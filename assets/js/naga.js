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
     2b) Light and dark theme. The head script already set data-theme
         before paint; this button flips it and remembers the choice.
         Until a choice is made, the page follows the system setting.
     --------------------------------------------------------------- */
  const root = document.documentElement;
  const isDarkTheme = () => root.getAttribute('data-theme') === 'dark';
  const store = (s, k, v) => { try { if (v === undefined) return s.getItem(k); s.setItem(k, v); } catch (e) { /* storage blocked */ } return null; };
  const themeBtn = document.querySelector('.theme-btn');
  const syncThemeBtn = () => themeBtn && themeBtn.setAttribute('aria-label', isDarkTheme() ? 'Switch to light mode' : 'Switch to dark mode');
  const setTheme = (mode, remember) => {
    root.setAttribute('data-theme', mode);
    if (remember) store(localStorage, 'naga-theme', mode);
    syncThemeBtn();
    window.dispatchEvent(new CustomEvent('naga:theme', { detail: mode }));
  };
  themeBtn?.addEventListener('click', () => setTheme(isDarkTheme() ? 'light' : 'dark', true));
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  sysDark.addEventListener?.('change', (e) => {
    const chosen = store(localStorage, 'naga-theme');
    if (chosen !== 'light' && chosen !== 'dark') setTheme(e.matches ? 'dark' : 'light', false);
  });
  syncThemeBtn();

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
     7) Product shot: eases from slightly enlarged to true size and
        gains a little lift as it enters, the way a product reveal settles.
     --------------------------------------------------------------- */
  if (hasST && !reduce) {
    document.querySelectorAll('[data-hero-shot]').forEach((fig) => {
      const img = fig.querySelector('img');
      if (!img) return;
      gsap.fromTo(img, { scale: 1.08, yPercent: 4 }, {
        scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top 90%', end: 'top 30%', scrub: true }
      });
    });
  }

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
    const darkTile = c.closest('.dark') !== null;
    let w = 0, h = 0, t = Math.random() * 10, raf = 0, visible = false;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      const dark = darkTile || isDarkTheme();
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
      const tint = c.closest('.tint') !== null;
      const bg = darkTile ? '0,0,0' : dark ? (tint ? '10,12,14' : '0,0,0') : (tint ? '245,247,248' : '255,255,255');
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
    window.addEventListener('naga:theme', draw);
    size(); draw(); io.observe(c);
  });

  /* ---------------------------------------------------------------
     10) Nameplate personalities: each product name moves its own way.
         [data-nameplate="lakan"]  slams in oversized and blurred, shakes on
                                   impact, flashes cyan; hover revs it again
         [data-nameplate="sipag"]  pops up letter by letter with a bouncy
                                   overshoot; hover sends a wave across it
         [data-nameplate="diwa"]   swings in along a wide arc, then drifts in
                                   slow circles like water; hover widens it
         Each entrance plays once when the name scrolls into view.
     --------------------------------------------------------------- */
  const plates = document.querySelectorAll('[data-nameplate]');
  if (plates.length && typeof window.Splitting !== 'undefined') {
    plates.forEach((el) => el.setAttribute('aria-label', el.textContent.trim()));
    Splitting({ target: '[data-nameplate]', by: 'chars' });
    plates.forEach((el) => el.querySelectorAll('.word, .whitespace').forEach((w) => w.setAttribute('aria-hidden', 'true')));
  }
  if (hasGsap && !reduce) {
    const whenSeen = (el, fn) => {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { io.disconnect(); fn(); }
      }), { threshold: .35 });
      io.observe(el);
    };
    const onScreen = (el, fn) => new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting))).observe(el);
    const fontPx = (el) => parseFloat(getComputedStyle(el).fontSize) || 48;

    const NAMEPLATES = {
      lakan(el, chars, dark) {
        const restGlow = dark ? '0 0 28px rgba(0,217,245,0.28)' : '0 0 0px rgba(0,217,245,0)';
        const slash = document.createElement('span');
        slash.className = 'np-slash'; slash.setAttribute('aria-hidden', 'true');
        el.appendChild(slash);
        const placeSlash = () => {
          const box = el.getBoundingClientRect(), a = chars[0].getBoundingClientRect(), b = chars[chars.length - 1].getBoundingClientRect();
          slash.style.left = (a.left - box.left) + 'px';
          slash.style.width = (b.right - a.left) + 'px';
        };
        const entrance = gsap.timeline({ paused: true })
          .fromTo(chars, { scale: 2.6, yPercent: -30, opacity: 0, filter: 'blur(12px)' },
            { scale: 1, yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .36, ease: 'power4.in', stagger: .06, clearProps: 'filter' })
          .addLabel('impact', '-=.02')
          .to(el, { keyframes: { x: [-12, 10, -7, 5, -2, 0], y: [4, -3, 2, -1, 1, 0] }, duration: .34, ease: 'none' }, 'impact')
          .fromTo(el, { textShadow: '0 0 46px rgba(0,217,245,0.95)' }, { textShadow: restGlow, duration: 1, ease: 'power2.out', clearProps: 'textShadow' }, 'impact')
          .fromTo(slash, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: .28, ease: 'power3.out' }, 'impact')
          .to(slash, { opacity: 0, duration: .6, ease: 'power1.in' }, '>');
        let rev = null;
        el.addEventListener('pointerenter', () => {
          if (entrance.progress() < 1 || (rev && rev.isActive())) return;
          rev = gsap.timeline()
            .to(chars, { skewX: -14, scaleY: 1.08, duration: .09, ease: 'power2.in', stagger: .02 })
            .to(chars, { skewX: 0, scaleY: 1, duration: .4, ease: 'elastic.out(1.2, .4)', stagger: .02 })
            .to(el, { keyframes: { x: [-6, 5, -3, 2, 0] }, duration: .26, ease: 'none' }, .08)
            .fromTo(el, { textShadow: '0 0 34px rgba(0,217,245,0.8)' }, { textShadow: restGlow, duration: .7, ease: 'power2.out', clearProps: 'textShadow' }, .08);
        });
        whenSeen(el, () => { placeSlash(); entrance.play(); });
      },

      sipag(el, chars) {
        el.classList.add('np-mask');
        const last = chars[chars.length - 1];
        const entrance = gsap.timeline({ paused: true })
          .fromTo(chars, { yPercent: 120 }, { yPercent: 0, duration: .6, ease: 'back.out(2.4)', stagger: .07 })
          .to(last, { keyframes: { yPercent: [0, -28, 0, -8, 0] }, duration: .55, ease: 'power1.inOut' }, '-=.15');
        let wave = null;
        el.addEventListener('pointerenter', () => {
          if (entrance.progress() < 1 || (wave && wave.isActive())) return;
          wave = gsap.timeline().to(chars, { yPercent: -18, duration: .16, ease: 'power2.out', stagger: .045, yoyo: true, repeat: 1 });
        });
        whenSeen(el, () => entrance.play());
      },

      diwa(el, chars, dark) {
        const state = { a: 0 };
        const R = fontPx(el) * .05;
        const PERIOD = 7, TWO_PI = Math.PI * 2;
        const setX = [...chars].map((c) => gsap.quickSetter(c, 'x', 'px'));
        const setY = [...chars].map((c) => gsap.quickSetter(c, 'y', 'px'));
        const orbit = (time) => {
          for (let i = 0; i < chars.length; i++) {
            const ph = (time / PERIOD) * TWO_PI + i * .95;
            setX[i](state.a * Math.cos(ph));
            setY[i](state.a * Math.sin(ph));
          }
        };
        const glow = dark ? gsap.fromTo(el, { textShadow: '0 0 18px rgba(0,217,245,0.18)' },
          { textShadow: '0 0 40px rgba(0,217,245,0.45)', duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }) : null;
        let ready = false, visible = false, running = false;
        const sync = () => {
          const want = ready && visible;
          if (want === running) return;
          running = want;
          if (want) { gsap.ticker.add(orbit); glow && glow.resume(); }
          else { gsap.ticker.remove(orbit); glow && glow.pause(); }
        };
        onScreen(el, (v) => { visible = v; sync(); });
        const entrance = gsap.timeline({
          paused: true,
          onComplete: () => { ready = true; sync(); gsap.to(state, { a: R, duration: 2.5, ease: 'sine.inOut' }); }
        }).fromTo(chars, { opacity: 0, rotation: -65, transformOrigin: '50% 320%', filter: 'blur(6px)' },
          { opacity: 1, rotation: 0, filter: 'blur(0px)', duration: 2.6, ease: 'sine.inOut', stagger: .24, clearProps: 'filter' });
        el.addEventListener('pointerenter', () => { if (ready) gsap.to(state, { a: R * 2.4, duration: 1.4, ease: 'sine.out', overwrite: true }); });
        el.addEventListener('pointerleave', () => { if (ready) gsap.to(state, { a: R, duration: 2.2, ease: 'sine.inOut', overwrite: true }); });
        whenSeen(el, () => entrance.play());
      }
    };

    plates.forEach((el) => {
      const chars = el.querySelectorAll('.char');
      const build = NAMEPLATES[el.dataset.nameplate];
      if (chars.length && build) build(el, chars, el.closest('.dark') !== null);
    });
  }

  /* ---------------------------------------------------------------
     11) B-roll reel: muted loops that play only while on screen.
         The poster is the resting state; with reduced motion the clips
         never autoplay and get controls instead.
     --------------------------------------------------------------- */
  document.querySelectorAll('.reel video').forEach((v) => {
    v.muted = true;
    if (reduce || !('IntersectionObserver' in window)) { v.controls = true; return; }
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => { v.controls = true; }); }
      else v.pause();
    }), { threshold: .35 }).observe(v);
  });

  /* ---------------------------------------------------------------
     12) Ambient music: the Bakunawa Night loop, quiet, behind the page.
         Browsers block sound until a gesture, so it starts on the first
         click, tap or key press, unless the visitor muted it (remembered).
         Web Audio loops the buffer without a gap, keeps the position
         between pages, pauses in background tabs and ducks under any
         video playing with sound.
     --------------------------------------------------------------- */
  (function ambientMusic() {
    const btn = document.querySelector('.sound-btn');
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!btn) return;
    if (!AC) { btn.hidden = true; return; }
    const SRC = 'assets/audio/naga-ambient-bakunawa-night.mp3';
    const LOOP_END = 54;      // seconds: the loop length of the master
    const LEVEL = 0.22;       // background, not foreground
    let wanted = store(localStorage, 'naga-music') !== 'off';
    let ctx = null, gain = null, src = null, buf = null, loading = null;
    let offset = parseFloat(store(sessionStorage, 'naga-music-pos')) || 0;
    let startedAt = 0, playing = false, ducked = false;

    const sync = () => {
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Mute background music' : 'Play background music');
    };
    const load = () => loading || (loading = fetch(SRC).then((r) => { if (!r.ok) throw new Error('music ' + r.status); return r.arrayBuffer(); }));
    const level = () => (ducked ? LEVEL * 0.15 : LEVEL);
    const ramp = (v, s) => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(v, now + s);
    };
    const position = () => (src ? (ctx.currentTime - startedAt) % src.loopEnd : offset);

    async function start() {
      if (playing) return;
      playing = true; sync();
      try {
        if (!ctx) { ctx = new AC(); gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination); }
        if (ctx.state === 'suspended') await ctx.resume();
        if (!buf) buf = await ctx.decodeAudioData(await load());
        if (!playing || src) return;           // muted again while loading
        src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        src.loopStart = 0; src.loopEnd = Math.min(LOOP_END, buf.duration);
        src.connect(gain);
        offset %= src.loopEnd;
        src.start(0, offset);
        startedAt = ctx.currentTime - offset;
        ramp(level(), 2.5);
      } catch (e) { playing = false; sync(); }
    }
    function stop() {
      if (!playing) return;
      playing = false; sync();
      if (!src) return;
      offset = position();
      const s = src; src = null;
      ramp(0, 0.6);
      s.stop(ctx.currentTime + 0.65);
    }

    btn.addEventListener('click', () => {
      wanted = !playing;
      store(localStorage, 'naga-music', wanted ? 'on' : 'off');
      wanted ? start() : stop();
    });

    const GESTURES = ['pointerdown', 'keydown', 'touchstart'];
    const firstGesture = (e) => {
      GESTURES.forEach((n) => window.removeEventListener(n, firstGesture, true));
      if (wanted && !btn.contains(e.target)) start();
    };
    if (wanted) {
      GESTURES.forEach((n) => window.addEventListener(n, firstGesture, true));
      const saveData = navigator.connection && navigator.connection.saveData;
      if (!saveData) window.addEventListener('load', () => (window.requestIdleCallback || setTimeout)(() => load().catch(() => {})));
    }

    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (playing) ctx.resume();
    });
    window.addEventListener('pagehide', () => store(sessionStorage, 'naga-music-pos', String(ctx ? position() : offset)));
    document.querySelectorAll('video').forEach((v) => {
      v.addEventListener('play', () => { if (!v.muted) { ducked = true; if (src) ramp(level(), 0.4); } });
      ['pause', 'ended'].forEach((n) => v.addEventListener(n, () => { if (ducked) { ducked = false; if (src) ramp(level(), 1); } }));
    });
    sync();
  })();

  // Fonts can arrive after layout; let ScrollTrigger re-measure.
  if (hasST && document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
