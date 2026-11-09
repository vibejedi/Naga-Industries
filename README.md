# Naga Industries — website

Static site for the three Naga products. No build step: open `index.html` or serve the folder.

```
npx serve .          # or any static server
```

## Pages

- `index.html` — entrance film, product tiles (LAKAN II, SIPAG I, DIWA), performance chapter, why Naga, compare, film
- `lakan-ii.html` — NAGA LAKAN II, gaming laptop
- `sipag-i.html` — NAGA SIPAG I, productivity laptop
- `diwa.html` — NAGA DIWA, AI mini PC

## Structure

```
assets/
  css/naga.css        design tokens and every component
  js/naga.js          nav, Lenis smooth scroll, GSAP reveals, Splitting headlines, Lottie mark, counters
  vendor/             pinned library builds (see package.json); nothing loads from a CDN except Google Fonts
  img/                wordmarks, poster frames, favicon
  img/products/       product renders (transparent 16:9 WebP, 2000×1125)
  video/              1080p H.264 entrance film (source 4K HEVC master kept in video/source/)
  lottie/             naga-wave.json, the animated mark in the nav
.claude/skills/naga-design-system/SKILL.md   the design system, loaded by Claude before visual work
CLAUDE.md                                    project conventions for Claude Code sessions
```

## Libraries

| Library | Version | Role |
|---|---|---|
| GSAP + ScrollTrigger | 3.15.0 | reveals, product-shot settle, nav dark detection |
| Lenis | 1.3.26 | smooth scrolling |
| lottie-web (light) | 5.13.0 | animated wave mark |
| Splitting | 1.1.0 | word-by-word headline reveals |

To update: change the version in `package.json`, then `npm install && npm run vendor`.

## Content to confirm before launch

Only LAKAN II carries specs from the original LAKAN 15 page. Everything below is a placeholder written to make the pages read like finished product pages. Each is marked `PLACEHOLDER SPECS` in the HTML.

- **SIPAG I**: 14" 2.8K OLED 90Hz, Ryzen 7 8840U, 32GB LPDDR5X, 1TB, 1.3 kg, 70Wh, 18 hrs video, ₱49,990
- **DIWA**: Ryzen AI 9 HX 370 (50 TOPS), 64GB LPDDR5X, 2TB, 1.1 L, 28 dB, 65W, ₱59,990
- **LAKAN II**: carried from LAKAN 15 (RTX 4070 140W, 15.3" 2.5K 240Hz, i9 14th Gen / Ryzen 7 8845HS, 32GB DDR5, 1TB, ₱63,000, was ₱73,500); the 99Wh battery, MUX switch, Thunderbolt 4 and 2.5GbE claims are new placeholders
- Homepage "why Naga" claims: 24-hour burn-in, 0% up to 12 months, free insured shipping, 7-day replacement
- All "Buy" and "Find a store" buttons link to `#` until the store exists
- The film still streams from the Higgsfield CloudFront URL; host it with the site before launch

## Product images

`assets/img/products/lakan-ii.webp`, `sipag-i.webp` and `diwa.webp` are AI-generated concept renders (GPT Image 2.5 via Higgsfield, transparent background, cleaned and reframed to 16:9 at 2000×1125). They are design intent, not photographs of shipping hardware. To replace one with a real product photo, export a transparent 16:9 WebP at the same path; the homepage tile, the product page shot and the dark chapter all read from it.
