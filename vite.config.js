import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { SITE, dayOf, openDays, SCHEDULE } from './src/site-config.js';
import { renderPartial, themeAttrs, toneAttr, TONE_CARDS } from './build/partials.js';
import { content, validateContent, resolveToken, esc, safeUrl } from './build/content.js';
import { photoSize } from './build/photos.js';

// The copy in content/*.json is checked before anything is built.
validateContent();

const root = fileURLToPath(new URL('.', import.meta.url));

const open = openDays();
const TOKENS = {
  url: SITE.url,
  opening_long: SITE.openingLong,
  year: String(SITE.copyrightYear),
  email: SITE.email,
  // Weekdays come from SCHEDULE, so moving an activity updates every sentence.
  golf_day: dayOf('golf'),
  cuisine_day: dayOf('cuisine'),
  sample_day: SCHEDULE.find((d) => d.sampleDay).weekday,
  open_days: `${open[0].weekday} through ${open[open.length - 1].weekday}`,
  // The Hatch pill on the microschool card says "soon" while The Hatch is coming soon.
  hatch_soon: content.microschool.hatch.comingSoon ? ' · soon' : '',
};

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  substack: 'Substack',
};

function socialLinks() {
  const links = Object.entries(SOCIAL_LABELS).map(([platform, label]) => {
    const href = safeUrl(SITE.socials[platform]);
    const icon = `<svg aria-hidden="true"><use href="/svg/social-icons.svg#${platform}"/></svg>`;
    const item = href
      ? `<a class="social-link" href="${esc(href)}" target="_blank" rel="noopener">${icon}${label}</a>`
      : `<span class="social-link social-pending">${icon}<span>${label}<small>Coming soon</small></span></span>`;
    return `<li>${item}</li>`;
  });
  return `<ul class="socials" aria-label="Social media and articles">${links.join('')}</ul>`;
}

// For each page: fills the shared partials (<!--@name--> or <!--@name:arg-->, see
// build/partials.js), inlines the social links, fills {{tokens}} and expands
// <img data-photo="name" ...> into src/srcset/size attributes.
//  - {{email}}, {{golf_day}}...: facts above (code).
//  - {{site.tagline}}, {{rich:enrichment.faq.3.a}}, {{photo:microschool.hatch.photo}},
//    {{nbsp:summer.hoursFrom}}: copy from content/*.json (text is escaped).
// Copy is filled first, so a text may itself hold a {{golf_day}} token.
function sitePartials() {
  return {
    name: 'site-partials',
    transformIndexHtml(html) {
      const page = html.match(/<html[^>]*\bdata-page="(\w+)"/)?.[1];
      if (!page) throw new Error('Every page needs <html data-page="...">');
      return html
        .replace(/<html([^>]*)>/, (m, attrs) => `<html${attrs}${themeAttrs()}>`)
        .replace(/<!--@([\w-]+)(?::([\w-]+))?-->/g, (m, name, arg) => renderPartial(name, page, arg))
        .replace(/<(\w+) class="(enrichment-feature|summer-card|microschool-card)"/g, (m, tag, cls) => `<${tag} class="${cls}"${toneAttr(TONE_CARDS[cls])}`)
        .replaceAll('<!--social-links-->', socialLinks())
        .replace(/\{\{([\w-]+(?:[.:][\w-]+)+)\}\}/g, (m, token) => resolveToken(token))
        .replace(/\{\{(\w+)\}\}/g, (m, key) => {
          if (!(key in TOKENS)) throw new Error(`Unknown token: ${m}`);
          return TOKENS[key];
        })
        .replace(/<img data-photo="([\w-]+)"/g, (m, name) => {
          const [w, h] = photoSize(name);
          return `<img src="/img/${name}-lg.webp" srcset="/img/${name}-sm.webp 480w, /img/${name}-lg.webp ${w}w" width="${w}" height="${h}" decoding="async"`;
        });
    },
  };
}

// The five pages are the only entries. editor/ (the Keystatic editor, its own
// project with its own package.json) is never scanned, watched or built here.
const PAGES_HTML = ['index.html', 'enrichment/index.html', 'summer/index.html', 'microschool/index.html', 'about/index.html'];

export default defineConfig({
  appType: 'mpa',
  plugins: [sitePartials()],
  server: { watch: { ignored: ['**/editor/**'] } },
  optimizeDeps: { entries: PAGES_HTML },
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
