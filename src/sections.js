import { motionState } from './ui.js';
import { initPathways } from './pathways.js';

// Section-by-section interactions. Each init is independent; under reduced
// motion they keep their interactivity but skip decorative movement.
export function initSections(ctx) {
  alignGrids(ctx);
  reveals(ctx);
  heroRotator(ctx);
  programs(ctx);
  initPathways(ctx);
  learner(ctx);
  carousel(ctx);
  sundial(ctx);
  familyBook(ctx);
  compare(ctx);
  weekPlanner(ctx);
  practical(ctx);
  packets(ctx);
  counters(ctx);
  founder(ctx);
  faq(ctx);
  visit(ctx);
}

/* ---------- Notebook grid ---------- */
// Colored sections paint their own grid; offset it so its lines continue the
// page grid (which starts at the top of the document).
function alignGrids({ ScrollTrigger }) {
  const els = document.querySelectorAll('.has-grid, .has-grid-dark');
  const align = () => {
    const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-size')) || 24;
    els.forEach((el) => {
      // Layout position (ignores reveal transforms, e.g. the visit panel's rise).
      let top = 0;
      for (let n = el; n; n = n.offsetParent) top += n.offsetTop;
      el.style.backgroundPosition = `0 ${-(top % size)}px`;
    });
  };
  align();
  ScrollTrigger.addEventListener('refresh', align);
}

/* ---------- Generic reveals ---------- */
function reveals({ gsap, SplitText, reduce }) {
  if (reduce) return;
  gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
    gsap.fromTo(el, { y: 32, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Headlines rise line by line from behind a mask.
  gsap.utils.toArray('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 0.9, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }),
    });
  });

  // Manifesto: words deepen from a readable soft ink to full ink as you
  // scroll (never faint), and the highlighted phrase gets a marigold underline.
  const scrub = document.querySelector('[data-scrub-words]');
  if (scrub) {
    const split = SplitText.create(scrub, { type: 'words' });
    const plain = split.words.filter((w) => !w.closest('em'));
    gsap.fromTo(plain, { color: '#5F625A' }, {
      color: '#23261F', stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: scrub, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
    const em = scrub.querySelector('em');
    if (em) {
      em.classList.add('mark');
      gsap.fromTo(em, { '--mark': '0%' }, {
        '--mark': '100%', ease: 'none',
        scrollTrigger: { trigger: scrub, start: 'top 75%', end: 'center 50%', scrub: true },
      });
    }
  }

  // Promise icons and FAQ rows.
  gsap.from('.promise-list li', {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.promise-list', start: 'top 80%', once: true },
  });
}

/* ---------- Hero rotating line ---------- */
function heroRotator({ gsap, reduce }) {
  const words = gsap.utils.toArray('.rot-word');
  if (words.length < 2 || reduce) return;
  let i = 0;
  setInterval(() => {
    if (motionState.paused || document.hidden) return;
    const cur = words[i];
    i = (i + 1) % words.length;
    gsap.to(cur, { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power3.in' });
    gsap.fromTo(words[i], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' });
  }, 2200);
}

/* ---------- Programs: 01 Enrichment → 02 Summer → 03 Microschool ---------- */
// Elements with a CSS hover transform (day cards) get explicit end values +
// clearProps, so an inline GSAP transform never fights the hover lift.
const CLEAR = 'transform,translate,rotate,scale,opacity';

function programs(ctx) {
  dayStrip(ctx);
  t6Card(ctx);
  summerCard(ctx);
  microschoolCard(ctx);
}

// Each day pill brings its card into view and makes it say "here".
function dayStrip({ reduce }) {
  document.querySelectorAll('[data-day-pill]').forEach((pill) => pill.addEventListener('click', () => {
    const card = document.querySelector(pill.getAttribute('href'));
    if (!card) return;
    // Phones: the day cards sit in a sideways scroller; slide this one in.
    const row = card.closest('.program-week');
    if (row && row.scrollWidth > row.clientWidth + 2) {
      const left = row.scrollLeft + card.getBoundingClientRect().left - row.getBoundingClientRect().left - parseFloat(getComputedStyle(row).paddingLeft);
      row.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
    }
    card.classList.remove('is-flash');
    void card.offsetWidth; // restart the highlight
    card.classList.add('is-flash');
    clearTimeout(card._flash);
    card._flash = setTimeout(() => card.classList.remove('is-flash'), 1700);
  }));

  // Phones and tablets: three dots under the sideways row show which card is in view.
  const row = document.querySelector('.program-week');
  const dots = [...document.querySelectorAll('.day-dots i')];
  if (!row || !dots.length) return;
  const cards = [...row.querySelectorAll('.day-card')];
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = row.scrollWidth - row.clientWidth;
    let on = 0;
    if (max > 2 && row.scrollLeft >= max - 2) on = cards.length - 1;
    else if (max > 2) {
      const x = row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft);
      let best = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.getBoundingClientRect().left - x); if (d < best) { best = d; on = i; } });
    }
    dots.forEach((d, i) => d.classList.toggle('is-on', i === on));
  };
  row.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

