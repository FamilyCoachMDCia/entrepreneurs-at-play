# Entrepreneurs at Play: website

Vite + vanilla JS, GSAP (ScrollTrigger, SplitText, DrawSVG, MotionPath), Lenis, Three.js (home page only).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # exports uploaded photos, then outputs dist/
```

`editor/` is a separate app (Astro + Keystatic, its own `package.json`) that edits
`content/`. The site build never builds, scans or watches it; see "Content and the editor".

## Pages

| Path | File | What it holds |
|---|---|---|
| `/` | `index.html` | Hero with the 3D toys, the three program doors, "What's in a name?" (short), contact |
| `/enrichment/` | `enrichment/index.html` | Golf (key `golf`, anchor `#golf`), the weekday cards, how it works, questions, contact |
| `/summer/` | `summer/index.html` | Summer camp, the after-school favorites all day, contact |
| `/microschool/` | `microschool/index.html` | Beta at capacity, The Hatch and The Studio, the week, the sun-dial day, subjects, promises, practical part, questions, waitlist |
| `/about/` | `about/index.html` | Who we are: the name, CREATE flow, why EP, nine things, founder, FamilyCoachMD, partners, contact |

Every page ends with the contact form, opened on that page's own program.

## Shared parts (build time)

Each page file holds its own sections plus `<!--@name-->` markers (or
`<!--@name:arg-->`, the argument picks a variant, e.g. `path-words:hatch`).
`vite.config.js` replaces them with the partials in `build/partials.js`: head, header
and ticker, phone menu, section row (`subnav`), doors, next step, contact form,
footer, the floating phone button, the schedule pieces and the lists that come from
`content/` (golf chips and sessions, sample day, subjects, beliefs, CREATE, nine
things). Page titles, colors and calls to action live in `src/pages.js` (shared
with the browser).

## Content and the editor

The copy that Dr. Che may change is in `content/*.json`, edited in `editor/` (Keystatic,
see `editor/README.md`) or by hand. The build reads it (`build/content.js` checks every file
first, so a bad save fails the build with a clear message instead of publishing a broken page).

| File | Holds |
|---|---|
| `content/site.json` | tagline, announcement bar, header button labels, footer line, social links |
| `content/home.json` | hero paragraph, the three doors (kicker, line, badge), name strip, week subtitle, dates |
| `content/enrichment.json` | intro, golf block, the afternoons (name, blurb, hours, "coming soon"), FAQ |
| `content/summer.json` | camp hours, intro, the four activities |
| `content/microschool.json` | intro, The Hatch and The Studio, mornings/afternoons, sample day, eleven subjects |
| `content/about.json` | lede, 12 beliefs, CREATE words, nine things, founder quote and bio |
| `content/theme.json` | door colors and page background (below) |

Tokens in the page HTML, filled at build (text is HTML-escaped):

- `{{site.tagline}}`: any path into `content/`. `{{photo:microschool.hatch.photo}}` gives a
  photo name (for `data-photo`), `{{nbsp:summer.hoursFrom}}` keeps spaces together,
  `{{rich:...}}` allows the tiny subset below.
- `{{email}}`, `{{golf_day}}`, `{{cuisine_day}}`, `{{sample_day}}`, `{{open_days}}`,
  `{{opening_long}}`, `{{year}}`, `{{url}}`, `{{hatch_soon}}`: facts from `src/site-facts.js` and the schedule.
  A copy field may itself contain one of them (the intro says `golf on {{golf_day}}s`).
- Inline formatting exists in one place: the Enrichment FAQ answers (`enrichment.faq[].a`)
  accept `[words](https://address)`, `**bold**` and `*italic*` (links only to http(s), mailto, `/path`, `#anchor`).
  Everything else is plain text.

Still in code only: sections and layout, animations, the contact form, SEO tags, the
weekday / icon / anchor of each afternoon (`STRUCTURE` in `src/site-config.js`), the
doors' drawings, the golf badge ring text, the "Where enrichment leads" titles, the
icons of the subjects, summer activities and nine-things doodles.

### Colors (`content/theme.json`)

```json
{ "doors": { "enrichment": "Sand", "summer": "Mist", "microschool": "Sage" }, "background": "Cream" }
```

