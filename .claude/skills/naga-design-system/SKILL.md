---
name: naga-design-system
description: Naga Industries visual system. Load before adding or changing any page, section, component, color, type, motion or product image on the site. Covers tokens, type, the layout patterns (one-screen homepage sections, product hero, open spec tiles, one black chapter), product imagery, motion rules and the library stack.
---

# Naga design system

**Thesis.** Two neutrals, one cyan, one type family, the product big. One black chapter per page is the event; one cyan band on the homepage carries the motto. Layout and motion follow `.claude/skills/design-taste-frontend` (tasteskill); read its `NAGA.md` for what Naga takes from it and what it leaves out.

## Tokens (source of truth: `assets/css/naga.css` `:root`)

| Token          | Value     | Role |
|----------------|-----------|------|
| `--paper`      | `#FFFFFF` | page ground |
| `--paper-2`    | `#F5F7F8` | tint ground, picture frames |
| `--ink`        | `#101214` | headlines and text |
| `--ink-2`      | `#6B7378` | leads, labels, notes |
| `--hairline`   | `rgba(16,18,20,.12)` | one-pixel rules |
| `--cyan`       | `#00D9F5` | fills, glow, links on dark, the statement band |
| `--cyan-link`  | `#0097B2` | text links on white (AA contrast) |
| `--void`       | `#000000` | the black chapter, footer |
| `--void-2`     | `#0A0C0E` | raised dark surface |
| `--onvoid`     | `#F5F7F8` | text on dark |
| `--onvoid-2`   | `#8E989E` | secondary text on dark |
| `--on-cyan`    | `#101214` | text on cyan, both themes |

Never add a color. Dark mode remaps the same tokens under `:root[data-theme="dark"]`; check every new component in both themes.

## Type

- One family: Outfit for headings and text (`--font-display`, `--font-text`), weights 400 and 500 only. Size and tight tracking carry a headline, never bold. No system-font or Inter look.
- Accent: Tilt Neon (`--font-accent`) for product names only. Add `.nameplate` to the name, or wrap the name in `<span class="nameplate">` inside an Outfit headline ("DIWA runs Baku, our own AI"). One weight, `font-synthesis: none`, a faint cyan glow on black.
- Roles: `.t-hero` (78px at 1440, 40px on a phone), `.t-h2` (48/30), `.t-h3` (28/22), `.t-tag` (the 21px lead), `.t-big` (a figure as a headline), `.eyebrow` (a 13px label in sentence case).
- Labels are never uppercase and never letter-spaced. Nothing is set under 13px.
- Copy: write it with `.claude/skills/stop-slop`. A heading names a thing with a noun; no slogan, no two-fragment headline ("Full power. Never held back."). The homepage h1 says what we sell and where. A button is a verb and an object ("Pre-order LAKAN II"), worded the same wherever it appears. No caption under a picture: say it in the section's lead.

## Layout

- **Two lines.** Every page stands on one content edge: `.wrap` is `min(100% - 2 × gutter, 1280px)`, so the lines are x 80 and 1360 at 1440 and x 24 and 366 at 390. The nav, sub-nav and footer pad with `--edge` to the same lines. Headings and text start on the left line; nothing is centred.
- **Head row** `.head`: a 12-column row, the heading on columns 1 to 7 and `.side` (lead, buttons, price) from column 8. Stacks under 860px.
- **Global nav** `.nav`: fixed, 56px, opaque (`--paper`, or `--void` while a `data-nav-dark` section is under it). Words underline on hover. Under 860px the menu fills the screen.
- **Product bar** `.subnav`: sticky under the nav on product pages; name left, section links and a small Buy pill right.
- **Homepage sections** are `.screen`: one screen tall from 1024px up, content top-aligned. In order:
  - `.entrance[data-enter]`: the carved-wall film full bleed, the h1, lead and two buttons on its dark foot, a round `.pause` button.
  - `#lineup`: `.range` of three `a.pcard` (picture in a square tint frame, nameplate, one line, price). `--s` on `.pcard-img` scales a picture inside its frame.
  - `#lakan`: `.screen.chapter.dark` with `.wrap.feat` (text on columns 1 to 5, `figure.stage.stage--glow` on 6 to 12). The page's one black chapter and its one effect (the living sea).
  - `#sipag`: `.screen.tint`, a `.head` row then `figure.stage.stage--wide` (the product across the wrap, no box).
  - `#baku`: an h2, then `.duo` (the Baku picture on 8 columns, lead, buttons and the DIWA render in `.duo-side`).
  - `#why`: `.screen.statement`, the cyan band. `p.say[data-say]` is the page's one moment; `.rows` holds three facts at its foot.
  - `#compare`: `table.cmp`. Under 720px each row stacks its label over the three values, so nothing scrolls sideways.
