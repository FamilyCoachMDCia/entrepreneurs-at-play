import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

import { runLoader } from './loader.js';
import { initGrowthLine } from './growth-line.js';
import { initUI } from './ui.js';
import { initSections } from './sections.js';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ctx = { gsap, ScrollTrigger, SplitText, reduce, lenis: null };

// Smooth scroll on pointer devices only; touch keeps native scrolling.
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ctx.lenis = lenis;
  if (import.meta.env.DEV) window.__lenis = lenis; // for local testing only
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
ctx.lenis?.stop();

initUI(ctx);

// Hero copy waits for the loader; everything else is wired now so
// ScrollTrigger measures the final layout once fonts are in.
document.fonts.ready.then(() => {
  initSections(ctx);
  initGrowthLine(ctx);
  ScrollTrigger.refresh();
});

runLoader(ctx).then(() => {
  ctx.lenis?.start();
  document.documentElement.classList.add('is-loaded');
  heroIntro();
  loadToys();
  if (import.meta.env.DEV) devShot();
});

// Local testing only: ?shot=<section id>&dy=<px> jumps there after the loader
// so headless screenshots can capture any section.
function devShot() {
  const q = new URLSearchParams(location.search);
  const id = q.get('shot');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => {
    const y = el.getBoundingClientRect().top + window.scrollY + (Number(q.get('dy')) || 0);
    if (ctx.lenis) ctx.lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, 300);
}

function heroIntro() {
  if (reduce) return;
  const items = gsap.utils.toArray('.hero-copy > *, .badge');
  gsap.from(items, { y: 36, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' });
}

// Three.js is the heaviest dependency: load it after first paint and only
// when WebGL works. The SVG doodles stay as the fallback otherwise.
function loadToys() {
  // Phones get a compact slot beside the hero buttons with just two toys.
  const compact = window.innerWidth < 768;
  const stage = document.querySelector(compact ? '.hero-toyslot' : '#hero-stage');
  if (reduce || !stage || !hasWebGL()) return;
  import('./hero-toys.js').then(({ initToys }) => {
    initToys(stage, { compact });
    document.documentElement.classList.add('has-webgl');
  }).catch(() => {});
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
