import { motionState } from './ui.js';
import { initPathways } from './pathways.js';

// Section-by-section interactions. Each init is independent; under reduced
// motion they keep their interactivity but skip decorative movement.
export function initSections(ctx) {
  alignGrids(ctx);
  reveals(ctx);
  heroRotator(ctx);
  initPathways(ctx);
  learner(ctx);
  carousel(ctx);
  sundial(ctx);
  compare(ctx);
  packets(ctx);
  counters(ctx);
  five(ctx);
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

  // Manifesto: words turn from faint to ink as you scroll through.
  const scrub = document.querySelector('[data-scrub-words]');
  if (scrub) {
    const split = SplitText.create(scrub, { type: 'words' });
    gsap.fromTo(split.words, { opacity: 0.15 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: scrub, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
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

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const key = chip.dataset.learner;
    const closing = current === key;
    chips.forEach((c) => c.setAttribute('aria-expanded', String(!closing && c === chip)));
    if (closing) {
      current = null;
      gsap.to(panel, { height: 0, duration: reduce ? 0 : 0.45, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; ScrollTrigger.refresh(); } });
      return;
    }
    const d = LEARNERS[key];
    const fill = () => {
      img.src = `/img/${d.photo}-sm.webp`;
      img.alt = d.alt;
      kicker.textContent = d.title;
      text.textContent = d.text;
      card.style.setProperty('--tint', getComputedStyle(chip).getPropertyValue('--tint'));
    };
    const wasOpen = current !== null;
    current = key;
    if (reduce) { fill(); panel.hidden = false; panel.style.height = 'auto'; return; }
    if (wasOpen) {
      gsap.to(card, { opacity: 0, y: 10, duration: 0.2, onComplete: () => { fill(); gsap.to(card, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }); } });
    } else {
      fill();
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.55, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
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

  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const p = max > 0 ? scroller.scrollLeft / max : 0;
    bar.style.transform = `scaleX(${0.12 + p * 0.88})`;
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

  // Mouse drag to scroll (touch already scrolls natively).
  let down = null;
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
    down = { x: e.clientX, left: scroller.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 4) { down.moved = true; scroller.classList.add('is-dragging'); }
    scroller.scrollLeft = down.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = null;
    scroller.classList.remove('is-dragging');
  });

  // Camera button flips a photo to its story (Patagonia-style captions).
  cards.forEach((card) => {
    const cam = card.querySelector('.cam');
    const use = cam.querySelector('use');
    cam.addEventListener('click', () => {
      const on = card.classList.toggle('is-story');
      cam.setAttribute('aria-pressed', String(on));
      cam.setAttribute('aria-label', on ? 'Show the photo' : 'Show the story behind this photo');
      use.setAttribute('href', on ? '#d-close' : '#d-camera');
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
function sundial({ gsap, reduce }) {
  const section = document.querySelector('.day');
  if (!section) return;
  const steps = gsap.utils.toArray('.day-steps li');
  if (reduce || steps.length < 2) return; // plain timeline stays

  section.classList.add('is-pinned');
  const timesBox = section.querySelector('.day-times');
  const photosBox = section.querySelector('.day-photos');
  const times = steps.map((li) => {
    const span = document.createElement('span');
    span.textContent = li.querySelector('time').textContent;
    timesBox.append(span);
    return span;
  });
  const photos = steps.map((li) => {
    const img = li.querySelector('img').cloneNode();
    img.loading = 'eager';
    photosBox.append(img);
    return img;
  });
  const n = steps.length;
  gsap.set([...steps.slice(1), ...photos.slice(1)], { opacity: 0 });
  gsap.set(times.slice(1), { yPercent: 100 });

  const mobile = window.innerWidth < 768;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, pin: '.day-pin', start: 'top top',
      end: () => `+=${window.innerHeight * (mobile ? 1.8 : 2.5)}`,
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
  const items = gsap.utils.toArray('.packet');
  items.forEach((p) => p.addEventListener('click', () => {
    p.setAttribute('aria-pressed', String(p.getAttribute('aria-pressed') !== 'true'));
  }));
  if (reduce) return;
  gsap.from('.packets li', {
    y: -30, rotation: () => gsap.utils.random(-6, 6), opacity: 0, duration: 0.7, stagger: 0.05, ease: 'back.out(1.6)',
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
  const ring = document.querySelector('.stat-ring');
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduce) return;
    const obj = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
  if (ring && !reduce) {
    gsap.from(ring, { scale: 0.6, opacity: 0, rotation: -10, duration: 0.8, delay: 1.5, ease: 'back.out(2)', scrollTrigger: { trigger: ring, start: 'top 85%', once: true } });
  }
}

/* ---------- 11 · Only 5 ---------- */
function five({ gsap, reduce }) {
  if (reduce) return;
  gsap.fromTo('.five-collage', { y: 60 }, {
    y: -140, ease: 'none',
    scrollTrigger: { trigger: '.five', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.from('.five-doodle', {
    scale: 0, rotation: -45, duration: 0.8, stagger: 0.15, ease: 'back.out(2.2)',
    scrollTrigger: { trigger: '.five-art', start: 'top 70%', once: true },
  });
  gsap.from('.five-copy > *', {
    y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.five-copy', start: 'top 85%', once: true },
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
  gsap.from('.steps li', { x: -20, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } });
  gsap.from('.visit-form', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.visit-form', start: 'top 90%', once: true } });
}
