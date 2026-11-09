---
name: naga-design-system
description: Naga Industries visual system. Load before adding or changing any page, section, component, color, type, motion or product image on the site. Covers tokens, type scale, layout patterns (Apple-style tiles, bento, Razer-style dark chapter), product imagery, motion rules and the library stack.
---

# Naga design system

**Thesis.** Apple's calm, Razer's edge, Naga's cyan. White product chapters set the pace. One black chapter per page is the event. Cyan is the only accent and it is used sparingly.

## Tokens (source of truth: `assets/css/naga.css` `:root`)

| Token          | Value     | Role |
|----------------|-----------|------|
| `--paper`      | `#FFFFFF` | hero and product chapters |
| `--paper-2`    | `#F5F7F8` | alternate chapter, cool tint |
| `--ink`        | `#101214` | headlines, buttons on white |
| `--ink-2`      | `#6B7378` | taglines, captions |
| `--hairline`   | `rgba(16,18,20,.12)` | borders on white |
| `--cyan`       | `#00D9F5` | fills, glow, links on dark |
| `--cyan-link`  | `#0097B2` | text links on white (AA contrast) |
| `--void`       | `#000000` | performance chapter, footer |
| `--void-2`     | `#0A0C0E` | raised dark surface |
| `--onvoid`     | `#F5F7F8` | text on dark |
| `--onvoid-2`   | `#8E989E` | secondary text on dark |

Never add a color. If something needs emphasis on dark, use `--cyan`; on white, use `--ink` weight or `--cyan-link`.

## Type

- Display: Outfit 600 (`--font-display`), letter-spacing -0.02em to -0.035em at hero sizes. Echoes the round geometric "naga" wordmark.
- Text: system stack (`--font-text`), SF Pro on Apple devices, Inter elsewhere.
- Accent: Tilt Neon (`--font-accent`), for product names only (SIPAG I, LAKAN II, DIWA). Monoline strokes with round ends, like the glowing cyan lines in the entrance film. Used in four places: homepage tile headings and product page heroes (add `.nameplate`), the sticky product bar (`.subnav .pname`) and the compare table header (`.pn`). Set in capitals, weight 400, letter-spacing +0.02em, `font-synthesis: none` because it has one weight. On black it carries a faint cyan glow. Never use it for headlines, body, nav or numbers.
- Roles: `.t-hero` (clamp 3rem to 6rem), `.t-h2`, `.t-h3`, `.t-tag` (grey tagline), `.t-big` (number as headline, tabular), `.eyebrow` (11.5px, +0.22em, uppercase, cyan-link).
- Copy: Taglish, short, declarative. One sentence per card. Numbers are the headline in spec tiles. No emoji icons.

## Layout patterns

- **Global nav** `.nav`: fixed, 48px, translucent with 20px blur. Dark sections carry `data-nav-dark`; `naga.js` flips the nav to `.on-dark` while one is under it.
- **Product bar** `.subnav`: sticky under the nav on product pages. Model name left, section links and a small cyan Buy pill right.
- **Entrance** `.entrance`: the carved-wall film, full height, scrolls away with copy drifting up. Homepage only.
- **Product tile** `.ptile`: eyebrow, headline, tagline, two chevron links, product image in `figure.render`. Stack: one full tile, then `.tile-pair`.
- **Product hero** `.phero` then **product shot** `.pshot`: a rounded 16:9 image frame (`figure.pshot-frame[data-hero-shot]`) with a two-line caption. No 3D; the product is photographed or rendered offline.
- **Views** `section.chapter.views` right after the product shot: a two-up `.gallery` of `figure.gview` cards (tinted, rounded) holding the `-front` and `-closed` shots with a one-line caption. One column under 720px.
- **Bento** `.bento` with `.tile.w2/.w3`: numbers as headlines, one `.dark-tile`, one `.cyan-tile` per grid.
- **Performance chapter** `.chapter.dark`: `.perf` two-column (copy + `figure.glow` holding the product image over a cyan radial glow), `.statrow` of three big numbers, `.dgrid` of hover-lit `.dcard`s.
- **Buttons**: `.btn-fill` (cyan pill, one per screen), `.btn-ghost` (outlined pill). Reading links use `.link` (chevron).
- Gutters via `--gutter`; content width `--wrap` (1120px). Grids wrap to one column under 560px.

## Motion

- Lenis smooth scroll + GSAP ScrollTrigger. Reveals use `[data-reveal]` on a group and `[data-reveal-child]` on items; headlines use `[data-splitting]` for word-by-word rise.
- Resting state is always visible. GSAP `from` tweens hide; CSS never does.
- `prefers-reduced-motion` disables Lenis, scrubs and word reveals.
- Product shot: `[data-hero-shot] img` scrubs from scale 1.08 to 1 as it enters. Keep product motion to this one settle.

## Product imagery

- Files live at `assets/img/products/<product>.webp` (transparent 16:9, 2000×1125) and are referenced from the homepage tile, the product page shot and the dark chapter. SIPAG I and LAKAN II are renders of the real Clevo chassis (made from the spec-sheet photos): black, Naga wallpaper on screen (cyan for SIPAG I, dark for LAKAN II), "naga" wordmark on the lid as a small flat print (about 14% of the lid width, slightly darker than the lid, no gloss or emboss, as on the production lid), small silver wordmark centered on the bottom screen bezel, no floor or shadow. Each laptop has four shots: `<product>.webp` (three-quarter front, the main image), `-front`, `-closed` (top-down) and `-lid` (rear three-quarter, used in the dark chapter). DIWA is an AI concept render (black, cyan light bar). New shots must match: same chassis, studio light, transparent background, wordmark reading upright to the camera.
- Shoot or render at 16:9, 1600×900 or larger, product centered, on transparent or pure white (light chapters) and reuse the same file on black (the glow sits behind it). A single three-quarter view with the lid open reads best at tile size.

## Adding a product page

Copy `lakan-ii.html`. Change: title and meta, `.subnav` name and price, `.phero` copy, the `.pshot` image and caption, bento tiles, the dark chapter image, and the buy block (`data-count`). Add the product to the nav, the homepage tiles, the compare table and the footer on every page.

## Checks before committing

Serve the folder, screenshot at 1440 and 390, no console errors, no horizontal scroll, every page loads with the CDN blocked (fonts fall back; nothing else is remote).