- **Product page**: `.screen.phero[data-enter]` (a `.head` row, then `figure.stage.stage--wide[data-hero-shot]`), `.views` (a `.head` row and a two-up `.gallery` of `figure.gview`, no captions), `.reel`, `#specs` (`.specs` of six open `.spec` tiles: `.t-big` figure, a `small` label, one line), the black chapter (`.feat` with `figure.stage.stage--glow`, then `.dgrid` of four open `.dcard` notes), and `#buy` (a `.head` row with the price, then `form.order`).
- **The product stands big, on the ground.** `figure.stage` holds a transparent render with no panel, border or radius, enlarged so the product spans its column. `.stage--glow` adds the cyan floor light on black; `.stage--fit` is for a boxy product (DIWA). A picture in a frame (`.pcard-img`, `.gview`) fills the frame.
- **Doc page** (`about.html`, `naga.html`): `.phero.doc-hero[data-enter]`, then chapters with `.t-h3` headings and `dl.facts` rows. Links in running text use `.link-plain`. `naga.html` also uses `.bento` tiles, `.statrow` and the fee bar `.split`.
- **Order** `form.order`: two cards on `--paper-2`, fields (`.fld`, `.pay-opt` radio cards) and `.order-summary`. One column under 820px.
- **Footer**: `.foot-band` sets the wordmark across the wrap in its serpent scales (`assets/img/naga-snake-band.webp`, masked by the wordmark), then the link columns.
- **Buttons**: `.btn-fill` (cyan pill, the main action) and `.btn-ghost`. A standalone link is `.link` (an arrow that moves 3px and an underline that draws).
- No bento of stat tiles on product pages, no row of big stat numbers that repeats the specs, no card that only decorates. One fact, one place.

## Motion

A page moves in three places and nowhere else:

1. **The hero enters once on load** (`[data-enter]`): the h1 rises line by line from word masks, `[data-enter-up]` items fade up 12px in order, `[data-enter-media]` settles from 1.05 to 1. About 1.1 s. The head script hides the words for at most 900ms and lifts that by itself, so they can never stay hidden.
2. **One moment follows the scroll in its own section**: `p[data-say]` on the homepage lights up word by word and runs back on the way up. The text is whole without script.
3. **The hover layer**: buttons step 1px up and press 1px down, links draw an underline, a linked card (`.pcard`) lifts 2px and its picture grows 3% inside its frame (`.m-zoom` does the same for any linked picture). A card without a link does not move.

Nothing reveals, fades, rises or counts as the page scrolls. No smooth-scroll library, no parallax, no scroll-triggered headline. The living sea (`canvas.sea`, WebGL caustics in cyan light) sits behind the page's first `.chapter.dark` only. Films pause off screen and carry a pause button. The nav wave mark draws once on load and again on hover. With `prefers-reduced-motion` everything stands still and complete.

## Product imagery

- Files live at `assets/img/products/<product>.webp` (transparent 16:9, 2000×1125). SIPAG I and LAKAN II are renders of the real Clevo chassis (made from the spec-sheet photos): black, Naga wallpaper on screen (cyan for SIPAG I, dark for LAKAN II), "naga" wordmark on the lid as a small flat print (about 14% of the lid width, slightly darker than the lid, no gloss or emboss), small silver wordmark centered on the bottom screen bezel, no floor or shadow. Each laptop has four shots: `<product>.webp` (three-quarter front, the main image), `-front`, `-closed` (top-down) and `-lid` (rear three-quarter, used in the black chapter). DIWA is an AI concept render (black, cyan light bar). New shots must match: same chassis, studio light, transparent background, wordmark reading upright to the camera.
- Show the whole product in at most three sections of a page and use a different view in each.

## Adding a product page

Copy `lakan-ii.html`. Change: the `seo/site.json` entry, `.subnav` name and price, the hero copy and image, the views, the six spec tiles, the black chapter and the buy block. Add the product to the nav, the homepage range, the compare table and the footer on every page.

## Checks before committing

Serve the folder and screenshot at 1440 and 390 in both themes: no console errors, no horizontal scroll. Then run the taste skill's checks (commands in its `NAGA.md`): `copy-lint.mjs` on every page you changed, and `assets/layout/check.mjs` on the homepage, which must report no findings at 1440x900.
