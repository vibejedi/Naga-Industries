// Timeline helpers shared by the promo pages (after stage.js and gsap).
window.FX = (tl) => ({
  show: (el, at) => tl.set(el, { opacity: 1 }, at),
  hide: (el, at) => tl.set(el, { opacity: 0 }, at),
  flash: (at, k = .5) => tl.fromTo('#flash', { opacity: k }, { opacity: 0, duration: .35, ease: 'power2.out', immediateRender: false }, at),
  shake(at, n = 6, a = 12) { for (let i = 0; i < n; i++) tl.to('#stage', { x: (i % 2 ? -1 : 1) * a * (1 - i / n), y: (i % 3 - 1) * a * .5 * (1 - i / n), duration: .04 }, at + i * .04); tl.to('#stage', { x: 0, y: 0, duration: .05 }, at + n * .04); },
  rise: (sel, at, d = .55) => tl.from(sel, { y: 70, opacity: 0, filter: 'blur(10px)', duration: d, ease: 'power3.out', stagger: .08 }, at),
  drift: (sel, at, d = .9) => tl.from(sel, { y: 24, opacity: 0, filter: 'blur(14px)', duration: d, ease: 'sine.out', stagger: .14 }, at),
  clip(sel, at, dur, from = .3, zoom = 1.1) { this.show(sel, at); window.PROMO.video(document.querySelector(sel + ' video'), at, from); tl.fromTo(sel + ' video', { scale: zoom }, { scale: 1, duration: dur + .2, ease: 'power2.out' }, at); this.hide(sel, at + dur); },
  outro: (d) => { tl.to('#stage', { opacity: 0, duration: .6, ease: 'power1.in' }, d - .6); tl.set({}, {}, d); },
});
