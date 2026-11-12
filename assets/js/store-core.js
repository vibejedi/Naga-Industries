/* ==========================================================================
   Naga store core: pricing, DHL shipping zones and order validation.
   Shared by the browser (window.NagaStoreCore) and the Vercel function
   api/preorder.js (require), so the quote a visitor sees is the quote the
   server checks a crypto payment against. Data comes from assets/data/store.json.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NagaStoreCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ISO 3166-1 alpha-2 codes; names come from Intl.DisplayNames in the browser.
  const COUNTRIES = ('AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CU CV CW CY CZ ' +
    'DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP ' +
    'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ ' +
    'OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
    'UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');

  const roundTo = (n, step) => Math.round(n / step) * step;

  function zoneFor(cfg, country) {
    const cc = String(country || '').toUpperCase();
    const z = cfg.shipping.zones.find((zone) => zone.countries.includes(cc));
    return z || cfg.shipping.rest;
  }

  /**
   * Price, shipping and delivery estimate for one order.
   * Orders shipping inside cfg.localCountry (the Philippines) are priced and settled in pesos
   * (product.php, VAT included, free delivery). Every other country pays the international USD
   * price (product.usd) plus the flat DHL rate. `usdc` is the amount to pay in USDC either way.
   * opts.nagaVerified: the buyer's $NAGA holding was verified on the server; the cfg.naga
   * discount then applies where cfg.naga.appliesTo allows it. The browser never sets it.
   */
  function quote(cfg, productKey, qty, country, opts) {
    const p = cfg.products[productKey];
    if (!p) throw new Error('Unknown product: ' + productKey);
    const o = opts || {};
    const n = Math.max(1, Math.min(cfg.maxQty, parseInt(qty, 10) || 1));
    const cc = String(country || '').toUpperCase();
    const zone = zoneFor(cfg, cc);
    const local = cc === String(cfg.localCountry || 'PH').toUpperCase();
    const currency = local ? 'PHP' : 'USD';
    const unit = local ? p.php : p.usd;
    const priced = typeof unit === 'number';
    const free = cfg.shipping.freeCountries.includes(cc);
    const naga = cfg.naga || {};
    const applies = naga.appliesTo === 'all' || (naga.appliesTo === 'international' && !local) || (naga.appliesTo === 'local' && local);
    const discountRate = o.nagaVerified && naga.enabled && applies && naga.discount > 0 ? naga.discount : 0;
    const round2 = (x) => Math.round(x * 100) / 100;
    const subtotal = priced ? unit * n : null;
    const discount = priced ? round2(subtotal * discountRate) : 0;
    const shipping = free ? 0 : (local ? 0 : cfg.shipping.flatUsd);
    const total = priced ? round2(subtotal - discount + shipping) : null;
    const usdTotal = priced ? (local ? Math.ceil(total / cfg.phpPerUsd * 100) / 100 : total) : null;
    return {
      product: productKey, name: p.name, qty: n, country: cc, priced, local, currency,
      unit: priced ? unit : null, subtotal, discountRate, discount, shipping, total,
      freeShipping: shipping === 0,
      approxPhp: priced ? (local ? total : roundTo(total * cfg.phpPerUsd, 10)) : null,
      usdTotal, usdc: priced ? usdTotal.toFixed(2) : null,
      days: zone.days, zone: zone.label, carrier: cfg.shipping.carrier, origin: cfg.shipping.origin,
    };
  }

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // "How did you hear about Naga?" (optional). AI assistants sit mid-list on purpose, so the
  // answer is not led by the order. Used for the monthly AI traffic report (dark AI traffic
  // that analytics never sees as a referral); see .claude/skills/ai-traffic-analytics.
  const HEARD = ['Google search', 'Facebook', 'Instagram', 'YouTube', 'ChatGPT', 'Google AI Overview or AI Mode', 'Gemini',
    'Perplexity', 'Copilot', 'Claude', 'Other AI assistant', 'A friend or colleague', 'Other'];

  /** Optional marketing fields, cleaned: unknown answers are dropped rather than rejected. */
  function attribution(o) {
    const heard = HEARD.includes(o.heard) ? o.heard : '';
    const ai = /^[a-z][a-z-]{1,19}$/.test(String(o.ai || '')) ? String(o.ai) : '';
    return { heard, ai };
  }

  /** Returns {field: message} for anything wrong; empty object when the order is valid. */
  function validate(cfg, o) {
    const e = {};
    if (!cfg.products[o.product]) e.product = 'Choose a product.';
    const q = Number(o.qty);
    if (!Number.isInteger(q) || q < 1 || q > cfg.maxQty) e.qty = 'Choose 1 to ' + cfg.maxQty + '.';
    if (!COUNTRIES.includes(String(o.country || '').toUpperCase())) e.country = 'Choose where to ship.';
    const name = String(o.name || '').trim();
    if (name.length < 2 || name.length > 120) e.name = 'Enter your full name.';
    const email = String(o.email || '').trim();
    if (!EMAIL.test(email) || email.length > 160) e.email = 'Enter a valid email.';
    return e;
  }

  /** Order reference, also written into the Solana memo as naga:<ref>. */
  function newRef() {
    const a = new Uint8Array(8);
    (typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 256; }));
    return 'NG-' + Array.from(a, (b) => (b % 36).toString(36)).join('').toUpperCase();
  }

  return { COUNTRIES, HEARD, zoneFor, quote, validate, attribution, newRef, REF: /^NG-[A-Z0-9]{8}$/ };
});
