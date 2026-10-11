// Copies the exact library files the site uses from node_modules into assets/vendor.
// Run after `npm install` when bumping a version in package.json.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nm = path.join(root, 'node_modules');
const out = path.join(root, 'assets', 'vendor');

const files = [
  ['gsap/dist/gsap.min.js', 'gsap.min.js'],
  ['gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
  ['lenis/dist/lenis.min.js', 'lenis.min.js'],
  ['lenis/dist/lenis.css', 'lenis.css'],
  ['lenis/LICENSE', 'LICENSE-lenis.txt'],
  ['@google/model-viewer/dist/model-viewer.min.js', 'model-viewer.min.js'],
  ['@google/model-viewer/LICENSE', 'LICENSE-model-viewer.txt'],
  ['lottie-web/build/player/lottie_light.min.js', 'lottie_light.min.js'],
  ['lottie-web/LICENSE.md', 'LICENSE-lottie-web.md'],
  ['splitting/dist/splitting.min.js', 'splitting.min.js'],
  ['splitting/dist/splitting.css', 'splitting.css'],
  ['three/build/three.module.min.js', 'three.module.min.js'],
  ['three/build/three.core.min.js', 'three.core.min.js'],
  ['three/LICENSE', 'LICENSE-three.txt'],
];

fs.mkdirSync(out, { recursive: true });
for (const [src, dst] of files) {
  const from = path.join(nm, src);
  if (!fs.existsSync(from)) { console.warn('missing', src); continue; }
  fs.copyFileSync(from, path.join(out, dst));
  console.log('vendored', dst);
}
