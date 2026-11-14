/* ==========================================================================
   POST /api/preorder  (Vercel serverless function, Node 18+)

   Records pre-orders and reservations from naga-store.js, and verifies USDC
   payments on Solana before confirming a crypto order.

   Body: { type: 'reserve' | 'card-request' | 'crypto', ref, product, qty,
           country, name, email, signature?, from? }

   Where orders go (set in Vercel > Settings > Environment Variables):
     PREORDER_WEBHOOK_URL   POST the order as JSON (Zapier, Make, Slack, a
                            Google Sheets Apps Script, your own backend...)
     SHOPIFY_STORE_DOMAIN   + SHOPIFY_ADMIN_TOKEN: also create a Shopify
                            draft order tagged "pre-order" (Admin API scope
                            write_draft_orders)
     SOLANA_RPC_URL         RPC used to verify payments (defaults to
                            store.json crypto.rpcUrl)
   With neither destination set, the function answers 503 and the page tells
   the visitor to email Naga instead, so nothing is silently dropped.

   GET /api/preorder answers { webhook, webhookHost, shopify, environment },
   so the owner can check in a browser that a deployment sees its variables.
   A 502 lists a reason code for each destination that failed.
   ========================================================================== */
'use strict';

const cfg = require('../assets/data/store.json');
const Core = require('../assets/js/store-core.js');

const TYPES = ['reserve', 'card-request', 'crypto'];
const SIG = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;
const ADDR = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 10000) throw new Error('too large'); }
  return JSON.parse(raw || '{}');
}

async function rpc(url, method, params) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const data = await r.json();
  if (data.error) throw new Error('rpc: ' + data.error.message);
  return data.result;
}

/**
 * Confirms that `signature` is a successful Solana transaction that paid at
 * least `minUnits` of the configured USDC mint into the configured recipient,
 * with memo naga:<ref>. Returns { ok, reason, paidUnits, blockTime }.
 */
async function verifySolanaPayment({ signature, ref, minUnits, rpcUrl, recipient, mint }) {
  const tx = await rpc(rpcUrl, 'getTransaction', [signature, { encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }]);
  if (!tx) return { ok: false, pending: true, reason: 'Transaction not found yet.' };
  if (tx.meta && tx.meta.err) return { ok: false, reason: 'Transaction failed on-chain.' };
  const age = Date.now() / 1000 - (tx.blockTime || 0);
  if (tx.blockTime && age > 3600) return { ok: false, reason: 'Transaction is older than one hour.' };
  const bal = (list) => (list || []).filter((b) => b.owner === recipient && b.mint === mint)
    .reduce((sum, b) => sum + BigInt(b.uiTokenAmount.amount), 0n);
  const paid = bal(tx.meta.postTokenBalances) - bal(tx.meta.preTokenBalances);
  if (paid < minUnits) return { ok: false, reason: 'Payment amount is lower than the order total.', paidUnits: paid };
  const memo = 'naga:' + ref;
  const logs = (tx.meta.logMessages || []).join('\n');
  const ixs = ((tx.transaction && tx.transaction.message && tx.transaction.message.instructions) || []);
  const memoFound = logs.includes(memo) || ixs.some((ix) => ix.program === 'spl-memo' && ix.parsed === memo);
  if (!memoFound) return { ok: false, reason: 'Payment memo does not match this order.' };
  return { ok: true, paidUnits: paid, blockTime: tx.blockTime };
}

const units = (usdString, decimals) => {
  const [w, f = ''] = String(usdString).split('.');
  return BigInt(w) * 10n ** BigInt(decimals) + BigInt((f + '0'.repeat(decimals)).slice(0, decimals) || '0');
};

// Every failure carries a short code, and the 502 answer lists the codes, so the owner can read why an
// order was not kept without opening the function logs. A code never holds the webhook URL or its key.
function fail(code, message, detail) {
  const e = new Error(message);
  e.code = code;
  if (detail) e.detail = detail;
  return e;
}
const plain = (html, max) => String(html).replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function toWebhook(url, record) {
  try { new URL(url); } catch (e) { throw fail('webhook_bad_url', 'PREORDER_WEBHOOK_URL is not a URL'); }
  let r;
  try {
    r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(record) });
  } catch (e) { throw fail('webhook_unreachable', 'webhook did not answer: ' + ((e.cause && e.cause.code) || e.name)); }
  const text = typeof r.text === 'function' ? await r.text().catch(() => '') : '';
  const page = /^\s*</.test(text);
  if (!r.ok) throw fail('webhook_http_' + r.status, 'webhook ' + r.status, page ? plain(text, 160) : '');
  // A 200 is not proof the order was kept. The Google Sheet script answers 200 with {ok:false} for a
  // wrong key, and Google answers 200 with a web page when the script is not shared with "Anyone" or
  // when the script itself threw an error.
  let data = null;
  try { data = JSON.parse(text); } catch (e) { /* not JSON: most webhooks answer with plain text */ }
  if (data && data.ok === false) throw fail('webhook_refused', 'webhook refused the order: ' + (data.error || 'ok is false'), String(data.error || '').slice(0, 80));
  let host = '';
  try { host = new URL(r.url || url).hostname; } catch (e) { /* keep the empty host */ }
  if (/(^|\.)google(usercontent)?\.com$/.test(host) && !data && page) {
    throw fail('webhook_web_page', 'webhook answered with a web page, not the script', plain(text, 160));
  }
}