- Door colors: `Sand #F2E6D3`, `Sun #F6DFA0`, `Tan #D2B48C`, `Clay blush #F3E3D6`, `Sage #E8EFE0`,
  `Mist #CFE0DF`. They feed `--door-enrichment`, `--door-summer`, `--door-microschool` (main.css),
  which paint the home doors, the menu block, the curtain, the "next step" doors and the card at the
  top of the program page (Enrichment golf card, Summer card, Microschool card).
- Background: `Cream` (`#F6F2EA`, today's look), `Linen` or `Milk`. The notebook grid always stays.
- The default values write nothing, so the default HTML is exactly the old HTML. Anything else is
  added by `build/partials.js`: a `<style id="theme">` in the head (`html:root` outranks main.css) and
  `data-bg="linen|milk"` on `<html>` reuses the `?paper=` variables. A door, menu block or top card painted
  **Sun** or **Tan** also gets `data-tone="sun|tan"` (any program): `pages.css` redefines the small-text colors
  inside it (`--olive`, `--clay`, `--ink-soft`, `--forest`, the stamp, the drawings) so small text stays at 4.5:1
  or better, and the big numerals at 3:1 or better. Checked in the browser with all three programs on Tan and on Sun.
- The URL tests still win: `?paper=linen|milk|off` and `?summer=yellow|brown|off` apply on top of the setting
  and `off` returns to the configured look.

### Photos

Two sources, both referred to by name (`public/img/<name>-sm.webp` 480 px and `-lg.webp` up to 1200 px):

- **Library**: the originals in `img/`, exported by `python -I tools/images.py img public/img`.
- **Uploads**: files in `content/photos/` (written by the editor). `tools/build-photos.mjs` (sharp, pinned) runs
  as `prebuild` / `predev` (`npm run photos`, `-- --force` to redo all): orientation applied, metadata (EXIF, GPS,
  ICC) removed, black-and-white photos get the forest/cream duotone and color ones the warm grade, WebP quality 72,
  never enlarged. A photo is skipped when its exports exist and the source hash is unchanged. The name is the file
  path without extension, lower case, folders joined with `-`.

`width` and `height` of every `data-photo` image are read from the exported `-lg.webp` at build
(`build/photos.js`), so there is no size table to maintain.

### Vercel

The site project builds `main` with `npm run build`. The root `vercel.json` has `ignoreCommand`
(`git diff --quiet HEAD^ HEAD -- . ':(exclude)editor'`) so a commit that only touches `editor/` does not
rebuild the site. The command compares against `VERCEL_GIT_PREVIOUS_SHA` (the last built commit, so a push of
several commits is judged as a whole), falls back to `HEAD^`, and exits 1 (= build) whenever that commit is not
in the clone. The editor is a second Vercel project with Root Directory `editor` (details in
`editor/README.md`).

## Site settings and the week

`src/site-facts.js` holds the site URL, the contact email and the microschool opening
date (also used by the browser). `src/site-config.js` holds the structure of the week
(`STRUCTURE`: weekday, icon, anchor, color of each afternoon) and builds `SCHEDULE`
from it plus the words in `content/enrichment.json`. Moving an activity to another day means
changing its `weekday` in `STRUCTURE`: the enrichment day strip and cards, the microschool
week, the sample day ("Follow the sun through a ..."), the form and every sentence
that names the day follow. Vite fills the `{{tokens}}` in the HTML from it.

The golf program uses the key `golf` (SCHEDULE key, form value, `data-program-cta`,
`#golf` anchor, `.golf-*` classes, `{{golf_day}}` token). An activity with
`soon: true` is not confirmed yet: its card shows a "Coming soon" tag instead of
hours, its button reads "Get updates", the home week says "Coming soon" and the
form option ends in "· coming soon". Untick "Coming soon" in the editor (`comingSoon` in `content/enrichment.json`) when a partner confirms.
The Hatch is a form program of its own (`hatch`, "The Hatch · updates", ages 2–6)
while it is "coming soon".

## Page transitions

`src/transitions.js`. A click on a door opens it and its color fills the screen;
any other link to another page raises that page's color from the bottom. The new
page is born under the same curtain (rendered in its HTML, shown by the inline
head script) and the curtain lifts once it is ready. The intro loader only plays on
the home page for visitors arriving from outside: the Arch & Sun mark draws itself (arch from both feet,
sun rising from the ground line, rays popping out), then "Entrepreneurs at Play" and
"A FamilyCoachMD program" (markup in `index.html`, animation in `src/loader.js`, start states in `main.css`). Reduced motion and the "pause
all motion" button skip the animation.

## Lighter background test

Add `?paper=linen` or `?paper=milk` to any address; the choice stays while you
move between pages. `?paper=off` returns to the background set in `content/theme.json`
(Cream by default). The colors are in `src/styles/pages.css` (end of file).

## Header mark test (Arch & Sun)

The header shows the FamilyCoachMD logo by default. Add `?mark=arch` to any address to see the
small Arch & Sun mark beside "Entrepreneurs at Play" instead (kept for the session);
`?mark=off` returns to the logo. The switch is `data-mark="arch"` on `<html>` (head script in
`build/partials.js`); the mark is `.nav-mark` in the header partial, styled in `main.css`.
To adopt it, drop the `.nav-symbol` image and the `html[data-mark]` rules.

## Summer color test

`--door-summer` (main.css, default = `--sky`) paints the Summer door, card, menu
block and curtain. Add `?summer=yellow` or `?summer=brown` to any address to try
the other colors (kept for the session); `?summer=off` returns to the color set in
`content/theme.json` (Mist, blue, by default). The colors and the text adjustments are at
the end of `src/styles/pages.css`. Choosing Sun or Tan for Summer in `content/theme.json`
adopts them (same variables, same contrast fixes).

## Program requests

Program links preselect the corresponding request, also across pages. The
microschool waitlist uses the child's age to identify The Hatch or The Studio.
"Prepare my email" opens the visitor's email app with the request filled in. The
visitor sends the email from that app.

## Publishing extras

`public/robots.txt`, `public/sitemap.xml`, `public/404.html` and `vercel.json`
(short links `/golf`, `/t6` (old, same target), `/waitlist`, `/contact`) assume the current domain
(https://entrepreneurs-at-play.vercel.app). Update them and `url` in
`src/site-config.js` when the final domain is chosen. Old links to `/#section`
are forwarded to the new pages by a small script in the home page head.

## Assets and tools

- `public/img/`: photos exported by `tools/images.py` (WebP `-sm` 480 px and `-lg` up to 1200 px; B&W photos get the forest/cream duotone).
  Editor uploads are exported by `tools/build-photos.mjs` (see "Photos").
  Re-export after changing originals in `img/`: `python -I tools/images.py img public/img`
- `public/logo/`: FamilyCoachMD SVGs traced from `FamilyCoachMD.png` (`tools/vectorize.py`).
- `src/partials/sprite.svg`: the shared icons.
- Brand icons: `public/favicon.svg` (Arch & Sun, simple version), `public/favicon-32.png`, `public/apple-touch-icon.png` and the share image `public/og-image.png` (1200 x 630) are generated by `python -I tools/brand_assets.py` (Pillow, Georgia for the text). The mark comes from `entregas/marca-ep/KIT-MARCA-EP/03-simbolo-porta/`. The EP monogram is not approved: never use EP letters.
- Dev only: `?shot=<section-id>&dy=<px>` skips the loader and the curtain and jumps to a section (used for screenshots).

## Photo credits

Free-license photos from Pexels (no on-site attribution required; kept here for the record). Originals are stored in `img/` under the site name, metadata stripped.

| Site photo | Used for | Pexels |
|---|---|---|
| `studio-making` | The Studio card, Microschool page | https://www.pexels.com/photo/7868834/ |
| `morning-discussion` | Microschool mornings | https://www.pexels.com/photo/5621973/ |
| `afternoon-making` | Microschool afternoons | https://www.pexels.com/photo/10032930/ |
| `day-reading` | Sample day, 10:15 Literature Is Lit | https://www.pexels.com/photo/5604947/ |
| `day-prep` | Sample day, 1:00 Podcast prep | https://www.pexels.com/photo/5896590/ |
| `day-lunch` | Sample day, 12:00 Lunch and free play | https://www.pexels.com/photo/5621921/ |
| `day-mindful` | Sample day, 9:00 Mindfulness | https://www.pexels.com/photo/5063290/ |
