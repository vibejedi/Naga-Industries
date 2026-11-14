// The local dashboard. It listens on 127.0.0.1 only, and it holds an unlocked wallet, so:
//   - a request must name this server in its Host header (stops DNS rebinding from a web page);
//   - a request that changes anything must carry the token that only the served page has (stops
//     another site from posting to localhost).
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ui', 'index.html');

export function createServer(node, { port = node.cfg.port } = {}) {
  const token = crypto.randomBytes(24).toString('hex');
  const routes = {
    'GET /api/state': () => node.snapshot(),
    'POST /api/refresh': async () => { await node.refresh(); return node.snapshot(); },
    'POST /api/setup': (b) => node.setup(String(b.passphrase || ''), b.mnemonic ? String(b.mnemonic).trim().toLowerCase().split(/\s+/).join(' ') : undefined),
    'POST /api/unlock': (b) => node.unlock(String(b.passphrase || '')),
    'POST /api/lock': () => node.lock(),
    'POST /api/phrase': (b) => ({ mnemonic: node.phrase(String(b.passphrase || '')) }),
    'POST /api/preview': () => node.preview(),
    'POST /api/activate': (b) => { if (b.confirm !== true) throw new Error('Confirm the activation first.'); return node.activate(); },
    'POST /api/clear-pending': () => node.clearPending(),
    'POST /api/on': () => node.switchOn(),
    'POST /api/off': () => node.switchOff(),
  };

  const server = http.createServer(async (req, res) => {
    const send = (status, body, type = 'application/json') => {
      res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
      res.end(type === 'application/json' ? JSON.stringify(body) : body);
    };
    const bound = server.address().port;
    if (![`127.0.0.1:${bound}`, `localhost:${bound}`].includes(req.headers.host)) return send(403, { error: 'Open Naga Node at http://127.0.0.1:' + bound });
    const url = new URL(req.url, 'http://x');
    if (req.method === 'GET' && url.pathname === '/') return send(200, fs.readFileSync(UI, 'utf8').replace('__NAGA_TOKEN__', token), 'text/html; charset=utf-8');
    const route = routes[req.method + ' ' + url.pathname];
    if (!route) return send(404, { error: 'Not found' });
    if (req.method === 'POST') {
      const given = Buffer.from(String(req.headers['x-naga-token'] || ''));
      if (given.length !== token.length || !crypto.timingSafeEqual(given, Buffer.from(token))) return send(403, { error: 'Reload the page and try again.' });
    }
    let body = {};
    if (req.method === 'POST') {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 4096) return send(413, { error: 'Too large' }); }
      try { body = raw ? JSON.parse(raw) : {}; } catch (e) { return send(400, { error: 'Bad request' }); }
    }
    try { send(200, await route(body)); }
    catch (e) { send(400, { error: String((e && (e.shortMessage || e.message)) || e).split('\n')[0].slice(0, 300) }); }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, token, url: 'http://127.0.0.1:' + server.address().port }));
  });
}
