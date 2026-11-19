import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SITE, dayOf, openDays, SCHEDULE } from './src/site-config.js';
import { renderPartial } from './build/partials.js';

const root = fileURLToPath(new URL('.', import.meta.url));

// Width x height of each exported -lg photo (see tools/images.py).
const PHOTOS = {
  'nature-play': [703, 799],
  'guitar-detail': [541, 342],
  'hatch-blocks': [1200, 800],
  'studio-making': [508, 339],
  baking: [1079, 1617], 'business-fair': [1000, 721], capitol: [750, 1000], cooking: [795, 900],
  cuisine: [1200, 861], flight: [1100, 802], founder: [700, 933],
  garden: [1000, 737], golf: [960, 540], guitar: [541, 900], hens: [1000, 726],
  horse: [1000, 716], mentoring: [575, 1000], podcast: [800, 1200],
  speaking: [887, 876], surprise: [1100, 855], typewriter: [600, 450],
};

const open = openDays();
const TOKENS = {
  url: SITE.url,
  opening_long: SITE.openingLong,
  year: String(SITE.copyrightYear),
  email: SITE.email,
  // Weekdays come from SCHEDULE, so moving an activity updates every sentence.
  t6_day: dayOf('t6'),
  cuisine_day: dayOf('cuisine'),
  sample_day: SCHEDULE.find((d) => d.sampleDay).weekday,
  open_days: `${open[0].weekday} through ${open[open.length - 1].weekday}`,
};

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  substack: 'Substack',
};

function socialLinks() {
  const links = Object.entries(SOCIAL_LABELS).map(([platform, label]) => {
    const href = SITE.socials[platform];
    const icon = `<svg aria-hidden="true"><use href="/svg/social-icons.svg#${platform}"/></svg>`;
    const item = href
      ? `<a class="social-link" href="${href}" target="_blank" rel="noopener">${icon}${label}</a>`
      : `<span class="social-link social-pending">${icon}<span>${label}<small>Coming soon</small></span></span>`;
    return `<li>${item}</li>`;
  });
  return `<ul class="socials" aria-label="Social media and articles">${links.join('')}</ul>`;
}

// For each page: fills the shared partials (<!--@name-->, see build/partials.js),
// inlines the logo and social links, fills {{tokens}} and expands
// <img data-photo="name" ...> into src/srcset/size attributes.
function sitePartials() {
  return {
    name: 'site-partials',
    transformIndexHtml(html) {
      const page = html.match(/<html[^>]*\bdata-page="(\w+)"/)?.[1];
      if (!page) throw new Error('Every page needs <html data-page="...">');
      const logo = readFileSync(new URL('./src/partials/logo-anim.svg', import.meta.url), 'utf8');
      return html
        .replace(/<!--@([\w-]+)-->/g, (m, name) => renderPartial(name, page))
        .replace('<!--logo-anim-->', logo)
        .replaceAll('<!--social-links-->', socialLinks())
        .replace(/\{\{(\w+)\}\}/g, (m, key) => {
          if (!(key in TOKENS)) throw new Error(`Unknown token: ${m}`);
          return TOKENS[key];
        })
        .replace(/<img data-photo="([\w-]+)"/g, (m, name) => {
          const dims = PHOTOS[name];
          if (!dims) throw new Error(`Unknown photo: ${name}`);
          const [w, h] = dims;
          return `<img src="/img/${name}-lg.webp" srcset="/img/${name}-sm.webp 480w, /img/${name}-lg.webp ${w}w" width="${w}" height="${h}" decoding="async"`;
        });
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [sitePartials()],
  // three.js is one lazy chunk (~130 KB gzip), requested only by the home page.
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        enrichment: `${root}enrichment/index.html`,
        summer: `${root}summer/index.html`,
        microschool: `${root}microschool/index.html`,
        about: `${root}about/index.html`,
      },
    },
  },
});
