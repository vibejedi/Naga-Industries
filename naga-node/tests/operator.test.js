// Run with: npm test   (the operator service runs on a local port; a stand-in SDK plays peaq)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

process.env.NAGA_NODE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'naga-op-test-'));
const { distribute } = await import('../operator/rewards.js');
const { createOperator } = await import('../operator/server.js');
const { NagaNode } = await import('../src/agent.js');
const { DEFAULTS, file, writeJson } = await import('../src/config.js');
const { sign, canonical } = await import('../src/report.js');
const { derive } = await import('../src/vault.js');

const ADMIN = 'admin-token-of-enough-length-123';
const A = 'So11111111111111111111111111111111111111112';

test('rewards: shared by network pay, capped at twice that pay, the rest to the treasury', () => {
  // Plenty in the pool: everyone hits the cap.
  let r = distribute(100000, [{ machineId: '1', solanaAddress: A, networkPayCents: 500 }, { machineId: '2', solanaAddress: A, networkPayCents: 1000 }]);
  assert.deepEqual(r.payouts.map((p) => p.rewardCents), [1000, 2000]);
  assert.equal(r.treasuryCents, 97000);
  // A small pool: split 1 to 2, nobody near the cap.
  r = distribute(900, [{ machineId: '1', solanaAddress: A, networkPayCents: 500 }, { machineId: '2', solanaAddress: A, networkPayCents: 1000 }]);
  assert.deepEqual(r.payouts.map((p) => p.rewardCents), [300, 600]);
  assert.equal(r.treasuryCents, 0);
  // One laptop caps out; its unused share goes to the other, up to that one's cap.
  r = distribute(2500, [{ machineId: '1', solanaAddress: A, networkPayCents: 100 }, { machineId: '2', solanaAddress: A, networkPayCents: 5000 }]);
  assert.equal(r.payouts[0].rewardCents <= 200, true);
  assert.equal(r.paidCents + r.treasuryCents, 2500, 'every cent is accounted for');
  // Online with no network pay earns nothing: the whole pool stays in the treasury.
  r = distribute(5000, [{ machineId: '1', solanaAddress: A, networkPayCents: 0 }]);
  assert.deepEqual([r.paidCents, r.treasuryCents], [0, 5000]);
  assert.throws(() => distribute(10.5, []), /whole number of cents/);
});

function fakeSdk(chain) {
  class PeaqosClient {
    async getMachineActivationState() { return chain.machine; }
  }
  return { PeaqosClient, MAX_HEARTBEAT_INTERVAL_MS: 120000, eip191SignerFromPrivateKey: () => ({}),
    getMonetization: async () => ({ status: chain.monetization }), optIn: async () => { chain.monetization = 'OPTED_IN'; return { status: 'OPTED_IN' }; }, optOut: async () => { chain.monetization = 'OPTED_OUT'; return { status: 'OPTED_OUT' }; },
    HeartbeatClient: class { start(c) { chain.hb = c; } stop() { chain.hb = null; } } };
}

