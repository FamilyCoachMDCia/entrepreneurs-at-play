// Build-time partials for the five pages. vite.config.js replaces every
// <!--@name--> marker in a page with renderPartial(name, pageKey).
// Node only (reads files); the browser never imports this module.
import { readFileSync } from 'node:fs';
import { PAGES, PROGRAM_KEYS, curtainHTML } from '../src/pages.js';
import { SITE, week, openDays } from '../src/site-config.js';
import { content, esc, rich, safeUrl, themeSettings, SWATCHES, DOOR_DEFAULTS, BACKGROUNDS } from './content.js';
import { photoName } from './photos.js';

// The copy lives in content/*.json (see build/content.js).
const { site, home, enrichment, summer, microschool, about } = content;
const pad2 = (n) => String(n).padStart(2, '0');
const cur = (on) => (on ? ' aria-current="page"' : '');
const use = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

/* ---------- Head ---------- */

// Runs before the first paint: decides whether this page arrives under its
// curtain, applies the background test (?paper=), the Summer color test
// (?summer=yellow|brown|off).
// The home hero child is off (Dr. Che did not want it); ?kid=1 previews it. Keep the head script dependency-free.
const HEAD_SCRIPT = `<script>
(function () {
  var h = document.documentElement, page = h.getAttribute('data-page');
  h.classList.add('js');
  var nav = null, entry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  try { nav = JSON.parse(sessionStorage.getItem('ep-nav') || 'null'); } catch (e) {}
  var back = entry.type === 'back_forward';
  var internal = !!nav && Date.now() - nav.t < 5000 && !back;
  if (!back && (internal || page !== 'home')) h.setAttribute('data-curtain', page);
  if (internal) h.setAttribute('data-arrived', '');
  try {
    var k = new URLSearchParams(location.search).get('kid');
    if (k === '1' || k === 'off') sessionStorage.setItem('ep-kid', k);
    else k = sessionStorage.getItem('ep-kid');
  } catch (e) {}
  if (k === '1' && page === 'home') h.setAttribute('data-kid', '1');
  try {
    var p = new URLSearchParams(location.search).get('paper');
    if (p) sessionStorage.setItem('ep-paper', p);
    p = sessionStorage.getItem('ep-paper');
    if (p && p !== 'off') h.setAttribute('data-paper', p);
    var s = new URLSearchParams(location.search).get('summer');
    if (s) sessionStorage.setItem('ep-summer', s);
    s = sessionStorage.getItem('ep-summer');
    if (s && s !== 'off') h.setAttribute('data-summer', s);
  } catch (e) {}
  setTimeout(function () {
    if (!h.classList.contains('app-ready')) {
      h.classList.remove('js'); h.removeAttribute('data-curtain');
      var l = document.getElementById('loader'); if (l) l.remove();
    }
  }, 5000);
})();
</script>`;

// Links shared before the site had pages (flyers, posts) point at /#section.
// The server never sees the hash, so the home page forwards them. The
// retired T6 anchor is rebuilt in the script ('t' + 6) so the old name leaves
// the built HTML and still lands on golf.
const OLD_ANCHORS = {
  enrichment: '/enrichment/', golf: '/enrichment/#golf', 'enr-podcast': '/enrichment/#enr-podcast',
  'enr-create': '/enrichment/#enr-create', 'enr-cuisine': '/enrichment/#enr-cuisine', summer: '/summer/',
  microschool: '/microschool/', pathways: '/microschool/#pathways', day: '/microschool/#day',
  world: '/microschool/#world', ages: '/microschool/#pathways', domains: '/microschool/#domains',
  learner: '/microschool/#learner', practical: '/microschool/#microschool', faq: '/microschool/#visit',
  why: '/about/#apart', apart: '/about/#apart', founder: '/#founder', familycoachmd: '/about/#familycoachmd',
};

/* ---------- Theme (content/theme.json: door colors and background) ---------- */

// Attributes for <html>. Only what differs from the look in the CSS is written,
// so the default theme adds nothing. data-bg reuses the ?paper= linen / milk variables.
export function themeAttrs() {
  const t = themeSettings();
  return t.background !== 'cream' ? ` data-bg="${t.background}"` : '';
}

// Doors, menu blocks and cards painted Sun or Tan get data-tone="sun|tan": pages.css
// then darkens their small text and accents (4.5:1). Other swatches need nothing.
export function toneAttr(program) {
  const id = themeSettings().doors[program];
  return id === 'sun' || id === 'tan' ? ` data-tone="${id}"` : '';
}
// The card at the top of each program page (class -> program), for data-tone.
export const TONE_CARDS = { 'enrichment-feature': 'enrichment', 'summer-card': 'summer', 'microschool-card': 'microschool' };

// The door colors that are not the CSS default, as a <style> in the head.
// `html:root` outranks main.css whatever the order; the Summer rule steps aside
// while a ?summer= test is active.
function themeStyle() {
  const t = themeSettings();
  const rules = [];
  const vars = ['enrichment', 'microschool'].filter((k) => t.doors[k] !== DOOR_DEFAULTS[k]).map((k) => `--door-${k}: ${SWATCHES[t.doors[k]].hex}`);
  if (vars.length) rules.push(`html:root { ${vars.join('; ')}; }`);
  if (t.doors.summer !== DOOR_DEFAULTS.summer) rules.push(`html:root:not([data-summer]) { --door-summer: ${SWATCHES[t.doors.summer].hex}; }`);
  return rules.length ? `<style id="theme">\n${rules.join('\n')}\n</style>\n` : '';
}

