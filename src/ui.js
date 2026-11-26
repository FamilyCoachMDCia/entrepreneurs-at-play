import { currentPathway } from './pathways.js';
import { SITE } from './site-config.js';
import { takeProgramChoice } from './transitions.js';

// Chrome around the content: ticker, nav, menu, magnetic buttons,
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
    magnetic(ctx);
  }
  form();
  copy();
}

// Needs ScrollTrigger positions, so main.js calls it after the sections.
export function initPageChrome(ctx) {
  subnav(ctx);
  stickyCta(ctx);
}

// In-page jump used by other modules (a link to this same page by path).
let jump = null;
export const goToHash = (hash, opts = { push: true }) => jump?.(hash, opts);

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
    if (motionState.paused || document.hidden || btn?.closest('.is-scrolled')) return;
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
      head.classList.toggle('is-scrolled', y > 34);
      // Never hide the header while the menu is open or it holds keyboard focus.
      if (document.body.classList.contains('menu-open') || head.contains(document.activeElement)) {
        head.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      head.classList.toggle('is-hidden', y > lastY && y > 240);
      lastY = y;
      // The sticky section row follows the header (top: nav height or 0).
      document.documentElement.classList.toggle('head-hidden', head.classList.contains('is-hidden'));
    },
  });
  head.addEventListener('focusin', () => {
    head.classList.remove('is-hidden');
    document.documentElement.classList.remove('head-hidden');
  });
}

// Mobile menu as a modal: focus moves in and stays in (Tab / Shift+Tab wrap
// between the close button and the links), everything behind is inert, the
// page can't scroll, Escape closes, and focus returns to the burger.
function menu({ lenis }) {
  const burger = document.querySelector('.burger');
  const sheet = document.getElementById('menu');
  if (!burger || !sheet) return;
  const behind = () => [document.getElementById('main'), document.querySelector('.foot'), document.querySelector('.ticker'), document.querySelector('.nav-brand')].filter(Boolean);
  const focusables = () => [burger, ...sheet.querySelectorAll('a, button')];

  let closing = 0;
  const set = (open, { restoreFocus = true, animate = true } = {}) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    behind().forEach((el) => { el.inert = open; });
    document.documentElement.style.overflow = open ? 'hidden' : '';
    // Opening: the CSS keyframes roll the sheet down as soon as it shows.
    // Closing from the burger or Escape: roll it back up, then hide it.
    // A link closes it at once, because the page moves on anyway.
    clearTimeout(closing);
    sheet.classList.remove('is-closing');
    if (open || !animate || matchMedia('(prefers-reduced-motion: reduce)').matches) sheet.hidden = !open;
    else {
      sheet.classList.add('is-closing');
      closing = setTimeout(() => { sheet.hidden = true; sheet.classList.remove('is-closing'); }, 260);
    }
    if (open) {
      lenis?.stop();
      // Focus the sheet itself (tabindex="-1", no ring): the next Tab reaches
      // the first link, and no link shows a focus ring on a plain tap.
      sheet.focus({ preventScroll: true });
    } else {
      lenis?.start();
      if (restoreFocus) burger.focus({ preventScroll: true });
    }
  };
  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';
  burger.addEventListener('click', () => set(!isOpen()));
  // A link closes the menu without stealing focus back: the anchor handler
  // moves focus to the destination section, or the page transition takes over.
  sheet.addEventListener('click', (e) => { if (e.target.closest('a[href]:not([href^="mailto:"])')) set(false, { restoreFocus: false, animate: false }); });
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
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (!e.matches || !isOpen()) return;
    set(false, { restoreFocus: false, animate: false });
    document.querySelector('.nav-brand').focus({ preventScroll: true });
  });
}

// In-page links scroll smoothly, then move keyboard focus to the section's
// heading so the next Tab continues from there. Each jump is a history entry,
// so Back returns to the previous section.
function anchors({ lenis }) {
  const go = (id, { push }) => {
    let target = null;
    try { target = id === '#top' ? document.getElementById('top') || document.getElementById('main') : document.querySelector(id); } catch { /* not a selector */ }
    if (!target) return false;
    // A section's scroll-margin-top (CSS) clears the fixed header; default 70px.
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 70;
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -margin, duration: 1.2 });
    else target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const focusEl = target.querySelector('h1, h2') || target;
    if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: true });
    if (push && location.hash !== id) history.pushState(null, '', id);
    return true;
  };
  jump = go;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    if (go(a.getAttribute('href'), { push: true })) e.preventDefault();
  });
  window.addEventListener('popstate', () => { if (location.hash) go(location.hash, { push: false }); else lenis ? lenis.scrollTo(0) : window.scrollTo(0, 0); });
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

// Program requests are sent from the visitor’s email app. Each page's form
// opens on that page's own program; a program button clicked on another page
// wins (transitions.js carries it over).
const NO_CHILD = ['general', 'partner'];
// Programs with their own age range (the microschool takes 2–12).
const AGES = { golf: [8, 12], hatch: [2, 6] };
const samePage = (a) => new URL(a.href, location.href).pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');

