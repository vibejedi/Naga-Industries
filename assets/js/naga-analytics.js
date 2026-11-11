/* ==========================================================================
   Naga analytics: Vercel Web Analytics and Google Analytics 4, with AI
   assistant referrals tagged so the monthly AI traffic report can count them
   (see .claude/skills/ai-traffic-analytics and seo/README.md).

   - Runs only on the production hosts, so local previews send nothing.
   - Vercel Web Analytics: cookie-free. Turn it on in Vercel > Project >
     Analytics; until then /_vercel/insights/script.js is simply absent.
   - GA4: off until GA4_ID is set. Consent Mode v2 defaults deny analytics
     cookies in the EEA, UK and Switzerland (GA4 sends cookieless pings there)
     and allow them elsewhere. Ads storage is denied everywhere.
   - Events: ai_referral (once per session, with ai_source), and the order
     steps from naga-store.js: generate_lead (reservation or saved pre-order),
     begin_checkout (Shopify), purchase (USDC payment confirmed on-chain).
     No names or emails are ever sent.
   ========================================================================== */
(function () {
  'use strict';

  var GA4_ID = ''; // e.g. 'G-ABC123XYZ'. Empty switches GA4 off.
  var PROD_HOSTS = /(^|\.)naga\.industries$/;

  // Hostname (or utm_source value) of each AI assistant -> short source name.
  // Keep in step with the GA4 custom channel regex in seo/README.md.
  var AI = [
    [/(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/, 'chatgpt'],
    [/(^|\.)perplexity\.ai$/, 'perplexity'],
    [/^(gemini|bard)\.google\.com$/, 'gemini'],
    [/(^|\.)copilot\.microsoft\.com$|^copilot\.cloud\.microsoft$/, 'copilot'],
    [/(^|\.)claude\.ai$/, 'claude'],
    [/(^|\.)deepseek\.com$/, 'deepseek'],
    [/(^|\.)grok\.com$/, 'grok'],
    [/(^|\.)meta\.ai$/, 'meta-ai'],
    [/(^|\.)mistral\.ai$/, 'mistral'],
  ];

  function matchAi(host) {
    host = String(host || '').toLowerCase();
    for (var i = 0; i < AI.length; i++) if (AI[i][0].test(host)) return AI[i][1];
    return '';
  }

  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } return v; }

  // The AI assistant that sent this visit: referrer first, then ChatGPT's utm_source tag.
  // Remembered for the session so a later pre-order can carry it.
  function detect() {
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { /* bad referrer */ }
    var utm = '';
    try { utm = new URLSearchParams(location.search).get('utm_source') || ''; } catch (e) { /* old browser */ }
    return matchAi(ref) || matchAi(utm);
  }
  var fresh = detect();
  if (fresh) store('naga-ai', fresh);
  var aiSource = function () { return store('naga-ai') || ''; };
  window.NagaAnalytics = { aiSource: aiSource };

  if (!PROD_HOSTS.test(location.hostname)) return;

  function addScript(src) {
    var s = document.createElement('script');
    s.defer = true; s.src = src;
    document.head.appendChild(s);
  }

  // Vercel Web Analytics (queue calls until the script loads).
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  addScript('/_vercel/insights/script.js');
  var vaEvent = function (name, data) { try { window.va('event', { name: name, data: data }); } catch (e) { /* ignore */ } };

  // GA4 with Consent Mode v2.
  var gtag = function () { /* GA4 off */ };
  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    gtag = function () { window.dataLayer.push(arguments); };
    var EEA = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH'];
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: EEA });
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA4_ID);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
  }

  if (fresh && !store('naga-ai-sent')) {
    store('naga-ai-sent', '1');
    gtag('event', 'ai_referral', { ai_source: fresh });
    vaEvent('AI referral', { source: fresh });
  }

  var GA_STEP = { reserve: 'generate_lead', 'card-request': 'generate_lead', checkout: 'begin_checkout', paid: 'purchase' };
  document.addEventListener('naga:order', function (ev) {
    var d = ev.detail || {};
    var params = { currency: 'USD', value: d.valueUsd || 0, ai_source: aiSource() || '(none)', order_step: d.step,
      items: [{ item_id: d.product, item_name: d.product, quantity: d.qty || 1 }] };
    if (d.step === 'paid') params.transaction_id = d.ref;
    gtag('event', GA_STEP[d.step] || 'generate_lead', params);
    vaEvent('Pre-order', { step: d.step, product: d.product, ai: aiSource() || 'none' });
  });
})();
