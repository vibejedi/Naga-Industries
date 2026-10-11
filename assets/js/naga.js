/* ==========================================================================
   Naga Industries — page behaviours
   Loads after the vendored libraries (gsap, ScrollTrigger, Lenis, Splitting,
   lottie). Every effect degrades: if a library is missing the page still reads.
   ========================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------
     1) Smooth scroll (Lenis) driven by the GSAP ticker
     --------------------------------------------------------------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined' && hasST) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.NagaLenis = lenis;

  // In-page anchors go through Lenis so they are smooth and respect the fixed bars.
  const navOffset = () => {
    const nav = document.querySelector('.nav');
    const sub = document.querySelector('.subnav');
    return -((nav ? nav.offsetHeight : 0) + (sub ? sub.offsetHeight : 0));
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: navOffset(), duration: 1.2 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector('.nav')?.classList.remove('open');
  });

  /* ---------------------------------------------------------------
     2) Global nav: mobile menu, dark-section awareness
     --------------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const btn = nav.querySelector('.menu-btn');
    btn?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    const darks = document.querySelectorAll('[data-nav-dark]');
    const setDark = () => {
      const y = (nav.offsetHeight || 48) + 1;
      let on = false;
      darks.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) on = true;
      });
      nav.classList.toggle('on-dark', on);
    };
    if (hasST) {
      darks.forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 49px', end: 'bottom 49px', onToggle: setDark, onRefresh: setDark }));
    } else {
      window.addEventListener('scroll', setDark, { passive: true });
    }
    setDark();
  }

  /* ---------------------------------------------------------------
     3) Lottie wave mark in the nav and footer
     --------------------------------------------------------------- */
  if (typeof window.lottie !== 'undefined') {
    document.querySelectorAll('.lottie-mark').forEach((el) => {
      const path = el.getAttribute('data-lottie') || 'assets/lottie/naga-wave.json';
      lottie.loadAnimation({ container: el, renderer: 'svg', loop: !reduce, autoplay: !reduce, path });
    });
  }

  /* ---------------------------------------------------------------
     4) Entrance video: fade in when it can play; poster stays otherwise
     --------------------------------------------------------------- */
  document.querySelectorAll('.entrance video').forEach((v) => {
    ['canplay', 'loadeddata', 'playing'].forEach((ev) => v.addEventListener(ev, () => v.classList.add('ready')));
    if (v.readyState >= 2) v.classList.add('ready');
    v.play && v.play().catch(() => {});
  });

  /* ---------------------------------------------------------------
     5) Headline reveals (Splitting + GSAP)
     --------------------------------------------------------------- */
  if (typeof window.Splitting !== 'undefined') {
    Splitting({ target: '[data-splitting]', by: 'words' });
  }
  if (hasST && !reduce) {
    document.querySelectorAll('[data-splitting]').forEach((h) => {
      const words = h.querySelectorAll('.word');
      if (!words.length) return;
      gsap.from(words, {
        yPercent: 60, opacity: 0, duration: .9, ease: 'power3.out', stagger: .05,
        scrollTrigger: { trigger: h, start: 'top 85%', once: true }
      });
    });

    // Generic rise-in for blocks marked data-reveal (and their children with data-reveal-child)
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const kids = el.querySelectorAll('[data-reveal-child]');
      const targets = kids.length ? kids : el;
      gsap.from(targets, {
        y: 36, opacity: 0, duration: .8, ease: 'power3.out', stagger: kids.length ? .08 : 0,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    // Entrance copy drifts up and fades as the user scrolls away from it
    document.querySelectorAll('.entrance').forEach((sec) => {
      const copy = sec.querySelector('.copy');
      if (!copy) return;
      gsap.to(copy, { yPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } });
      const media = sec.querySelectorAll('video, img.poster');
      gsap.to(media, { scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------------------------------------------------------------
     6) Counters: data-count="63000" data-prefix="₱"
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.getAttribute('data-count')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const fmt = (n) => prefix + Math.round(n).toLocaleString('en-PH') + suffix;
    el.textContent = fmt(target); // resting state is the final number
    if (reduce) return;
    const run = () => {
      const t0 = performance.now(), dur = 1400;
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * ease);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); run(); } }), { threshold: .5 });
    io.observe(el);
  });

  /* ---------------------------------------------------------------
     7) Scene scrub: pin each [data-scene-pin] section and publish progress
        to the 3D module through a CustomEvent (keeps the module decoupled).
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-scene-pin]').forEach((sec) => {
    const emit = (p) => sec.dispatchEvent(new CustomEvent('naga:progress', { detail: p }));
    if (hasST && !reduce) {
      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: '+=160%', pin: true, scrub: .6,
        onUpdate: (st) => emit(st.progress)
      });
    } else {
      const onScroll = () => {
        const r = sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        emit(p);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });

  /* ---------------------------------------------------------------
     8) Film frame: hide the label once playing
     --------------------------------------------------------------- */
  document.querySelectorAll('.film-frame video').forEach((v) => {
    v.addEventListener('play', () => v.closest('.film-frame')?.classList.add('playing'));
  });

  /* ---------------------------------------------------------------
     9) Brand wave field on canvases marked .waves (topographic lines)
     --------------------------------------------------------------- */
  document.querySelectorAll('canvas.waves').forEach((c) => {
    const ctx = c.getContext('2d');
    const dark = c.closest('.dark') !== null;
    let w = 0, h = 0, t = Math.random() * 10, raf = 0, visible = false;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const lines = 16;
      for (let i = 0; i < lines; i++) {
        const y0 = (i / lines) * h * .5;
        const a = .08 + .2 * (1 - i / lines);
        ctx.beginPath();
        ctx.strokeStyle = i % 3 === 0 ? `rgba(0,217,245,${a + .18})` : (dark ? `rgba(245,247,248,${a * .35})` : `rgba(16,18,20,${a * .45})`);
        ctx.lineWidth = 1;
        for (let x = 0; x <= w; x += 6) {
          const y = y0 + Math.sin(x * .007 + i * .7 + t) * 16 + Math.sin(x * .019 - t * .6 + i) * 7;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      const g = ctx.createLinearGradient(0, 0, 0, h * .55);
      const bg = dark ? '0,0,0' : (c.closest('.tint') ? '245,247,248' : '255,255,255');
      g.addColorStop(0, `rgba(${bg},0)`); g.addColorStop(1, `rgba(${bg},1)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * .55);
    };
    const tick = () => { t += .005; draw(); if (visible && !reduce) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) tick();
    }));
    window.addEventListener('resize', () => { size(); draw(); });
    size(); draw(); io.observe(c);
  });

  // Fonts can arrive after layout; let ScrollTrigger re-measure.
  if (hasST && document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
