import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { SITE } from './src/site-config.js';

// Width x height of each exported -lg photo (see tools/images.py).
const PHOTOS = {
  'business-fair': [1000, 721], capitol: [750, 1000], cooking: [795, 900],
  cuisine: [1200, 861], flight: [1100, 802], founder: [700, 933],
  garden: [1000, 737], golf: [960, 540], guitar: [541, 900], hens: [1000, 726],
  horse: [1000, 716], mentoring: [575, 1000], podcast: [800, 1200],
  speaking: [887, 876], surprise: [1100, 855], typewriter: [600, 450],
};

const TOKENS = {
  url: SITE.url,
  opening_long: SITE.openingLong,
  opening_short: SITE.openingShort,
  opening_month_year: SITE.openingMonthYear.toUpperCase(),
  spots: String(SITE.spotsToStart),
  max_children: String(SITE.maxChildren),
  year: String(SITE.copyrightYear),
  email: SITE.email,
};

// Expands <img data-photo="name" ...> into src/srcset/size attributes,
// inlines the animated logo where <!--logo-anim--> appears, fills {{tokens}}
// from src/site-config.js and writes the visit-week <option>s.
function sitePartials() {
  return {
    name: 'site-partials',
    transformIndexHtml(html) {
      const logo = readFileSync(new URL('./src/partials/logo-anim.svg', import.meta.url), 'utf8');
      const weeks = SITE.visitWeeks
        .map((w) => `<option value="${w.label}" data-start="${w.start}">${w.label}</option>`)
        .join('');
      return html
        .replace('<!--logo-anim-->', logo)
        .replace('<!--visit-weeks-->', weeks)
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
  plugins: [sitePartials()],
  // three.js is one lazy chunk (~130 KB gzip) loaded after first paint.
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 600 },
});
