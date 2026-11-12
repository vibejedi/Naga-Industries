# Naga Industries website

Static site, no build step. Open `index.html` or serve the folder with any static server.

## Pages

| File            | Role                                                  |
|-----------------|-------------------------------------------------------|
| `index.html`    | Homepage: entrance film, three product tiles, performance chapter, "why Naga" bento, compare table, film |
| `sipag-i.html`  | NAGA SIPAG I, productivity laptop                     |
| `lakan-ii.html` | NAGA LAKAN II, gaming laptop                          |
| `diwa.html`     | NAGA DIWA, AI mini PC (Baku section with the Baku film) |
| `about.html`    | Company facts: the visible brand fact sheet (keep in step with `seo/brand-facts.md`) |
| `naga.html`     | $NAGA token page. **Draft, not deployed**: in `.vercelignore` with `noindex` until legal review and the SEC filing. Model and launch steps: `docs/naga-token-model.md` |

## Design system (read `.claude/skills/naga-design-system/SKILL.md` before touching visuals)

- Direction: Apple's calm (two neutrals, one accent, thin blurred nav, bento, chevron links) with one Razer-style black chapter per page.
- Tokens live in `assets/css/naga.css` under `:root`. Never introduce a new color; use the tokens. Dark mode remaps the same tokens under `:root[data-theme="dark"]` (paper → void, ink → onvoid); `data-theme` is set before paint by the inline script in each page head and flipped by `.theme-btn` in the nav. Text on cyan uses `--on-cyan` so it stays dark in both themes. Never hard-code white or black backgrounds; use `--paper`, `--glass` and friends.
- One accent: `--cyan` for fills and glow, `--cyan-link` for text links on white. No teal variants.
- Display face Outfit (echoes the round "naga" wordmark); body is the system font stack.
- Accent face Tilt Neon (`--font-accent`) for product names only: add `.nameplate` to a product-name heading; `.subnav .pname` and the compare header `.pn` already use it. One weight, so never bold it.
- Copy is English for the export market: short headlines, tight tracking. Write it with `.claude/skills/stop-slop` (MIT): "we" and "you", active voice, real numbers and named things, no slogans, no stacked fragments, no "not X, it's Y", no adverbs, no em dashes. Product names (SIPAG, LAKAN, DIWA, Baku) and the brand motto SULONG stay Filipino; no other Tagalog. Prices come in two: pesos for the Philippines (VAT included) and a fixed USD price for everywhere else (`php` and `usd` in `store.json`); show both, never a converted figure. Numbers are the headline in spec tiles. No emoji as icons.
- Every page: `.nav` (fixed, 48px) and, on product pages, `.subnav` (sticky, Buy pill). Sections that are dark carry `data-nav-dark` so the nav flips.

## Libraries (vendored in `assets/vendor/`, versions pinned in `package.json`)

| Library        | Used for                                                   |
|----------------|------------------------------------------------------------|
| GSAP + ScrollTrigger | reveals, headline word animation, product-shot settle, nav dark detection |
| Lenis          | smooth inertial scrolling, in-page anchor scrolling        |
| lottie-web (light) | animated wave mark in the nav, `assets/lottie/naga-wave.json` |
| Splitting      | splits `[data-splitting]` headlines into words for GSAP    |

Load order at the bottom of each page: gsap, ScrollTrigger, lenis, splitting, lottie, then `naga.js` and `naga-analytics.js`. Each effect in `naga.js` checks for its library and degrades; never let a missing library hide content.

To bump a library: edit the version in `package.json`, run `npm install` and `npm run vendor`.

## Motion rules

- Resting state is visible. GSAP `from` tweens do the hiding; CSS never sets `opacity: 0`.
- Respect `prefers-reduced-motion`: Lenis, scrubs and word reveals are skipped in `naga.js`.
- Light chapters reveal headlines calmly (`[data-splitting]` words rise out of a blur). Dark chapters are the Razer act: their `h2.t-h2` slams in word by word with a shake and a cyan flash on the `<em>`, and spec numbers in `.statrow` and `.bento` `.t-big` count up from zero (text already holds the final number).
- Living sea: `naga.js` (13) puts a WebGL caustics canvas (`canvas.sea`) behind every `.chapter.dark`. It only adds cyan light over `--void`, renders at quarter resolution and 30 fps while on screen, draws one still frame with reduced motion, and does nothing without WebGL.
- Promo films: `figure.promo` (muted loop on screen, Pause and Sound on buttons; Sound on restarts with sound and the ambient music ducks). Files in `assets/video/promo/` are web encodes of `promo/` renders. Only the Baku film is on the site; the product promos wait for b-roll rebuilt from accurate reference photos.
- No 3D. Product visuals are transparent 16:9 WebP renders in `assets/img/products/` (SIPAG I and LAKAN II: renders of the real Clevo chassis; DIWA: AI concept render). The product page shot (`[data-hero-shot]`) settles from 1.08× to 1× on scroll; nothing else moves the product, except the b-roll clips in `.reel` (`assets/video/broll/`), which play muted only while on screen and stay on their poster with reduced motion.

## Sound

Ambient music (`assets/audio/naga-ambient-bakunawa-night.mp3`, the 54 s Bakunawa Night loop from the Naga sound kit) plays quietly behind every page. Browsers block sound until a gesture, so `naga.js` (section 12) starts it on the first click, tap or key press; `.sound-btn` in the nav mutes it and the choice is remembered. It loops gaplessly with Web Audio, resumes where it left off on the next page, pauses in background tabs and ducks under any video playing with sound.

