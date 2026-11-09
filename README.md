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

LAKAN II carries confirmed specs. SIPAG I and DIWA are still placeholders written to make the pages read like finished product pages, marked `PLACEHOLDER SPECS` in the HTML.

- **SIPAG I** (black restock, mostly confirmed): built on the Clevo V740TU-2 (spec sheet v3.1, 2026/05) per the Naga order. Intel Core Ultra 5 125U, 14" Full HD 60Hz panel (45% NTSC), Intel Graphics, two DDR5-5600 SO-DIMM slots (up to 64GB), one M.2 2280 PCIe Gen4 SSD slot, white-backlit keyboard, Intel AX211 Wi-Fi 6E + Bluetooth, Gigabit LAN, USB-C with DisplayPort and power delivery, 2 × USB-A, HDMI, microSD, 2MP FHD camera with shutter, 60Wh battery (up to 13 h per Clevo), 1.30 kg, 315.6 × 226 × 16.85 mm, metal lid and base, 180° hinge, MIL-STD-810H. Still to confirm: the RAM and SSD capacities Naga installs (the unit ships without them or an OS), the price (₱49,990 is a placeholder), whether the panel is FHD or FHD+ (the order says FHD, the sheet lists 1920×1200), and black product imagery (the current render is silver)
- **DIWA**: Ryzen AI 9 HX 370 (50 TOPS), 64GB LPDDR5X, 2TB, 1.1 L, 28 dB, 65W, ₱59,990
- **LAKAN II** (confirmed): built on the Clevo V255RNN1 (spec sheet v3.0, 2025/11). Intel Core 7 250H, 16GB DDR5-5600 dual channel (two SO-DIMM, up to 64GB), RTX 5060 Laptop up to 115W with 8GB GDDR7 and Dynamic Boost, 512GB PCIe Gen4 SSD (second M.2 slot free), one-zone RGB full-size keyboard with numpad, Intel AX211 Wi-Fi 6E + Bluetooth, Gigabit LAN, HDMI + Mini DisplayPort 1.4 + USB-C, 53.35Wh battery (up to 7.5 h on integrated graphics per Clevo), 180W charger, 2.25 kg, 361 × 247 × 24.5 mm. ₱89,900 with the Naga Karga backpack. Still to confirm: panel resolution (QHD or FHD) and refresh rate, which USB-C option ships, webcam (HD or FHD), and backpack photos
- Homepage "why Naga" claims: 24-hour burn-in, 0% up to 12 months, free insured shipping, 7-day replacement
- All "Buy" and "Find a store" buttons link to `#` until the store exists
- The film still streams from the Higgsfield CloudFront URL; host it with the site before launch

## Product images

`assets/img/products/lakan-ii.webp`, `sipag-i.webp` and `diwa.webp` are AI-generated concept renders (GPT Image 2.5 via Higgsfield, transparent background, cleaned and reframed to 16:9 at 2000×1125). They are design intent, not photographs of shipping hardware. To replace one with a real product photo, export a transparent 16:9 WebP at the same path; the homepage tile, the product page shot and the dark chapter all read from it.