function head(key) {
  const p = PAGES[key];
  const url = SITE.url + p.path;
  const ogTitle = key === 'home' ? `Entrepreneurs at Play · ${site.tagline}` : p.title;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="${BACKGROUNDS[themeSettings().background].paper}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Entrepreneurs at Play">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${SITE.url}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Entrepreneurs at Play, a FamilyCoachMD program in Omaha">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE.url}/og-image.png">
${themeStyle()}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400..800,0..100,0..1;1,9..144,400..800,0..100,0..1&display=swap">
${key === 'home' ? `<script>(function () { var id = location.hash.slice(1); if (id === 't' + 6) id = 'golf'; var to = ${JSON.stringify(OLD_ANCHORS)}[id]; if (to && to !== '/' + location.hash) location.replace(to); })();</script>\n` : ''}${HEAD_SCRIPT}${key === 'home' ? `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Entrepreneurs at Play",
  "alternateName": "EP, a FamilyCoachMD program",
  "description": "${p.description}",
  "email": "{{email}}",
  "url": "{{url}}/",
  "areaServed": "Omaha, Nebraska",
  "founder": { "@type": "Person", "name": "Dr. Larisa Che, MD", "jobTitle": "Board-certified child and adolescent psychiatrist" },
  "parentOrganization": { "@type": "Organization", "name": "FamilyCoachMD", "url": "https://www.familycoachmd.com/" }
}
</script>` : ''}`;
}

/* ---------- Body start: skip link, icons, curtain, grain ---------- */

const SPRITE = readFileSync(new URL('../src/partials/sprite.svg', import.meta.url), 'utf8');

function bodyStart(key) {
  return `<a class="skip" href="#main">Skip to content</a>

<!-- Doodle sprite: hand-drawn stickers and icons used across the site -->
${SPRITE}
<!-- Page curtain: covers the page until it is ready when arriving from another page (transitions.js) -->
${curtainHTML(key)}

<div class="grain" aria-hidden="true"></div>`;
}

/* ---------- Header, menu, footer ---------- */

const NAV_PAGES = ['enrichment', 'summer', 'microschool', 'about'];

function siteHead(key) {
  const p = PAGES[key];
  return `<!-- Ticker + nav -->
<header class="site-head" id="site-head">
  <div class="ticker" role="region" aria-label="Announcements">
    <ul class="ticker-list">
      <li><a href="/enrichment/#golf">${esc(site.ticker.golf)}</a></li>
      <li><a href="/enrichment/">${esc(site.ticker.afterSchool)}</a></li>
      <li><a href="/microschool/#visit" data-program-cta="microschool">${esc(site.ticker.microschool)}</a></li>
    </ul>
    <button class="ticker-pause" type="button" aria-pressed="false" aria-label="Pause all motion"><span></span><span></span></button>
  </div>
  <nav class="nav" aria-label="Main">
    <a href="/" class="nav-brand" aria-label="Entrepreneurs at Play, home"${cur(key === 'home')}>
      <img class="nav-mark" src="/logo/arch-sun-bricks.svg" alt="" width="58" height="58">
      <span class="nav-word">Entrepreneurs <em>at Play</em></span>
    </a>
    <ul class="nav-links">
      ${NAV_PAGES.map((k) => `<li><a href="${PAGES[k].path}"${cur(k === key)}>${PAGES[k].name}</a></li>`).join('\n      ')}
    </ul>
    <a href="#visit" class="btn btn-primary nav-cta" data-program-cta="${p.cta.program}"><span>${p.cta.label}</span><i class="btn-dot"></i></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button>
  </nav>
</header>`;
}

// Section shortcuts per page: the sticky row under the page top (subnav)
// and the "On this page" group of the phone menu.
const SUBNAV = {
  microschool: [['#pathways', 'Pathways'], ['#world', 'A week'], ['#day', 'A day'], ['#domains', 'Subjects'], ['#visit', 'Waitlist']],
  about: [['#name', 'Our name'], ['#believe', 'What we believe'], ['#create', 'CREATE'], ['#apart', 'Nine things'], ['#founder', 'Founder'], ['#familycoachmd', 'FamilyCoachMD'], ['#partners', 'Partners'], ['#visit', 'Contact']],
  // Enrichment's top already lists each afternoon (day strip), so its row
  // stays one level up; the phone menu still lists the afternoons.
  enrichment: [['#enrichment', 'Afternoons'], ['#faq', 'FAQ'], ['#visit', 'Request a spot']],
  summer: [['#summer', 'Summer camp'], ['#summer-favorites', 'Favorites'], ['#visit', 'Get updates']],
};

function onThisPage(key) {
  if (SUBNAV[key] && key !== 'enrichment' && key !== 'summer') return SUBNAV[key];
  if (key === 'enrichment') {
    return [
      ...openDays().map((d) => [`#${d.anchor}`, d.chip || d.name]),
      ['#faq', 'FAQ'], ['#visit', 'Request a spot'],
    ];
  }
  if (key === 'summer') return [['#summer-favorites', 'All-day favorites'], ['#visit', 'Get updates']];
  return [];
}

// The big blocks at the top of the menu: the three programs, then who we are.
const MENU_BLOCKS = [
  ['enrichment', '01 · Try it', 'After-school afternoons, open to all kids'],
  ['summer', '02 · Go deeper', 'Longer days of hands-on adventure'],
  ['microschool', '03 · All in', 'Ages 2–12 · Fall 2027 waitlist'],
  ['about', 'Meet us', 'Our name, what we believe and our founder', 'var(--tint-clay)'],
];

