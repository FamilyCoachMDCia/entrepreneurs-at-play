import { PATHS, pathFor } from './pathways.js';
import { SITE } from './site-config.js';

// Chrome around the content: ticker, nav, menu, cursor, magnetic buttons,
// anchor scrolling, the visit form and copy-to-clipboard.

// One switch for every self-running effect (WCAG 2.2.2). Effects read
// `paused` and/or listen for changes with onMotionChange().
export const motionState = { paused: false };
const motionListeners = new Set();
export const onMotionChange = (fn) => motionListeners.add(fn);
export function setMotionPaused(paused) {
  motionState.paused = paused;
  document.documentElement.classList.toggle('motion-paused', paused);
  const btn = document.querySelector('.ticker-pause');
  btn?.setAttribute('aria-pressed', String(paused));
  btn?.setAttribute('aria-label', paused ? 'Play all motion' : 'Pause all motion');
  motionListeners.forEach((fn) => fn(paused));
}

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
  btn?.addEventListener('click', () => setMotionPaused(!motionState.paused));
  // A reduced-motion preference turned on while the page is open pauses too.
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', (e) => { if (e.matches) setMotionPaused(true); });
  if (!items.length) return;
  gsap.set(items, { yPercent: (k) => (k === 0 ? 0 : 100) });
  if (reduce) return; // reduced motion: the first announcement stays put
  let i = 0;
  setInterval(() => {
    if (motionState.paused || document.hidden) return;
    const cur = items[i];
    i = (i + 1) % items.length;
    gsap.to(cur, { yPercent: -100, duration: 0.6, ease: 'power3.inOut' });
    gsap.fromTo(items[i], { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' });
  }, 4000);
}

function nav({ ScrollTrigger }) {
  const head = document.getElementById('site-head');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      head.classList.toggle('is-scrolled', y > 10);
      // Never hide the header while the menu is open or it holds keyboard focus.
      if (document.body.classList.contains('menu-open') || head.contains(document.activeElement)) {
        head.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      head.classList.toggle('is-hidden', y > lastY && y > 240);
      lastY = y;
    },
  });
  head.addEventListener('focusin', () => head.classList.remove('is-hidden'));
}

// Mobile menu as a modal: focus moves in and stays in (Tab / Shift+Tab wrap
// between the close button and the links), everything behind is inert, the
// page can't scroll, Escape closes, and focus returns to the burger.
function menu({ gsap, lenis, reduce }) {
  const burger = document.querySelector('.burger');
  const sheet = document.getElementById('menu');
  if (!burger || !sheet) return;
  const links = sheet.querySelectorAll('.menu-links li');
  const behind = () => [document.getElementById('main'), document.querySelector('.foot'), document.querySelector('.ticker'), document.querySelector('.nav-brand')].filter(Boolean);
  const focusables = () => [burger, ...sheet.querySelectorAll('a, button')];

  const set = (open, { restoreFocus = true } = {}) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    behind().forEach((el) => { el.inert = open; });
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      sheet.hidden = false;
      lenis?.stop();
      sheet.querySelector('a')?.focus({ preventScroll: true });
      if (!reduce) {
        gsap.fromTo(sheet, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.inOut' });
        gsap.fromTo(links, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.2, ease: 'power3.out' });
      }
    } else {
      lenis?.start();
      if (restoreFocus) burger.focus({ preventScroll: true });
      if (reduce) { sheet.hidden = true; return; }
      gsap.to(sheet, { clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'expo.inOut', onComplete: () => { sheet.hidden = true; } });
    }
  };
  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';
  burger.addEventListener('click', () => set(!isOpen()));
  // A link closes the menu without stealing focus back: the anchor handler
  // moves focus to the destination section.
  sheet.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) set(false, { restoreFocus: false }); });
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { set(false); return; }
    if (e.key !== 'Tab') return;
    const list = focusables();
    const i = list.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
    else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
  });
  // Leaving the phone layout with the menu open: close it cleanly.
  matchMedia('(min-width: 1024px)').addEventListener?.('change', (e) => { if (e.matches && isOpen()) set(false, { restoreFocus: false }); });
}

