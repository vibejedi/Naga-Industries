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
  video/broll/        silent b-roll loops for the product pages (<product>-<shot>.mp4 + .jpg poster)
  lottie/             naga-wave.json, the animated mark in the nav
  audio/              naga-ambient-bakunawa-night.mp3, the background music (96 kbps, 636 KB)
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

LAKAN II and SIPAG I carry confirmed specs and prices. DIWA is still a placeholder written to make the pages read like finished product pages, marked `PLACEHOLDER SPECS` in the HTML.

- **SIPAG I** (black restock, mostly confirmed): built on the Clevo V740TU-2 (spec sheet v3.1, 2026/05) per the Naga order. Intel Core Ultra 5 125U, 14" Full HD 60Hz panel (45% NTSC), Intel Graphics, two DDR5-5600 SO-DIMM slots (up to 64GB), one M.2 2280 PCIe Gen4 SSD slot, white-backlit keyboard, Intel AX211 Wi-Fi 6E + Bluetooth, Gigabit LAN, USB-C with DisplayPort and power delivery, 2 × USB-A, HDMI, microSD, 2MP FHD camera with shutter, 60Wh battery (up to 13 h per Clevo), 1.30 kg, 315.6 × 226 × 16.85 mm, metal lid and base, 180° hinge, MIL-STD-810H. Naga installs 16GB DDR5 and a 512GB SSD (the barebone ships without RAM, SSD or OS); ₱49,900. Still to confirm: whether the panel is FHD or FHD+ (the order says FHD, the sheet lists 1920×1200)
- **DIWA**: Ryzen AI 9 HX 370 (50 TOPS), 64GB LPDDR5X, 2TB, 1.1 L, 28 dB, 65W. No price yet: the site says "Coming soon" with "Get notified" buttons
- **Baku** (Naga's local LLM on DIWA): the site claims that it runs on the machine, keeps data local, works offline and speaks all languages (confirmed by Naga). Confirm the model and other features before adding more. Mascot art is `assets/img/baku.webp` (cut out from the supplied illustration); the homepage splash uses `assets/img/baku-coding.webp` (Higgsfield render). Baku is built with the Machine.Fun ecosystem: https://machine.fun/project/J8RKZwmr8ol
- **LAKAN II** (confirmed): built on the Clevo V255RNN1 (spec sheet v3.0, 2025/11). Intel Core 7 250H, 16GB DDR5-5600 dual channel (two SO-DIMM, up to 64GB), RTX 5060 Laptop up to 115W with 8GB GDDR7 and Dynamic Boost, 512GB PCIe Gen4 SSD (second M.2 slot free), one-zone RGB full-size keyboard with numpad, Intel AX211 Wi-Fi 6E + Bluetooth, Gigabit LAN, HDMI + Mini DisplayPort 1.4 + USB-C, 53.35Wh battery (up to 7.5 h on integrated graphics per Clevo), 180W charger, 2.25 kg, 361 × 247 × 24.5 mm. 15.6" QHD 165Hz panel (72% NTSC). ₱99,900 with the Naga Karga backpack. Still to confirm: which USB-C option ships, webcam (HD or FHD), and backpack photos
- Prices: pesos (VAT included) for buyers in the Philippines and a fixed USD price for everyone else: SIPAG I ₱49,900 / US$699, LAKAN II ₱99,900 / US$1,499 (`php` and `usd` in `store.json`). Checkout charges pesos to Philippine addresses and USD elsewhere; ₱63.06 per US$ is only used for display and for the USDC amount on Philippine orders. A $NAGA holder discount (5%, international) is configured but off until the token launches
- Shipping: free within the Philippines, $100 flat rate worldwide
- Homepage "why Naga" claims: 24-hour burn-in, 0% up to 12 months, free insured shipping, 7-day replacement
- All "Buy" and "Find a store" buttons link to `#` until the store exists
- The film still streams from the Higgsfield CloudFront URL; host it with the site before launch

## Product images

All files are transparent 16:9 WebP at 2000×1125.

| File | Shot | Used in |
|---|---|---|
| `sipag-i.webp`, `lakan-ii.webp` | three-quarter front, lid open | homepage tile, product page hero shot (LAKAN also in the homepage performance chapter) |
| `sipag-i-front.webp`, `lakan-ii-front.webp` | straight-on front | product page Views gallery |
| `sipag-i-closed.webp`, `lakan-ii-closed.webp` | closed, top-down, lid with the wordmark | product page Views gallery |
| `sipag-i-lid.webp`, `lakan-ii-lid.webp` | rear three-quarter, lid with the wordmark | product page dark chapter |
| `diwa.webp` | three-quarter | homepage tile, DIWA page |

The SIPAG I and LAKAN II images are GPT Image 2.6 renders made on Higgsfield from the product photos in the Clevo spec sheets (V740TU-2 and V255RNN1), so the chassis, ports and keyboard match the shipping units. Added on top: the Naga wallpaper on the screen (cyan for SIPAG I, dark for LAKAN II), the "naga" wordmark on the lid as a small flat print (about 14% of the lid width, slightly darker than the lid, no gloss or emboss) matched to a photo of the production lid (on the top-down closed shots it is printed on in post, so size and position are exact), the small silver wordmark on the bottom screen bezel, and a cyan keyboard backlight on LAKAN II. They are renders, not photographs. The DIWA image is still an AI concept render. To replace any of them, export a transparent 16:9 WebP at the same path.

## B-roll

`assets/video/broll/` holds three silent loops per laptop (`sipag-desk/keys/lid`, `lakan-studio/keys/lid`), shown in the "In motion" reel on each product page. Each was made on Higgsfield in two steps: a styled still built from the chassis renders (GPT Image 2.6), then a 6-second Kling 4.0 image-to-video clip with a slow camera move. They are re-encoded to 1440×810 H.264 with no audio, and the last 0.8 s cross-fades into the first so the loop has no jump; the `.jpg` next to each clip is its first frame and serves as the poster. `naga.js` plays a clip only while it is on screen; with reduced motion the clips stay on the poster and show controls. These are AI-generated scenes, not footage of real units.

## Dark mode and music

- Dark mode follows the visitor's system setting until they press the sun/moon button in the nav; the choice is stored in `localStorage` (`naga-theme`). The theme is applied before first paint, so there is no flash.
- Background music starts on the visitor's first click, tap or key press (browsers do not allow sound earlier). The speaker button mutes it; that choice is stored too (`naga-music`). To change the track, replace `assets/audio/naga-ambient-bakunawa-night.mp3` and set `LOOP_END` in `naga.js` to the loop length in seconds.

## Store: pre-orders, Shopify, crypto and shipping

Every product page ends with an order form: pre-order for SIPAG I and LAKAN II, reservation (no payment) for DIWA. It quotes price, DHL shipping and delivery time live as the visitor picks a country and quantity.

### How an order flows

| Visitor picks | What happens | Needs |
|---|---|---|
| Card, PayPal and more | A Shopify cart is created and the visitor lands on Shopify checkout | `shopify.storeDomain`, `shopify.storefrontToken` and the product's `shopifyVariantId` in `store.json` |
| Card, before Shopify is set up | The pre-order is saved and Naga emails a payment link | a destination for `/api/preorder` (below) |
| Crypto · USDC on Solana | Privy connects a wallet (Phantom, Solflare, Backpack, or email with an embedded wallet), the visitor approves a USDC transfer with memo `naga:<ref>`, and `/api/preorder` checks it on-chain before confirming | `crypto.privyAppId` and `crypto.recipient` in `store.json`, plus a destination |
| Reserve (DIWA) | The reservation is saved; no payment | a destination |

If nothing is configured the form still renders, crypto shows "Coming soon", and submitting offers an email link with the order details, so no lead is lost.

### Set up checklist

1. **Shopify**: create the products (mark them as pre-order / continue selling when out of stock), create a Storefront API access token (Headless channel or a custom app), and copy each variant ID (`gid://shopify/ProductVariant/...`) into `store.json`. Set Shopify's shipping rates to match the table below. In Shopify Markets, price the Philippines in PHP (₱99,900 / ₱49,900, free shipping) and every other market in USD (US$1,499 / US$699) so checkout matches the site; the site sends the buyer's country with the cart.
2. **Privy**: create an app at dashboard.privy.io, enable Solana and external wallets, add `naga.industries` to allowed origins, and paste the app ID into `crypto.privyAppId`.
3. **Solana**: put Naga's receiving wallet address in `crypto.recipient` (it must be able to hold USDC). Use a dedicated RPC URL (Helius, QuickNode) in `crypto.rpcUrl`; the public endpoint is rate-limited.
4. **Vercel environment variables** (Settings > Environment Variables):
   - `PREORDER_WEBHOOK_URL`: where each order is POSTed as JSON (Zapier, Make, Slack, a Google Sheet via Apps Script).
   - `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_TOKEN` (scope `write_draft_orders`): also creates a Shopify draft order tagged `pre-order` (and `paid-usdc` for verified crypto payments).
   - `SOLANA_RPC_URL` (optional): RPC for payment checks; defaults to `crypto.rpcUrl`.
   - `CRYPTO_RECIPIENT` (optional): overrides `crypto.recipient` on the server.

### Shipping (DHL Express from Manila)

| Zone | Days after dispatch | Cost |
|---|---|---|
| Philippines | 3–5 | Free |
| East and Southeast Asia | 4–7 | US$100 flat per order |
| Oceania, South Asia and the Middle East | 5–9 | US$100 |
| North America and Europe | 6–10 | US$100 |
| Rest of the world | 8–14 | US$100 |

Zones and days are estimates in `store.json` (`shipping`); confirm them with DHL.

### Notes

- Crypto prices use the USD figure in `store.json` (1 USDC = US$1). A verified payment must be at least the order total, sent to `crypto.recipient`, carry the order memo and be under an hour old. The same transaction submitted twice reaches the destinations twice with the same reference and signature; de-duplicate on those.
- The Privy bundle is about 1.75 MB on first use and loads only when someone chooses crypto. Rebuild it with `npm run build:privy` after changing `scripts/privy/`.

