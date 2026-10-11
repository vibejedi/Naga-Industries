/* ==========================================================================
   Naga Industries — 3D product scenes (three.js, ES module)

   Usage:
     <div class="scene" data-scene="laptop" data-variant="gaming"  data-scene-pin>…<canvas></canvas></div>
     <div class="render" data-scene="laptop" data-variant="work"   data-mode="idle"><canvas></canvas></div>
     <div class="render" data-scene="minipc" data-mode="idle"><canvas></canvas></div>

   data-scene   laptop | minipc            procedural stand-in geometry
   data-variant gaming | work              laptop finish and key lighting
   data-mode    idle                       gentle auto-orbit, no scroll scrub
   data-glb     assets/models/x.glb        when set, the page should use
                                           <model-viewer> instead (see README)

   Progress (0..1) arrives as a 'naga:progress' CustomEvent on the container,
   dispatched by naga.js from GSAP ScrollTrigger. Drag rotates in any mode.
   ========================================================================== */
import * as THREE from '../vendor/three.module.min.js';

const CYAN = 0x00D9F5;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function canvasTexture(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function waveStrands(ctx, w, h, { base, strands, yMid, amp }) {
  strands.forEach((col, i) => {
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 6 - (i % 3) * 1.5; ctx.globalAlpha = .95;
    for (let x = 0; x <= w; x += 8) {
      const y = yMid + Math.sin(x * .011 + i * 1.35) * (amp + i * 14) + (i - strands.length / 2) * 22;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

/* ---------------- Laptop ---------------- */
function buildLaptop(variant, label) {
  const g = new THREE.Group();
  const gaming = variant === 'gaming';
  const bodyMat = new THREE.MeshStandardMaterial({
    color: gaming ? 0x121418 : 0xC9CED3, metalness: gaming ? .7 : .85, roughness: gaming ? .38 : .32
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, .16, 2.5), bodyMat);
  g.add(base);

  // Keyboard deck
  const kbTex = canvasTexture(512, 340, (kc) => {
    kc.fillStyle = gaming ? '#0E1013' : '#D7DBDF'; kc.fillRect(0, 0, 512, 340);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
      kc.globalAlpha = gaming ? .35 + Math.random() * .55 : 1;
      kc.fillStyle = gaming ? 'rgba(0,217,245,.9)' : '#F3F5F7';
      kc.fillRect(18 + c * 34, 30 + r * 40, 28, 30);
    }
    kc.globalAlpha = 1;
    kc.fillStyle = gaming ? '#0B0D10' : '#E6E9EC'; kc.fillRect(150, 235, 212, 80);
    kc.strokeStyle = gaming ? 'rgba(0,217,245,.6)' : 'rgba(16,18,20,.18)'; kc.strokeRect(150, 235, 212, 80);
  });
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.3), new THREE.MeshStandardMaterial({
    map: kbTex, emissive: gaming ? CYAN : 0x000000, emissiveIntensity: gaming ? .35 : 0, emissiveMap: gaming ? kbTex : null, roughness: .6
  }));
  deck.rotation.x = -Math.PI / 2; deck.position.y = .085; g.add(deck);

  // Lid pivots at the rear hinge
  const lidGroup = new THREE.Group(); lidGroup.position.set(0, .08, -1.25); g.add(lidGroup);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, .12), bodyMat);
  lid.position.set(0, 1.2, 0); lidGroup.add(lid);

  const scrTex = canvasTexture(1024, 640, (s, w, h) => {
    if (gaming) {
      s.fillStyle = '#05070A'; s.fillRect(0, 0, w, h);
      waveStrands(s, w, h, { strands: ['#00D9F5', '#0097B2', '#00D9F5', '#2A3238', '#00D9F5', '#0097B2'], yMid: 340, amp: 40 });
      s.fillStyle = '#F5F7F8';
    } else {
      s.fillStyle = '#FBFDFE'; s.fillRect(0, 0, w, h);
      waveStrands(s, w, h, { strands: ['#101214', '#00D9F5', '#101214', '#7EDCEE', '#101214', '#0097B2'], yMid: 360, amp: 36 });
      s.fillStyle = '#101214';
    }
    s.font = '600 120px Outfit, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'; s.textAlign = 'center';
    s.fillText('naga', w / 2, 290);
    s.fillStyle = gaming ? '#00D9F5' : '#0097B2'; s.font = '500 36px Outfit, "Helvetica Neue", Arial, sans-serif';
    s.fillText(label.toUpperCase(), w / 2, 560);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.35, 2.15), new THREE.MeshBasicMaterial({ map: scrTex }));
  screen.position.set(0, 1.2, .062); lidGroup.add(screen);

  // Lid-top logo strip
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .08), new THREE.MeshBasicMaterial({ color: gaming ? CYAN : 0x101214 }));
  strip.position.set(0, 1.2, -.062); strip.rotation.y = Math.PI; lidGroup.add(strip);

  // Ground glow disc + ring
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: gaming ? .16 : .08 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -.36; g.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.26, 80), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: .4, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -.35; g.add(ring);

  g.position.y = -.3;
  const CLOSED = Math.PI / 2 - .06, OPEN = -Math.PI / 9;
  lidGroup.rotation.x = CLOSED;

  return {
    group: g, ring,
    update(progress, t, drag) {
      const target = CLOSED + (OPEN - CLOSED) * Math.min(1, progress * 1.5);
      lidGroup.rotation.x += (target - lidGroup.rotation.x) * .08;
      g.rotation.y = drag + Math.sin(t * .4) * .12 + progress * 1.1;
      g.position.y = -.3 + Math.sin(t * .9) * .05;
      ring.material.opacity = .3 + Math.sin(t * 2) * .1;
      return Math.round((CLOSED - lidGroup.rotation.x) / (CLOSED - OPEN) * 100);
    },
    camera: { pos: [0, 1.6, 6.4], look: [0, .5, 0] }
  };
}

