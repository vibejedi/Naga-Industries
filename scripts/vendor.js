// Copies the exact library files the site uses from node_modules into assets/vendor.
// Run after `npm install` when bumping a version in package.json.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nm = path.join(root, 'node_modules');
const out = path.join(root, 'assets', 'vendor');

const files = [
  // gsap is for the promo film pages in promo/ only; no site page loads it.
  ['gsap/dist/gsap.min.js', 'gsap.min.js'],
  ['lottie-web/build/player/lottie_light.min.js', 'lottie_light.min.js'],
  ['lottie-web/LICENSE.md', 'LICENSE-lottie-web.md'],
];

fs.mkdirSync(out, { recursive: true });
for (const [src, dst] of files) {
  const from = path.join(nm, src);
  if (!fs.existsSync(from)) { console.warn('missing', src); continue; }
  fs.copyFileSync(from, path.join(out, dst));
  console.log('vendored', dst);
}