function menu(key) {
  const p = PAGES[key];
  const here = onThisPage(key);
  const more = [['/', 'Home', 'home'], ['/about/#partners', 'Partner with us', 'partners']]
    .filter(([, , k]) => k !== key && !(key === 'about' && k === 'partners'));
  return `<nav class="menu" id="menu" aria-label="Main menu" tabindex="-1" data-lenis-prevent hidden>
  <div class="menu-group menu-group-main">
    <h2>Explore</h2>
    <ul class="menu-programs">
      ${MENU_BLOCKS.map(([k, top, line, tint]) => `<li><a href="${PAGES[k].path}" style="--door: ${tint || PAGES[k].tint}"${PROGRAM_KEYS.includes(k) ? toneAttr(k) : ''}${cur(k === key)}><small aria-hidden="true">${top}</small><strong>${PAGES[k].name}</strong><span>${line}</span>${use('d-chev').replace('<svg', '<svg class="menu-go"')}</a></li>`).join('\n      ')}
    </ul>
  </div>${here.length ? `
  <div class="menu-group">
    <h2>On this page</h2>
    <ul class="menu-links">
      ${here.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('\n      ')}
    </ul>
  </div>` : ''}
  <div class="menu-group">
    <h2>More</h2>
    <ul class="menu-links">
      ${more.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n      ')}
    </ul>
  </div>
  <div class="menu-foot">
    <a href="#visit" class="btn btn-primary" data-program-cta="${p.cta.program}"><span>${p.cta.label}</span><i class="btn-dot"></i></a>
    <a class="menu-email" href="mailto:{{email}}">{{email}}</a>
  </div>
</nav>`;
}

function subnav(key) {
  const items = SUBNAV[key] || [];
  return `<!-- On this page: section shortcuts (sticky on desktop) -->
<nav class="subnav" aria-label="On this page">
  <div class="wrap">
    <ul class="subnav-list">
      ${items.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n      ')}
    </ul>
  </div>
</nav>`;
}

function siteFoot(key) {
  const links = [['/', 'Home', 'home'], ...NAV_PAGES.map((k) => [PAGES[k].path, PAGES[k].name, k]), ['/about/#partners', 'Partner with us', ''], ['#visit', 'Contact', '']];
  return `<!-- Footer -->
<footer class="foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <img class="foot-mark" src="/logo/arch-sun-bricks.svg" alt="" width="128" height="128" loading="lazy">
      <p class="foot-word">Entrepreneurs <em>at Play</em></p>
      <p>${esc(site.footerLine)}</p>
    </div>
    <nav class="foot-links" aria-label="Footer">
      ${links.map(([href, label, k]) => `<a href="${href}"${cur(k === key)}>${label}</a>`).join('')}
    </nav>
    <div class="foot-contact">
      <p><a href="mailto:{{email}}">{{email}}</a></p>
      <p>Omaha, Nebraska</p>
      <p>A FamilyCoachMD program</p>
      <!--social-links-->
    </div>
  </div>
  <div class="wrap foot-bottom">
    <p>© {{year}} Entrepreneurs at Play · FamilyCoachMD · “${esc(site.tagline)}”</p>
    <p>Site by <a href="https://www.haderach.com.br" rel="noopener">Haderach Solutions</a></p>
  </div>
</footer>`;
}

// Phones and tablets: the page's own call to action stays a thumb away.
function stickyCta(key) {
  const { cta } = PAGES[key];
  return `<div class="sticky-cta" aria-hidden="true">
  <a class="btn btn-primary" href="#visit" data-program-cta="${cta.program}" tabindex="-1"><span>${cta.label}</span><i class="btn-dot"></i></a>
</div>`;
}

/* ---------- Doors: the three programs ---------- */

// Words come from content/home.json; the drawings and the "stamp" are code.
const DOORS = {
  enrichment: {
    art: `<svg class="door-art art-putt" viewBox="0 0 160 84" aria-hidden="true"><path class="art-track" d="M14 66 C 52 44, 92 80, 128 64"/><ellipse class="art-hole" cx="132" cy="65" rx="11" ry="3.5"/><path class="art-pole" d="M132 64 V 16"/><path class="art-flag" d="M132 17 C 141 19, 148 22, 158 24 C 149 28, 141 31, 132 34 z"/><circle class="art-ball" cx="14" cy="62" r="5.5"/></svg>`,
  },
  summer: {
    art: `<svg class="door-art art-sun" viewBox="0 0 160 84" aria-hidden="true"><path class="art-track" d="M10 80 C 40 6, 120 6, 150 80"/><g class="art-sunball" transform="translate(27 46)"><g class="art-rays"><path d="M0 -17v5M0 12v5M-17 0h5M12 0h5M-12 -12l3.5 3.5M8.5 8.5l3.5 3.5M-12 12l3.5 -3.5M8.5 -8.5l3.5 -3.5"/></g><circle r="9"/></g></svg>`,
  },
  microschool: {
    stamp: true,
    art: `<svg class="door-art art-school" viewBox="0 0 160 84" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M35 74h92M48 72V42l32-26 32 26v30M39 46l41-34 41 34M73 73V54h14v19M56 50h9v10h-9zM95 50h9v10h-9z"/><circle cx="80" cy="36" r="6"/></svg>`,
  },
};

function door(k, { compact = false, label = '' } = {}) {
  const p = PAGES[k];
  const d = { ...DOORS[k], ...home.doors[k] };
  const kicker = label || p.kicker;
  return `<a class="door door-${k}${compact ? ' door--compact' : ''}" href="${p.path}" data-door="${k}"${toneAttr(k)} style="--door: ${p.tint}" aria-label="${esc(`${p.name}: ${d.line} ${d.stamp ? 'Enrollment at capacity.' : `${d.status}.`}`)}">
          <span class="door-inside" aria-hidden="true"><strong>${p.name}</strong></span>
          <span class="door-leaf">
            <span class="door-top"><span class="door-num">${p.num}</span><span class="door-status${d.stamp ? ' door-stamp' : ''}">${d.status}</span></span>
            <span class="door-kicker">${kicker}</span>
            <strong class="door-name">${p.name}</strong>
            <span class="door-line">${d.line}</span>
            ${d.art}
            <span class="door-go">Open ${use('d-chev')}</span>
          </span>
        </a>`;
}

