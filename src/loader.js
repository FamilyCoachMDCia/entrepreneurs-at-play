// 00 · Loader: the FamilyCoachMD logo grows like a plant, then lands in the nav.
const HARD_CAP = 3200;   // ms from start: exit no matter what
const SEEN_KEY = 'ep-loader-seen';

export function runLoader({ gsap, reduce }) {
  const loader = document.getElementById('loader');
  if (!loader) return Promise.resolve();
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('shot')) {
    loader.remove(); // headless section screenshots skip the intro
    return Promise.resolve();
  }
  const wrap = loader.querySelector('.loader-logo');
  const svg = loader.querySelector('.fcmd-logo');
  const line = loader.querySelector('.loader-line');
  const navSymbol = document.querySelector('.nav-symbol');
  const started = performance.now();

  let seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }

  const ready = Promise.race([assetsReady(), wait(HARD_CAP - 600)]);

  if (reduce) {
    gsap.set(line, { opacity: 1 });
    return gsap.timeline()
      .from(wrap, { opacity: 0, duration: 0.3 })
      .to({}, { duration: 0.4 })
      .then(() => ready)
      .then(() => gsap.to(loader, { opacity: 0, duration: 0.3 }))
      .then(() => loader.remove());
  }

  const center = svg.querySelector('.fcmd-stem-center');
  const leafSmall = svg.querySelector('.fcmd-leaf-small');
  const leafBig = svg.querySelector('.fcmd-leaf-big');
  const glyphs = svg.querySelectorAll('.glyph');

  // Seed dot and a glowing growth tip that rides the stem as it draws.
  const start = center.getPointAtLength(0);
  const ns = 'http://www.w3.org/2000/svg';
  const seed = document.createElementNS(ns, 'circle');
  seed.setAttribute('cx', start.x); seed.setAttribute('cy', start.y); seed.setAttribute('r', 16);
  seed.setAttribute('fill', '#6B7055');
  const tip = document.createElementNS(ns, 'circle');
  tip.setAttribute('r', 22); tip.setAttribute('fill', '#A9AE93');
  svg.append(seed, tip);

  gsap.set(center, { drawSVG: '0%' });
  gsap.set(tip, { opacity: 0 });
  gsap.set(seed, { opacity: 0 });
  gsap.set(leafSmall, { svgOrigin: leafSmall.dataset.origin, scale: 0.1, rotation: -40, opacity: 0 });
  gsap.set(leafBig, { svgOrigin: leafBig.dataset.origin, scale: 0.1, rotation: -55, opacity: 0 });
  gsap.set(glyphs, { y: 140, rotation: 6, opacity: 0, transformOrigin: '50% 100%' });

  const tl = gsap.timeline();
  tl.to(seed, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0)
    .to(center, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, 0.2)
    .to(tip, { opacity: 0.9, duration: 0.1 }, 0.2)
    .to(tip, { motionPath: { path: center, align: center, alignOrigin: [0.5, 0.5] }, duration: 1.1, ease: 'power2.inOut' }, 0.2)
    .to(tip, { opacity: 0, duration: 0.25 }, 1.25)
    .to(seed, { opacity: 0, duration: 0.3 }, 0.6)
    .to(leafSmall, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.9)
    .to(leafBig, { scale: 1, rotation: 0, opacity: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 1.1)
    .to(glyphs, { y: 0, rotation: 0, opacity: 1, duration: 0.6, stagger: 0.055, ease: 'power3.out' }, 1.2)
    .to(line, { opacity: 1, duration: 0.4 }, 2.0)
    .to(wrap, { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.2)
    .to([leafSmall, leafBig], { rotation: 3, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.2);

  if (seen) tl.timeScale(2.8);

  return tl.then(() => ready).then(() => {
    const elapsed = performance.now() - started;
    const exit = exitTimeline(gsap, { loader, wrap, line, glyphs, navSymbol });
    if (elapsed > HARD_CAP) exit.timeScale(1.4);
    // Resolve as the curtain starts lifting so the page can come alive under it.
    return wait(250);
  });
}

function exitTimeline(gsap, { loader, wrap, line, glyphs, navSymbol }) {
  const tl = gsap.timeline({ onComplete: () => loader.remove() });
  if (navSymbol) {
    // Fly the logo onto the nav symbol (same viewBox, so the leaves line up).
    const from = wrap.getBoundingClientRect();
    const to = navSymbol.getBoundingClientRect();
    const scale = to.width / from.width;
    gsap.set(navSymbol, { opacity: 0 });
    tl.to(glyphs, { opacity: 0, duration: 0.3, stagger: 0.01 }, 0)
      .to(line, { opacity: 0, duration: 0.25 }, 0)
      .to(wrap, {
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
        scale, duration: 0.8, ease: 'expo.inOut',
      }, 0.05)
      .set(navSymbol, { opacity: 1 }, 0.85)
      .set(wrap, { opacity: 0 }, 0.85);
  }
  tl.to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.1);
  return tl;
}

function assetsReady() {
  const heroImgs = [...document.querySelectorAll('.hero img')];
  return Promise.all([
    document.fonts.ready,
    ...heroImgs.map((img) => img.decode().catch(() => {})),
  ]);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
