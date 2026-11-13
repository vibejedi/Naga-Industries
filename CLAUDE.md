# Naga Industries website

Static site, no build step. Open `index.html` or serve the folder with any static server.

## Pages

| File            | Role                                                  |
|-----------------|-------------------------------------------------------|
| `index.html`    | Homepage, one screen a section: the carved-wall hero, the range (three product cards), LAKAN II (the black chapter), SIPAG I, DIWA and Baku, the cyan "Why Naga" statement, the compare table. The brand film section, its nav link and its footer link are removed for now (13 November 2026); restore them from git history |
| `sipag-i.html`  | NAGA SIPAG I, productivity laptop                     |
| `lakan-ii.html` | NAGA LAKAN II, gaming laptop                          |
| `diwa.html`     | NAGA DIWA, AI mini PC (Baku section with the Baku film) |
| `about.html`    | Company facts: the visible brand fact sheet (keep in step with `seo/brand-facts.md`) |
| `node.html`     | $NAGA rewards page, served at `/node` ("Rewards" in the nav and footers), live since 12 November 2026. It was `naga.html` until 13 November 2026; `vercel.json` redirects the old address. Model, legal notes and open work: `docs/naga-token-model.md` |

## Design system (read `.claude/skills/naga-design-system/SKILL.md` before touching visuals)

- Direction: two neutrals, one cyan, one type family, the product big, one black chapter per page. Layout, copy and motion follow the taste skill in `.claude/skills/design-taste-frontend` (tasteskill 2.5.1, MIT); its `NAGA.md` says what we take from it and what we leave out. Use it for any redesign or new page.
- Tokens live in `assets/css/naga.css` under `:root`. Never introduce a new color; use the tokens. Dark mode remaps the same tokens under `:root[data-theme="dark"]` (paper → void, ink → onvoid); `data-theme` is set before paint by the inline script in each page head and flipped by `.theme-btn` in the nav. Text on cyan uses `--on-cyan` so it stays dark in both themes. Never hard-code white or black backgrounds; use `--paper`, `--void` and friends.
- One accent: `--cyan` for fills and glow, `--cyan-link` for text links on white. No teal variants.
- One family: Outfit for headings and text, weights 400 and 500 only (never bold). Labels (`.eyebrow`) are 13px in sentence case, never uppercase or letter-spaced.
- Accent face Tilt Neon (`--font-accent`) for product names only: add `.nameplate` to a product-name heading or wrap the name in `span.nameplate` inside a headline; `.subnav .pname` and the compare header `.pn` already use it. One weight, so never bold it.
- One content edge: `.wrap` is 1280px wide and the nav, sub-nav and footer pad to the same two lines (`--edge`). Headings and text start on the left line; nothing is centred. The product stands big on the section's ground in `figure.stage`, never mid-size in a grey panel, and no picture has a caption.
- Copy is English for the export market: short headlines, tight tracking. Write it with `.claude/skills/stop-slop` (MIT): "we" and "you", active voice, real numbers and named things, no slogans, no stacked fragments, no "not X, it's Y", no adverbs, no em dashes. A heading names a thing; a button is a verb and an object. Product names (SIPAG, LAKAN, DIWA, Baku) and the brand motto SULONG stay Filipino; no other Tagalog. Prices come in two: pesos for the Philippines (VAT included) and a fixed USD price for everywhere else (`php` and `usd` in `store.json`); show both, never a converted figure. Numbers are the headline in spec tiles. No emoji as icons.
- Every page: `.nav` (fixed, 56px, opaque) and, on product pages, `.subnav` (sticky, Buy pill). Sections that are dark carry `data-nav-dark` so the nav flips.

## Libraries (vendored in `assets/vendor/`, versions pinned in `package.json`)

| Library        | Used for                                                   |
|----------------|------------------------------------------------------------|
| lottie-web (light) | the wave mark in the nav, `assets/lottie/naga-wave.json` (draws once on load and on hover) |
| GSAP           | the promo film pages in `promo/` only; no site page loads it |

The site has no animation or scroll library: `naga.js` and CSS do all of it. Load order at the bottom of each page: lottie, then `naga.js` and `naga-analytics.js` (product pages add `store-core.js` and `naga-store.js`). Never let a missing library hide content.

To bump a library: edit the version in `package.json`, run `npm install` and `npm run vendor`.

## Motion rules

A page moves in three places and nowhere else.

- The hero enters once on load. Mark the hero section `data-enter`; its h1 rises line by line from word masks, `[data-enter-up]` items fade up in order and `[data-enter-media]` settles from 1.05 to 1 (keyframes in `naga.css`, splitting in `naga.js` 5). The inline head script adds `html.m-enter`, which hides the hero's words, and lifts it by itself after 900ms; this is the only place CSS hides content.
- One moment follows the scroll in its own section: `p[data-say]` (the homepage "Why Naga" statement) lights up word by word (`naga.js` 16). The text is whole without script.
- The hover layer: buttons step 1px, links draw an underline, a linked card (`.pcard`) lifts 2px and its picture grows 3%. A card without a link does not move.
- Nothing else moves on scroll: no reveals, no rising headlines, no count-ups, no parallax, no smooth-scroll library. Prices never animate.
- Respect `prefers-reduced-motion`: the hero stands, the statement is in full ink, films do not autoplay.
- Living sea: `naga.js` (13) puts a WebGL caustics canvas (`canvas.sea`) behind the first `.chapter.dark` of a page, the page's one effect. It only adds cyan light over `--void`, renders at half resolution and 30 fps while on screen, draws one still frame with reduced motion, and does nothing without WebGL.
- The hero film loops, so it has a round `.pause` button.
- Promo films: `figure.promo` (muted loop on screen, Pause and Sound on buttons; Sound on restarts with sound and the ambient music ducks). Files in `assets/video/promo/` are web encodes of `promo/` renders. Only the Baku film is on the site; the product promos wait for b-roll rebuilt from accurate reference photos.
- No 3D. Product visuals are transparent 16:9 WebP renders in `assets/img/products/` (SIPAG I and LAKAN II: renders of the real Clevo chassis; DIWA: AI concept render). Nothing moves the product except the hero's settle on load and the b-roll clips in `.reel` (`assets/video/broll/`), which play muted only while on screen and stay on their poster with reduced motion.