function doors() {
  return `<!-- The three doors: each program opens into its own page -->
<section class="doors" id="programs" aria-labelledby="doors-title">
  <div class="wrap">
    <div class="doors-head">
      <h2 class="doors-title" id="doors-title">Three ways to join. <em>One journey.</em></h2>
      <p class="doors-note" aria-hidden="true">Choose your adventure <svg viewBox="0 0 96 48"><use href="#d-arrow"/></svg></p>
    </div>
    <ol class="doors-row">
      ${PROGRAM_KEYS.map((k) => `<li>\n        ${door(k)}\n      </li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
}

// The funnel at the end of each page: enrichment leads to summer, summer
// leads to school.
const NEXT = {
  enrichment: { title: 'Where enrichment <em>leads.</em>', doors: [['summer', 'Next'], ['microschool', 'Then']] },
  summer: { title: 'Before and after <em>summer.</em>', doors: [['enrichment', 'Start with'], ['microschool', 'Next']] },
  microschool: { title: 'The microschool is full this spring. <em>Start with enrichment.</em>', doors: [['enrichment', 'Start here'], ['summer', 'Or try']] },
  about: { title: 'Three ways to join. <em>One journey.</em>', doors: [['enrichment'], ['summer'], ['microschool']] },
};

function nextStep(key) {
  const n = NEXT[key];
  if (!n) return '';
  return `<!-- Next step: the other programs as small doors -->
<section class="next-step" aria-labelledby="next-title">
  <div class="wrap">
    <h2 class="next-title" id="next-title">${n.title}</h2>
    <ul class="next-row next-${n.doors.length}">
      ${n.doors.map(([k, label]) => `<li>\n        ${door(k, { compact: true, label })}\n      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;
}

/* ---------- Schedule pieces (from SCHEDULE in site-config.js) ---------- */

const short = (weekday) => weekday.slice(0, 3);

function dayStrip() {
  return `<ol class="day-strip" aria-label="Enrichment by day">
        ${openDays().map((d) => `<li><a href="#${d.anchor}" data-day-pill><b>${short(d.weekday)}</b><span>${esc(d.strip || d.name)}${d.soon ? '<small>Coming soon</small>' : ''}</span></a></li>`).join('\n        ')}
        <li class="strip-signup"><a href="#visit" data-program-cta="golf"><b aria-hidden="true">${use('d-chev').replace('<svg', '<svg class="strip-go"')}</b><span>Request a golf spot</span></a></li>
      </ol>`;
}

function dayCards() {
  const cards = openDays().filter((d) => d.key !== 'golf');
  return `<div class="program-week" aria-label="Planned enrichment activities">
      ${cards.map((d) => `<article class="day-card" id="${d.anchor}" style="--tint:${d.tint}; --tab:${d.tab}">
        <p class="cal-tab"><span>${d.weekday}</span></p>
        <svg class="day-card-icon" aria-hidden="true"><use href="#${d.icon}"/></svg>
        <h3>${esc(d.title || d.name)}</h3>${d.soon ? '<span class="soon-tag">Coming soon</span>' : ''}
        <p>${esc(d.blurb)}</p>
        <a class="link link-go" href="#visit" data-program-cta="${d.key}">${esc(d.ask)}<svg aria-hidden="true"><use href="#d-chev"/></svg></a>
      </article>`).join('\n      ')}
    </div>
    <!-- Phones and tablets: which day card is in view (sections.js) -->
    <div class="day-dots" aria-hidden="true">${cards.map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</div>`;
}

function weekRhythm() {
  return `<ul class="week-rhythm">
        ${week().map((d) => {
          const cls = [d.open && 'is-after', d.sampleDay && 'is-sample'].filter(Boolean).join(' ');
          const label = d.sampleDay ? `<a class="link" href="#day">${esc(d.week)}</a>` : `<span>${esc(d.week)}</span>`;
          const dot = d.open ? '<i class="after-dot" aria-hidden="true"></i>' : '';
          const ring = d.sampleDay ? '\n          <svg class="day-ring" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path d="M150 14C118 2 40 6 16 34c-20 24 8 54 72 58 64 4 104-18 100-44-3-20-40-34-92-32" fill="none" vector-effect="non-scaling-stroke"/></svg>' : '';
          return `<li${cls ? ` class="${cls}"` : ''}><svg class="week-icon" aria-hidden="true"><use href="#${d.icon}"/></svg><strong>${d.weekday}</strong>${label}${dot}${ring}</li>`;
        }).join('\n        ')}
      </ul>`;
}

const SUMMER_ICONS = ['d-flag', 'd-hammer', 'i-talker', 'd-whisk']; // one per activity (code)

function summerFavorites() {
  return `<!-- Summer takes the after-school favorites and gives them whole days -->
<section class="summer-favorites" id="summer-favorites" aria-labelledby="favorites-title">
  <div class="wrap">
    <div class="favorites-card">
      <div class="favorites-copy">
        <h2 class="h2" id="favorites-title">Summer <em>activities</em></h2>
      </div>
      <ul class="favorites-list">
        ${summer.activities.map((a, i) => `<li><div><svg aria-hidden="true"><use href="#${SUMMER_ICONS[i]}"/></svg><span>${esc(a.name)}</span><small>${esc(a.text)}</small></div></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;
}

/* ---------- Home: what's in a name (short) ---------- */

