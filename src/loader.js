// 00 · Loader: the Arch & Sun draws itself (arch from both feet, the sun rises
// from the ground line, the rays pop out), then the name appears.
const HARD_CAP = 3200;   // ms from start: exit no matter what
const SEEN_KEY = 'ep-loader-seen';

export function runLoader({ gsap, reduce }) {
  const loader = document.getElementById('loader');
  if (!loader) return Promise.resolve();
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('shot')) {
    loader.remove(); // headless section screenshots skip the intro
    return Promise.resolve();
  }
  const inner = loader.querySelector('.loader-inner');
  const arch = loader.querySelectorAll('.lm-arch');
  const strokes = loader.querySelector('.lm-strokes');
  const full = loader.querySelector('.lm-full');
  const sun = loader.querySelector('.lm-sun');
  const rays = loader.querySelectorAll('.lm-ray');
  const word = loader.querySelector('.loader-word');
  const line = loader.querySelector('.loader-line');
  const started = performance.now();

  let seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }

  // 'Skip intro' ends the animation and the wait at once.
  const skipBtn = loader.querySelector('.loader-skip');
  let onSkip = () => {};
  const skipped = new Promise((r) => skipBtn?.addEventListener('click', () => { onSkip(); r(); }, { once: true }));
  const ready = Promise.race([assetsReady(), wait(HARD_CAP - 600), skipped]);

  if (reduce) {
    // The finished mark, still, then straight into the site.
    gsap.set(full, { opacity: 1 });
    gsap.set([sun, rays, word, line], { opacity: 1 });
    return gsap.timeline()
      .from(inner, { opacity: 0, duration: 0.3 })
      .to({}, { duration: 0.5 })
      .then(() => ready)
      .then(() => gsap.to(loader, { opacity: 0, duration: 0.3 }))
      .then(() => loader.remove());
  }

  // Start states (the stylesheet already hides everything until now).
  gsap.set(arch, { strokeDashoffset: 1 });
  gsap.set(sun, { y: 48, opacity: 1 });
  gsap.set(rays, { opacity: 0 });
  gsap.set([word, line], { y: 12 });

  const tl = gsap.timeline();
  // 1. The arch draws upward from both feet and closes at the top. The solid
  //    shape (identical outline) takes over so the seam at the top is clean.
  tl.to(arch, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.05)
    .set(full, { opacity: 1 }, 0.75)
    .set(strokes, { opacity: 0 }, 0.76)
    // 2. The sun rises from behind the ground line (clipped there).
    .to(sun, { y: 0, duration: 0.7, ease: 'power2.out' }, 0.5)
    // 3. The rays pop out one by one, from the center outward.
    .fromTo(rays,
      { opacity: 0, scale: 0.35, svgOrigin: '100 240' },
      { opacity: 1, scale: 1, svgOrigin: '100 240', duration: 0.3, ease: 'back.out(2.2)', stagger: { each: 0.05, from: 'center' } }, 1.0)
    // 4. The name, then the program line.
    .to(word, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.3)
    .to(line, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 1.5);

  if (seen) tl.timeScale(2.8);
  onSkip = () => tl.progress(1);

  return tl.then(() => ready).then(() => {
    const elapsed = performance.now() - started;
    const exit = exitTimeline(gsap, { loader, inner });
    if (elapsed > HARD_CAP) exit.timeScale(1.4);
    // Resolve as the curtain starts lifting so the page can come alive under it.
    return wait(250);
  });
}

// The mark and the name lift away while the curtain wipes up and the hero enters.
function exitTimeline(gsap, { loader, inner }) {
  const tl = gsap.timeline({ onComplete: () => loader.remove() });
  tl.to(inner, { opacity: 0, y: -18, duration: 0.45, ease: 'power2.in' }, 0)
    .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut' }, 0.1);
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
