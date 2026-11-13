// Two pathways: The Hatch (ages 2–6) and The Studio (ages 7–12).
//
// Three separate things, kept separate on purpose:
// - preview:  the panel a mouse is over (visual only, never saved)
// - selected: the pathway a family chose (click, CTA or age slider; saved)
// - age:      only what the family entered on the slider (never invented)
// All visible text (slider note, form line) is derived from these in one
// render(), so nothing can disagree.
const STORE_KEY = 'ep-pathway';
const AGE_KEY = 'ep-child-age';
export const PATHS = {
  hatch: { name: 'The Hatch', ages: '2–6' },
  studio: { name: 'The Studio', ages: '7–12' },
};
export const pathFor = (age) => (Number(age) <= 6 ? 'hatch' : 'studio');

const state = { preview: null, selected: null, age: null };
let render = () => {};

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

export function initPathways({ gsap, reduce }) {
  const grid = document.querySelector('.paths-grid');
  if (!grid) return;
  const panels = [...grid.querySelectorAll('.path')];
  const range = document.getElementById('age-range');
  const out = document.getElementById('age-out');
  const note = document.querySelector('.age-note');
  const helper = document.querySelector('.age-helper');
  let shown = null;

  render = () => {
    const visual = state.preview || state.selected;
    if (visual !== shown) {
      shown = visual;
      panels.forEach((p) => {
        const on = p.dataset.path === visual;
        p.classList.toggle('is-active', on);
        if (on && !reduce) {
          gsap.fromTo(p.querySelector('.path-leaf'), { scale: 0.4, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
          gsap.fromTo(p.querySelectorAll('.path-words li'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity' });
        }
      });
    }
    if (state.age) {
      const key = pathFor(state.age);
      const edge = { 6: ' Turning 7 this year?', 7: ' Just turned 7?' }[state.age];
      out.textContent = state.age;
      helper.dataset.path = key;
      note.innerHTML = `Your child would join <strong>${PATHS[key].name}</strong>.${edge ? `${edge} Talk to us, and we’ll find the right fit.` : ''}`;
    } else {
      out.textContent = '–';
      delete helper.dataset.path;
      note.textContent = 'Slide to your child’s age to see which pathway fits.';
    }
    renderForm();
  };

  const select = (key) => {
    state.selected = key;
    store.set(STORE_KEY, key);
    render();
  };

  panels.forEach((p) => {
    const key = p.dataset.path;
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { state.preview = key; render(); } });
    p.addEventListener('pointerleave', () => { state.preview = null; render(); });
    p.addEventListener('click', () => select(key));
  });

  range.addEventListener('input', () => {
    state.age = Number(range.value);
    store.set(AGE_KEY, String(state.age));
    state.selected = pathFor(state.age);
    store.set(STORE_KEY, state.selected);
    render();
  });

  // A waitlist button records the interest. It fills the form's age only when
  // the family already told us the age and it belongs to that pathway.
  // A CTA for the other pathway than the slider's age means the family is
  // asking about a different child: the slider age is cleared, not kept in
  // contradiction with the choice.
  document.querySelectorAll('[data-path-cta]').forEach((a) => a.addEventListener('click', () => {
    const key = a.dataset.pathCta;
    if (state.age && pathFor(state.age) !== key) { state.age = null; store.set(AGE_KEY, ''); }
    const ageSelect = document.getElementById('f-age');
    if (ageSelect) {
      if (state.age) ageSelect.value = String(state.age);
      else if (ageSelect.value && (ageSelect.value === 'other' || pathFor(ageSelect.value) !== key)) ageSelect.value = '';
    }
    select(key);
  }));

  // Restore what the family actually chose last time.
  const savedPath = store.get(STORE_KEY);
  const savedAge = Number(store.get(AGE_KEY));
  if (savedAge >= 2 && savedAge <= 12) { state.age = savedAge; range.value = savedAge; }
  if (savedPath === 'hatch' || savedPath === 'studio') state.selected = savedPath;
  if (state.age) state.selected = pathFor(state.age);

  initFormPath();
  render();
}

// Microschool waitlist: the child's age in the form is the truth; otherwise the chosen
// pathway is sent as the family's interest.
function renderForm() {
  const ageSelect = document.getElementById('f-age');
  const line = document.getElementById('f-path');
  if (!ageSelect || !line) return;
  const key = ageSelect.value ? pathFor(ageSelect.value) : state.selected;
  if (document.getElementById('f-program').value !== 'microschool' || !key) { line.hidden = true; return; }
  line.innerHTML = ageSelect.value
    ? `Your child would join <strong>${PATHS[key].name}</strong> (ages ${PATHS[key].ages}).`
    : `You’re interested in <strong>${PATHS[key].name}</strong> (ages ${PATHS[key].ages}).`;
  line.hidden = false;
}

function initFormPath() {
  document.getElementById('f-age')?.addEventListener('change', () => renderForm());
}

export const currentPathway = () => {
  const ageSelect = document.getElementById('f-age');
  const key = ageSelect?.value ? pathFor(ageSelect.value) : state.selected;
  return key ? PATHS[key].name : '';
};