function nameStrip() {
  return `<!-- What's in a name: the short version (full one on /about/) -->
<section class="name-strip" aria-labelledby="name-strip-title">
  <div class="wrap">
    <a class="door door-about name-strip-door" href="/about/" style="--door: var(--paper-2)" aria-label="Who we are — learn about Entrepreneurs at Play">
      <span class="door-inside" aria-hidden="true"><strong>Who we are</strong></span>
      <span class="door-leaf name-strip-card">
      <span class="eyebrow" id="name-strip-title">What’s in a name?</span>
      <span class="name-strip-eq">
        <span class="ns-term">Entrepreneurs</span>
        <span class="ns-op" aria-hidden="true">+</span><span class="sr-only">plus</span>
        <span class="ns-term ns-play">at <em>Play</em></span>
        <span class="ns-op" aria-hidden="true">=</span><span class="sr-only">equals</span>
        <span class="ns-result">${esc(home.nameStrip.result)}</span>
      </span>
      <span class="name-strip-detail">
          <span class="door-kicker">Our story</span>
          <strong class="door-name">Who we are</strong>
          <span class="door-line">Meet the people and ideas behind Entrepreneurs at Play.</span>
      </span>
      <svg class="door-art art-leaves" viewBox="0 0 160 84" aria-hidden="true"><path class="art-stem" d="M34 82 C 66 82, 92 68, 104 42"/><path class="art-leaf-big" d="M104 42 C 98 18, 120 3, 152 2 C 152 30, 136 46, 104 42 z"/><path class="art-vein" d="M106 40 C 118 28, 132 16, 146 8"/><path class="art-leaf-small" d="M86 64 C 70 52, 70 34, 78 24 C 92 34, 94 52, 86 64 z"/></svg>
      <span class="door-go">Open ${use('d-chev')}</span>
      </span>
    </a>
  </div>
</section>`;
}

/* ---------- Enrichment extras ---------- */