async function toShopifyDraft(domain, token, record) {
  const p = cfg.products[record.product];
  const line = p.shopifyVariantId
    ? { variantId: p.shopifyVariantId, quantity: record.qty }
    : { title: p.name + ' (pre-order)', quantity: record.qty, originalUnitPrice: String(record.quote.unit || 0) };
  const input = {
    email: record.email,
    note: 'Naga ' + record.type + ' ' + record.ref + (record.payment ? ' · paid ' + record.payment.amount + ' USDC · ' + record.payment.signature : ''),
    tags: ['pre-order', record.type].concat(record.payment ? ['paid-usdc'] : []),
    lineItems: [line],
    presentmentCurrencyCode: record.quote.currency,
    shippingAddress: { countryCode: record.country, firstName: record.name },
    customAttributes: [{ key: 'Naga order ref', value: record.ref }, { key: 'Ship to', value: record.country }]
      .concat(record.heard ? [{ key: 'Heard about Naga', value: record.heard }] : [])
      .concat(record.ai ? [{ key: 'Arrived from AI', value: record.ai }] : []),
  };
  const r = await fetch('https://' + domain + '/admin/api/' + cfg.shopify.apiVersion + '/graphql.json', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query: 'mutation($input: DraftOrderInput!){draftOrderCreate(input:$input){draftOrder{id}userErrors{message}}}', variables: { input } }),
  });
  const data = await r.json();
  const errs = data.errors || (data.data && data.data.draftOrderCreate.userErrors);
  if (!r.ok || (errs && errs.length)) throw fail('shopify_failed', 'shopify ' + JSON.stringify(errs || r.status));
}

// The host of the webhook, so the owner can see a pasted sheet address or a typo. Never the path or the key.
function webhookHost(url) {
  if (!url) return null;
  try { return new URL(url).hostname; } catch (e) { return 'not a URL'; }
}

module.exports = async function handler(req, res) {
  // Opening /api/preorder in a browser says whether this deployment can see a destination.
  // It shows true or false only, never a URL or a token.
  if (req.method === 'GET') {
    return send(res, 200, {
      service: 'naga pre-orders',
      webhook: !!process.env.PREORDER_WEBHOOK_URL,
      webhookHost: webhookHost(process.env.PREORDER_WEBHOOK_URL),
      shopify: !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN),
      environment: process.env.VERCEL_ENV || 'local',
    });
  }
  if (req.method !== 'POST') { res.setHeader('allow', 'GET, POST'); return send(res, 405, { error: 'method_not_allowed' }); }
  let body;
  try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'bad_json' }); }

  const order = {
    type: String(body.type || ''), ref: String(body.ref || ''), product: String(body.product || ''),
    qty: Number(body.qty), country: String(body.country || '').toUpperCase(),
    name: String(body.name || '').trim().slice(0, 120), email: String(body.email || '').trim().slice(0, 160),
  };
  const errors = Core.validate(cfg, order);
  if (!TYPES.includes(order.type)) errors.type = 'Unknown order type.';
  if (!Core.REF.test(order.ref)) errors.ref = 'Bad reference.';
  const product = cfg.products[order.product];
  if (product && order.type === 'reserve' && product.mode !== 'reserve') errors.type = 'This product takes pre-orders, not reservations.';
  if (product && order.type !== 'reserve' && product.mode === 'reserve') errors.type = 'This product is reservation only.';
  if (Object.keys(errors).length) return send(res, 400, { error: 'invalid', fields: errors });

  const webhook = process.env.PREORDER_WEBHOOK_URL;
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN, shopToken = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!webhook && !(shopDomain && shopToken)) return send(res, 503, { error: 'not_configured' });

  const quote = Core.quote(cfg, order.product, order.qty, order.country);
  const record = Object.assign({}, order, Core.attribution(body), { quote, createdAt: new Date().toISOString(), source: req.headers['referer'] || '' });

  if (order.type === 'crypto') {
    const c = cfg.crypto;
    const recipient = process.env.CRYPTO_RECIPIENT || c.recipient;
    const signature = String(body.signature || '');
    if (!recipient || !SIG.test(signature) || (body.from && !ADDR.test(String(body.from)))) return send(res, 400, { error: 'invalid_payment' });
    let check;
    try {
      check = await verifySolanaPayment({
        signature, ref: order.ref, minUnits: units(quote.usdc, c.decimals),
        rpcUrl: process.env.SOLANA_RPC_URL || c.rpcUrl, recipient, mint: c.mint,
      });
    } catch (e) { return send(res, 502, { error: 'rpc_unavailable' }); }
    if (check.pending) return send(res, 409, { error: 'pending', reason: check.reason });
    if (!check.ok) return send(res, 402, { error: 'payment_not_verified', reason: check.reason });
    record.payment = { chain: c.chain, token: c.token, amount: quote.usdc, signature, from: String(body.from || ''), verified: true, blockTime: check.blockTime };
  }

  const jobs = [];
  if (webhook) jobs.push(toWebhook(webhook, record));
  if (shopDomain && shopToken) jobs.push(toShopifyDraft(shopDomain, shopToken, record));
  const results = await Promise.allSettled(jobs);
  if (!results.some((r) => r.status === 'fulfilled')) {
    console.error('preorder: every destination failed', results.map((r) => r.reason && r.reason.message));
    const reasons = results.map((r) => Object.assign({ code: (r.reason && r.reason.code) || 'error' }, r.reason && r.reason.detail ? { detail: r.reason.detail } : {}));
    return send(res, 502, { error: 'record_failed', reasons });
  }
  return send(res, 200, { ok: true, ref: order.ref });
};

module.exports.verifySolanaPayment = verifySolanaPayment;
module.exports.units = units;
