// Two pathways: The Hatch (ages 2–6) and The Studio (ages 7–12).
// The chooser panels, the age slider and the visit form all agree on one
// "current pathway", remembered for the visit.
const STORE_KEY = 'ep-pathway';
export const PATHS = {
  hatch: { name: 'The Hatch', ages: '2–6' },
  studio: { name: 'The Studio', ages: '7–12' },
};
export const pathFor = (age) => (Number(age) <= 6 ? 'hatch' : 'studio');

export function initPathways({ gsap, reduce }) {
  const grid = document.querySelector('.paths-grid');
  if (!grid) return;
  const panels = [...grid.querySelectorAll('.path')];
  const range = document.getElementById('age-range');
  const out = document.getElementById('age-out');
  const note = document.querySelector('.age-note');
  let current = null;

  const setActive = (key, { remember = true } = {}) => {
    if (key === current) return;
    current = key;
    grid.dataset.active = key;
    document.documentElement.dataset.path = key;
    panels.forEach((p) => {
      const on = p.dataset.path === key;
      p.classList.toggle('is-active', on);
      if (on && !reduce) {
        gsap.fromTo(p.querySelector('.path-leaf'), { scale: 0.4, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
        gsap.fromTo(p.querySelectorAll('.path-words li'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out' });
      }
    });
    if (remember) { try { localStorage.setItem(STORE_KEY, key); } catch { /* private mode */ } }
  };

  panels.forEach((p) => {
    const key = p.dataset.path;
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setActive(key); });
    p.addEventListener('focusin', () => setActive(key));
    p.addEventListener('click', () => setActive(key));
  });

  const showAge = (age) => {
    out.textContent = age;
    const key = pathFor(age);
    const { name } = PATHS[key];
    // At the boundary, invite a conversation instead of a hard rule.
    const edge = { 6: ' Turning 7 this year?', 7: ' Just turned 7?' }[age];
    note.innerHTML = `Your child would join <strong>${name}</strong>.${edge ? `${edge} Talk to us, and we’ll find the right fit.` : ''}`;
    setActive(key);
  };
  range.addEventListener('input', () => showAge(Number(range.value)));

  // Restore a remembered choice, otherwise start on The Hatch.
  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch { /* private mode */ }
  if (saved === 'studio') { range.value = 8; showAge(8); } else { showAge(Number(range.value)); }

  // "Book a … visit" pre-fills the form's age from the slider.
  document.querySelectorAll('[data-path-cta]').forEach((a) => a.addEventListener('click', () => {
    const key = a.dataset.pathCta;
    const age = pathFor(range.value) === key ? range.value : (key === 'hatch' ? 4 : 8);
    const select = document.getElementById('f-age');
    if (select) { select.value = String(age); select.dispatchEvent(new Event('change')); }
  }));

  initFormPath();
}

// Visit form: tell parents which pathway their child's age belongs to.
function initFormPath() {
  const select = document.getElementById('f-age');
  const line = document.getElementById('f-path');
  if (!select || !line) return;
  select.addEventListener('change', () => {
    if (!select.value) { line.hidden = true; return; }
    const { name, ages } = PATHS[pathFor(select.value)];
    line.innerHTML = `Your child would join <strong>${name}</strong> (ages ${ages}).`;
    line.hidden = false;
  });
}
