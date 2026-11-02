import { PATHS, pathFor } from './pathways.js';

// Chrome around the content: ticker, nav, menu, cursor, magnetic buttons,
// anchor scrolling, the visit form and copy-to-clipboard.
export const motionState = { paused: false };

export function initUI(ctx) {
  ticker(ctx);
  nav(ctx);
  menu(ctx);
  anchors(ctx);
  if (!ctx.reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cursor(ctx);
    magnetic(ctx);
  }
  form();
  copy();
}

function ticker({ gsap, reduce }) {
  const items = gsap.utils.toArray('.ticker-list li');
  const btn = document.querySelector('.ticker-pause');
  if (!items.length) return;
  let i = 0;
  gsap.set(items, { yPercent: (k) => (k === 0 ? 0 : 100) });
  const next = () => {
    if (motionState.paused) return;
    const cur = items[i];
    i = (i + 1) % items.length;
    const nxt = items[i];
    if (reduce) {
      gsap.set(cur, { yPercent: 100 });
      gsap.set(nxt, { yPercent: 0 });
      return;
    }
    gsap.to(cur, { yPercent: -100, duration: 0.6, ease: 'power3.inOut' });
    gsap.fromTo(nxt, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' });
  };
  setInterval(next, 4000);
  // One pause control for every auto-rotating element (WCAG 2.2.2).
  btn?.addEventListener('click', () => {
    motionState.paused = !motionState.paused;
    btn.setAttribute('aria-pressed', String(motionState.paused));
    btn.setAttribute('aria-label', motionState.paused ? 'Play announcements' : 'Pause announcements');
  });
}

function nav({ ScrollTrigger }) {
  const head = document.getElementById('site-head');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      head.classList.toggle('is-scrolled', y > 10);
      if (document.body.classList.contains('menu-open')) return;
      const down = y > lastY;
      head.classList.toggle('is-hidden', down && y > 240);
      lastY = y;
    },
  });
}

function menu({ gsap, lenis, reduce }) {
  const burger = document.querySelector('.burger');
  const sheet = document.getElementById('menu');
  if (!burger || !sheet) return;
  const links = sheet.querySelectorAll('.menu-links li');
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      sheet.hidden = false;
      lenis?.stop();
      if (!reduce) {
        gsap.fromTo(sheet, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.inOut' });
        gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
      }
    } else {
      lenis?.start();
      if (reduce) { sheet.hidden = true; return; }
      gsap.to(sheet, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'expo.inOut', onComplete: () => { sheet.hidden = true; } });
    }
  };
  burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { set(false); burger.focus(); } });
}

function anchors({ lenis }) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
    if (target.id) history.replaceState(null, '', id);
  });
}

function cursor({ gsap }) {
  const root = document.querySelector('.cursor');
  if (!root) return;
  const dot = root.querySelector('.cursor-dot');
  const ring = root.querySelector('.cursor-ring');
  const label = root.querySelector('.cursor-label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    const zone = e.target.closest?.('[data-cursor], .card-front, .tile, .ages-photo');
    const text = zone ? (zone.dataset.cursor || 'look') : '';
    root.classList.toggle('has-label', !!text);
    if (text) label.textContent = text;
  });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => root.classList.remove('is-hidden'));
}

function magnetic({ gsap }) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 16);
      y(((e.clientY - r.top) / r.height - 0.5) * 16);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

// Sends to data-endpoint (e.g. a Formspree URL) when set; otherwise opens the
// visitor's email app with a pre-filled message to Grow@familycoachmd.com.
function form() {
  const f = document.getElementById('visit-form');
  if (!f) return;
  const status = f.querySelector('.form-status');
  const btnLabel = f.querySelector('.btn-submit span');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    let firstBad = null;
    f.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      status.textContent = 'Please fill in your name, a valid email and your child’s age.';
      status.classList.add('is-error');
      firstBad.focus();
      return;
    }
    status.classList.remove('is-error');
    const data = Object.fromEntries(new FormData(f));
    const endpoint = f.dataset.endpoint;
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
        if (!res.ok) throw new Error('send failed');
      } else {
        const body = [
          `Parent: ${data.name}`, `Email: ${data.email}`, `Child's age: ${data.age}`,
          `Pathway: ${PATHS[pathFor(data.age)].name}`,
          `Best week to visit: ${data.week || 'Any week'}`, '', data.message || '',
        ].join('\n');
        window.location.href = `mailto:Grow@familycoachmd.com?subject=${encodeURIComponent(`Visit request: ${PATHS[pathFor(data.age)].name} at Entrepreneurs at Play`)}&body=${encodeURIComponent(body)}`;
      }
      f.classList.add('is-sent');
      btnLabel.textContent = 'Request sent ✓';
      status.textContent = 'Thank you! We’ll be in touch within 2 days.';
    } catch {
      status.textContent = 'Something went wrong. Please email Grow@familycoachmd.com.';
      status.classList.add('is-error');
    }
  });
}

function copy() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied!';
      } catch {
        btn.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
  });
}
