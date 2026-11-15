import { PAGES, pageForPath, curtainHTML } from './pages.js';
import { motionState, goToHash } from './ui.js';

// Page transitions. Leaving: a door swings open and its color fills the
// screen, or (any other link) the next page's color rises from the bottom.
// Arriving: the page is born under the very same curtain (rendered in its
// HTML, shown by the inline head script) and the curtain lifts once the page
// is ready. Same color, same mark, same place: the document swap is invisible.

const NAV_KEY = 'ep-nav';
const PROGRAM_KEY = 'ep-program';
const scrollKey = (path) => `ep-scroll:${path}`;
const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* private mode */ } },
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const html = document.documentElement;

/* ---------- Arriving ---------- */

export function runCurtainIn({ gsap, reduce }) {
  const curtain = document.querySelector('.curtain:not(.is-exit)');
  const done = () => {
    curtain?.remove();
    html.removeAttribute('data-curtain');
    html.removeAttribute('data-arrived');
    store.del(NAV_KEY);
  };
  if (!html.hasAttribute('data-curtain') || !curtain) { done(); return Promise.resolve(); }
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('shot')) { done(); return Promise.resolve(); }

  const started = performance.now();
  // Wait for the fonts and the page's first photo, but never more than 1.2 s.
  const lead = document.querySelector('main img[fetchpriority="high"]');
  const ready = Promise.race([
    Promise.all([document.fonts.ready, lead?.decode?.().catch(() => {})]),
    wait(1200),
  ]);
  return ready.then(() => wait(Math.max(0, 260 - (performance.now() - started)))).then(() => {
    curtain.style.animation = 'none'; // the CSS failsafe is no longer needed
    if (reduce || motionState.paused) {
      gsap.to(curtain, { opacity: 0, duration: 0.15, onComplete: done });
      return undefined;
    }
    const mark = curtain.querySelector('.curtain-mark');
    gsap.timeline({ onComplete: done })
      .to(mark, { y: -24, opacity: 0, duration: 0.3, ease: 'power2.in' })
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: innerWidth < 768 ? 0.6 : 0.75, ease: 'expo.inOut' }, 0.08);
    // The page comes alive under the lifting curtain.
    return wait(220);
  });
}

/* ---------- Leaving ---------- */

export function initTransitions(ctx) {
  const { gsap } = ctx;
  let leaving = false;

  const exitCurtain = (key) => {
    const holder = document.createElement('div');
    holder.innerHTML = curtainHTML(key, { exit: true });
    const el = holder.firstElementChild;
    document.body.append(el);
    return el;
  };

  const leaveTo = (url, key, door) => {
    if (leaving) return;
    leaving = true;
    html.classList.add('is-leaving');
    store.set(scrollKey(location.pathname), String(Math.round(scrollY)));
    store.set(NAV_KEY, JSON.stringify({ to: key, t: Date.now() }));
    const go = () => location.assign(url.href);

    if (ctx.reduce || motionState.paused) { go(); return; }
    ctx.lenis?.stop();
    const failsafe = setTimeout(go, 1400); // a background tab may never finish the tween
    const curtain = exitCurtain(key);
    const mark = curtain.querySelector('.curtain-mark');
    const small = innerWidth < 768;
    const tl = gsap.timeline({ onComplete: () => { clearTimeout(failsafe); go(); } });
    gsap.set(mark, { opacity: 0, y: 18 });

    if (door) {
      // The door swings open; the light behind it floods the screen.
      const leaf = door.querySelector('.door-leaf');
      const r = door.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = innerHeight;
      const radius = parseFloat(getComputedStyle(door).borderTopLeftRadius) || 24;
      leaf.style.transition = 'none';
      gsap.set(curtain, { clipPath: `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round ${radius}px)`, opacity: 0 });
      tl.to(leaf, { rotationY: small ? -70 : -100, duration: small ? 0.3 : 0.4, ease: 'power2.in' }, 0)
        .to(curtain, { opacity: 1, duration: 0.12, ease: 'none' }, small ? 0.16 : 0.24)
        .to(curtain, { clipPath: `inset(0px 0px 0px 0px round 0px)`, duration: small ? 0.48 : 0.6, ease: 'expo.inOut' }, small ? 0.16 : 0.24)
        .to(mark, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, small ? 0.42 : 0.58)
        .to({}, { duration: 0.06 });
    } else {
      gsap.set(curtain, { clipPath: 'inset(100% 0% 0% 0%)' });
      tl.to(curtain, { clipPath: 'inset(0% 0% 0% 0%)', duration: small ? 0.45 : 0.55, ease: 'expo.inOut' })
        .to(mark, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, '-=0.18')
        .to({}, { duration: 0.06 });
    }
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    const key = pageForPath(url.pathname);
    if (!key) return; // not one of our pages (404, files): let the browser go

    // A link to this same page is an in-page jump.
    if (key === pageForPath(location.pathname)) {
      e.preventDefault();
      goToHash(url.hash || '#top', { push: !!url.hash });
      return;
    }
    // A program button on another page: that page's form opens on it.
    if (a.dataset.programCta) store.set(PROGRAM_KEY, a.dataset.programCta);
    e.preventDefault();
    leaveTo(url, key, a.classList.contains('door') ? a : null);
  });

  // Fetch the next page while the visitor is still deciding.
  const prefetched = new Set();
  const prefetch = (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.origin !== location.origin) return;
    const key = pageForPath(a.pathname);
    if (!key || key === pageForPath(location.pathname) || prefetched.has(key)) return;
    prefetched.add(key);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = PAGES[key].path;
    document.head.append(link);
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);
  document.addEventListener('touchstart', prefetch, { passive: true });

  // Back/forward from the browser's page cache: never show a page still
  // covered by the curtain it left with.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.querySelectorAll('.curtain').forEach((c) => c.remove());
    html.classList.remove('is-leaving');
    html.removeAttribute('data-curtain');
    document.querySelectorAll('.door-leaf').forEach((leaf) => { gsap.set(leaf, { clearProps: 'transform' }); leaf.style.transition = ''; });
    leaving = false;
    ctx.lenis?.start();
  });
}

// Back/forward without the page cache: return to where the visitor was.
export function restoreScroll(ctx) {
  const entry = performance.getEntriesByType?.('navigation')[0];
  if (entry?.type !== 'back_forward') return;
  const y = Number(store.get(scrollKey(location.pathname)));
  if (!y) return;
  if (ctx.lenis) ctx.lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

// The program a visitor picked on another page (read once).
export function takeProgramChoice() {
  const v = store.get(PROGRAM_KEY);
  store.del(PROGRAM_KEY);
  return v;
}
