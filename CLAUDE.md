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
- Headlines: short, tight tracking, Taglish voice. Numbers are the headline in spec tiles. No emoji as icons.
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
- No 3D. Product visuals are images in `assets/img/products/` (placeholder SVGs until photos or renders exist). The product page shot (`[data-hero-shot]`) settles from 1.08× to 1× on scroll; nothing else moves the product.

## Content status

Only LAKAN II carries specs from the original LAKAN 15 page. SIPAG I and DIWA specs, and all three prices, are placeholders marked with `PLACEHOLDER SPECS` comments. Confirm with the product team before launch. Buy and Find a store buttons link to `#` until the store exists. The three product images are placeholders; swap the files at the same paths.

## Verifying

`node` + Playwright are available in cloud sessions. Serve the folder and screenshot at 1440 and 390 wide; check the console for errors and that `document.documentElement.scrollWidth` equals `clientWidth` (no horizontal scroll).
