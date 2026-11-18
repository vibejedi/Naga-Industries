# Impeccable in the Naga Industries repo

`SKILL.md` and `reference/` are from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0, see
`LICENSE` and `NOTICE.md`), commit `d41d986`, copied 18 November 2026. Unchanged.

## Left out, on purpose

- **The `scripts/` folder** (the launcher, the live-browser scripts, the engine checksums). The launcher downloads
  an engine binary, and live mode can start an agent with its sandbox off. `SKILL.md` step 1 asks to run
  `scripts/impeccable context`; that file is not here, so read the project context directly (`CLAUDE.md` and
  `.claude/skills/naga-design-system/SKILL.md`), as the skill's own fallback says.
- **The design hook.** Nothing runs on edits.
- **Telemetry.** Run the detector with `DO_NOT_TRACK=1`.

## How Naga uses it

- The detector, on demand: `DO_NOT_TRACK=1 npx impeccable detect <file.html or URL> --json`. Source files get the
  pattern rules; a URL (serve the folder first) also gets the rendered rules such as contrast and line length.
- The `critique`, `audit`, `polish`, `harden`, `clarify`, `onboard` and `shape` playbooks in `reference/`, for the
  site and for the Naga Node app.
- The Naga design system wins where they disagree: Naga's palette, Outfit and Tilt Neon are fixed.

## Detector findings Naga accepts

- `pulsing-dot` on `.lane i`: those dots travel along the pay figure on `/node`; they are not status lights.
- `cramped-padding` on full-bleed sections and the sticky sub-nav: their content sits in `.wrap`, which has the gutter.
- `undersized-ui-text` on spec units ("GB", "Hz"): the detector reads `.5em` without the parent's size; they render at 16px or more.
- `tight-leading` on the display headings: 1.02 to 1.05 is the set leading for one- and two-line headlines.
