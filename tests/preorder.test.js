// Run with: npm test   (no network: webhook, Shopify and Solana RPC are mocked)
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const cfg = require('../assets/data/store.json');
const handler = require('../api/preorder.js');

const RECIPIENT = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
const PAYER = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
const SIG = '5'.repeat(88);
cfg.crypto.recipient = RECIPIENT;

let calls = [];
let rpcResult = null;
global.fetch = async (url, init) => {
  const body = init && init.body ? JSON.parse(init.body) : null;
  calls.push({ url: String(url), body, headers: init && init.headers });
  if (String(url).includes('rpc')) return { ok: true, json: async () => ({ result: rpcResult }) };
  if (String(url).includes('myshopify')) return { ok: true, json: async () => ({ data: { draftOrderCreate: { draftOrder: { id: 'gid://shopify/DraftOrder/1' }, userErrors: [] } } }) };
  return { ok: true, json: async () => ({}) };
};

function call(body) {
  return new Promise((resolve) => {
    const res = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(s) { resolve({ status: this.statusCode, body: JSON.parse(s) }); } };
    handler({ method: 'POST', headers: {}, body }, res);
  });
}

const base = { ref: 'NG-ABCD1234', qty: 1, country: 'US', name: 'Juan Dela Cruz', email: 'juan@example.com' };
const tx = (paidUnits, memo, extra = {}) => Object.assign({
  blockTime: Math.floor(Date.now() / 1000) - 30,
  meta: {
    err: null,
    preTokenBalances: [{ owner: RECIPIENT, mint: cfg.crypto.mint, uiTokenAmount: { amount: '1000000' } }],
    postTokenBalances: [{ owner: RECIPIENT, mint: cfg.crypto.mint, uiTokenAmount: { amount: String(1000000n + paidUnits) } }],
    logMessages: ['Program log: Memo (len 16): "' + memo + '"'],
  },
  transaction: { message: { instructions: [] } },
}, extra);

(async () => {
  // Not configured: no destination at all.
  delete process.env.PREORDER_WEBHOOK_URL;
  let r = await call(Object.assign({ type: 'reserve', product: 'diwa' }, base));
  assert.equal(r.status, 503, '503 without a destination');

  process.env.PREORDER_WEBHOOK_URL = 'https://hooks.example.com/naga';
  process.env.SOLANA_RPC_URL = 'https://rpc.example.com';

  // Reservation for DIWA reaches the webhook with a server-side quote.
  calls = [];
  r = await call(Object.assign({ type: 'reserve', product: 'diwa' }, base));
  assert.equal(r.status, 200, 'reserve ok');
  assert.equal(calls[0].url, 'https://hooks.example.com/naga');
  assert.equal(calls[0].body.quote.shippingUsd, 100, 'US pays flat shipping');
  assert.deepEqual(calls[0].body.quote.days, [6, 10], 'US lead time');

  // Optional attribution: known answers pass through, anything else is dropped, never rejected.
  calls = [];
  r = await call(Object.assign({ type: 'reserve', product: 'diwa', heard: 'ChatGPT', ai: 'perplexity' }, base));
  assert.equal(r.status, 200);
  assert.equal(calls[0].body.heard, 'ChatGPT'); assert.equal(calls[0].body.ai, 'perplexity');
  calls = [];
  r = await call(Object.assign({ type: 'reserve', product: 'diwa', heard: '<script>', ai: 'Bad Value!' }, base));
  assert.equal(r.status, 200);
  assert.equal(calls[0].body.heard, ''); assert.equal(calls[0].body.ai, '');

  // Validation.
  r = await call(Object.assign({ type: 'reserve', product: 'diwa' }, base, { email: 'nope' }));
  assert.equal(r.status, 400); assert.ok(r.body.fields.email);
  r = await call(Object.assign({ type: 'card-request', product: 'diwa' }, base));
  assert.equal(r.status, 400, 'DIWA is reservation only');
  r = await call(Object.assign({ type: 'reserve', product: 'lakan-ii' }, base));
  assert.equal(r.status, 400, 'LAKAN takes pre-orders, not reservations');
  r = await call(Object.assign({ type: 'card-request', product: 'lakan-ii' }, base, { qty: 9 }));
  assert.equal(r.status, 400, 'qty limit');
  r = await call(Object.assign({ type: 'card-request', product: 'lakan-ii' }, base, { ref: 'bad' }));
  assert.equal(r.status, 400, 'ref format');

  // Card request (Shopify checkout not connected yet): recorded.
  r = await call(Object.assign({ type: 'card-request', product: 'lakan-ii' }, base, { country: 'PH' }));
  assert.equal(r.status, 200);

  // Crypto: LAKAN II to the US = 1430 + 100 = 1530 USDC = 1530000000 units.
  const order = Object.assign({ type: 'crypto', product: 'lakan-ii', signature: SIG, from: PAYER }, base);
  rpcResult = tx(1530000000n, 'naga:NG-ABCD1234');
  calls = [];
  r = await call(order);
  assert.equal(r.status, 200, 'exact payment verified');
  const rec = calls.find((c) => c.url.includes('hooks')).body;
  assert.equal(rec.payment.amount, '1530.00'); assert.equal(rec.payment.verified, true);

  rpcResult = tx(1529999999n, 'naga:NG-ABCD1234');
  r = await call(order); assert.equal(r.status, 402, 'underpayment rejected');
  rpcResult = tx(1530000000n, 'naga:NG-OTHER999');
  r = await call(order); assert.equal(r.status, 402, 'memo mismatch rejected');
  rpcResult = tx(1530000000n, 'naga:NG-ABCD1234', { blockTime: Math.floor(Date.now() / 1000) - 7200 });
  r = await call(order); assert.equal(r.status, 402, 'stale transaction rejected');
  rpcResult = Object.assign(tx(1530000000n, 'naga:NG-ABCD1234'), { meta: Object.assign(tx(1530000000n, 'x').meta, { err: { InstructionError: [1, 'x'] } }) });
  r = await call(order); assert.equal(r.status, 402, 'failed transaction rejected');
  rpcResult = null;
  r = await call(order); assert.equal(r.status, 409, 'not yet visible -> pending');
  rpcResult = tx(1530000000n, 'naga:NG-ABCD1234');
  r = await call(Object.assign({}, order, { signature: 'not-a-sig' }));
  assert.equal(r.status, 400, 'bad signature format');

  // Shopify draft order as a second destination.
  process.env.SHOPIFY_STORE_DOMAIN = 'naga-test.myshopify.com'; process.env.SHOPIFY_ADMIN_TOKEN = 'shpat_test';
  calls = [];
  r = await call(order);
  assert.equal(r.status, 200);
  const draft = calls.find((c) => c.url.includes('myshopify'));
  assert.ok(draft.url.endsWith('/admin/api/' + cfg.shopify.apiVersion + '/graphql.json'));
  assert.ok(draft.body.variables.input.tags.includes('paid-usdc'));
  assert.equal(draft.body.variables.input.lineItems[0].originalUnitPrice, '1430');

  // Non-POST.
  const res405 = await new Promise((resolve) => handler({ method: 'GET', headers: {} }, { statusCode: 0, setHeader() {}, end(s) { resolve(this.statusCode); } }));
  assert.equal(res405, 405);

  console.log('preorder api: all checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
