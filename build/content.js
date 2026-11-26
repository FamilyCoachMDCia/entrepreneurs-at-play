// The editable copy of the site: content/*.json (written by the Keystatic
// editor in editor/, or by hand). Build time only (Node).
//
// - `content` is the parsed JSON, checked by validateContent() so a bad save
//   fails the build with a clear message instead of publishing a broken page.
// - `{{path.to.value}}` tokens in the page HTML read from it (see resolveToken).
import site from '../content/site.json';
import home from '../content/home.json';
import enrichment from '../content/enrichment.json';
import summer from '../content/summer.json';
import microschool from '../content/microschool.json';
import about from '../content/about.json';
import theme from '../content/theme.json';
import { photoName } from './photos.js';

export const content = { site, home, enrichment, summer, microschool, about, theme };

/* ---------- Text helpers ---------- */

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Plain text plus a tiny safe subset, for the few fields whose copy has inline
// formatting (today: enrichment.faq[].a). Everything is escaped first, then:
//   **bold**  ->  <strong>   *italic*  ->  <em>   [text](url)  ->  <a class="link">
// Only https://, http://, mailto:, /path and #anchor links are turned into links.
export function rich(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/|#)[^)\s]*)\)/g, '<a class="link" href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Links typed in the editor: only web, mail, site and same-page addresses pass.
export const safeUrl = (u) => (/^(https?:\/\/|mailto:|\/|#)/.test(String(u ?? '').trim()) ? String(u).trim() : '');

// "9 a.m." -> "9&nbsp;a.m." (the camp hours are kept on one line)
export const nbsp = (s) => esc(s).replace(/ /g, '&nbsp;');

/* ---------- Theme: swatches and background presets ---------- */

// Door colors the editor offers (plan section 8.5). `css` is the value of
// --door-<program>; `dflt` marks what each program shows when nothing is set.
export const SWATCHES = {
  sand: { label: 'Sand', hex: '#F2E6D3' },
  sun: { label: 'Sun', hex: '#F6DFA0' },
  tan: { label: 'Tan', hex: '#D2B48C' },
  'clay blush': { label: 'Clay blush', hex: '#F3E3D6' },
  sage: { label: 'Sage', hex: '#E8EFE0' },
  mist: { label: 'Mist', hex: '#CFE0DF' },
};
// The look the CSS already has (main.css); choosing these emits nothing.
export const DOOR_DEFAULTS = { enrichment: 'sand', summer: 'mist', microschool: 'sage' };

export const BACKGROUNDS = {
  cream: { label: 'Cream', paper: '#F6F2EA' }, // the approved look
  linen: { label: 'Linen', paper: '#FAF8F3' },  // = ?paper=linen
  milk: { label: 'Milk', paper: '#FDFCF9' },    // = ?paper=milk
};

const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/[-_]+/g, ' ');

export function themeSettings() {
  const doors = {};
  for (const key of Object.keys(DOOR_DEFAULTS)) {
    const id = norm(content.theme.doors?.[key]);
    if (!SWATCHES[id]) throw new Error(`content/theme.json: doors.${key} is "${content.theme.doors?.[key]}", expected one of ${Object.values(SWATCHES).map((s) => s.label).join(', ')}`);
    doors[key] = id;
  }
  const bg = norm(content.theme.background);
  if (!BACKGROUNDS[bg]) throw new Error(`content/theme.json: background is "${content.theme.background}", expected one of ${Object.values(BACKGROUNDS).map((s) => s.label).join(', ')}`);
  return { doors, background: bg };
}

/* ---------- Tokens: {{site.tagline}}, {{rich:enrichment.faq.3.a}}, {{photo:...}} ---------- */

export function get(path) {
  let node = content;
  for (const part of path.split('.')) {
    if (node == null || typeof node !== 'object' || !(part in node)) throw new Error(`Unknown content path: ${path}`);
    node = node[part];
  }
  return node;
}

// Returns the HTML for one `{{...}}` token that holds a dot or a colon.
export function resolveToken(token) {
  const [, mode, path] = token.match(/^(?:(rich|photo|nbsp):)?(.+)$/);
  const value = get(path);
  if (mode === 'photo') {
    const name = photoName(value);
    if (!name) throw new Error(`Content path ${path} has no photo`);
    return name;
  }
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`Content path ${path} is not text`);
  if (mode === 'rich') return rich(value);
  if (mode === 'nbsp') return nbsp(value);
  return esc(value);
}

/* ---------- Validation ---------- */

// 's' text, 's?' optional text, 'b' yes/no, 'p' photo, 'p?' optional photo,
// [item, min, max] list, object = nested fields.
const photo = 'p';
const SCHEMAS = {
  site: {
    tagline: 's', ticker: { golf: 's', afterSchool: 's', microschool: 's' },
    headerCta: { home: 's', enrichment: 's', summer: 's', microschool: 's', about: 's' },
    footerLine: 's', socials: { instagram: 's?', facebook: 's?', substack: 's?' },
  },
  home: {
    heroLede: 's',
    doors: Object.fromEntries(['enrichment', 'summer', 'microschool'].map((k) => [k, { kicker: 's', line: 's', status: 's' }])),
    nameStrip: { result: 's' }, week: { subtitle: 's' },
    dates: [{ date: 's', year: 's', title: 's', text: 's', link: 's' }, 1, 8],
  },
  enrichment: {
    intro: 's',
    golf: {
      title: 's', chips: ['s', 1, 6], button: 's', photo, photoAlt: 's',
      sessions: [{ month: 's', dates: 's?', place: 's?', placeLink: 's?', comingSoon: 'b' }, 1, 8],
    },
    afternoons: {
      arts: { name: 's', weekLabel: 's' },
      golf: { name: 's', title: 's', weekLabel: 's', chipNote: 's', startsLine: 's' },
      ...Object.fromEntries(['create', 'podcast', 'cuisine'].map((k) => [k, { name: 's', weekLabel: 's', title: 's?', blurb: 's', hours: 's', comingSoon: 'b', ask: 's' }])),
    },
    faq: [{ q: 's', a: 's' }, 1, 12],
  },
  summer: { hoursFrom: 's', hoursTo: 's', intro: 's', activities: [{ name: 's', text: 's' }, 4, 4] },
  microschool: {
    intro: 's',
    hatch: { text: 's', words: ['s', 3, 3], comingSoon: 'b', soonNote: 's?', button: 's', photo, photoAlt: 's' },
    studio: { text: 's', words: ['s', 3, 3], button: 's', photo, photoAlt: 's' },
    morning: { text: 's', photo, photoAlt: 's' },
    afternoon: { text: 's', photo, photoAlt: 's' },
    sampleDay: [{ time: 's', title: 's', text: 's', photo, photoAlt: 's' }, 3, 12],
    subjects: [{ name: 's', area: 's', short: 's', details: 's' }, 11, 11],
  },
  about: {
    lede: 's',
    beliefs: [{ title: 's', text: 's' }, 1, 16],
    create: [{ name: 's', text: 's' }, 6, 6],
    nineThings: [{ title: 's', text: 's', photo: 'p?', photoAlt: 's?', frontNote: 's?', story: 's?', storyNote: 's?' }, 9, 9],
    founder: { quote: 's', bio: 's' },
  },
  theme: { doors: { enrichment: 's', summer: 's', microschool: 's' }, background: 's' },
};

function check(schema, value, path, errors) {
  if (typeof schema === 'string') {
    const optional = schema.endsWith('?');
    const kind = optional ? schema.slice(0, -1) : schema;
    if (value == null || value === '') {
      if (!optional && kind !== 'b') errors.push(`${path} is empty`);
      return;
    }
    if (kind === 's' && typeof value !== 'string') errors.push(`${path} must be text`);
    if (kind === 'b' && typeof value !== 'boolean') errors.push(`${path} must be yes/no`);
    if (kind === 'p' && !(typeof value === 'string' || typeof value === 'object')) errors.push(`${path} must be a photo`);
    return;
  }
  if (Array.isArray(schema)) {
    const [item, min, max] = schema;
    if (!Array.isArray(value)) { errors.push(`${path} must be a list`); return; }
    if (value.length < min || value.length > max) errors.push(`${path} has ${value.length} items, expected ${min === max ? min : `${min} to ${max}`}`);
    value.forEach((v, i) => check(item, v, `${path}.${i}`, errors));
    return;
  }
  if (value == null || typeof value !== 'object') { errors.push(`${path} is missing`); return; }
  for (const key of Object.keys(schema)) check(schema[key], value[key], `${path}.${key}`, errors);
}

export function validateContent() {
  const errors = [];
  for (const [name, schema] of Object.entries(SCHEMAS)) check(schema, content[name], name, errors);
  // Required photos must name something.
  const need = [
    ['enrichment.golf.photo', content.enrichment?.golf?.photo], ['microschool.hatch.photo', content.microschool?.hatch?.photo],
    ['microschool.studio.photo', content.microschool?.studio?.photo], ['microschool.morning.photo', content.microschool?.morning?.photo],
    ['microschool.afternoon.photo', content.microschool?.afternoon?.photo],
    ...(content.microschool?.sampleDay ?? []).map((s, i) => [`microschool.sampleDay.${i}.photo`, s.photo]),
  ];
  for (const [path, ref] of need) if (!photoName(ref)) errors.push(`${path} has no photo`);
  // A card with a photo needs its description (alt text).
  (content.about?.nineThings ?? []).forEach((c, i) => {
    if (photoName(c.photo) && !c.photoAlt) errors.push(`about.nineThings.${i}.photoAlt is empty (describe the photo)`);
  });
  if (!errors.length) themeSettings();
  if (errors.length) throw new Error(`The content files have problems:\n  - ${errors.join('\n  - ')}`);
}
