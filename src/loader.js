// 00 · Loader: the Arch & Sun (bricks) draws itself — arch from both feet,
// sun rises inside the doorway, 8 brick rays fan outward — then the name
// springs in letter by letter.
const HARD_CAP = 3800;   // ms from start: exit no matter what
const SEEN_KEY = 'ep-loader-seen';

export function runLoader({ gsap, reduce }) {
  const loader = document.getElementById('loader');
  if (!loader) return Promise.resolve();
  const params = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
  if (params?.has('shot')) {
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

  // Split "Entrepreneurs at Play" into word-safe letter spans for a lively
  // letter-by-letter entrance without awkward mid-word wraps on phones.
  const chars = splitLoaderChars(word);

  // Start states (the stylesheet already hides everything until now).
  gsap.set(arch, { strokeDashoffset: 1 });
  gsap.set(sun, { y: 18, opacity: 1 });
  gsap.set(rays, { opacity: 0 });
  gsap.set(word, { opacity: 1 });
  gsap.set(chars, { opacity: 0, y: 24, rotate: -6, scale: 0.78 });
  gsap.set(line, { y: 12, opacity: 0 });

  const tl = gsap.timeline();
  // 1. The arch draws upward from both feet and closes cleanly at the crown.
  tl.to(arch, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' }, 0.05)
    .set(full, { opacity: 1 }, 0.7)
    .set(strokes, { opacity: 0 }, 0.71)
    // 2. The sun rises from behind the doorway baseline.
    .to(sun, { y: 0, duration: 0.56, ease: 'power3.out' }, 0.48)
    // 3. The 8 brick rays fan outward from the center right after the sun rises.
    .fromTo(rays,
      { opacity: 0, scale: 0.22, svgOrigin: '180 180' },
      { opacity: 1, scale: 1, svgOrigin: '180 180', duration: 0.34, ease: 'back.out(2.15)', stagger: { each: 0.048, from: 'center' } }, 0.96)
    // 4. Each letter of "Entrepreneurs at Play" springs up one by one.
    .to(chars, {
      opacity: 1, y: 0, rotate: 0, scale: 1,
      duration: 0.42, ease: 'back.out(1.9)',
      stagger: 0.035,
    }, 1.24)
    // 5. The subtitle settles gently underneath.
    .to(line, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 2.12)
    // Brief breath so visitors enjoy the finished lockup before the curtain lifts.
    .to({}, { duration: 0.28 }, 2.52);

  // Dev-only inspection hook: ?loaderAt=<seconds> freezes the timeline at an
  // exact frame so desktop and mobile screenshots can verify every beat.
  if (params?.has('loaderAt')) {
    const t = Number(params.get('loaderAt'));
    if (Number.isFinite(t)) {
      tl.pause(Math.max(0, t));
      return new Promise(() => {});
    }
  }

  if (seen) tl.timeScale(2.5);
  onSkip = () => tl.progress(1);

  return tl.then(() => ready).then(() => {
    const elapsed = performance.now() - started;
    const exit = exitTimeline(gsap, { loader, inner });
    if (elapsed > HARD_CAP) exit.timeScale(1.4);
    // Resolve as the curtain starts lifting so the page can come alive under it.
    return wait(250);
  });
}

// Wraps each non-space token in a nowrap chunk and each letter in .lm-char,
// preserving inline elements like <em>at Play</em>.
function splitLoaderChars(el) {
  if (!el) return [];
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const chunk = document.createElement('span');
          chunk.className = 'lm-word-chunk';
          for (const ch of part) {
            const span = document.createElement('span');
            span.className = 'lm-char';
            span.textContent = ch;
            chunk.appendChild(span);
            chars.push(span);
          }
          frag.appendChild(chunk);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  return chars;
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