test('a laptop enrolls, reports its days, and the payout sheet follows network pay', async () => {
  const dataFile = path.join(process.env.NAGA_NODE_HOME, 'fleet.json');
  const { api, server } = createOperator({ dataFile, adminToken: ADMIN });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port;
  const admin = (p) => fetch(url + p, { headers: { authorization: 'Bearer ' + ADMIN } });
  try {
    const chain = { machine: { owner: '0xOwner', controller: '0xOp', subscription: { tier: 0, periodStart: 1n, periodEnd: 1800000000n }, isHomedLocally: true }, monetization: 'PENDING', hb: null };
    const node = new NagaNode({ cfg: Object.assign({}, DEFAULTS, { operatorUrl: url, model: 'SIPAG I' }), sdk: fakeSdk(chain) });
    node.setup('correct horse');
    await node.switchOn();
    assert.equal(node.snapshot().operator.enrolled, true);
    assert.equal(node.snapshot().operator.error, null);

    // Two accepted heartbeats, then the switch goes off: the day is reported.
    chain.hb.onResult({ accepted: true, online: true }); chain.hb.onResult({ accepted: true, online: true });
    await node.switchOff();
    let fleet = await (await admin('/v1/admin/fleet')).json();
    assert.equal(fleet.length, 1);
    assert.equal(fleet[0].model, 'SIPAG I');
    assert.equal(fleet[0].solanaAddress, node.snapshot().addresses.solana);
    assert.equal(fleet[0].days, 1);
    assert.ok(!JSON.stringify(fleet).includes('correct horse'));

    // No network pay yet: the payout sheet pays nothing, whatever the pool.
    const month = new Date().toISOString().slice(0, 7), day = new Date().toISOString().slice(0, 10);
    let pay = await (await admin('/v1/admin/payouts?month=' + month + '&pool=1000')).json();
    assert.deepEqual([pay.paidCents, pay.treasuryCents], [0, 100000]);

    // Naga records what a partner network paid this laptop. Now the laptop collects, up to twice that.
    api.setNetworkPay(node.id(), day, 450);
    pay = await (await admin('/v1/admin/payouts?month=' + month + '&pool=1000')).json();
    assert.equal(pay.payouts[0].rewardCents, 900);
    const csv = await (await admin('/v1/admin/payouts?month=' + month + '&pool=1000&format=csv')).text();
    assert.match(csv.split('\n')[1], new RegExp('^' + node.id() + ',' + node.snapshot().addresses.solana + ',[0-9.]+,4\\.50,9\\.00,9\\.00$'));

    // A laptop cannot set its own network pay: the field in its report is ignored.
    const keys = node.keys || derive(node.phrase('correct horse'));
    const forged = await sign(derive(node.phrase('correct horse')).evm, 'report', { machineId: node.id(), peaqAddress: node.snapshot().addresses.peaq, day, onlineSeconds: 86400, heartbeats: 1440, networkPayUsdCents: 999999 });
    assert.equal((await fetch(url + '/v1/reports', { method: 'POST', body: JSON.stringify(forged) })).status, 200);
    pay = await (await admin('/v1/admin/payouts?month=' + month + '&pool=1000')).json();
    assert.equal(pay.payouts[0].networkPayCents, 450);

    // Refusals: no admin token, a report signed by another wallet, a stale message, a second wallet for the same machine.
    assert.equal((await fetch(url + '/v1/admin/fleet')).status, 401);
    const other = derive('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about').evm;
    const wrong = await sign(other, 'report', { machineId: node.id(), peaqAddress: node.snapshot().addresses.peaq, day, onlineSeconds: 60, heartbeats: 1, networkPayUsdCents: 0 });
    assert.equal((await fetch(url + '/v1/reports', { method: 'POST', body: JSON.stringify(wrong) })).status, 401);
    const stale = Object.assign({}, forged, { sentAt: '2020-01-01T00:00:00.000Z' });
    assert.equal((await fetch(url + '/v1/reports', { method: 'POST', body: JSON.stringify(stale) })).status, 400);
    const steal = await sign(other, 'enroll', { machineId: node.id(), peaqAddress: other.address, solanaAddress: A, model: 'x', network: 'peaq-mainnet' });
    assert.equal((await fetch(url + '/v1/machines', { method: 'POST', body: JSON.stringify(steal) })).status, 409);
    assert.match(canonical('report', forged), /^naga-node:report\nday: /);
  } finally { server.close(); }
});

test('a laptop keeps working when the operator service is down', async () => {
  for (const f of fs.readdirSync(process.env.NAGA_NODE_HOME)) fs.rmSync(file(f), { recursive: true });
  const chain = { machine: { owner: '0xOwner', controller: '0xOp', subscription: { tier: 0, periodStart: 1n, periodEnd: 1800000000n }, isHomedLocally: true }, monetization: 'PENDING', hb: null };
  const node = new NagaNode({ cfg: Object.assign({}, DEFAULTS, { operatorUrl: 'http://127.0.0.1:9' }), sdk: fakeSdk(chain) });
  node.setup('correct horse');
  await node.switchOn();
  assert.ok(chain.hb, 'the heartbeat still runs');
  assert.ok(node.snapshot().operator.error);
});
