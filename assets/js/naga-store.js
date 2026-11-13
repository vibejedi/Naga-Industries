/* ==========================================================================
   Naga store: pre-order and reservation forms, DHL shipping calculator,
   Shopify checkout and USDC (Solana) payments through Privy.

   Each form is <form class="order" data-order="<product key>"> on a product
   page. Settings live in assets/data/store.json; anything left empty there
   switches its feature off and the form falls back to saving the order
   through /api/preorder (see api/preorder.js), so no pre-order is lost.
   ========================================================================== */
(function () {
  'use strict';
  const forms = document.querySelectorAll('form.order[data-order]');
  const Core = window.NagaStoreCore;
  if (!forms.length || !Core) return;

  const $ = (root, sel) => root.querySelector(sel);
  const usd = (n) => 'US$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const php = (n) => '₱' + n.toLocaleString('en-US');
  const money = (n, cur) => (cur === 'PHP' ? php(n) : usd(n));
  const days = (d) => d[0] + '–' + d[1] + ' days';
  const dataUrl = new URL('assets/data/store.json', document.baseURI).href;

  fetch(dataUrl).then((r) => r.json()).then((cfg) => forms.forEach((f) => setup(f, cfg))).catch(() => {
    forms.forEach((f) => say(f, 'The order form could not load. Email us at hello@nagatech.ph and we will reserve one for you.', 'error'));
  });

  function say(form, text, tone, html) {
    const el = $(form, '[data-o="msg"]');
    if (!el) return;
    el.dataset.tone = tone || '';
    if (html) el.innerHTML = html; else el.textContent = text;
  }

  function guessCountry() {
    const langs = navigator.languages || [navigator.language || ''];
    for (const l of langs) { const m = /-([A-Z]{2})$/i.exec(l); if (m) return m[1].toUpperCase(); }
    return 'PH';
  }

  function fillCountries(select) {
    let names;
    try { names = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { names = null; }
    const label = (cc) => { try { return (names && names.of(cc)) || cc; } catch (e) { return cc; } };
    const list = Core.COUNTRIES.map((cc) => [cc, label(cc)]).sort((a, b) => a[1].localeCompare(b[1]));
    select.innerHTML = list.map(([cc, n]) => '<option value="' + cc + '">' + n + '</option>').join('');
    const pick = guessCountry();
    select.value = Core.COUNTRIES.includes(pick) ? pick : 'PH';
  }

  function setup(form, cfg) {
    const key = form.dataset.order;
    const product = cfg.products[key];
    if (!product) return;
    const reserve = product.mode === 'reserve';
    const qtySel = form.elements.qty, ctySel = form.elements.country;
    qtySel.innerHTML = Array.from({ length: cfg.maxQty }, (_, i) => '<option>' + (i + 1) + '</option>').join('');
    fillCountries(ctySel);
    if (form.elements.heard) form.elements.heard.innerHTML = '<option value="">Choose one</option>' + Core.HEARD.map((h) => '<option>' + h + '</option>').join('');

    const shopifyReady = !!(cfg.shopify.storeDomain && cfg.shopify.storefrontToken && product.shopifyVariantId);
    const cryptoReady = !!(cfg.crypto.privyAppId && cfg.crypto.recipient);
    const cryptoOpt = form.querySelector('input[name="method"][value="crypto"]');
    if (cryptoOpt && !cryptoReady) {
      cryptoOpt.disabled = true;
      const small = cryptoOpt.closest('.pay-opt').querySelector('small');
      if (small) small.textContent = 'Coming soon';
      cryptoOpt.closest('.pay-opt').classList.add('is-off');
    }

    // Until card checkout or crypto is connected there is nothing to choose and nothing to pay:
    // the form takes the pre-order and says so.
    const payFs = form.querySelector('.pay');
    if (!reserve && payFs && !shopifyReady && !cryptoReady) {
      payFs.hidden = true;
      payFs.insertAdjacentHTML('afterend', '<p class="order-fine order-nopay">No payment now. We will email you a payment link when checkout opens.</p>');
    }

    const go = $(form, '.order-go');
    const goLabel = () => {
      if (reserve) return 'Reserve my ' + product.name;
      return method() === 'crypto' ? 'Pay with USDC' : 'Pre-order ' + product.name;
    };
    const method = () => (form.elements.method ? form.elements.method.value : 'reserve');

    const render = () => {
      const q = Core.quote(cfg, key, qtySel.value, ctySel.value);
      $(form, '[data-o="item"]').textContent = product.name + ' × ' + q.qty;
      $(form, '[data-o="subtotal"]').textContent = q.priced ? money(q.subtotal, q.currency) : 'To be announced';
      $(form, '[data-o="shipping"]').textContent = q.freeShipping ? 'Free' : money(q.shipping, q.currency);
      $(form, '[data-o="carrier"]').textContent = q.carrier + ' from ' + q.origin;
      $(form, '[data-o="eta"]').textContent = days(q.days) + ' after dispatch';
      $(form, '[data-o="zone"]').textContent = q.zone;
      if (q.priced) {
        $(form, '[data-o="total"]').textContent = money(q.total, q.currency);
        $(form, '[data-o="total-php"]').textContent = q.local ? 'VAT included' : '≈ ' + php(q.approxPhp);
      }
      const usdc = $(form, '[data-o="usdc"]');
      if (usdc) { usdc.hidden = method() !== 'crypto'; usdc.textContent = 'You will pay ' + (q.usdc || '') + ' USDC on Solana.'; }
      go.textContent = goLabel();
      return q;
    };
    form.addEventListener('change', render);
    render();

    const showErrors = (errs) => {
      form.querySelectorAll('.fld').forEach((l) => {
        const input = l.querySelector('input, select'); const msg = l.querySelector('.err');
        const bad = errs[input.name];
        input.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (msg) msg.textContent = bad || '';
      });
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    };

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (form.classList.contains('is-busy')) return;
      const order = {
        product: key, qty: Number(qtySel.value), country: ctySel.value,
        name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
        heard: form.elements.heard ? form.elements.heard.value : '',
        ai: (window.NagaAnalytics && window.NagaAnalytics.aiSource()) || '',
      };
      const errs = Core.validate(cfg, order);
      showErrors(errs);
      if (Object.keys(errs).length) { say(form, 'Please check the highlighted fields.', 'error'); return; }
      const q = render();
      const ref = Core.newRef();
      form.classList.add('is-busy'); go.disabled = true;
      try {
        if (reserve) await reserveOrder(form, cfg, order, ref, product);
        else if (method() === 'crypto') await payCrypto(form, cfg, order, ref, q);
        else await payCard(form, cfg, order, ref, product, shopifyReady);
      } catch (err) {
        say(form, (err && err.message) || 'Something went wrong. Please try again.', 'error');
      } finally {
        form.classList.remove('is-busy'); go.disabled = false; go.textContent = goLabel();
      }
    });
  }

  function clearContact(form) { form.elements.name.value = ''; form.elements.email.value = ''; if (form.elements.heard) form.elements.heard.value = ''; }

  // Tells assets/js/naga-analytics.js about a completed step (no personal data in the event).
  function announce(step, order, ref, q) {
    document.dispatchEvent(new CustomEvent('naga:order', { detail: { step, ref, product: order.product, qty: order.qty, country: order.country, valueUsd: q && q.priced ? q.usdTotal : 0 } }));
  }

  async function api(cfg, body) {
    const r = await fetch(cfg.api.preorder, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    let data = {};
    try { data = await r.json(); } catch (e) { /* non-JSON error page */ }
    return { ok: r.ok, status: r.status, data };
  }

  const mailto = (cfg, subject, body) => 'mailto:' + cfg.contactEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  const fallbackHtml = (cfg, order, ref, lead) => lead + ' <a href="' + mailto(cfg, 'Pre-order ' + ref, order.name + ' wants ' + order.qty + ' × ' + ((cfg.products[order.product] || {}).name || order.product) + ', shipping to ' + order.country + '.') + '">Email ' + cfg.contactEmail + '</a> and we will hold one for you.';

  async function reserveOrder(form, cfg, order, ref, product) {
    $(form, '.order-go').textContent = 'Saving…';
    const res = await api(cfg, Object.assign({ type: 'reserve', ref }, order));
    if (res.ok) { announce('reserve', order, ref); say(form, 'You are on the list for ' + product.name + '. We will email ' + order.email + ' first when pricing and pre-orders open. Reference ' + ref + '.', 'ok'); clearContact(form); return; }
    say(form, '', 'error', fallbackHtml(cfg, order, ref, 'Reservations are not open online yet.'));
  }

  async function payCard(form, cfg, order, ref, product, shopifyReady) {
    if (shopifyReady) {
      $(form, '.order-go').textContent = 'Opening checkout…';
      const s = cfg.shopify;
      const query = 'mutation($input: CartInput!){cartCreate(input:$input){cart{checkoutUrl}userErrors{field message}}}';
      const input = {
        lines: [{ merchandiseId: product.shopifyVariantId, quantity: order.qty }],
        buyerIdentity: { email: order.email, countryCode: order.country },
        attributes: [{ key: 'Pre-order', value: 'yes' }, { key: 'Naga order ref', value: ref }, { key: 'Name', value: order.name }],
      };
      const r = await fetch('https://' + s.storeDomain + '/api/' + s.apiVersion + '/graphql.json', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'X-Shopify-Storefront-Access-Token': s.storefrontToken },
        body: JSON.stringify({ query, variables: { input } }),
      });
      const data = await r.json().catch(() => ({}));
      const cart = data.data && data.data.cartCreate;
      if (cart && cart.cart && cart.cart.checkoutUrl) { announce('checkout', order, ref, Core.quote(cfg, order.product, order.qty, order.country)); window.location.href = cart.cart.checkoutUrl; return; }
      const why = (cart && cart.userErrors && cart.userErrors[0] && cart.userErrors[0].message) || (data.errors && data.errors[0] && data.errors[0].message);
      throw new Error('Checkout could not open' + (why ? ': ' + why : '.') + ' Please try again.');
    }
    // Card checkout not connected yet: keep the pre-order and follow up by email.
    $(form, '.order-go').textContent = 'Saving…';
    const res = await api(cfg, Object.assign({ type: 'card-request', ref }, order));
    if (res.ok) { announce('card-request', order, ref, Core.quote(cfg, order.product, order.qty, order.country)); say(form, 'You are on the pre-order list for ' + product.name + '. We will email ' + order.email + ' a payment link when checkout opens. Reference ' + ref + '.', 'ok'); clearContact(form); return; }
    say(form, '', 'error', fallbackHtml(cfg, order, ref, 'Online pre-orders are not open yet.'));
  }

  async function payCrypto(form, cfg, order, ref, q) {
    const go = $(form, '.order-go');
    go.textContent = 'Connecting wallet…';
    const mod = await import(new URL('assets/vendor/privy/privy-pay.js', document.baseURI).href);
    const c = cfg.crypto;
    await mod.init({ appId: c.privyAppId, rpcUrl: c.rpcUrl, theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' });
    go.textContent = 'Approve in your wallet…';
    const paid = await mod.payUsdc({ recipient: c.recipient, mint: c.mint, amount: q.usdc, decimals: c.decimals, memo: 'naga:' + ref, chain: c.chain });
    const link = '<a href="' + c.explorer + paid.signature + '" target="_blank" rel="noopener">View the payment</a>';
    go.textContent = 'Confirming payment…';
    // The server checks the transaction on-chain; it can take a few seconds to be visible.
    for (let i = 0; i < 6; i++) {
      const res = await api(cfg, Object.assign({ type: 'crypto', ref, signature: paid.signature, from: paid.from }, order));
      if (res.ok) { announce('paid', order, ref, q); say(form, '', 'ok', 'Paid. Your pre-order ' + ref + ' is confirmed and a receipt is on its way to ' + order.email + '. ' + link + '.'); clearContact(form); return; }
      if (res.status !== 409) break;
      await new Promise((r) => setTimeout(r, 3000));
    }
    say(form, '', 'error', 'Your payment went through, but we could not confirm the order automatically. Keep this reference: ' + ref + '. ' + link + ', and <a href="' + mailto(cfg, 'Crypto pre-order ' + ref, 'Signature: ' + paid.signature) + '">email us</a> so we can match it.');
  }
})();
