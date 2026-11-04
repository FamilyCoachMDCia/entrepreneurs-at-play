import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

import { runLoader } from './loader.js';
import { initGrowthLine } from './growth-line.js';
import { initUI, motionState } from './ui.js';
import { initSections } from './sections.js';

// The inline head script hides effect-driven content only until this flag
// appears; if this module never runs, it reverts the page to plain HTML.
document.documentElement.classList.add('app-ready');

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ctx = { gsap, ScrollTrigger, SplitText, reduce, lenis: null };

// Smooth scroll on mouse/trackpad devices only; touch keeps native scrolling.
if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ctx.lenis = lenis;
  if (import.meta.env.DEV) window.__lenis = lenis; // for local testing only
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);
ctx.lenis?.stop();

initUI(ctx);

// Sections measure layout, so they wait for the web fonts, but never longer
// than 2.5 s: blocked font hosts must not leave the page half-built.
const fontsOrTimeout = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
fontsOrTimeout.then(() => {
  initSections(ctx);
  initGrowthLine(ctx);
  ScrollTrigger.refresh();
});

runLoader(ctx).then(() => {
  ctx.lenis?.start();
  document.documentElement.classList.add('is-loaded');
  heroIntro();
  loadToys();
  // Arriving with a #hash (e.g. a shared link to #visit) lands there.
  if (location.hash && location.hash !== '#top') {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => (ctx.lenis ? ctx.lenis.scrollTo(target, { offset: -70, immediate: true }) : target.scrollIntoView()), 50);
  }
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
// when WebGL works. Phones get two toys in a slot beside the hero buttons;
// wider screens get the full stage. Crossing the breakpoint (resize,
// rotation) disposes the scene and rebuilds it in the right host. Each host
// hides its SVG fallback only while it actually holds a scene.
function loadToys() {
  if (reduce || !hasWebGL()) return;
  const phone = window.matchMedia('(max-width: 767px)');
  let dispose = null;
  let host = null;
  let initToys = null;

  const mount = () => {
    dispose?.();
    host?.classList.remove('has-scene');
    const compact = phone.matches;
    host = document.querySelector(compact ? '.hero-toyslot' : '#hero-stage');
    if (!host || !initToys) return;
    dispose = initToys(host, { compact, isPaused: () => motionState.paused });
    host.classList.add('has-scene');
  };

  import('./hero-toys.js').then((mod) => {
    initToys = mod.initToys;
    mount();
    phone.addEventListener('change', mount);
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