function form() {
  const form = document.getElementById('visit-form');
  if (!form) return;
  const program = form.querySelector('#f-program');
  const age = form.querySelector('#f-age');
  const ageField = form.querySelector('.field-age');
  const ageNote = form.querySelector('#f-age-note');
  const status = form.querySelector('.form-status');
  const picks = [...form.querySelectorAll('input[name="program-pick"]')];
  const summary = form.querySelector('.form-summary');
  const more = form.querySelector('.pick-more');

  // The program chips mirror the hidden select (the source of truth): a chip
  // writes the select; every select change (chip, CTA) repaints the chips.
  const syncPicks = () => {
    picks.forEach((r) => { r.checked = r.value === program.value; });
    // A choice tucked under "Looking for another program?" opens that drawer.
    const chosen = picks.find((r) => r.checked);
    if (more && chosen && more.contains(chosen)) more.open = true;
    if (!summary) return;
    if (!program.value) { summary.textContent = 'Pick a program above.'; return; }
    const strong = document.createElement('strong');
    strong.textContent = program.selectedOptions[0].textContent;
    summary.replaceChildren('Your request: ', strong);
  };
  picks.forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    program.value = r.value;
    program.dispatchEvent(new Event('change'));
  }));

  const updateAge = () => {
    syncPicks();
    // Questions and partnerships are not about a child: no age field.
    const childless = NO_CHILD.includes(program.value);
    ageField.hidden = childless;
    age.required = !childless;
    const [min, max] = AGES[program.value] || [2, 12];
    const restricted = !childless && (program.value in AGES || program.value === 'microschool');
    [...age.options].slice(1).forEach((option) => {
      option.disabled = restricted && (option.value === 'other' || Number(option.value) < min || Number(option.value) > max);
    });
    if (age.selectedOptions[0]?.disabled) age.value = '';
    ageNote.hidden = !restricted;
    ageNote.textContent = restricted ? `This program is for ages ${min}–${max}.` : '';
    age.dispatchEvent(new Event('change'));
  };

  program.addEventListener('change', updateAge);
  document.querySelectorAll('[data-program-cta]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!samePage(link)) return; // another page: its own form picks it up
      program.value = link.dataset.programCta;
      updateAge();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const choice = program.selectedOptions[0].textContent;
    const childless = NO_CHILD.includes(program.value);
    const body = [
      `Request: ${choice}`,
      `${childless ? 'Name' : 'Parent or guardian'}: ${data.name}`,
      `Email: ${data.email}`,
      ...(childless ? [] : [`Child’s age: ${age.selectedOptions[0].textContent}`]),
      ...(data.program === 'microschool' ? [`Pathway: ${currentPathway()}`] : []),
      '',
      data.message,
    ].join('\n');
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Entrepreneurs at Play: ${choice}`)}&body=${encodeURIComponent(body)}`;
    status.textContent = `If your email app opened, press Send there. You can also write to ${SITE.email}.`;
  });

  const valid = (v) => !!v && [...program.options].some((o) => o.value === v);
  const carried = takeProgramChoice();
  const fallback = form.dataset.defaultProgram;
  program.value = valid(carried) ? carried : valid(fallback) ? fallback : '';
  updateAge();
  form.hidden = false;
}

// Phones and tablets: the page's own call to action floats at the bottom once
// the page top has scrolled away, and steps aside for the form, the menu and
// the keyboard.
function stickyCta({ ScrollTrigger }) {
  const bar = document.querySelector('.sticky-cta');
  const visit = document.getElementById('visit');
  const top = document.querySelector('main > section');
  if (!bar || !visit || !top) return;
  const link = bar.querySelector('a');
  let past = false;
  let atForm = false;
  let typing = false;
  const render = () => {
    const on = past && !atForm && !typing;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    link.tabIndex = on ? 0 : -1;
  };
  ScrollTrigger.create({ trigger: top, start: 'bottom 40%', end: 'max', onToggle: (self) => { past = self.isActive; render(); } });
  ScrollTrigger.create({ trigger: visit, start: 'top 92%', end: 'max', onToggle: (self) => { atForm = self.isActive; render(); } });
  document.addEventListener('focusin', (e) => { typing = !!e.target.closest?.('input, select, textarea'); render(); });
  document.addEventListener('focusout', () => { typing = false; render(); });
}

// Desktop: the "On this page" row sticks under the header and marks the
// section in view. Phones: a sideways row (CSS), same links.
function subnav({ ScrollTrigger }) {
  const nav = document.querySelector('.subnav');
  if (!nav) return;
  document.documentElement.classList.add('has-subnav');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const list = nav.querySelector('.subnav-list');
  const mark = (link) => {
    links.forEach((l) => (l === link ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
    // Keep the marked chip in view inside the row (phones and narrow screens).
    if (link && list.scrollWidth > list.clientWidth + 2) {
      list.scrollTo({ left: link.parentElement.offsetLeft - 16, behavior: 'smooth' });
    }
  };
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 45%', end: 'bottom 45%',
      onToggle: (self) => { if (self.isActive) mark(link); },
    });
  });
  // The pinned sun-dial uses the whole screen: the row tucks away meanwhile.
  const day = document.querySelector('.day');
  if (day) {
    ScrollTrigger.create({
      trigger: day, start: 'top 30%', end: 'bottom 70%',
      onToggle: (self) => nav.classList.toggle('is-tucked', self.isActive && day.classList.contains('is-pinned')),
    });
  }
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
