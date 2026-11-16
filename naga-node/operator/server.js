#!/usr/bin/env node
// Naga's operator service: the fleet's index and its work record.
// peaq does not list a fleet, and its work events are whatever the operator submits, so Naga keeps both here.
//   POST /v1/machines        a laptop enrolls (signed with its peaq key)
//   POST /v1/reports         a laptop reports one day of work (signed)
//   GET  /v1/admin/fleet     every laptop and its totals                      (admin token)
//   GET  /v1/admin/payouts   ?month=2026-11&pool=1000.00[&format=csv]          (admin token)
// Storage is one JSON file. That is right for a pilot of tens of laptops, and wrong past that: move to a database.
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { verifyMessage } from 'viem';
import { anchorless } from './validate.js';
import { distribute } from './rewards.js';
import { MAX_AGE_SECONDS, canonical } from '../src/report.js';

export function createOperator({ dataFile, adminToken, now = () => Date.now() }) {
  if (!adminToken || adminToken.length < 24) throw new Error('Set an admin token of at least 24 characters.');
  const load = () => { try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch (e) { return { machines: {}, reports: {} }; } };
  const save = (db) => { fs.mkdirSync(path.dirname(dataFile), { recursive: true }); const tmp = dataFile + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 }); fs.renameSync(tmp, dataFile); };

  async function signed(kind, body) {
    const age = Math.abs(now() - Date.parse(body.sentAt)) / 1000;
    if (!(age <= MAX_AGE_SECONDS)) throw fail(400, 'This message is too old or has no time. Check the laptop\'s clock.');
    let ok = false;
    try { ok = await verifyMessage({ address: body.peaqAddress, message: canonical(kind, body), signature: body.signature }); } catch (e) { ok = false; }
    if (!ok) throw fail(401, 'The signature does not match the laptop\'s peaq address.');
  }

  const api = {
    async enroll(body) {
      anchorless.enroll(body); await signed('enroll', body);
      const db = load(); const old = db.machines[body.machineId];
      if (old && old.peaqAddress.toLowerCase() !== body.peaqAddress.toLowerCase()) throw fail(409, 'This machine is already enrolled under another wallet.');
      db.machines[body.machineId] = { machineId: body.machineId, peaqAddress: body.peaqAddress, solanaAddress: body.solanaAddress, model: body.model, network: body.network, enrolledAt: (old && old.enrolledAt) || new Date(now()).toISOString(), lastSeenAt: new Date(now()).toISOString() };
      save(db); return { ok: true, enrolledAt: db.machines[body.machineId].enrolledAt };
    },
    async report(body) {
      anchorless.report(body); await signed('report', body);
      const db = load(); const m = db.machines[body.machineId];
      if (!m) throw fail(404, 'Enroll this laptop first.');
      if (m.peaqAddress.toLowerCase() !== body.peaqAddress.toLowerCase()) throw fail(401, 'This report is not from the enrolled wallet.');
      if (body.day > new Date(now()).toISOString().slice(0, 10)) throw fail(400, 'A report cannot be for a day that has not come.');
      // A laptop reports its own online time. Network pay is never taken from the laptop: it is set from the
      // partner network's own records (setNetworkPay), so the figure here stays what the operator recorded.
      const key = body.machineId + ':' + body.day; const old = db.reports[key] || {};
      db.reports[key] = { machineId: body.machineId, day: body.day, onlineSeconds: Math.min(86400, body.onlineSeconds), heartbeats: body.heartbeats, networkPayUsdCents: old.networkPayUsdCents || 0, receivedAt: new Date(now()).toISOString() };
      m.lastSeenAt = new Date(now()).toISOString();
      save(db); return { ok: true };
    },
    /** Called by Naga with a partner network's statement, never by a laptop. */
    setNetworkPay(machineId, day, cents) {
      if (!Number.isInteger(cents) || cents < 0) throw fail(400, 'Network pay must be whole cents.');
      const db = load(); if (!db.machines[machineId]) throw fail(404, 'Unknown machine.');
      const key = machineId + ':' + day; db.reports[key] = Object.assign({ machineId, day, onlineSeconds: 0, heartbeats: 0 }, db.reports[key], { networkPayUsdCents: cents });
      save(db); return { ok: true };
    },
    fleet() {
      const db = load();
      return Object.values(db.machines).map((m) => {
        const mine = Object.values(db.reports).filter((r) => r.machineId === m.machineId);
        return Object.assign({}, m, { days: mine.length, onlineHours: +(mine.reduce((n, r) => n + r.onlineSeconds, 0) / 3600).toFixed(1), networkPayUsdCents: mine.reduce((n, r) => n + r.networkPayUsdCents, 0) });
      });
    },
    payouts(month, poolCents) {
      if (!/^\d{4}-\d{2}$/.test(month)) throw fail(400, 'Give the month as YYYY-MM.');
      const db = load();
      const machines = Object.values(db.machines).map((m) => {
        const mine = Object.values(db.reports).filter((r) => r.machineId === m.machineId && r.day.startsWith(month));
        return { machineId: m.machineId, solanaAddress: m.solanaAddress, networkPayCents: mine.reduce((n, r) => n + r.networkPayUsdCents, 0), onlineHours: +(mine.reduce((n, r) => n + r.onlineSeconds, 0) / 3600).toFixed(1) };
      });
      const result = distribute(poolCents, machines);
      result.payouts.forEach((p, i) => { p.onlineHours = machines[i].onlineHours; });
      return Object.assign({ month, poolCents }, result);
    },
  };

  const server = http.createServer(async (req, res) => {
    const send = (status, body, type = 'application/json') => { res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' }); res.end(type === 'application/json' ? JSON.stringify(body) : body); };
    try {
      const url = new URL(req.url, 'http://x');
      if (url.pathname.startsWith('/v1/admin/')) {
        const given = Buffer.from(String(req.headers.authorization || '').replace(/^Bearer /, ''));
        if (given.length !== adminToken.length || !crypto.timingSafeEqual(given, Buffer.from(adminToken))) return send(401, { error: 'Admin token needed.' });
        if (req.method === 'GET' && url.pathname === '/v1/admin/fleet') return send(200, api.fleet());
        if (req.method === 'GET' && url.pathname === '/v1/admin/payouts') {
          const pool = Math.round(parseFloat(url.searchParams.get('pool') || '0') * 100);
          const out = api.payouts(url.searchParams.get('month') || '', pool);
          if (url.searchParams.get('format') !== 'csv') return send(200, out);
          const usd = (c) => (c / 100).toFixed(2);
          return send(200, ['machine_id,solana_address,online_hours,network_pay_usd,cap_usd,reward_usdc'].concat(out.payouts.map((p) => [p.machineId, p.solanaAddress, p.onlineHours, usd(p.networkPayCents), usd(p.capCents), usd(p.rewardCents)].join(','))).join('\n') + '\n', 'text/csv');
        }
        return send(404, { error: 'Not found' });
      }
      if (req.method !== 'POST') return send(404, { error: 'Not found' });
      let raw = ''; for await (const c of req) { raw += c; if (raw.length > 4096) return send(413, { error: 'Too large' }); }
      let body; try { body = JSON.parse(raw); } catch (e) { return send(400, { error: 'Bad request' }); }
      if (url.pathname === '/v1/machines') return send(200, await api.enroll(body));
      if (url.pathname === '/v1/reports') return send(200, await api.report(body));
      send(404, { error: 'Not found' });
    } catch (e) { send(e.status || 500, { error: e.status ? e.message : 'Something went wrong.' }); }
  });
  return { api, server };
}

function fail(status, message) { return Object.assign(new Error(message), { status }); }

if (import.meta.url === 'file://' + process.argv[1]) {
  const { server } = createOperator({ dataFile: process.env.NAGA_OPERATOR_DATA || './operator-data/fleet.json', adminToken: process.env.NAGA_OPERATOR_ADMIN_TOKEN || '' });
  const port = Number(process.env.PORT || 4848);
  server.listen(port, () => console.log('Naga operator service on port ' + port));
}
