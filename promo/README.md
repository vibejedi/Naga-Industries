# Naga promo videos

Motion-graphics promos rendered from HTML: each `*.html` here is a 1920×1080 stage animated with GSAP on a paused timeline. `render.cjs` opens it in headless Chromium, seeks the timeline and every video clip to each frame (30 fps), screenshots it, encodes H.264 and mixes the soundtrack described in the page (`PROMO.audio`). Same idea as HyperFrames or Remotion, with no extra dependencies.

| Page | Video | Music | Length |
|---|---|---|---|
| `lakan.html` | LAKAN II: hook, 115W counter, Core 7, backpack, nameplate end card | Sulong (Filipino trap) from 17.3 s + bamboo cracks, riser, gong | 16.8 s |
| `sipag.html` | SIPAG I: light theme, 1.30 kg and 13 hrs counters, Core Ultra 5, end card | Gabi trap bed + kulintang, kudyapi sting | 16.8 s |
| `diwa.html` | DIWA: orbit ring hook, desk shot, Baku inside, end card | Bakunawa Night ambient + gong bloom | 16.8 s |
| `baku.html` | Baku: Bakunawa myth, Baku coding, Private/Offline/Every language, mascot end card | Bakunawa song + bamboo cracks, gong | 16.8 s |

Cuts land on bar lines (the kit is ~99.4 BPM, one bar = 2.4 s).

## Render

```
FONT_CACHE=/path/to/font-cache node promo/render.cjs lakan.html out/lakan.mp4
```

Needs Node, Playwright with Chromium (`CHROME` and `PW` env vars override the paths) and ffmpeg. Without `FONT_CACHE` the page loads Outfit, Inter and Tilt Neon from Google Fonts. Output is loudness-normalised to -14 LUFS for social.

## Media

- `media/`: b-roll clips (Kling 4.0 on Higgsfield, from the chassis renders), re-encoded at 1080p with short GOPs for frame-accurate seeking.
- `audio/`: tracks and hits from the Naga sound kit (ElevenLabs Music via Higgsfield).
- Product renders, Baku art and wordmarks come from `../assets/img/`.

Prices and specs in the end cards must match the site (SIPAG I ₱49,900, LAKAN II ₱99,900).