// A photo reveal shared by T6 and summer: a clip-path wipe, the photo settling
// from a gentle zoom, then a slow parallax drift while it crosses the screen.
function photoReveal(gsap, frame, img, tl, from) {
  tl.fromTo(frame, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
    .fromTo(img, { scale: 1.28 }, { scale: 1.12, duration: 1.5, ease: 'power3.out' }, 0);
  gsap.fromTo(img, { yPercent: -4 }, {
    yPercent: 4, ease: 'none',
    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

function t6Card({ gsap, reduce }) {
  const card = document.getElementById('t6');
  if (!card) return;
  const week = gsap.utils.toArray('.day-card');
  if (reduce) return;

  const photo = card.querySelector('.t6-photo');
  const ball = card.querySelector('.putt-ball');
  const track = card.querySelector('.putt-path');
  const flag = card.querySelector('.putt-flag');
  const roll = { path: track, align: track, alignOrigin: [0.5, 0.5] };
  gsap.set(ball, { motionPath: { ...roll, end: 0 } }); // waits at the tee

  const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 75%', once: true } });
  photoReveal(gsap, photo, photo.querySelector('img'), tl, 'inset(0% 100% 0% 0%)');
  tl.fromTo(card.querySelector('.t6-badge'), { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2)', clearProps: 'transform' }, 0.45)
    .fromTo(card.querySelectorAll('.t6-chips li'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', clearProps: CLEAR }, 0.4)
    .fromTo(card.querySelectorAll('.t6-ing svg'), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.7, stagger: 0.14, ease: 'back.out(2.4)', clearProps: 'transform' }, 0.7)
    // The putt: flag pops up, the dotted line draws, the ball rolls in and drops.
    .from(card.querySelectorAll('.putt-pole, .putt-flag, .putt-hole'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, ease: 'back.out(2)' }, 0.8)
    .fromTo(card.querySelector('.putt-reveal'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power1.inOut' }, 1)
    .to(ball, { motionPath: { ...roll, start: 0, end: 1 }, duration: 1.4, ease: 'power2.out' }, 1.05)
    .to(ball, { scale: 0.78, svgOrigin: '250 92', duration: 0.18, ease: 'power2.in' }, '>-0.08')
    .to(flag, { keyframes: { rotation: [0, -16, 11, -6, 0] }, svgOrigin: '250 19', duration: 1, ease: 'sine.inOut' }, '>-0.05');

  // Day cards drop in like the seed packets, settling from a slight tilt.
  gsap.fromTo(week, { y: -34, rotation: () => gsap.utils.random(-6, 6), opacity: 0 }, {
    y: 0, rotation: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)', clearProps: CLEAR,
    scrollTrigger: { trigger: '.program-week', start: 'top 85%', once: true },
  });
}

function summerCard({ gsap, reduce }) {
  const card = document.querySelector('.summer-card');
  if (!card || reduce) return;
  const frame = card.querySelector('.summer-frame');
  const plane = card.querySelector('.plane');
  const flight = card.querySelector('.plane-path');
  const arc = card.querySelector('.time-arc-path');
  const sunDot = card.querySelector('.time-arc-sun');
  const fly = { path: flight, align: flight, alignOrigin: [0.5, 0.5], autoRotate: 40 };
  const sweep = { path: arc, align: arc, alignOrigin: [0.5, 0.5] };
  gsap.set(plane, { motionPath: { ...fly, end: 0 }, opacity: 0 });
  gsap.set(sunDot, { motionPath: { ...sweep, end: 0 } });

  const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 75%', once: true } });
  photoReveal(gsap, frame, frame.querySelector('img'), tl, 'inset(100% 0% 0% 0%)');
  // The sun rises from behind the photo's corner (it then turns slowly in CSS).
  tl.fromTo(card.querySelector('.summer-sun'), { xPercent: -45, yPercent: 60, scale: 0.5 }, { xPercent: 0, yPercent: 0, scale: 1, duration: 1.6, ease: 'power3.out', clearProps: 'transform' }, 0.5)
    .fromTo(card.querySelector('.time-chip'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', clearProps: CLEAR }, 0.35)
    .to(sunDot, { motionPath: { ...sweep, start: 0, end: 1 }, duration: 1.6, ease: 'sine.inOut' }, 0.7)
    .fromTo(card.querySelector('.hand-note'), { scale: 0.6, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)', clearProps: CLEAR }, 1.1)
    // One paper-plane flight along a dotted line.
    .fromTo(card.querySelector('.plane-reveal'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.5, ease: 'power1.inOut' }, 0.6)
    .to(plane, { opacity: 1, duration: 0.2 }, 0.6)
    .to(plane, { motionPath: { ...fly, start: 0, end: 1 }, duration: 1.5, ease: 'power1.inOut' }, 0.6);
}

function microschoolCard({ gsap, reduce }) {
  const card = document.querySelector('.microschool-card');
  if (!card || reduce) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 75%', once: true } });
  // Thunk: the status stamp lands, the timeline draws, the two leaves unfurl.
  tl.fromTo(card.querySelector('.stamp'), { scale: 2.4, rotation: -16, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.7)', clearProps: CLEAR }, 0.2)
    .fromTo(card, { y: 0 }, { y: 3, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut', clearProps: 'transform' }, 0.62)
    .fromTo(card.querySelectorAll('.mt-dot'), { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.55, ease: 'back.out(2.5)', clearProps: 'transform' }, 0.5)
    .fromTo(card.querySelector('.mt-line'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 0.6, ease: 'power2.inOut', clearProps: 'transform' }, 0.62)
    .fromTo(card.querySelectorAll('.mt-step b, .mt-step span'), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out', clearProps: CLEAR }, 0.55)
    .fromTo(card.querySelectorAll('.micro-paths li'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power3.out', clearProps: CLEAR }, 0.7)
    .fromTo(card.querySelectorAll('.micro-paths svg'), { scale: 0.2, rotation: -30 }, { scale: 1, rotation: 0, duration: 1, stagger: 0.15, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' }, 0.8);
}

/* ---------- 07b · A week in the microschool ---------- */
function weekPlanner({ gsap, reduce }) {
  const list = document.querySelector('.week-rhythm');
  if (!list) return;
  // The ring hugs only "Wednesday" + "Podcasting", clear of the icon and the
  // after-school dot. Phones: one row (CSS sets top/bottom); wider: a column.
  const ringSvg = list.querySelector('.wed-ring');
  const phone = matchMedia('(max-width: 767px)');
  const fitRing = () => {
    const li = ringSvg?.closest('li');
    const day = li?.querySelector('strong');
    const link = li?.querySelector('a');
    if (!day || !link) return;
    const base = li.getBoundingClientRect();
    const a = day.getBoundingClientRect();
    const b = link.getBoundingClientRect();
    const box = {
      left: Math.min(a.left, b.left) - base.left, right: Math.max(a.right, b.right) - base.left,
      top: Math.min(a.top, b.top) - base.top, bottom: Math.max(a.bottom, b.bottom) - base.top,
    };
    // The drawn ellipse sits a little inside its box, so pad more on the right.
    const narrow = innerWidth <= 380;
    const padL = phone.matches ? (narrow ? 12 : 18) : 34;
    const padR = phone.matches ? (narrow ? 24 : 30) : 26;
    ringSvg.style.left = `${box.left - padL}px`;
    ringSvg.style.width = `${box.right - box.left + padL + padR}px`;
    if (phone.matches) { ringSvg.style.top = ''; ringSvg.style.height = ''; return; }
    ringSvg.style.top = `${box.top - 24}px`;
    ringSvg.style.height = `${box.bottom - box.top + 40}px`;
  };
  fitRing();
  document.fonts?.ready.then(fitRing);
  addEventListener('resize', fitRing);
  if (reduce) return;
  const ring = list.querySelector('.wed-ring path');
  gsap.set(ring, { drawSVG: '0%' });
  gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 85%', once: true } })
    .fromTo(list.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', clearProps: CLEAR })
    .fromTo(list.querySelectorAll('.week-icon'), { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2.2)', clearProps: 'transform' }, 0.15)
    .fromTo(list.querySelectorAll('.after-dot'), { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(3)', clearProps: 'transform' }, 0.6)
    .to(ring, { drawSVG: '100%', duration: 1, ease: 'power2.inOut' }, 0.8);
}

/* ---------- 13b · The practical part ---------- */
function practical({ gsap, reduce }) {
  const card = document.querySelector('.index-card');
  if (!card || reduce) return;
  gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
    .fromTo(card, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: CLEAR })
    .fromTo(card.querySelectorAll('.facts > div'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out', clearProps: CLEAR }, 0.2)
    .fromTo(card.querySelectorAll('.fact-icon'), { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(2.4)', clearProps: 'transform' }, 0.3)
    .fromTo(card.querySelector('.facts-cta'), { y: 16, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', clearProps: CLEAR }, 0.7);
}

/* ---------- 04 · What kind of learner ---------- */
const LEARNERS = {
  builder: { title: 'The builder', photo: 'business-fair', alt: 'A young entrepreneur at his table at a business fair', text: 'Real products, real customers. Engage and Engineer, CrunchLabs builds and hackathons, and a weekly stock market game.' },
  talker: { title: 'The talker', photo: 'speaking', alt: 'A young boy speaking with confidence', text: 'Their own podcast, one-on-one speech coaching from experts, and a mini United Nations.' },
  explorer: { title: 'The explorer', photo: 'horse', alt: 'A young child beside a white horse', text: 'Afternoons out in Omaha: farms, college campuses, flight decks and nature, rain or shine.' },
  artist: { title: 'The artist', photo: 'guitar', alt: 'A smiling child holding a guitar', text: 'Music, choir, theater and art with local studios, plus world cuisines in the kitchen.' },
  thinker: { title: 'The deep thinker', photo: 'typewriter', alt: 'A child learning on an antique typewriter', text: 'Socratic reading groups, advanced academics at their own pace, and MAP Growth testing to prove it.' },
  littlest: { title: 'The littlest one', photo: 'mentoring', alt: 'An older child helping a younger child', text: 'The Hatch, from age 2: free play, sign language, gentle routines, and big kids from The Studio who mentor them every day.' },
};

function learner({ gsap, reduce, ScrollTrigger }) {
  const chips = gsap.utils.toArray('.chip');
  const panel = document.getElementById('learner-panel');
  if (!panel) return;
  const card = panel.querySelector('.learner-card');
  const img = panel.querySelector('.learner-img');
  const kicker = panel.querySelector('.learner-kicker');
  const text = panel.querySelector('.learner-text');
  let current = null;

  if (!reduce) {
    // Chips also lift on hover via a CSS transform transition, which fights an
    // inline GSAP transform; explicit end values + clearProps hand control back.
    gsap.fromTo(chips, { y: 24, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out',
      clearProps: 'transform,translate,rotate,scale,opacity',
      scrollTrigger: { trigger: '.chips', start: 'top 85%', once: true },
    });
  }

  // One source of truth: `current`. Every click cancels pending tweens and
  // their callbacks, so fast open/close/open sequences can't leave the panel
  // hidden while a chip says it's expanded.
  const fill = (key) => {
    const d = LEARNERS[key];
    const chip = chips.find((c) => c.dataset.learner === key);
    img.src = `/img/${d.photo}-sm.webp`;
    img.alt = d.alt;
    kicker.textContent = d.title;
    text.textContent = d.text;
    card.style.setProperty('--tint', getComputedStyle(chip).getPropertyValue('--tint'));
  };
  const settle = () => {
    gsap.killTweensOf([panel, card]);
    gsap.set(card, { clearProps: 'opacity,transform' });
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const key = chip.dataset.learner;
    const next = current === key ? null : key;
    const wasOpen = current !== null;
    current = next;
    chips.forEach((c) => c.setAttribute('aria-expanded', String(c.dataset.learner === next)));
    settle();

    if (!next) {
      if (reduce) { panel.hidden = true; panel.style.height = ''; return; }
      gsap.to(panel, {
        height: 0, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => {
          if (current !== null) return; // reopened meanwhile
          panel.hidden = true;
          gsap.set(panel, { clearProps: 'height' });
          ScrollTrigger.refresh();
        },
      });
      return;
    }

    fill(next);
    panel.hidden = false;
    if (reduce) { panel.style.height = ''; return; }
    if (wasOpen) {
      gsap.set(panel, { height: 'auto' });
      gsap.fromTo(card, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    } else {
      gsap.fromTo(panel, { height: 0 }, {
        height: 'auto', duration: 0.55, ease: 'power3.out',
        onComplete: () => { if (current) gsap.set(panel, { clearProps: 'height' }); ScrollTrigger.refresh(); },
      });
      gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: 'power3.out' });
    }
  }));
}

/* ---------- 05 · Eight things carousel ---------- */
function carousel({ gsap, reduce }) {
  const scroller = document.querySelector('.carousel');
  if (!scroller) return;
  const bar = document.querySelector('.carousel-progress span');
  const cards = gsap.utils.toArray('.card');
  const stepSize = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(scroller.firstElementChild).columnGap || 24);

  const now = document.querySelector('.cc-now');
  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const p = max > 0 ? scroller.scrollLeft / max : 0;
    bar.style.transform = `scaleX(${0.12 + p * 0.88})`;
    // "n of 8": the first card whose left edge is at or past the scroll start.
    const left = scroller.getBoundingClientRect().left + parseFloat(getComputedStyle(scroller).paddingLeft);
    let idx = cards.findIndex((c) => c.getBoundingClientRect().left >= left - 8);
    if (idx < 0 || p > 0.98) idx = cards.length - 1;
    if (now) now.textContent = String(idx + 1);
  };
  scroller.addEventListener('scroll', update, { passive: true });
  update();

  document.querySelectorAll('[data-carousel]').forEach((btn) => btn.addEventListener('click', () => {
    const dir = btn.dataset.carousel === 'next' ? 1 : -1;
    scroller.scrollBy({ left: dir * stepSize(), behavior: reduce ? 'auto' : 'smooth' });
  }));
  scroller.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scroller.scrollBy({ left: stepSize(), behavior: 'smooth' });
    if (e.key === 'ArrowLeft') scroller.scrollBy({ left: -stepSize(), behavior: 'smooth' });
  });

  // Mouse drag to scroll (touch already scrolls natively). Snap is off while
  // dragging; on release the row glides (with a little momentum) to the
  // nearest card, then snap comes back on, so nothing jumps.
  const snapTargets = () => {
    const edge = scroller.getBoundingClientRect().left + parseFloat(getComputedStyle(scroller).paddingLeft);
    const max = scroller.scrollWidth - scroller.clientWidth;
    return cards.map((c) => Math.min(max, Math.max(0, scroller.scrollLeft + c.getBoundingClientRect().left - edge)));
  };
  let down = null;
  let justDragged = false;
  scroller.addEventListener('dragstart', (e) => e.preventDefault()); // no ghost images
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, a')) return;
    gsap.killTweensOf(scroller);
    down = { id: e.pointerId, x: e.clientX, left: scroller.scrollLeft, moved: false, vx: 0, lastX: e.clientX, lastT: performance.now() };
  });
  scroller.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x;
    if (!down.moved) {
      if (Math.abs(dx) < 6) return;
      down.moved = true;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add('is-dragging');
      window.getSelection()?.removeAllRanges();
    }
    const t = performance.now();
    const dt = Math.max(1, t - down.lastT);
    down.vx = 0.8 * ((e.clientX - down.lastX) / dt) + 0.2 * down.vx; // px per ms, smoothed
    down.lastX = e.clientX;
    down.lastT = t;
    scroller.scrollLeft = down.left - dx;
  });
  const release = (e) => {
    if (!down || e.pointerId !== down.id) return;
    const { moved, vx, lastT } = down;
    down = null;
    if (!moved) return;
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
    // A flick carries on a bit; a slow release stays where it is.
    const fresh = performance.now() - lastT < 80;
    const projected = scroller.scrollLeft - (fresh ? vx * 260 : 0);
    const targets = snapTargets();
    const goal = targets.reduce((best, x) => (Math.abs(x - projected) < Math.abs(best - projected) ? x : best), targets[0]);
    gsap.to(scroller, {
      scrollLeft: goal, duration: reduce ? 0 : 0.55, ease: 'power3.out',
      onComplete: () => scroller.classList.remove('is-dragging'),
    });
  };
  scroller.addEventListener('pointerup', release);
  scroller.addEventListener('pointercancel', release);
  // A drag that ends over a link or button must not also click it.
  scroller.addEventListener('click', (e) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Camera button flips a photo to its story (Patagonia-style captions). The
  // story is a disclosure: hidden from assistive tech and focus until shown.
  cards.forEach((card) => {
    const cam = card.querySelector('.cam');
    const use = cam.querySelector('use');
    const back = card.querySelector('.card-back');
    cam.addEventListener('click', () => {
      const on = card.classList.toggle('is-story');
      cam.setAttribute('aria-expanded', String(on));
      cam.setAttribute('aria-label', on ? 'Show the photo' : 'Show the story behind this photo');
      use.setAttribute('href', on ? '#d-close' : '#d-camera');
      back.setAttribute('aria-hidden', String(!on));
      back.inert = !on;
    });

    if (reduce) return;
    // Gentle tilt toward the cursor on desktop.
    const inner = card.querySelector('.card-inner');
    inner.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = inner.getBoundingClientRect();
      gsap.to(inner, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 6, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 6, duration: 0.5, ease: 'power3.out', transformPerspective: 900 });
    });
    inner.addEventListener('pointerleave', () => gsap.to(inner, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' }));

    // Doodle stickers pop onto a few cards.
    const kind = card.dataset.sticker;
    if (kind) {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.classList.add('sticker');
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = `<use href="#d-${kind}"/>`;
      Object.assign(s.style, { right: '-10px', top: '-14px', color: kind === 'star' ? '#3B5E1A' : '#F2B33D' });
      inner.append(s);
      gsap.from(s, { scale: 0, rotation: -40, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: scroller, start: 'top 75%', once: true } });
    }
  });

  if (!reduce) {
    gsap.from(cards, {
      x: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: scroller, start: 'top 85%', once: true },
    });
  }
}

/* ---------- 06 · A day at EP: the sun-dial ---------- */
// Pinned only where the whole step fits on screen (wide and tall enough);
// phones, short laptops and landscape phones get the plain chronological list.
// gsap.matchMedia reverts the pin and the DOM changes when the size changes.
const PIN_QUERY = '(min-width: 768px) and (min-height: 720px)';

function sundial({ gsap, reduce }) {
  const section = document.querySelector('.day');
  if (!section) return;
  const steps = gsap.utils.toArray('.day-steps li');
  if (reduce || steps.length < 2) return; // plain timeline stays

  gsap.matchMedia().add(PIN_QUERY, () => {
    section.classList.add('is-pinned');
    const timesBox = section.querySelector('.day-times');
    const photosBox = section.querySelector('.day-photos');
    // The list keeps its <time>s (visually hidden in this mode) so assistive
    // tech still reads every time once; the big clock is decoration only.
    const times = steps.map((li) => {
      const span = document.createElement('span');
      span.textContent = li.querySelector('time').textContent;
      timesBox.append(span);
      return span;
    });
    // Photos move (not clone) into the stage, so there is one copy of each.
    const photos = steps.map((li) => {
      const img = li.querySelector('img');
      img.loading = 'eager';
      photosBox.append(img);
      return img;
    });
    photosBox.setAttribute('aria-hidden', 'true');

    const n = steps.length;
    gsap.set([...steps.slice(1), ...photos.slice(1)], { opacity: 0 });
    gsap.set(times.slice(1), { yPercent: 100 });
    buildTimeline(n, steps, times, photos);

    return () => {
      // Back to the plain list: return photos to their steps, drop the clock.
      photos.forEach((img, i) => steps[i].append(img));
      timesBox.replaceChildren();
      photosBox.removeAttribute('aria-hidden');
      gsap.set([...steps, ...photos], { clearProps: 'opacity,transform' });
      section.classList.remove('is-pinned');
      gsap.set(section, { clearProps: 'backgroundColor' });
    };
  });

  function buildTimeline(n, steps, times, photos) {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section, pin: '.day-pin', start: 'top top',
        end: () => `+=${window.innerHeight * 2.5}`,
        scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: 'power2.inOut' },
      },
    });

    tl.to('.sun', { motionPath: { path: '.sun-arc', align: '.sun-arc', alignOrigin: [0.5, 0.5] }, duration: n - 1 }, 0)
      .to('.sun-rays', { rotation: 180, svgOrigin: '0 0', duration: n - 1 }, 0)
      .to(section, {
        keyframes: { backgroundColor: ['#F6F2EA', '#FBF3DC', '#FBF3DC', '#CFE0DF', '#F3E2C4'] },
        duration: n - 1,
      }, 0);

    for (let k = 1; k < n; k++) {
      const at = k - 0.5;
      tl.to(steps[k - 1], { y: -24, opacity: 0, duration: 0.3 }, at)
        .fromTo(steps[k], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, at + 0.2)
        .to(times[k - 1], { yPercent: -100, duration: 0.4 }, at)
        .fromTo(times[k], { yPercent: 100 }, { yPercent: 0, duration: 0.4 }, at + 0.1)
        .to(photos[k - 1], { opacity: 0, scale: 0.96, duration: 0.35 }, at)
        .fromTo(photos[k], { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.35 }, at + 0.1);
    }
  }
}

/* ---------- 11 · FamilyCoachMD book ---------- */
// The book rises and tips upright as the section scrolls in, then opens; on
// desktop it leans toward the pointer (the stage moves, the book tilts).
function familyBook({ gsap, reduce }) {
  const link = document.querySelector('.family-book-link');
  if (!link) return;
  const stage = link.querySelector('.family-book-stage');
  const book = link.querySelector('.family-book');
  // With a mouse the book stays closed and opens only on hover (CSS :hover /
  // :focus-visible). Touch screens have no hover, so there it opens once the
  // card is in view.
  const touch = !matchMedia('(hover: hover)').matches;
  const open = () => { if (touch) link.classList.add('is-open'); };
  if (reduce) { open(); return; }

  // Upright by the time the card's top reaches 70% of the screen, so the
  // book never sits half-tilted over its label while someone is reading.
  // Phones: tilt only, no drop, so the book never slides over its label.
  const drop = matchMedia('(max-width: 767px)').matches ? 0 : 44;
  gsap.fromTo(stage, { y: drop, rotationX: 26, transformOrigin: '50% 100%' }, {
    y: 0, rotationX: 0, ease: 'none',
    scrollTrigger: {
      trigger: link, start: 'top bottom', end: 'top 70%', scrub: 0.6,
      onUpdate: (self) => { if (self.progress > 0.8) open(); },
      onLeave: open,
    },
  });

  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  gsap.set(book, { transformPerspective: 1000 });
  const rx = gsap.quickTo(book, 'rotationX', { duration: 0.6, ease: 'power3' });
  const ry = gsap.quickTo(book, 'rotationY', { duration: 0.6, ease: 'power3' });
  link.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = link.getBoundingClientRect();
    ry(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
  });
  link.addEventListener('pointerleave', () => { rx(0); ry(0); });
}

/* ---------- 07 · Morning / afternoon compare ---------- */
function compare({ gsap, reduce }) {
  const box = document.querySelector('.compare');
  if (!box) return;
  const range = box.querySelector('.compare-range');
  const capA = box.querySelector('.cap-a');
  const capB = box.querySelector('.cap-b');
  const state = { pos: 50 };
  const apply = () => {
    box.style.setProperty('--pos', `${state.pos}%`);
    capB.style.opacity = Math.min(1, state.pos / 50).toFixed(2);
    capA.style.opacity = Math.min(1, (100 - state.pos) / 50).toFixed(2);
  };
  range.addEventListener('input', () => { gsap.killTweensOf(state); state.pos = +range.value; apply(); });
  apply();
  if (reduce) return;
  // A small "try me" wiggle the first time it comes into view.
  gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 70%', once: true } })
    .to(state, { pos: 68, duration: 0.7, ease: 'power2.inOut', onUpdate: apply })
    .to(state, { pos: 34, duration: 0.9, ease: 'power2.inOut', onUpdate: apply })
    .to(state, { pos: 50, duration: 0.6, ease: 'power2.inOut', onUpdate: apply, onComplete: () => { range.value = 50; } });

  gsap.from('.tile', {
    y: 40, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.tiles', start: 'top 88%', once: true },
  });
}

/* ---------- 09 · Seed packets ---------- */
function packets({ gsap, reduce }) {
  // One state per packet, driven only by its button (hover just lifts it).
  gsap.utils.toArray('.packet').forEach((p) => {
    const btn = p.querySelector('.packet-toggle');
    const back = p.querySelector('.packet-back');
    const label = btn.querySelector('.sr-only');
    const name = label.textContent.replace(/: show details$/, '');
    btn.addEventListener('click', () => {
      const open = !p.classList.contains('is-open');
      p.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      back.setAttribute('aria-hidden', String(!open));
      back.inert = !open;
      label.textContent = `${name}: ${open ? 'hide' : 'show'} details`;
    });
  });
  if (reduce) return;
  // Packets lift on hover with a CSS transform transition: explicit end
  // values + clearProps keep the entrance from fighting it (see chips).
  gsap.fromTo('.packets li', { y: -30, rotation: () => gsap.utils.random(-6, 6), opacity: 0 }, {
    y: 0, rotation: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'back.out(1.6)',
    clearProps: 'transform,translate,rotate,scale,opacity',
    scrollTrigger: { trigger: '.packets', start: 'top 85%', once: true },
  });
  // Ages leaves unfurl too, echoing the loader.
  gsap.timeline({ scrollTrigger: { trigger: '.ages-card', start: 'top 75%', once: true } })
    .from('.ages-stem', { drawSVG: '0%', duration: 0.8, ease: 'power2.inOut' })
    .from('.ages-leaf-big', { scale: 0.2, rotation: -30, svgOrigin: '140 80', opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0.5)
    .from('.ages-leaf-small', { scale: 0.2, rotation: 30, svgOrigin: '118 116', opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0.65)
    .from('.ages-photo', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.2);
}

/* ---------- 10 · Count-up numbers ---------- */
function counters({ gsap, reduce }) {
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduce) return;
    // The final value stays in the DOM until the number scrolls into view;
    // the count only starts then (screen readers use the sr-only text).
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      onStart: () => { el.textContent = (0).toFixed(dec); },
      onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
      scrollTrigger: { trigger: el, start: 'top bottom', once: true },
    });
  });
}

/* ---------- 12 · Founder ---------- */
function founder({ gsap, SplitText, reduce }) {
  if (reduce) return;
  gsap.timeline({ scrollTrigger: { trigger: '.founder', start: 'top 70%', once: true } })
    .from('.founder-outline', { drawSVG: '0%', duration: 1.6, ease: 'power2.inOut' })
    .from('.founder-svg image', { scale: 1.08, opacity: 0, transformOrigin: '50% 50%', duration: 1.2, ease: 'power3.out' }, 0.1)
    .from('.cred li', { y: 16, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.3);
  const quote = document.querySelector('[data-lines]');
  if (quote) {
    SplitText.create(quote, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 0.9, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: quote, start: 'top 85%', once: true },
      }),
    });
  }
}

/* ---------- 14 · FAQ ---------- */
function faq({ gsap, reduce, ScrollTrigger }) {
  // Animated accordion on top of native <details>.
  document.querySelectorAll('.faq-list details').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.faq-a');
    summary.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.45, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  // Parent asks, Dr. Che "types" the answer.
  const chat = document.querySelector('.chat');
  if (!chat) return;
  const [q, typing, a] = chat.querySelectorAll('.bubble');
  const full = a.dataset.type;
  if (reduce) { gsap.set([q, a], { opacity: 1 }); a.textContent = full; return; }
  gsap.set(typing, { display: 'none' });
  const typed = { n: 0 };
  gsap.timeline({ scrollTrigger: { trigger: chat, start: 'top 80%', once: true } })
    .fromTo(q, { opacity: 0, y: 10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' })
    .set(typing, { display: 'inline-flex', opacity: 1 }, '+=0.3')
    .set(typing, { display: 'none' }, '+=1.1')
    .set(a, { opacity: 1 })
    .to(typed, { n: full.length, duration: full.length * 0.028, ease: 'none', onUpdate: () => { a.textContent = full.slice(0, Math.round(typed.n)); } });
}

/* ---------- 15 · Visit ---------- */
function visit({ gsap, reduce }) {
  if (reduce) return;
  gsap.from('.visit', { y: 80, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.visit', start: 'top 95%', once: true } });
  // The form card rises with a slight tilt, then its program chips pop in.
  gsap.timeline({ scrollTrigger: { trigger: '.visit-form', start: 'top 90%', once: true } })
    .fromTo('.visit-form', { y: 50, rotation: 1.5, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'power3.out', clearProps: CLEAR })
    .fromTo('.pick', { y: 12, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', clearProps: CLEAR }, 0.35);
  // Desktop: a doodle arrow draws itself toward the form.
  const arrow = document.querySelector('.visit-arrow');
  if (arrow && getComputedStyle(arrow).display !== 'none') {
    gsap.timeline({ scrollTrigger: { trigger: arrow, start: 'top 85%', once: true } })
      .fromTo(arrow.querySelector('.va-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, 0.6)
      .fromTo(arrow.querySelector('.va-head'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.3, ease: 'power2.out' });
  }
}