/* ---------------- Mini PC (DIWA) ---------------- */
function buildMiniPC(label) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x14171B, metalness: .75, roughness: .35 });

  const W = 1.9, H = .62, D = 1.9;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), bodyMat); g.add(body);

  // Top: brushed with the wave motif and the wordmark
  const topTex = canvasTexture(1024, 1024, (s, w, h) => {
    s.fillStyle = '#15181C'; s.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { s.fillStyle = `rgba(255,255,255,${.02 + Math.random() * .03})`; s.fillRect(0, y, w, 1); }
    waveStrands(s, w, h, { strands: ['#1F2A2F', '#00D9F5', '#1F2A2F', '#0097B2', '#1F2A2F'], yMid: 520, amp: 50 });
    s.fillStyle = '#F5F7F8'; s.font = '600 140px Outfit, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'; s.textAlign = 'center';
    s.fillText('naga', w / 2, 400);
    s.fillStyle = '#00D9F5'; s.font = '500 48px Outfit, "Helvetica Neue", Arial, sans-serif'; s.fillText(label.toUpperCase(), w / 2, 760);
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(W - .08, D - .08), new THREE.MeshStandardMaterial({ map: topTex, roughness: .5, metalness: .4 }));
  top.rotation.x = -Math.PI / 2; top.position.y = H / 2 + .002; g.add(top);

  // Front light bar
  const bar = new THREE.Mesh(new THREE.BoxGeometry(W * .6, .03, .02), new THREE.MeshBasicMaterial({ color: CYAN }));
  bar.position.set(0, -H * .25, D / 2 + .005); g.add(bar);
  const barLight = new THREE.PointLight(CYAN, 1.2, 4); barLight.position.set(0, -H * .2, D / 2 + .4); g.add(barLight);

  // Side vents
  const ventTex = canvasTexture(256, 128, (s, w, h) => {
    s.fillStyle = '#0B0D10'; s.fillRect(0, 0, w, h);
    s.fillStyle = '#1C2024'; for (let x = 8; x < w; x += 12) s.fillRect(x, 10, 5, h - 20);
  });
  [-1, 1].forEach((side) => {
    const vent = new THREE.Mesh(new THREE.PlaneGeometry(D * .7, H * .5), new THREE.MeshStandardMaterial({ map: ventTex, roughness: .9 }));
    vent.rotation.y = side * Math.PI / 2; vent.position.set(side * (W / 2 + .003), 0, 0); g.add(vent);
  });

  // Rear ports
  const portMat = new THREE.MeshStandardMaterial({ color: 0x07090B, roughness: .9 });
  const ports = [[-.6, .07, .14], [-.38, .07, .14], [-.1, .1, .22], [.2, .06, .12], [.5, .1, .1]];
  ports.forEach(([x, h, w]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, .04), portMat);
    p.position.set(x, -.05, -D / 2 - .01); g.add(p);
  });

  // Base glow
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 64), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: .14 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -.62; g.add(disc);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.6, 80), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: .4, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -.61; g.add(ring);

  g.position.y = -.2;
  return {
    group: g, ring,
    update(progress, t, drag) {
      g.rotation.y = drag + Math.sin(t * .35) * .15 + progress * Math.PI * 1.15;
      g.rotation.x = .05 + progress * .35;
      g.position.y = -.2 + Math.sin(t * .9) * .05;
      bar.material.color.setHSL(.52, 1, .45 + Math.sin(t * 2.2) * .1);
      ring.material.opacity = .3 + Math.sin(t * 2) * .1;
      return Math.round(progress * 100);
    },
    camera: { pos: [0, 1.9, 5.2], look: [0, 0, 0] }
  };
}