// In-page links scroll smoothly, then move keyboard focus to the section's
// heading so the next Tab continues from there. Each jump is a history entry,
// so Back returns to the previous section.
function anchors({ lenis }) {
  const go = (id, { push }) => {
    const target = id === '#top' ? document.getElementById('top') : document.querySelector(id);
    if (!target) return false;
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70, duration: 1.2 });
    else target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const focusEl = target.querySelector('h1, h2') || target;
    if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: true });
    if (push && location.hash !== id) history.pushState(null, '', id);
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    if (go(a.getAttribute('href'), { push: true })) e.preventDefault();
  });
  window.addEventListener('popstate', () => { if (location.hash) go(location.hash, { push: false }); else lenis ? lenis.scrollTo(0) : window.scrollTo(0, 0); });
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
  const CONTROLS = 'a, button, input, select, textarea, summary, label, [role="button"]';
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    // Over controls the decorative ring steps aside for the native cursor.
    const onControl = !!e.target.closest?.(CONTROLS);
    root.classList.toggle('on-control', onControl);
    const zone = onControl ? null : e.target.closest?.('[data-cursor], .card-front, .tile, .ages-photo');
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

// Visit form. With data-endpoint (e.g. a Formspree URL) it really sends and
// only then confirms. Without one it can only prepare an email in the
// visitor's own app, and says so plainly: nothing is sent until they press
// Send there. Typed data is never cleared on failure.
function form() {
  const f = document.getElementById('visit-form');
  if (!f) return;
  const status = f.querySelector('.form-status');
  const submit = f.querySelector('.btn-submit');
  const btnLabel = submit.querySelector('span');
  const endpoint = f.dataset.endpoint;
  const idleLabel = endpoint ? 'Request a visit' : 'Prepare my email';
  btnLabel.textContent = idleLabel;

  // Hide preferred weeks that have already started.
  const today = new Date().toISOString().slice(0, 10);
  f.querySelectorAll('#f-week option[data-start]').forEach((o) => { if (o.dataset.start < today) o.remove(); });

  const setStatus = (msg, kind = '') => {
    status.textContent = msg;
    status.classList.toggle('is-error', kind === 'error');
    status.classList.toggle('is-pending', kind === 'pending');
  };

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.dataset.busy) return; // no double sends
    let firstBad = null;
    f.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      setStatus('Please fill in your name, a valid email and your child’s age.', 'error');
      firstBad.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(f));
    const pathway = PATHS[pathFor(data.age)].name;

    if (!endpoint) {
      const body = [
        `Parent: ${data.name}`, `Email: ${data.email}`, `Child's age: ${data.age}`,
        `Pathway: ${pathway}`, `Preferred week: ${data.week || 'Any week'}`, '', data.message || '',
      ].join('\n');
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Visit request: ${pathway} at Entrepreneurs at Play`)}&body=${encodeURIComponent(body)}`;
      setStatus(`Your email app should open with this request ready. Nothing has been sent yet: press Send there. If it didn’t open, write to ${SITE.email}.`, 'pending');
      return;
    }

    f.dataset.busy = '1';
    submit.disabled = true;
    btnLabel.textContent = 'Sending…';
    setStatus('Sending your request…', 'pending');
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      f.classList.add('is-sent');
      btnLabel.textContent = 'Request received ✓';
      setStatus('Thank you! Your request was received. We’ll reply by email to confirm a visit time.');
    } catch {
      btnLabel.textContent = idleLabel;
      submit.disabled = false;
      setStatus(`We couldn’t send your request. Your answers are still here: please try again, or write to ${SITE.email}.`, 'error');
    } finally {
      delete f.dataset.busy;
    }
  });
}

// Copy the email. If the clipboard is blocked, select the address on the page
// so the visitor can copy it with their device's own controls.
function copy() {
  const isTouch = matchMedia('(pointer: coarse)').matches;
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const status = btn.parentElement.querySelector('.copy-status');
    const say = (msg) => { if (status) status.textContent = msg; };
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied!';
        say('');
        setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
      } catch {
        const link = btn.parentElement.querySelector('.visit-email');
        if (link) {
          const range = document.createRange();
          range.selectNodeContents(link);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        say(isTouch ? 'Couldn’t copy automatically. Press and hold the address to copy it.' : 'Couldn’t copy automatically. The address is selected: copy it with your keyboard or right-click.');
      }
    });
  });
}
