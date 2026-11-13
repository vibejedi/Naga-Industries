# tasteskill in the Naga Industries repo

This folder is [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT, see `LICENSE`), version 2.5.1,
copied from commit `f6b76575f949707b4e3c37cd86cb44b0b98643e8` (7 November 2026). The site is https://www.tasteskill.dev/.

## What is here and what is left out

`SKILL.md`, `references/`, `scripts/`, `library/` and the code under `assets/` are upstream files, unchanged.

Left out to keep the repo small (about 34 MB): every image and video in the kit, and the folders `assets/photos`,
`assets/icons`, `assets/objects` and `assets/scenes`. Those are stand-in photographs, icon sets and 3D demo objects.
Naga shows its own product renders, so the site needs none of them. The scripts that read those folders
(`photos.mjs`, `icons.mjs`, the object and scene demos) will not work here; install the full skill with
`npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend` if you need them.

## How Naga uses it

The Naga site is not built from the kit's `starter.html` and `system.css`. It keeps its own stack (`assets/css/naga.css`,
`assets/js/naga.js`), its own tokens and its own faces, and applies the skill's rules to them.
`.claude/skills/naga-design-system/SKILL.md` is the result; follow that file when the two disagree.

Taken from the skill:

- One content edge on every page (`.wrap` at 1280px, lines at x 80 and 1360), heads and text on the left line.
- Homepage sections are one screen tall at desktop size, the hero alone on the first screen.
- The product stands big on the section's ground, no grey panel; a different view in each section.
- Plain copy: the h1 names what is sold and where, headings name things, buttons are a verb and an object,
  no caption under a picture, one fact in one place.
- Motion in three places only: the hero's entrance on load, one statement moment (`word-highlight`, rebuilt in
  `naga.js` section 16 on Naga's tokens), and the hover and press layer. No scroll reveals, no smooth-scroll library.
- One effect a page (the living sea behind the first black chapter), a pause button on the hero film.
- Type at weights 400 and 500, labels in sentence case, nothing under 13px.

Not taken, on purpose:

- **The dealt palette and type pairing.** Naga has its own: cyan `#00D9F5`, Outfit, Tilt Neon for product names.
- **Exact one-or-two-screen heights on inner pages and on phones.** Product pages, About and Rewards hold an order
  form, spec lists and legal terms; they keep their content height. On a phone the homepage sections also take
  their content height, so no screen is half empty.
- **The sticky product bar.** The skill allows nothing sticky; the bar holds the Buy button, so it stays.
- **The finish gate.** No build is armed here (`.taste-skill/` is ignored by git), so the Stop hook in `SKILL.md` does nothing.

## Checks that work in this repo

```bash
# copy: no browser, under a second per page
node .claude/skills/design-taste-frontend/scripts/copy-lint.mjs index.html --kind tech

# layout: needs Chrome. As root in a container, point CHROME_PATH at a wrapper that adds --no-sandbox.
CHROME_PATH=/path/to/chrome node .claude/skills/design-taste-frontend/assets/layout/check.mjs \
  --url index.html --profile .taste-skill/chrome-check --sizes 1440x900,390x844
```

State on 13 November 2026: `copy-lint` reports 0 FAIL on all pages. `check.mjs` reports no findings on the homepage
at 1440x900; at 390x844 it reports the phone heights described above. Inner pages fail its height rules for the
same reason and pass its edge rules, except the bento on `node.html`.
