// The five pages of the site. Shared by the build (vite.config.js and
// build/partials.js) and the browser (transitions.js), so the curtain a page
// leaves with is the same one the next page arrives under.

export const PAGES = {
  home: {
    path: '/',
    name: 'Entrepreneurs at Play',
    markHTML: 'Entrepreneurs <em>at Play</em>',
    tint: 'var(--paper)',
    title: 'Entrepreneurs at Play · Enrichment, summer camp and microschool in Omaha',
    description: 'A physician-founded enrichment center in Omaha offering after-school enrichment, summer camp and a mixed-age microschool.',
    cta: { label: 'Golf sign-up', program: 'golf' },
  },
  enrichment: {
    path: '/enrichment/',
    num: '01',
    kicker: 'Try it',
    name: 'Enrichment',
    tint: 'var(--tint-sand)',
    title: 'After-school enrichment in Omaha · Entrepreneurs at Play',
    description: 'After-school enrichment in Omaha. Golf starts January 5. More afternoons coming soon. Open to all kids.',
    cta: { label: 'Golf sign-up', program: 'golf' },
  },
  summer: {
    path: '/summer/',
    num: '02',
    kicker: 'Go deeper',
    name: 'Summer',
    tint: 'var(--door-summer)',
    title: 'Summer camp in Omaha · Entrepreneurs at Play',
    description: 'Longer days of hands-on adventure, 9 a.m. to 3 p.m. Get summer 2027 updates from Entrepreneurs at Play.',
    cta: { label: 'Get summer updates', program: 'summer' },
  },
  microschool: {
    path: '/microschool/',
    num: '03',
    kicker: 'All in',
    name: 'Microschool',
    tint: 'var(--tint-green)',
    title: 'Microschool in Omaha, ages 2–12 · Entrepreneurs at Play',
    description: 'A mixed-age microschool with two pathways, The Hatch and The Studio. Join the Fall 2027 waitlist.',
    cta: { label: 'Join the waitlist', program: 'microschool' },
  },
  about: {
    path: '/about/',
    name: 'Who we are',
    markHTML: 'Who we <em>are</em>',
    tint: 'var(--paper-2)',
    title: 'Who we are · Entrepreneurs at Play',
    description: 'Why we are called Entrepreneurs at Play, what we believe, and the physician who founded it.',
    cta: { label: 'Contact us', program: 'general' },
  },
};

export const PROGRAM_KEYS = ['enrichment', 'summer', 'microschool'];

// "/enrichment", "/enrichment/" and "/enrichment/index.html" are one page.
export function pageForPath(pathname) {
  const clean = pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  return Object.keys(PAGES).find((key) => PAGES[key].path === clean) || null;
}

// The full-screen color a page arrives under (and the one a click leaves with).
export function curtainHTML(key, { exit = false } = {}) {
  const p = PAGES[key];
  const name = p.markHTML || p.name;
  return `<div class="curtain${exit ? ' is-exit' : ''}" data-for="${key}" style="--curtain-bg: ${p.tint}" aria-hidden="true">`
    + '<div class="curtain-mark">'
    + (p.num ? `<span class="curtain-num">${p.num}</span>` : '<svg class="curtain-sprout"><use href="#i-sprout"/></svg>')
    + `<strong class="curtain-name">${name}</strong>`
    + (p.kicker ? `<span class="curtain-kicker">${p.kicker}</span>` : '')
    + '</div></div>';
}
