// Shared helpers. Each promo builds a paused GSAP master timeline and registers
// its <video> elements; render.cjs seeks both to every frame (deterministic).
window.PROMO = {
  fps: 30, duration: 16.8, tl: null, videos: [], audio: null,
  video(el, start, from = 0, rate = 1) { el.muted = true; el.preload = 'auto'; this.videos.push({ el, start, from, rate }); return el; },
  ready() { return Promise.all([document.fonts.ready].concat(this.videos.map(({ el }) => el.readyState >= 2 ? 1 : new Promise((r) => el.addEventListener('loadeddata', r, { once: true }))))); },
  async seek(t) {
    this.tl.seek(t, false);
    await Promise.all(this.videos.map(({ el, start, from, rate }) => {
      const want = Math.min(Math.max(0, from + (t - start) * rate), el.duration - 0.04);
      if (Math.abs(el.currentTime - want) < 0.001) return 1;
      return new Promise((r) => { el.addEventListener('seeked', r, { once: true }); el.currentTime = want; });
    }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  },
  // Split a heading's text into .word spans (keeps spaces).
  words(el) { el.innerHTML = el.textContent.split(' ').map((w) => '<span class="word">' + w + '</span>').join(' '); return el.querySelectorAll('.word'); },
  chars(el) { el.innerHTML = Array.from(el.textContent).map((c) => '<span class="word">' + (c === ' ' ? '&nbsp;' : c) + '</span>').join(''); return el.querySelectorAll('.word'); },
  // Count a number up inside el over d seconds at time `at` on timeline tl.
  count(tl, el, to, at, d = 1.2, fmt = (v) => Math.round(v).toLocaleString('en-US')) {
    const o = { v: 0 }; tl.to(o, { v: to, duration: d, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } }, at);
  },
};