function faqEnrichment() {
  return `<!-- Enrichment questions -->
<section class="faq faq-simple" id="faq" aria-labelledby="faq-title">
  <div class="wrap">
    <p class="eyebrow">Quick answers</p>
    <h2 class="h2" id="faq-title" data-split>Questions parents <em>ask</em></h2>
    <div class="faq-list">
      ${enrichment.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div class="faq-a"><p>${rich(f.a)}</p></div></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

/* ---------- Contact: closes every page ---------- */

const VISIT = {
  home: {
    title: 'Find your <em>next step.</em>',
    intro: 'Request a golf spot, ask about another afternoon, get summer updates or join the Fall 2027 microschool waitlist. We’ll reply by email with availability and next steps.',
    show: ['enrichment', 'summer', 'microschool', 'other'], def: '',
  },
  enrichment: {
    title: 'Request a spot <em>after school.</em>',
    intro: 'Request a golf spot or ask about another afternoon. We’ll reply by email with availability and next steps.',
    show: ['enrichment'], def: 'golf',
  },
  summer: {
    title: 'Be first to hear about <em>summer.</em>',
    intro: 'Leave your email and we’ll share dates, ages and fees as soon as they’re set.',
    show: ['summer'], def: 'summer',
  },
  microschool: {
    title: 'Join the <em>Fall 2027</em> waitlist.',
    intro: 'The spring beta is at capacity. Request a place for Fall 2027 and we’ll reply by email with next steps.',
    show: ['microschool'], def: 'microschool',
  },
  about: {
    title: 'Talk with <em>us.</em>',
    intro: 'Ask a question, or tell us how you’d like to partner with EP. We’ll reply by email.',
    show: ['other'], def: 'general',
  },
};

const pick = (value, icon, title, small) => `<label class="pick"><input type="radio" name="program-pick" value="${value}"><span class="pick-face">${use(icon)}<span><b>${esc(title)}</b><small>${esc(small)}</small></span></span></label>`;

const PICK_GROUPS = {
  enrichment: () => `<div class="pick-group pick-enrichment" role="group" aria-labelledby="pick-enr">
            <p class="pick-label" id="pick-enr">Enrichment</p>
            <div class="pick-row">
              ${openDays().map((d) => pick(d.key, d.icon, d.chip || d.name, d.chipNote || `${d.weekday}${d.soon ? ' · coming soon' : ''}`)).join('\n              ')}
            </div>
          </div>`,
  summer: () => `<div class="pick-group" role="group" aria-labelledby="pick-sum">
            <p class="pick-label" id="pick-sum">Summer</p>
            ${pick('summer', 'd-sun', 'Summer camp', 'Updates')}
          </div>`,
  microschool: () => `<div class="pick-group" role="group" aria-labelledby="pick-mic">
            <p class="pick-label" id="pick-mic">Microschool</p>
            <div class="pick-row pick-row-2">
              ${pick('microschool', 'i-sprout', 'Fall 2027 waitlist', 'The Hatch & The Studio')}
              ${pick('hatch', 'i-sprout', 'The Hatch · updates', 'Ages 2–6 · coming soon')}
            </div>
          </div>`,
  other: () => `<div class="pick-group pick-other" role="group" aria-labelledby="pick-oth">
            <p class="pick-label" id="pick-oth">Talk with us</p>
            <div class="pick-row pick-row-2">
              ${pick('general', 'd-mail', 'General question', 'About EP')}
              ${pick('partner', 'p-hands', 'Partner with EP', 'Businesses and institutions')}
            </div>
          </div>`,
};
const GROUP_ORDER = ['enrichment', 'summer', 'microschool', 'other'];

function contact(key) {
  const v = VISIT[key];
  const shown = GROUP_ORDER.filter((g) => v.show.includes(g)).map((g) => PICK_GROUPS[g]()).join('\n          ');
  const rest = GROUP_ORDER.filter((g) => !v.show.includes(g)).map((g) => PICK_GROUPS[g]()).join('\n            ');
  const options = [
    ['', 'Select a program'],
    ...openDays().map((d) => [d.key, d.key === 'golf' ? d.name : `${d.weekday} ${d.name}${d.soon ? ' · coming soon' : ''}`]),
    ['summer', 'Summer camp updates'], ['microschool', 'Fall 2027 microschool waitlist'], ['hatch', 'The Hatch · updates'],
    ['general', 'General question'], ['partner', 'Partner with EP'],
  ];
  return `<!-- Contact: every page ends here -->
<section class="visit has-grid-dark" id="visit" aria-labelledby="visit-title"${key === 'home' ? '' : ' data-sprout'}>
  <div class="wrap visit-grid">
    <div class="visit-copy">
      <h2 class="h2" id="visit-title">${v.title}</h2>
      <p class="request-intro">${v.intro} Prepare your request here, then send it from your email app.</p>
      <svg class="visit-arrow" viewBox="0 0 160 90" aria-hidden="true"><path class="va-line" d="M8 14 C 40 70, 100 82, 146 52" fill="none"/><path class="va-head" d="M126 44 L 148 51 L 134 70" fill="none"/></svg>
      <p class="visit-mail">Email us directly: <a class="visit-email" href="mailto:{{email}}">{{email}}</a> <button class="copy" type="button" data-copy="{{email}}">Copy</button> <span class="copy-status" role="status"></span></p>
      <!--social-links-->
    </div>
    <form class="visit-form" id="visit-form" data-default-program="${v.def}" hidden>
      <!-- Program chips are native radios (keyboard: arrows move, Space picks).
           The hidden select below stays the source of truth for the form logic
           and the email; ui.js keeps the two in sync. -->
      <fieldset class="program-pick">
        <legend>${key === 'about' ? 'What is it about?' : 'Program'}</legend>
        <select id="f-program" name="program" hidden tabindex="-1" aria-hidden="true">
          ${options.map(([value, label]) => `<option value="${value}">${esc(label)}</option>`).join('\n          ')}
        </select>
        ${shown}${rest ? `
        <details class="pick-more">
          <summary>${key === 'about' ? 'Asking about a program?' : 'Looking for another program?'}</summary>
          <div class="pick-more-body">
            ${rest}
          </div>
        </details>` : ''}
      </fieldset>
      <div class="field-row">
        <div class="field"><label for="f-name">${key === 'about' ? 'Your name' : 'Parent or guardian name'}</label><input id="f-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="field field-age"><label for="f-age">Child’s age</label>
        <select id="f-age" name="age" required aria-describedby="f-age-note f-path"><option value="">Select</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option value="other">Other age</option></select>
      </div>
      <p class="form-path" id="f-age-note" hidden></p>
      <p class="form-path" id="f-path" aria-live="polite" hidden></p>
      <div class="field"><label for="f-msg">Message <span>(optional)</span></label><textarea id="f-msg" name="message" rows="3"></textarea></div>
      <div class="form-send">
        <p class="form-summary" aria-live="polite">Pick a program above.</p>
        <button class="btn btn-primary btn-submit" type="submit"><span>Prepare my email</span><i class="btn-dot"></i></button>
      </div>
      <p class="form-note">This opens your email app with the request filled in. Press Send there to contact us. We’ll reply by email.</p>
      <button type="button" class="link copy-request">Copy request for webmail</button>
      <textarea class="request-fallback" aria-label="Request to copy" readonly hidden></textarea>
      <p class="form-status" role="status"></p>
    </form>
  </div>
</section>`;
}

/* ---------- Shared by home and /about/ ---------- */

function founder(key) {
  if (key === 'about') return `<section class="founder" id="founder"><div class="wrap">
    <p class="eyebrow">Meet the founder</p><h2 class="h2">Dr. Larisa Che, <em>MD</em></h2>
    <p class="sub">Founder, Entrepreneurs at Play · Founder &amp; CEO, FamilyCoachMD · Mom</p>
    <a class="link" href="/#founder">Read her story</a>
  </div></section>`;
  return `<!-- 12 · Founder -->
<section class="founder" id="founder" aria-labelledby="founder-title" data-sprout>
  <div class="wrap founder-grid">
    <div class="founder-visual">
      <svg class="founder-svg" viewBox="0 0 400 520" aria-hidden="true">
        <defs>
          <clipPath id="leaf-clip"><path d="M200 12 C 330 40, 392 170, 380 300 C 368 430, 280 508, 200 508 C 120 508, 32 430, 20 300 C 8 170, 70 40, 200 12 z"/></clipPath>
        </defs>
        <image href="/img/founder-lg.webp" x="0" y="0" width="400" height="533" clip-path="url(#leaf-clip)" preserveAspectRatio="xMidYMin slice"/>
        <path class="founder-outline" d="M200 12 C 330 40, 392 170, 380 300 C 368 430, 280 508, 200 508 C 120 508, 32 430, 20 300 C 8 170, 70 40, 200 12 z" fill="none"/>
      </svg>
      <span class="sr-only">Portrait of Dr. Larisa Che, MD, founder of Entrepreneurs at Play</span>
    </div>
    <div class="founder-copy">
      <p class="eyebrow">Meet the founder</p>
      <h2 class="h2" id="founder-title" data-split>Dr. Larisa Che, <em>MD</em></h2>
      <ul class="cred">
        <li>Board-certified child &amp; adolescent psychiatrist</li>
        <li>Founder, Entrepreneurs at Play</li>
        <li>Founder &amp; CEO, FamilyCoachMD</li>
        <li>Creighton fellowship-trained</li>
        <li>Certified Positive Discipline parent educator</li>
        <li>Mom</li>
      </ul>
      <blockquote class="quote" data-lines>“${esc(about.founder.quote)}”</blockquote>
      <p>${esc(about.founder.bio)}</p>
      <p class="signature">— Dr. Larisa Che</p>${key === 'home' ? `
      <p class="founder-more"><a class="link link-go" href="/about/">More about EP<svg aria-hidden="true"><use href="#d-chev"/></svg></a></p>` : ''}
      <!--social-links-->
    </div>
  </div>
</section>`;
}

function manifesto() {
  return `<!-- 03 · Manifesto -->
<section class="manifesto" id="why" data-sprout>
  <div class="wrap">
    <p class="eyebrow">Why Entrepreneurs at Play</p>
    <h2 class="manifesto-text" data-scrub-words>Every child carries an <em>entrepreneurial spirit</em>. We give it room to play.</h2>

  </div>
</section>`;
}

/* ---------- Home: the week at a glance and the dates to remember ---------- */

// Monday is microschool only, golf has its start date, the rest are not confirmed.
const hwTime = (d) => {
  if (!d.open) return '<span class="hw-time">Microschool only</span>';
  if (d.soon) return '<span class="hw-time hw-soon">Coming soon</span>';
  return `<span class="hw-time">${esc(d.startsLine || d.hours || '')}</span>`;
};

function homeWeek() {
  return `<!-- A week at EP: every afternoon, from SCHEDULE in site-config.js -->
<section class="home-week" id="week" aria-labelledby="home-week-title">
  <div class="wrap">
    <p class="eyebrow">A week at EP</p>
    <h2 class="h2" id="home-week-title" data-split>Something new <em>every afternoon.</em></h2>
    <p class="sub">${esc(home.week.subtitle)}</p>
    <ol class="hw-list">
      ${week().map((d) => {
        const inner = `<svg class="hw-icon" aria-hidden="true"><use href="#${d.icon}"/></svg><b>${d.weekday}</b><strong>${esc(d.title || d.name)}</strong>${hwTime(d)}`;
        return d.open
          ? `<li class="hw-day is-open" style="--tint:${d.tint || 'var(--tint-sun)'}" data-reveal><a href="/enrichment/#${d.anchor}">${inner}</a></li>`
          : `<li class="hw-day" data-reveal><div>${inner}</div></li>`;
      }).join('\n      ')}
    </ol>
    <a class="link link-go" href="/enrichment/">See all afternoons<svg aria-hidden="true"><use href="#d-chev"/></svg></a>
  </div>
</section>`;
}

function dates() {
  return `<!-- Dates to remember -->
<section class="dates" aria-labelledby="dates-title">
  <div class="wrap">
    <p class="eyebrow">Mark your calendar</p>
    <h2 class="h2" id="dates-title" data-split>Dates to <em>remember.</em></h2>
    <ol class="date-list">
      ${home.dates.map((d) => `<li data-reveal><a href="${esc(safeUrl(d.link) || '/')}"><span class="date-chip"><b>${esc(d.date)}</b><small>${esc(d.year)}</small></span><span class="date-copy"><strong>${esc(d.title)}</strong><span>${esc(d.text)}</span></span><svg class="date-go" aria-hidden="true"><use href="#d-chev"/></svg></a></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
}

/* ---------- Enrichment: the golf block ---------- */

function golfChips() {
  return enrichment.golf.chips.map((c) => `<li>${esc(c)}</li>`).join('');
}

function golfSessions() {
  return enrichment.golf.sessions.map((s) => {
    if (s.comingSoon) return `<div class="is-soon"><dt>${esc(s.month)}</dt><dd><span class="soon-tag">Coming soon</span></dd></div>`;
    const url = safeUrl(s.placeLink);
    const place = s.place ? `<dd>${url ? `<a class="link" href="${esc(url)}">${esc(s.place)}</a>` : esc(s.place)}</dd>` : '';
    return `<div><dt>${esc(s.month)}</dt>${s.dates ? `<dd>${esc(s.dates)}</dd>` : ''}${place}</div>`;
  }).join('\n          ');
}

/* ---------- Microschool ---------- */

// The two pathways: words, "coming soon" pieces.
function pathWords(key, arg) {
  const words = microschool[arg].words;
  const label = words.map((w, i) => (i ? w.toLowerCase() : w)).join(', ');
  return `<ul class="path-words" aria-label="${esc(label)}">${words.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;
}
const hatchStamp = () => (microschool.hatch.comingSoon ? '<p class="eyebrow stamp path-stamp">Coming soon</p>' : '');
const hatchSoonNote = () => (microschool.hatch.comingSoon && microschool.hatch.soonNote ? `<p class="path-soon">${esc(microschool.hatch.soonNote)}</p>` : '');

// Photos whose crop needs a nudge, and the narrow ones that stay at 60vw (see main.css).
const DAY_PHOTO_CLASS = { 'day-prep': 'day-prep-photo', 'day-openmic': 'day-openmic-photo' };
const DAY_PHOTO_NARROW = new Set(['day-money', 'podcast']);

function sampleDaySteps() {
  return microschool.sampleDay.map((s) => {
    const name = photoName(s.photo);
    const cls = DAY_PHOTO_CLASS[name] ? ` class="${DAY_PHOTO_CLASS[name]}"` : '';
    const sizes = DAY_PHOTO_NARROW.has(name) ? '60vw' : '100vw';
    return `<li><time>${esc(s.time)}</time><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><img data-photo="${name}"${cls} sizes="(max-width: 767px) ${sizes}, 420px" alt="${esc(s.photoAlt)}" loading="lazy"></li>`;
  }).join('\n          ');
}

// One icon per subject; the seventh also shows a photo on its back (code).
const SUBJECT_ICONS = ['i-builder', 'i-thinker', 'd-sparkle', 'd-plane', 'd-leaf', 'p-chart', 'i-explorer', 'i-artist', 'i-talker', 'p-adults', 'd-sun'];
const SUBJECT_PHOTO = { 6: { name: 'cuisine' } };

function subjects() {
  return microschool.subjects.map((s, i) => {
    const n = i + 1;
    const photo = SUBJECT_PHOTO[i];
    const back = photo
      ? `<div class="packet-back packet-back-photo" id="pk-${n}" aria-hidden="true" inert>
            <img data-photo="${photo.name}" sizes="(max-width: 767px) 50vw, 300px" alt="" loading="lazy">
            <strong>${esc(s.area)}</strong>
            <span>${esc(s.details)}</span>
          </div>`
      : `<div class="packet-back" id="pk-${n}" aria-hidden="true" inert><strong>${esc(s.area)}</strong><span>${esc(s.details)}</span></div>`;
    return `<li class="packet">
        <div class="packet-card">
          <div class="packet-front"><span class="packet-n" aria-hidden="true">${pad2(n)}</span><svg aria-hidden="true"><use href="#${SUBJECT_ICONS[i]}"/></svg><strong>${esc(s.name)}</strong><small>${esc(s.short)}</small></div>
          ${back}
        </div>
        <button class="packet-toggle" type="button" aria-expanded="false" aria-controls="pk-${n}"><span class="sr-only">${esc(s.name)}: show details</span></button>
      </li>`;
  }).join('\n      ');
}

/* ---------- Who we are ---------- */

function beliefs() {
  return about.beliefs.map((b, i) => `<li class="belief" data-reveal><span class="belief-n" aria-hidden="true">${pad2(i + 1)}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></li>`).join('\n      ');
}

// CREATE: the first letter of each word is the letter on the packet. The home
// hero cycles through the same six words.
function createPackets() {
  return about.create.map((c, i) => `<li class="packet">
        <div class="packet-card">
          <div class="packet-front"><span class="packet-letter" aria-hidden="true">${esc(c.name.charAt(0).toUpperCase())}</span><strong>${esc(c.name)}</strong></div>
          <div class="packet-back" id="cr-${i + 1}" aria-hidden="true" inert><strong>${esc(c.name)}</strong><span>${esc(c.text)}</span></div>
        </div>
        <button class="packet-toggle" type="button" aria-expanded="false" aria-controls="cr-${i + 1}"><span class="sr-only">${esc(c.name.replace(/&/g, 'and'))}: show details</span></button>
      </li>`).join('\n      ');
}
const rotWords = () => about.create.map((c) => `<span class="rot-word">${esc(c.name)}</span>`).join('');
const rotSr = () => `${esc(about.create.map((c) => c.name).join(', '))}.`;

// The nine cards. A card with a photo shows it; without one it shows a doodle
// (icon and tint by position, code). The story on the back is optional.
const NINE_ART = [['i-explorer', 'green'], ['d-sparkle', 'green'], ['d-coin', 'sun'], ['d-flag', 'green'], ['i-talker', 'green'], ['d-hammer', 'green'], ['d-sparkle', 'green'], ['d-sparkle', 'green'], ['d-sparkle', 'green']];
const NINE_STICKERS = [null, 'sparkle', null, null, 'star', null, null, null, 'sun'];

function nineThings() {
  return about.nineThings.map((c, i) => {
    const n = i + 1;
    const name = photoName(c.photo);
    const [icon, tint] = NINE_ART[i];
    const front = name
      ? `<figure class="card-front"><img data-photo="${name}" sizes="(max-width: 767px) 78vw, 380px" alt="${esc(c.photoAlt || '')}" loading="lazy"></figure>`
      : `<div class="card-front card-art" style="--art: var(--tint-${tint})" aria-hidden="true"><svg><use href="#${icon}"/></svg><span class="doodle-note">${esc(c.frontNote || '')}</span></div>`;
    const back = c.story
      ? `
          <div class="card-back" id="story-${n}" aria-hidden="true" inert><p>${esc(c.story)}</p><span class="doodle-note">${esc(c.storyNote || '')}</span></div>
          <button class="cam" type="button" aria-expanded="false" aria-controls="story-${n}" aria-label="Read the story about ${esc(c.title)}"><svg aria-hidden="true"><use href="#d-camera"/></svg></button>`
      : '';
    const sticker = NINE_STICKERS[i] ? ` data-sticker="${NINE_STICKERS[i]}"` : '';
    return `<li class="card"${sticker}>
        <div class="card-inner">
          ${front}${back}
        </div>
        <span class="card-num">${pad2(n)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>
      </li>`;
  }).join('\n      ');
}

/* ---------- Registry ---------- */

const PARTIALS = {
  head, 'body-start': bodyStart, 'site-head': siteHead, menu, subnav, 'site-foot': siteFoot, 'sticky-cta': stickyCta,
  doors, 'next-step': nextStep, 'name-strip': nameStrip, contact, founder, manifesto, 'home-week': homeWeek, dates,
  'day-strip': dayStrip, 'day-cards': dayCards, 'week-rhythm': weekRhythm,
  'summer-favorites': summerFavorites, 'faq-enrichment': faqEnrichment,
  'golf-chips': golfChips, 'golf-sessions': golfSessions,
  'path-words': pathWords, 'hatch-stamp': hatchStamp, 'hatch-soon-note': hatchSoonNote,
  'day-summary': () => microschool.sampleDay.map(s => `<li><strong>${esc(s.time)}</strong> ${esc(s.title)}</li>`).join(''),
  'sample-day-steps': sampleDaySteps, subjects,
  beliefs, 'create-packets': createPackets, 'rot-words': rotWords, 'rot-sr': rotSr, 'nine-things': nineThings,
};

// <!--@name--> or <!--@name:arg--> (the argument picks a variant, e.g. path-words:hatch).
export function renderPartial(name, key, arg) {
  const fn = PARTIALS[name];
  if (!fn) throw new Error(`Unknown partial: <!--@${name}--> in page "${key}"`);
  if (!PAGES[key]) throw new Error(`Unknown page: ${key}`);
  return fn(key, arg);
}