## Sound

Ambient music (`assets/audio/naga-ambient-bakunawa-night.mp3`, the 54 s Bakunawa Night loop from the Naga sound kit) plays quietly behind every page. Browsers block sound until a gesture, so `naga.js` (section 12) starts it on the first click, tap or key press; `.sound-btn` in the nav mutes it and the choice is remembered. It loops gaplessly with Web Audio, resumes where it left off on the next page, pauses in background tabs and ducks under any video playing with sound.

## Content status

LAKAN II specs and price are confirmed (Clevo V255RNN1 base, 15.6" QHD 165Hz, ₱99,900 / US$1,499 international, with the Naga Karga backpack). SIPAG I specs and price are confirmed for the black restock (Clevo V740TU-2, 16GB DDR5, 512GB SSD, ₱49,900 / US$699 international). DIWA specs and prices are placeholders marked with `PLACEHOLDER SPECS` comments. Baku, Naga's own local LLM, ships on DIWA and is being built with the Machine.Fun ecosystem (project link https://machine.fun/project/J8RKZwmr8ol, on the homepage splash and the DIWA section). It has its own section (`diwa.html#baku`, mascot `assets/img/baku.webp`) plus a splash on the homepage built around `assets/img/baku-coding.webp` (Higgsfield render of Baku coding on a SIPAG I underwater); claims are limited to what is confirmed: it runs on the machine, keeps data private, works offline and speaks all languages. Socials (Facebook nagaindustries, Instagram nagaindustriesph) sit in every footer. Confirm with the product team before launch. DIWA has no price yet: it shows "Coming soon" and takes reservations only. Shipping is free in the Philippines and a $100 flat rate worldwide by DHL Express from Manila (3 to 14 days by zone). SIPAG I and LAKAN II images are Higgsfield renders built from the Clevo spec-sheet photos (real chassis, Naga wallpaper on screen, small flat-printed wordmark on the lid, as on the production lid); the DIWA image is still an AI concept render. Swap files at the same paths when photography exists. The b-roll clips and the LAKAN II, SIPAG I and DIWA promo films were judged inaccurate (the laptop designs do not match the real units); Naga is shooting reference photos, and the b-roll and product promos get rebuilt from them.

## $NAGA token (see `docs/naga-token-model.md`)

- `node.html` (naga.industries/node) is live on the owner's decision, without an SEC disclosure filing. Keep every $NAGA claim true today: label what is still in build, and switch nothing on in the order forms (`naga.enabled`) until it works.
- Positioning: $NAGA is the key to Naga Node (a bonded laptop takes paid bandwidth and computing work on peaqOS); perks come second. Earnings appear only as Naga's own estimate (about ₱1,000 a month for a SIPAG I and ₱1,500–1,800 for a LAKAN II, reached when Machine Rewards pay near their cap; ₱300–600 from bandwidth sharing alone), always labelled as an estimate with the power cost and "Profitability varies. You may receive as little as ₱0" beside it, and never called a return; peaq's US$0.50–3 a day figure stays out until peaq documents it. The launch thread is `docs/naga-launch-thread.md`. Never ask anyone to buy it; no price, chart or buy link anywhere.
- Fees and rewards (owner's decisions, 13 November 2026): creator fees split 30% Machine Rewards, 40% products, 30% team and marketing. Machine Rewards are paid in $MU, the token $NAGA trades against. Call $MU "a token that tracks Micron Technology's share price". Never say a laptop earns Micron stock or shares, never suggest Micron is a partner, and keep the line that some countries restrict it.
- Wording rules: $NAGA unlocks perks; it is never an investment. Rewards are "for the work your machine does", shown as ranges with the electricity cost and "can be zero". Never promise a price, a return, yield, passive income or a machine that pays for itself. Staking gives access, not money.
- Fee split bar: `.split` (segments `.s-a/.s-b/.s-c` with inline `flex`) and `.split-key` (four keys; `.k-d` is the hollow dot for a milestone that is not running yet).

## SEO and analytics (see `seo/README.md`)

- Each page's head has a generated `<!-- seo -->` block (title, description, canonical, Open Graph, one JSON-LD `@graph`). Never edit it by hand: change `seo/site.json` (or prices in `store.json`) and run `npm run seo`, which also writes `sitemap.xml`, `robots.txt` and `llms.txt`. `npm test` fails if they are stale.
- Canonical URLs are `https://naga.industries/<page>.html`; link to the homepage as `/`, never `index.html`. The Rewards page is the one clean address: `node.html` is served at `/node` by a rewrite in `vercel.json`, its canonical is `https://naga.industries/node`, and every link to it is `/node`. A new indexable page goes in `seo/site.json`, the footer and `seo/urls.txt`.
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

`node` + Playwright are available in cloud sessions. Serve the folder and screenshot at 1440 and 390 wide in both themes; check the console for errors and that `document.documentElement.scrollWidth` equals `clientWidth` (no horizontal scroll). Then run the taste skill's `copy-lint.mjs` on changed pages and its `assets/layout/check.mjs` on the homepage (commands in `.claude/skills/design-taste-frontend/NAGA.md`); the homepage must report no findings at 1440x900.
