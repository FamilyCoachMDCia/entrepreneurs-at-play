import { motionState, onMotionChange } from './ui.js';

// The Growth Line: one hand-drawn stem that draws itself down the page and
// sprouts a pair of leaves (big + small, like the logo) at each [data-sprout].
const LEAF_SVG = `<svg viewBox="0 0 46 40"><path d="M2 38 C 4 20, 16 6, 44 2 C 42 24, 28 36, 2 38 z" fill="#6E7157" stroke="#3C4136" stroke-width="2"/><path d="M4 36 C 16 26, 26 16, 38 8" fill="none" stroke="#3C4136" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const SMALL_SVG = `<svg viewBox="0 0 46 40"><path d="M2 38 C 4 24, 14 12, 34 10 C 32 26, 22 36, 2 38 z" fill="#BDAF90" stroke="#9A9B86" stroke-width="2"/></svg>`;

export function initGrowthLine({ gsap, ScrollTrigger, reduce }) {
  // Leaf sway loops obey the page-wide "pause motion" switch.
  const sways = [];
  onMotionChange((paused) => sways.forEach((t) => (paused ? t.pause() : t.play())));
  const wrap = document.querySelector('.growth');
  // Starts at the first sprouting section (the founder, right after pathways).
  const start = document.querySelector('[data-sprout]');
  const end = document.querySelector('.foot');
  if (!wrap || !start || !end) return;
  const svg = wrap.querySelector('.growth-svg');
  const path = wrap.querySelector('.growth-path');
  const leavesBox = wrap.querySelector('.growth-leaves');
  const pageY = (el) => el.getBoundingClientRect().top + window.scrollY;

  // One leaf pair per sprouting section, created once.
  const pairs = [...document.querySelectorAll('[data-sprout]')].map((section, i) => {
    const big = document.createElement('span');
    big.className = 'growth-leaf';
    big.innerHTML = LEAF_SVG;
    const small = document.createElement('span');
    small.className = 'growth-leaf';
    small.innerHTML = SMALL_SVG;
    leavesBox.append(big, small);
    if (!reduce) {
      gsap.set(big, { scale: 0, rotation: -25 });
      gsap.set(small, { scaleX: 0, scaleY: 0, rotation: 25 });
      const tl = gsap.timeline({ paused: true })
        .to(big, { scale: 1, rotation: 0, duration: 1, ease: 'elastic.out(1, 0.5)' })
        .to(small, { scaleX: -0.75, scaleY: 0.75, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, 0.15)
        .add(() => {
          const sway = gsap.to(big, { rotation: 4, duration: 2 + (i % 3) * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: motionState.paused });
          sways.push(sway);
        });
      ScrollTrigger.create({ trigger: section, start: 'top 75%', once: true, onEnter: () => tl.play() });
    } else {
      gsap.set(small, { scaleX: -0.75, scaleY: 0.75 });
    }
    return { section, big, small };
  });

  function build() {
    const top = pageY(start) - 40;
    const height = Math.max(0, pageY(end) + 60 - top);
    const vw = document.documentElement.clientWidth;
    const gutter = parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingLeft) || 16;
    const contentLeft = Math.max(gutter, (vw - 1240) / 2);
    const mobile = vw < 768;
    const cx = mobile ? 7 : Math.max(14, contentLeft / 2);
    const amp = mobile ? 3 : Math.min(26, Math.max(4, contentLeft / 2 - 10));
    const period = mobile ? 520 : 760;
    const xAt = (y) => cx + amp * Math.sin((y / period) * Math.PI * 2);
    const width = Math.ceil(cx + amp + 60);

    Object.assign(wrap.style, { top: `${top}px`, height: `${height}px`, width: `${width}px` });
    svg.setAttribute('viewBox', `0 0 ${width} ${Math.ceil(height)}`);

    // Smooth sine-like curve made of cubic segments every quarter period.
    const step = period / 4;
    let d = `M${xAt(0).toFixed(1)},0`;
    for (let y = 0; y < height; y += step) {
      const y2 = Math.min(height, y + step);
      const a = y + step / 3;
      const b = y2 - step / 3;
      d += ` C${xAt(a).toFixed(1)},${a.toFixed(1)} ${xAt(b).toFixed(1)},${b.toFixed(1)} ${xAt(y2).toFixed(1)},${y2.toFixed(1)}`;
    }
    path.setAttribute('d', d);

    const size = mobile ? 26 : 46;
    pairs.forEach(({ section, big, small }) => {
      const y = pageY(section) - top + 90;
      const x = xAt(y);
      const visible = y > 0 && y < height;
      big.style.display = small.style.display = visible ? '' : 'none';
      Object.assign(big.style, { left: `${x}px`, top: `${y - size * 0.87}px` });
      Object.assign(small.style, { left: `${x}px`, top: `${y - size * 0.4}px` });
    });
  }

  build();

  if (reduce) {
    gsap.set(path, { drawSVG: '100%' });
    window.addEventListener('resize', debounce(build, 200));
    return;
  }

  const draw = gsap.fromTo(path, { drawSVG: '0%' }, {
    drawSVG: '100%', ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 75%', end: 'bottom bottom', scrub: 1 },
  });

  // After every global refresh (resize, pin spacers, late images) re-measure
  // and refresh only the draw trigger, which depends on this element's size.
  ScrollTrigger.addEventListener('refresh', () => {
    build();
    draw.scrollTrigger?.refresh();
  });
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