/* ---------------- Mount ---------------- */
function mount(container) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { container.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const kind = container.dataset.scene || 'laptop';
  const variant = container.dataset.variant || 'gaming';
  const label = container.dataset.label || (kind === 'minipc' ? 'DIWA' : variant === 'gaming' ? 'LAKAN II' : 'SIPAG I');
  const idle = container.dataset.mode === 'idle';
  const onDark = container.closest('.dark') !== null;

  scene.add(new THREE.AmbientLight(onDark ? 0x8FA4AC : 0xE8F5F9, onDark ? 1.0 : 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 6, 4); scene.add(key);
  const rimC = new THREE.PointLight(CYAN, 2.2, 14); rimC.position.set(-4, 2, -2); scene.add(rimC);
  const rimT = new THREE.PointLight(0x0097B2, 1.4, 14); rimT.position.set(4, 1, -3); scene.add(rimT);

  const model = kind === 'minipc' ? buildMiniPC(label) : buildLaptop(variant, label);
  scene.add(model.group);

  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(...model.camera.pos);
  camera.lookAt(...model.camera.look);

  // Drag to rotate
  let dragX = 0, targetDrag = 0, dragging = false, px = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; px = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => dragging = false);
  canvas.addEventListener('pointercancel', () => dragging = false);
  canvas.addEventListener('pointermove', (e) => { if (dragging) { targetDrag += (e.clientX - px) * .008; px = e.clientX; } });

  // Scroll progress from naga.js
  let progress = idle ? 1 : 0;
  container.addEventListener('naga:progress', (e) => { progress = e.detail; });
  const pctEl = container.querySelector('[data-pct]');

  function resize() {
    const w = container.clientWidth, h = container.clientHeight || Math.round(w * 9 / 16);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // Portrait viewports: pull the camera back so the full width of the product stays in frame,
    // and look a little lower so the product sits in the upper part of the screen.
    const [px, py, pz] = model.camera.pos, [lx, ly, lz] = model.camera.look;
    const k = camera.aspect < 1 ? Math.min(1.9, 1 / camera.aspect) : 1;
    camera.position.set(px, py, pz * k);
    camera.lookAt(lx, ly - (camera.aspect < 1 ? .7 : 0), lz);
  }
  window.addEventListener('resize', resize); resize();

  const clock = new THREE.Clock();
  let visible = true, raf = 0;
  function tick() {
    const t = clock.getElapsedTime();
    dragX += (targetDrag - dragX) * .08;
    const pct = model.update(progress, reduce ? 0 : t, dragX);
    if (pctEl) pctEl.textContent = Math.max(0, Math.min(100, pct)) + '%';
    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) tick();
  }), { rootMargin: '200px' });
  io.observe(container);
  tick();

  // Rebuild textures once the display font is available (first paint may use a fallback)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { /* textures are cheap; a reload is not needed for a demo */ });
}

document.querySelectorAll('[data-scene]').forEach((el) => {
  if (el.dataset.glb) return; // the page uses <model-viewer> for this one
  mount(el);
});
