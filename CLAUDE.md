# Naga Industries website

Static site, no build step. Open `index.html` or serve the folder with any static server.

## Pages

| File            | Role                                                  |
|-----------------|-------------------------------------------------------|
| `index.html`    | Homepage: entrance film, three product tiles, performance chapter, "why Naga" bento, compare table, film |
| `sipag-i.html`  | NAGA SIPAG I, productivity laptop                     |
| `lakan-ii.html` | NAGA LAKAN II, gaming laptop                          |
| `diwa.html`     | NAGA DIWA, AI mini PC                                 |

## Design system (read `.claude/skills/naga-design-system/SKILL.md` before touching visuals)

- Direction: Apple's calm (two neutrals, one accent, thin blurred nav, bento, chevron links) with one Razer-style black chapter per page.
- Tokens live in `assets/css/naga.css` under `:root`. Never introduce a new color; use the tokens.
- One accent: `--cyan` for fills and glow, `--cyan-link` for text links on white. No teal variants.
- Display face Outfit (echoes the round "naga" wordmark); body is the system font stack.
- Accent face Tilt Neon (`--font-accent`) for product names only: add `.nameplate` to a product-name heading; `.subnav .pname` and the compare header `.pn` already use it. One weight, so never bold it.
- Copy is English for the export market: short headlines, tight tracking. Product names (SIPAG, LAKAN, DIWA, Baku) and the brand motto SULONG stay Filipino; no other Tagalog. Peso prices show a USD conversion next to them (≈ US$, rounded to $10). Numbers are the headline in spec tiles. No emoji as icons.
- Every page: `.nav` (fixed, 48px) and, on product pages, `.subnav` (sticky, Buy pill). Sections that are dark carry `data-nav-dark` so the nav flips.

## Libraries (vendored in `assets/vendor/`, versions pinned in `package.json`)

| Library        | Used for                                                   |
|----------------|------------------------------------------------------------|
| GSAP + ScrollTrigger | reveals, headline word animation, product-shot settle, nav dark detection |
| Lenis          | smooth inertial scrolling, in-page anchor scrolling        |
| lottie-web (light) | animated wave mark in the nav, `assets/lottie/naga-wave.json` |
| Splitting      | splits `[data-splitting]` headlines into words for GSAP    |

Load order at the bottom of each page: gsap, ScrollTrigger, lenis, splitting, lottie, then `naga.js`. Each effect in `naga.js` checks for its library and degrades; never let a missing library hide content.

To bump a library: edit the version in `package.json`, run `npm install` and `npm run vendor`.

## Motion rules

- Resting state is visible. GSAP `from` tweens do the hiding; CSS never sets `opacity: 0`.
- Respect `prefers-reduced-motion`: Lenis, scrubs and word reveals are skipped in `naga.js`.
- No 3D. Product visuals are transparent 16:9 WebP renders in `assets/img/products/` (SIPAG I and LAKAN II: renders of the real Clevo chassis; DIWA: AI concept render). The product page shot (`[data-hero-shot]`) settles from 1.08× to 1× on scroll; nothing else moves the product, except the b-roll clips in `.reel` (`assets/video/broll/`), which play muted only while on screen and stay on their poster with reduced motion.

## Content status

LAKAN II specs and price are confirmed (Clevo V255RNN1 base, ₱89,900 with the Naga Karga backpack; panel resolution and refresh rate still to confirm). SIPAG I specs are confirmed for the black restock (Clevo V740TU-2) except RAM and SSD capacity and price; DIWA specs and prices are placeholders marked with `PLACEHOLDER SPECS` comments. Baku, Naga's own local LLM, ships on DIWA and has its own section (`diwa.html#baku`, mascot `assets/img/baku.webp`) plus a band on the homepage; claims are limited to what is confirmed: it runs on the machine, keeps data private, works offline and speaks all languages. Socials (Facebook nagaindustries, Instagram nagaindustriesph) sit in every footer. Confirm with the product team before launch. DIWA has no price yet: it shows "Coming soon" with "Get notified" buttons. Shipping is free in the Philippines and a $100 flat rate worldwide. Buy, Get notified and Find a store buttons link to `#` until the store exists. SIPAG I and LAKAN II images are Higgsfield renders built from the Clevo spec-sheet photos (real chassis, Naga wallpaper on screen, small flat-printed wordmark on the lid, as on the production lid); the DIWA image is still an AI concept render. Swap files at the same paths when photography exists.

## Verifying

`node` + Playwright are available in cloud sessions. Serve the folder and screenshot at 1440 and 390 wide; check the console for errors and that `document.documentElement.scrollWidth` equals `clientWidth` (no horizontal scroll).
