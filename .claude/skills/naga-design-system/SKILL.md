---
name: naga-design-system
description: Naga Industries visual system. Load before adding or changing any page, section, component, color, type, motion or 3D scene on the site. Covers tokens, type scale, layout patterns (Apple-style tiles, bento, Razer-style dark chapter), motion rules and the library stack.
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
- Roles: `.t-hero` (clamp 3rem to 6rem), `.t-h2`, `.t-h3`, `.t-tag` (grey tagline), `.t-big` (number as headline, tabular), `.eyebrow` (11.5px, +0.22em, uppercase, cyan-link).
- Copy: Taglish, short, declarative. One sentence per card. Numbers are the headline in spec tiles. No emoji icons.

## Layout patterns

- **Global nav** `.nav`: fixed, 48px, translucent with 20px blur. Dark sections carry `data-nav-dark`; `naga.js` flips the nav to `.on-dark` while one is under it.
- **Product bar** `.subnav`: sticky under the nav on product pages. Model name left, section links and a small cyan Buy pill right.
- **Entrance** `.entrance`: the carved-wall film, full height, scrolls away with copy drifting up. Homepage only.
- **Product tile** `.ptile`: eyebrow, headline, tagline, two chevron links, product render. Stack: one full tile, then `.tile-pair`.
- **Product hero** `.phero` then **pinned scene** `.scene[data-scene-pin]`: scroll scrubs the 3D model.
- **Bento** `.bento` with `.tile.w2/.w3`: numbers as headlines, one `.dark-tile`, one `.cyan-tile` per grid.
- **Performance chapter** `.chapter.dark`: `.perf` two-column (copy + `.glow` scene), `.statrow` of three big numbers, `.dgrid` of hover-lit `.dcard`s.
- **Buttons**: `.btn-fill` (cyan pill, one per screen), `.btn-ghost` (outlined pill). Reading links use `.link` (chevron).
- Gutters via `--gutter`; content width `--wrap` (1120px). Grids wrap to one column under 560px.

## Motion

- Lenis smooth scroll + GSAP ScrollTrigger. Reveals use `[data-reveal]` on a group and `[data-reveal-child]` on items; headlines use `[data-splitting]` for word-by-word rise.
- Resting state is always visible. GSAP `from` tweens hide; CSS never does.
- `prefers-reduced-motion` disables Lenis, scrubs and word reveals.
- 3D: `assets/js/scene.js` (three.js ESM). `data-scene="laptop|minipc"`, `data-variant="gaming|work"`, `data-mode="idle"` for auto-orbit renders. Scroll progress arrives as the `naga:progress` event. Real GLBs go through `<model-viewer>`; see `assets/models/README.md`.

## Adding a product page

Copy `lakan-ii.html`. Change: title and meta, `.subnav` name and price, `.phero` copy, the scene's `data-scene`/`data-variant`/`data-label`, bento tiles, the dark chapter, and the buy block (`data-count`). Add the product to the nav, the homepage tiles, the compare table and the footer on every page.

## Checks before committing

Serve the folder, screenshot at 1440 and 390, no console errors, no horizontal scroll, every page loads with the CDN blocked (fonts fall back; nothing else is remote).
