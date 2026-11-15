/* ==========================================================================
   Naga motion layer (owner's request, 14 November 2026).
   GSAP + ScrollTrigger: headings rise, blocks arrive in a stagger, products
   grow onto their stage, spec numbers count up, a progress line follows the
   scroll. Three.js: the node network on the Rewards page.

   Rules it keeps:
   - It only runs when GSAP loaded and the visitor has not asked for reduced
     motion. Nothing is hidden by CSS, so without this file the page is whole.
   - Everything it hides, it shows again: each tween clears its inline styles.
   - Prices never animate.
   ========================================================================== */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap, ST = window.ScrollTrigger;

  if (!reduce && gsap && ST) {
    gsap.registerPlugin(ST);
    const ease = 'power3.out';
    const main = document.querySelector('main') || document.body;
    const free = (el) => !el.closest('[data-enter], details:not([open]), [hidden]');
    const all = (sel) => [...main.querySelectorAll(sel)].filter(free);

    /* 1. A progress line under the nav. */
    const bar = document.createElement('div');
    bar.className = 'scroll-line'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    /* 2. Product names arrive letter by letter. */
    const named = all('h2.t-hero.nameplate');
    named.forEach((h) => {
      const text = h.textContent;
      h.setAttribute('aria-label', text);
      h.textContent = '';
      const chars = [...text].map((c) => { const s = document.createElement('span'); s.setAttribute('aria-hidden', 'true'); s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; s.textContent = c; h.appendChild(s); return s; });
      gsap.from(chars, { yPercent: 70, opacity: 0, rotateX: -50, duration: 0.8, ease, stagger: 0.045, scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
    });

    /* 3. Headings rise. */
    all('h2.t-h2, h2.t-h3, h3.t-h3, p.say').filter((h) => !named.includes(h) && !h.matches('[data-say]')).forEach((h) => {
      gsap.from(h, { y: 40, opacity: 0, duration: 0.9, ease, clearProps: 'transform,opacity', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });

    /* 4. Blocks arrive in a stagger, row by row. */
    const blocks = all('.pcard, .spec, .dcard, .rows > li, .baku-points:not(.split-key) > li, .bento > *, .statrow > *, .flow-node, .flow-track, .hz-row, .head > .side, .feat-text > :not(h2), .duo .shot, .duo-side > :not(figure), .eyebrow, .tblwrap, dl.facts > div, form.order > *, .measure');
    gsap.set(blocks, { opacity: 0, y: 30 });
    ST.batch(blocks, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.75, ease, stagger: 0.07, overwrite: 'auto', clearProps: 'transform,opacity' }) });
    // Whatever happens to the scroll listeners, nothing stays hidden.
    window.addEventListener('load', () => setTimeout(() => ST.refresh(), 300));

    /* 5. The product grows onto its stage as it scrolls in. */
    all('figure.stage img').forEach((img) => {
      gsap.fromTo(img, { scale: 0.86, y: 60, opacity: 0.4 }, { scale: 1, y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top 96%', end: 'top 38%', scrub: 0.6 } });
    });

    /* 6. Heroes drift as they leave: the film slower than the page, the product a little faster. */
    document.querySelectorAll('.entrance').forEach((sec) => {
      gsap.to(sec.querySelectorAll('video, .poster'), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(sec.querySelector('.copy'), { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: '70% top', scrub: true } });
    });
    document.querySelectorAll('[data-hero-shot] img').forEach((img) => {
      gsap.to(img, { y: -50, ease: 'none', scrollTrigger: { trigger: img, start: 'top 40%', end: 'bottom top', scrub: 0.5 } });
    });

    /* 7. Spec numbers count up once. Prices are left alone. */
    all('.spec .t-big, .statrow .t-big').forEach((el) => {
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
      if (!node || /[₱$]/.test(el.textContent)) return;
      const m = node.textContent.match(/^(\s*)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
      if (!m) return;
      const end = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].includes(',');
      const fmt = (v) => { const t = v.toFixed(dec); return comma ? Number(t).toLocaleString('en-US', { minimumFractionDigits: dec }) : t; };
      const o = { v: 0 };
      el.style.fontVariantNumeric = 'tabular-nums';
      gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { node.textContent = m[1] + fmt(o.v) + m[3]; }, onComplete: () => { node.textContent = m[1] + m[2] + m[3]; } });
    });

    /* 8. The fee bar builds itself: each share grows in turn while its figure counts up, its key
       lands as the share does, and a light passes over the finished bar. Then it answers the pointer:
       point at a share or its key and the rest step back. */
    all('.split').forEach((bar2) => {
      const segs = [...bar2.children];
      const keys = [...(bar2.parentElement.querySelectorAll('.split-key > li'))];
      const tl = gsap.timeline({ scrollTrigger: { trigger: bar2, start: 'top 82%', once: true }, onComplete: () => bar2.classList.add('is-built') });
      gsap.set(keys, { opacity: 0, y: 18 });
      segs.forEach((seg, k) => {
        const label = seg.textContent, end = parseFloat(label), o = { v: 0 }, at = k * 0.42;
        seg.style.fontVariantNumeric = 'tabular-nums';
        tl.from(seg, { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'power3.inOut', clearProps: 'transform' }, at)
          .to(o, { v: end, duration: 0.8, ease: 'power2.out', onUpdate: () => { seg.textContent = Math.round(o.v) + '%'; }, onComplete: () => { seg.textContent = label; } }, at);
        if (keys[k]) {
          tl.to(keys[k], { opacity: 1, y: 0, duration: 0.6, ease, clearProps: 'transform,opacity' }, at + 0.35);
          const dot = keys[k].querySelector('i');
          if (dot) tl.from(dot, { scale: 0, duration: 0.6, ease: 'back.out(3)', clearProps: 'transform' }, at + 0.4);
        }
      });
      const group = bar2.parentElement;
      const focus = (k) => { group.classList.toggle('split-focus', k >= 0); segs.forEach((x, n) => x.classList.toggle('is-on', n === k)); keys.forEach((x, n) => x.classList.toggle('is-on', n === k)); };
      [segs, keys].forEach((list) => list.forEach((item, k) => {
        item.addEventListener('pointerenter', () => focus(k));
        item.addEventListener('pointerleave', () => focus(-1));
        item.addEventListener('click', () => focus(item.classList.contains('is-on') && group.classList.contains('split-focus') ? -1 : k));
      }));
    });

    /* 8b. A cyan line draws across the top of each step and spec tile, one after another. */
    ['.dgrid', '.specs'].forEach((sel) => all(sel).forEach((grid) => {
      gsap.fromTo(grid.children, { '--draw': 0 }, { '--draw': 1, duration: 0.9, ease: 'power2.inOut', stagger: 0.18, scrollTrigger: { trigger: grid, start: 'top 80%', once: true } });
    }));

    /* 8c. Gallery pictures wipe open from the left while the picture settles. */
    all('.gview').forEach((fig, k) => {
      const st = { trigger: fig, start: 'top 88%', once: true };
      gsap.fromTo(fig, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut', delay: (k % 2) * 0.12, clearProps: 'clipPath', scrollTrigger: st });
      const img = fig.querySelector('img');
      if (img) gsap.from(img, { scale: 1.18, duration: 1.5, ease, delay: (k % 2) * 0.12, clearProps: 'transform', scrollTrigger: st });
    });

    /* 8d. The winning cell in each compare row gets its underline. */
    all('table.cmp').forEach((t) => {
      gsap.fromTo(t.querySelectorAll('td.hi'), { '--draw': 0 }, { '--draw': 1, duration: 0.7, ease: 'power2.out', stagger: 0.09, scrollTrigger: { trigger: t, start: 'top 70%', once: true } });
    });

    /* 8e. Product cards lean toward the pointer. Mouse only. */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.pcard').forEach((card) => {
        const pic = card.querySelector('.pcard-img'); if (!pic) return;
        gsap.set(pic, { transformPerspective: 900 });
        const rx = gsap.quickTo(pic, 'rotationX', { duration: 0.5, ease: 'power3.out' }), ry = gsap.quickTo(pic, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        card.addEventListener('pointermove', (e) => { const r = pic.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 9); rx(-((e.clientY - r.top) / r.height - 0.5) * 9); });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
    }

    /* 9. The footer wordmark slides in as the page ends. */
    document.querySelectorAll('.foot-band img').forEach((img) => {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
    });
  }

  /* 10. The node network (Three.js) on the Rewards page: laptops as points, work as pulses.
     Loaded only when its box is on the page, WebGL exists and motion is allowed. */
  const box = document.querySelector('[data-node-net]');
  if (box && !reduce && 'IntersectionObserver' in window) {
    const probe = document.createElement('canvas');
    if (probe.getContext('webgl2') || probe.getContext('webgl')) {
      import(new URL('assets/vendor/three.module.min.js', document.baseURI).href).then((THREE) => nodeNet(THREE, box)).catch(() => { box.hidden = true; });
    } else box.hidden = true;
  } else if (box) box.hidden = true;

  function nodeNet(THREE, el) {
    const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.z = 7.6;
    const globe = new THREE.Group(); scene.add(globe);

    // Points spread evenly over a sphere, each linked to its three nearest neighbours.
    const N = 84, pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(2.3));
    }
    const edges = [], seen = new Set();
    pts.forEach((p, i) => {
      pts.map((q, j) => [p.distanceTo(q), j]).sort((x, y) => x[0] - y[0]).slice(1, 4).forEach(([, j]) => {
        const k = i < j ? i + '-' + j : j + '-' + i;
        if (!seen.has(k)) { seen.add(k); edges.push([i, j]); }
      });
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(edges.flatMap(([i, j]) => [pts[i], pts[j]]));
    const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.28 });
    globe.add(new THREE.LineSegments(lineGeo, lineMat));
    const dotMat = new THREE.PointsMaterial({ size: 0.075, sizeAttenuation: true });
    globe.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), dotMat));

    // Pulses: work travelling from one laptop to the next.
    const P = 26, pulseGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(P * 3); pulseGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pulseMat = new THREE.PointsMaterial({ size: 0.15, sizeAttenuation: true, transparent: true });
    globe.add(new THREE.Points(pulseGeo, pulseMat));
    const pulses = Array.from({ length: P }, () => ({ e: (Math.random() * edges.length) | 0, t: Math.random(), s: 0.25 + Math.random() * 0.5 }));

    const paint = () => { lineMat.color.set(css('--ink') || '#101214'); dotMat.color.set(css('--ink') || '#101214'); pulseMat.color.set(css('--cyan') || '#00D9F5'); };
    paint();
    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const size = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    size(); new ResizeObserver(size).observe(el);

    let mx = 0, my = 0, on = false, last = 0, raf = 0;
    window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    const frame = (now) => {
      raf = on ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      globe.rotation.y += dt * 0.12;
      globe.rotation.x += ((my * 0.5) - globe.rotation.x) * 0.04;
      globe.rotation.z += ((-mx * 0.25) - globe.rotation.z) * 0.04;
      pulses.forEach((p, i) => {
        p.t += dt * p.s;
        if (p.t >= 1) { p.t = 0; const from = edges[p.e][1]; const next = edges.map((e, k) => [e, k]).filter(([e]) => e[0] === from || e[1] === from); p.e = next[(Math.random() * next.length) | 0][1]; }
        const [a, b] = edges[p.e]; const v = pts[a].clone().lerp(pts[b], p.t);
        pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      });
      pulseGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    new IntersectionObserver((es) => es.forEach((e) => { on = e.isIntersecting && !document.hidden; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } })).observe(el);
    document.addEventListener('visibilitychange', () => { if (document.hidden) on = false; });
    el.classList.add('is-live');
  }
})();