## Content status

LAKAN II specs and price are confirmed (Clevo V255RNN1 base, 15.6" QHD 165Hz, ₱99,900 / US$1,499 international, with the Naga Karga backpack). SIPAG I specs and price are confirmed for the black restock (Clevo V740TU-2, 16GB DDR5, 512GB SSD, ₱49,900 / US$699 international). DIWA specs and prices are placeholders marked with `PLACEHOLDER SPECS` comments. Baku, Naga's own local LLM, ships on DIWA and is being built with the Machine.Fun ecosystem (project link https://machine.fun/project/J8RKZwmr8ol, on the homepage splash and the DIWA section). It has its own section (`diwa.html#baku`, mascot `assets/img/baku.webp`) plus a splash on the homepage built around `assets/img/baku-coding.webp` (Higgsfield render of Baku coding on a SIPAG I underwater); claims are limited to what is confirmed: it runs on the machine, keeps data private, works offline and speaks all languages. Socials (Facebook nagaindustries, Instagram nagaindustriesph) sit in every footer. Confirm with the product team before launch. DIWA has no price yet: it shows "Coming soon" and takes reservations only. Shipping is free in the Philippines and a $100 flat rate worldwide by DHL Express from Manila (3 to 14 days by zone). SIPAG I and LAKAN II images are Higgsfield renders built from the Clevo spec-sheet photos (real chassis, Naga wallpaper on screen, small flat-printed wordmark on the lid, as on the production lid); the DIWA image is still an AI concept render. Swap files at the same paths when photography exists. The b-roll clips and the LAKAN II, SIPAG I and DIWA promo films were judged inaccurate (the laptop designs do not match the real units); Naga is shooting reference photos, and the b-roll and product promos get rebuilt from them.

## $NAGA token (see `docs/naga-token-model.md`)

- Nothing about $NAGA goes on a deployed page, the order forms or structured data until the launch checklist in that doc is done; token marketing in the Philippines needs an SEC disclosure document public for 30 days first.
- Positioning: $NAGA is the rewards token for Naga laptops (earned by a laptop's work, used for perks). Never ask anyone to buy it; no price, chart or buy link anywhere.
- Wording rules: $NAGA unlocks perks; it is never an investment. Rewards are "for the work your machine does", shown as ranges with the electricity cost and "can be zero". Never promise a price, a return, yield, passive income or a machine that pays for itself. Staking gives access, not money.
- Fee split bar: `.split` (segments `.s-a/.s-b/.s-c` with inline `flex`) and `.split-key`.

## SEO and analytics (see `seo/README.md`)

- Each page's head has a generated `<!-- seo -->` block (title, description, canonical, Open Graph, one JSON-LD `@graph`). Never edit it by hand: change `seo/site.json` (or prices in `store.json`) and run `npm run seo`, which also writes `sitemap.xml`, `robots.txt` and `llms.txt`. `npm test` fails if they are stale.
- Canonical URLs are `https://naga.industries/<page>.html`; link to the homepage as `/`, never `index.html`. A new indexable page goes in `seo/site.json`, the footer and `seo/urls.txt`.
- Structured data must match visible text; a price goes into Product/Offer markup only when `priceConfirmed` is true in `store.json`.
- `assets/js/naga-analytics.js`: Vercel Web Analytics and GA4 (`GA4_ID`, empty = off) on naga.industries only, with AI assistant referrals tagged. Order forms carry an optional "How did you hear about Naga?" (`Core.HEARD`).
- SEO skills (RomeoSEO, MIT) are in `.claude/skills/`; use them for audits, schema, comparison pages and content QA.

## Store (pre-orders, Shopify, crypto, shipping)

- `assets/data/store.json` is the one source of truth: prices (`php` charged to Philippine addresses, `usd` to everyone else; the `naga` block holds the $NAGA holder discount, off until the token launches and only applied after server-side verification), DHL zones and lead times, Shopify Storefront settings, Privy app ID and the Solana USDC recipient. Empty values switch a feature off; the form then saves the order through `/api/preorder` instead. Never put secrets in it.
- `assets/js/store-core.js` (pricing, zones, validation) is shared by the browser and the server so quotes always match. `assets/js/naga-store.js` drives `form.order[data-order]` on each product page (pre-order on SIPAG I and LAKAN II, reservation on DIWA). Load order: naga.js, store-core.js, naga-store.js.
- Card: Shopify Storefront `cartCreate`, then redirect to Shopify checkout. Crypto: USDC on Solana through Privy (`assets/vendor/privy/`, built from `scripts/privy/` with `npm run build:privy`; loaded only when a visitor picks crypto). The payment memo is `naga:<order ref>`.
- `api/preorder.js` is a Vercel function: it re-validates and re-prices every order, verifies crypto payments on-chain (amount, recipient, memo, age) and records orders to `PREORDER_WEBHOOK_URL` and/or a Shopify draft order (`SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN`). Without either it answers 503 and the page offers email.
- `npm test` runs the API tests (mocked network) and the Solana transfer test.

## Verifying

`node` + Playwright are available in cloud sessions. Serve the folder and screenshot at 1440 and 390 wide; check the console for errors and that `document.documentElement.scrollWidth` equals `clientWidth` (no horizontal scroll).
