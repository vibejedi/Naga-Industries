/* ==========================================================================
   Naga Industries — page behaviours
   No animation or scroll library: the page scrolls natively. A page moves in
   three places only (see CLAUDE.md, Motion rules): the hero enters once on
   load, one statement follows the scroll in its own section, and CSS answers
   the pointer. The only vendored library is lottie (the wave mark); if it is
   missing the page still reads.
   ========================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // One passive scroll read per frame, shared by everything that watches the scroll.
  const onScroll = (fn) => {
    let queued = false;
    const run = () => { queued = false; fn(); };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    fn();
  };

  /* ---------------------------------------------------------------
     1) In-page anchors: land the target under the fixed bars. A full
        screen section (.screen, .entrance) pads for the bar itself, so
        it lands at the very top.
     --------------------------------------------------------------- */
  const barsHeight = () => {
    const nav = document.querySelector('.nav');
    const sub = document.querySelector('.subnav');
    return (nav ? nav.offsetHeight : 0) + (sub ? sub.offsetHeight : 0);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const full = target.matches('.screen, .entrance');
    const top = target.getBoundingClientRect().top + window.scrollY - (full ? 0 : barsHeight());
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
    const nav = document.querySelector('.nav');
    if (nav && nav.classList.contains('open')) { nav.classList.remove('open'); nav.querySelector('.menu-btn')?.setAttribute('aria-expanded', 'false'); }
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
      const y = (nav.offsetHeight || 56) + 1;
      let on = false;
      darks.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) on = true;
      });
      nav.classList.toggle('on-dark', on);
    };
    onScroll(setDark);
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
     3) Lottie wave mark in the nav: the waves draw once on load and
        again when the pointer enters the brand; they never loop
     --------------------------------------------------------------- */
  if (typeof window.lottie !== 'undefined') {
    document.querySelectorAll('.lottie-mark').forEach((el) => {
      const path = el.getAttribute('data-lottie') || 'assets/lottie/naga-wave.json';
      const anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: false, path });
      const REST = 60; // the frame where the three waves are fully drawn
      const draw = () => anim.playSegments([0, REST], true);
      anim.addEventListener('DOMLoaded', () => (reduce ? anim.goToAndStop(REST, true) : draw()));
      if (!reduce) el.closest('a')?.addEventListener('pointerenter', () => { if (anim.isPaused) draw(); });
    });
  }

  /* ---------------------------------------------------------------
     4) Hero film: fade in when it can play; the poster stays otherwise.
        It loops, so the hero carries a pause button.
     --------------------------------------------------------------- */
  document.querySelectorAll('.entrance').forEach((sec) => {
    const v = sec.querySelector('video');
    const btn = sec.querySelector('.pause');
    if (!v) { btn?.remove(); return; }
    ['canplay', 'loadeddata', 'playing'].forEach((ev) => v.addEventListener(ev, () => v.classList.add('ready')));
    if (v.readyState >= 2) v.classList.add('ready');
    const play = () => { const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); };
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); btn?.setAttribute('aria-pressed', 'true'); } else play();
    btn?.addEventListener('click', () => {
      const paused = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? 'Play the background film' : 'Pause the background film');
      if (paused) v.pause(); else play();
    });
  });

  /* ---------------------------------------------------------------
     5) Hero entrance, once on load. The h1 rises line by line out of
        word masks, then whatever is marked [data-enter-up] fades up 12px
        in order, while [data-enter-media] settles from 1.05 to 1. The
        keyframes are in naga.css. The head script hides the words for at
        most 900ms; if this script is later than that, the hero just stands.
     --------------------------------------------------------------- */
  (function heroEntrance() {
    const root = document.documentElement;
    const hero = document.querySelector('[data-enter]');
    const late = root.classList.contains('m-enter-done');
    if (!hero || reduce || late || !root.classList.contains('m-enter')) { root.classList.add('m-enter-done'); return; }
    const h1 = hero.querySelector('h1');
    const original = h1 ? h1.innerHTML : '';
    const masks = [];
    if (h1) {
      // Wrap every word of every text node, keeping the h1's own spans (a nameplate, a line break).
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const m = document.createElement('span'); m.className = 'en-w';
              const inner = document.createElement('span'); inner.textContent = part;
              m.appendChild(inner); frag.appendChild(m); masks.push(m);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      };
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      walk(h1);
      // Words on one line rise together; lines follow 80ms apart, three steps at most.
      let line = -1, lastTop = null;
      masks.forEach((m) => {
        const top = Math.round(m.getBoundingClientRect().top);
        if (lastTop === null || Math.abs(top - lastTop) > 4) { line += 1; lastTop = top; }
        m.style.setProperty('--l', Math.min(line, 3));
      });
    }
    hero.querySelectorAll('[data-enter-up]').forEach((el, i) => el.style.setProperty('--i', i));
    hero.classList.add('is-entering');
    root.classList.add('m-enter-done');
    // When everything has landed, give the h1 its own nodes back.
    setTimeout(() => {
      hero.classList.remove('is-entering');
      if (h1) { h1.innerHTML = original; h1.removeAttribute('aria-label'); }
    }, 1500);
  })();

  /* ---------------------------------------------------------------
     6) Prices marked data-count show their final figure. They used to
        count up; a price never animates now.
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.getAttribute('data-count')) || 0;
    el.textContent = (el.getAttribute('data-prefix') || '') + Math.round(target).toLocaleString('en-PH') + (el.getAttribute('data-suffix') || '');
  });

  /* ---------------------------------------------------------------
     8) Film frame: hide the label once playing
     --------------------------------------------------------------- */
  document.querySelectorAll('.film-frame video').forEach((v) => {
    v.addEventListener('play', () => v.closest('.film-frame')?.classList.add('playing'));
  });

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
    // Duck while any video plays with sound (a promo can be unmuted mid-play, hence volumechange).
    const vids = [...document.querySelectorAll('video')];
    const reduck = () => {
      const d = vids.some((v) => !v.paused && !v.ended && !v.muted && v.volume > 0);
      if (d !== ducked) { ducked = d; if (src) ramp(level(), d ? 0.4 : 1); }
    };
    vids.forEach((v) => ['play', 'pause', 'ended', 'volumechange'].forEach((n) => v.addEventListener(n, reduck)));
    sync();
  })();

  /* ---------------------------------------------------------------
     13) Living sea: WebGL caustics drifting behind the page's first dark chapter,
         like light through water above the Bakunawa. Only cyan light is
         added on top of the chapter's own black; no WebGL, no change.
         Renders at quarter resolution, 30 fps, only while on screen; with
         reduced motion it draws one still frame.
     --------------------------------------------------------------- */
  (function livingSea() {
    const chapters = [...document.querySelectorAll('.chapter.dark')].slice(0, 1);
    if (!chapters.length) return;
    const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const FRAG = [
      'precision mediump float;',
      'uniform vec2 uRes;uniform float uTime;uniform float uCell;',
      'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}',
      // Distance to the nearest cell edge (F2 - F1) of moving Voronoi cells: bright where it is small.
      'float edge(vec2 p,float t){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;',
      ' for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=h2(i+g);',
      '  o=.5+.42*sin(t+6.2831*o);float d=length(g+o-f);if(d<a){b=a;a=d;}else if(d<b){b=d;}}',
      ' return b-a;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/uCell;float t=uTime*.3;',
      ' uv+=vec2(sin(uv.y*2.1+t),cos(uv.x*1.7-t*.8))*.32+sin(uv.yx*4.3+t*1.3)*.07;',
      ' float c1=pow(1.-smoothstep(0.,.085,edge(uv,t)),2.),c2=pow(1.-smoothstep(0.,.07,edge(uv*1.7+vec2(3.1,1.7),t*1.2)),2.);',
      ' float c=c1*.55+c2*.3+c1*c2*.9;',
      ' float patch=smoothstep(.25,1.,sin(uv.x*.42+t*.25)*sin(uv.y*.37-t*.18)*.5+.5+.25);',
      ' float x=gl_FragCoord.x/uRes.x,top=gl_FragCoord.y/uRes.y;',
      ' float r=(sin(x*19.+t*1.1)*.5+.5)*(sin(x*37.-t*.7+1.3)*.5+.5);r=pow(r,3.)*smoothstep(.25,1.,top);',
      ' float a=(c*patch*.5*smoothstep(-.2,1.,top)+r*.2)*.6;',
      ' gl_FragColor=vec4(vec3(0.,.851,.961)*a,a);}',
    ].join('\n');

    chapters.forEach((sec) => {
      const c = document.createElement('canvas');
      c.className = 'sea'; c.setAttribute('aria-hidden', 'true');
      const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'low-power' });
      if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(prog, 'uRes'), uTime = gl.getUniformLocation(prog, 'uTime'), uCell = gl.getUniformLocation(prog, 'uCell');
      sec.prepend(c);

      const SCALE = 0.5; // canvas pixels per CSS pixel
      const size = () => {
        const w = Math.max(1, Math.round(sec.clientWidth * SCALE)), h = Math.max(1, Math.round(sec.clientHeight * SCALE));
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
        gl.uniform1f(uCell, 230 * SCALE);
      };
      const t0 = performance.now() - Math.random() * 20000;
      const draw = (now) => { gl.uniform1f(uTime, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
      let raf = 0, last = 0, visible = false;
      const loop = (now) => {
        if (!visible) return;
        raf = requestAnimationFrame(loop);
        if (now - last < 33) return;
        last = now; draw(now);
      };
      size(); draw(performance.now()); c.classList.add('on');
      if ('ResizeObserver' in window) new ResizeObserver(() => { size(); if (!visible || reduce) draw(performance.now()); }).observe(sec);
      if (reduce) return;
      new IntersectionObserver((es) => es.forEach((e) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      })).observe(sec);
      document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (visible && !document.hidden) raf = requestAnimationFrame(loop); });
    });
  })();

  /* ---------------------------------------------------------------
     15) Promo films (figure.promo): muted loop that plays only on
         screen. "Sound on" restarts it with sound (the ambient music
         ducks); "Pause" stops it. With reduced motion it never
         autoplays and shows native controls instead.
     --------------------------------------------------------------- */
  document.querySelectorAll('.promo').forEach((fig) => {
    const v = fig.querySelector('video');
    const sound = fig.querySelector('.promo-sound'), pause = fig.querySelector('.promo-pause');
    if (!v) return;
    v.muted = true;
    if (reduce || !('IntersectionObserver' in window)) { v.controls = true; fig.querySelector('.promo-ui')?.remove(); return; }
    let userPaused = false;
    const ui = () => {
      if (sound) { sound.setAttribute('aria-pressed', String(!v.muted)); sound.querySelector('span').textContent = v.muted ? 'Sound on' : 'Sound off'; }
      if (pause) { pause.setAttribute('aria-pressed', String(userPaused)); pause.querySelector('span').textContent = userPaused ? 'Play' : 'Pause'; }
    };
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => { v.controls = true; }); };
    sound?.addEventListener('click', () => {
      const on = v.muted;
      v.muted = !on;
      if (on) { v.currentTime = 0; userPaused = false; play(); }
      ui();
    });
    pause?.addEventListener('click', () => { userPaused = !userPaused; if (userPaused) v.pause(); else play(); ui(); });
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (!userPaused) play(); }
      else { v.pause(); if (!v.muted) { v.muted = true; ui(); } }
    }), { threshold: .5 }).observe(v);
    ui();
  });

  /* ---------------------------------------------------------------
     16) Statement moment: [data-say] lights up word by word as it
         crosses the screen and runs back on the way up (after the
         word-highlight moment in .claude/skills/design-taste-frontend).
         The text is whole and readable without this script.
     --------------------------------------------------------------- */
  if (!reduce) {
    document.querySelectorAll('[data-say]').forEach((p) => {
      const words = [];
      p.setAttribute('aria-label', p.textContent.replace(/\s+/g, ' ').trim());
      [...p.childNodes].forEach((n) => {
        if (n.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'say-w'; w.setAttribute('aria-hidden', 'true'); w.textContent = part;
          frag.appendChild(w); words.push(w);
        });
        n.replaceWith(frag);
      });
      if (!words.length) return;
      p.classList.add('is-live');
      let shown = -1;
      onScroll(() => {
        const r = p.getBoundingClientRect(), vh = window.innerHeight;
        // From the first line reaching 80% of the screen to the last line reaching 45%.
        const t = (vh * 0.8 - r.top) / (vh * 0.35 + r.height);
        const n = Math.round(Math.max(0, Math.min(1, t)) * words.length);
        if (n === shown) return;
        shown = n;
        words.forEach((w, i) => w.classList.toggle('is-on', i < n));
      });
    });
  }
})();
