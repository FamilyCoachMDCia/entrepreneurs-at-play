# Entrepreneurs at Play: website

Vite + vanilla JS, GSAP (ScrollTrigger, SplitText, DrawSVG, MotionPath), Lenis, Three.js (home page only).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

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

Each page file holds its own sections plus `<!--@name-->` markers. `vite.config.js`
replaces them with the partials in `build/partials.js`: head, header and ticker,
phone menu, section row (`subnav`), doors, next step, contact form, footer, the
floating phone button and the schedule pieces. Page titles, colors and calls to
action live in `src/pages.js` (shared with the browser).

## Site settings and the week

`src/site-config.js` holds the microschool opening date, the contact email, the
site URL and `SCHEDULE`, the week. Moving an activity to another day means
changing its `weekday` there: the enrichment day strip and cards, the microschool
week, the sample day ("Follow the sun through a …"), the form and every sentence
that names the day follow. Vite fills the `{{tokens}}` in the HTML from it.

The golf program uses the key `golf` (SCHEDULE key, form value, `data-program-cta`,
`#golf` anchor, `.golf-*` classes, `{{golf_day}}` token). An activity with
`soon: true` is not confirmed yet: its card shows a "Coming soon" tag instead of
hours, its button reads "Get updates", the home week says "Coming soon" and the
form option ends in "· coming soon". Remove the flag when a partner confirms.
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
move between pages. `?paper=off` returns to the current background. The colors
are in `src/styles/pages.css` (end of file).

## Header mark test (Arch & Sun)

The header shows the FamilyCoachMD logo by default. Add `?mark=arch` to any address to see the
small Arch & Sun mark beside "Entrepreneurs at Play" instead (kept for the session);
`?mark=off` returns to the logo. The switch is `data-mark="arch"` on `<html>` (head script in
`build/partials.js`); the mark is `.nav-mark` in the header partial, styled in `main.css`.
To adopt it, drop the `.nav-symbol` image and the `html[data-mark]` rules.

## Summer color test

`--door-summer` (main.css, default = `--sky`) paints the Summer door, card, menu
block and curtain. Add `?summer=yellow` or `?summer=brown` to any address to try
the other colors (kept for the session); `?summer=off` returns to blue. The
colors and the text adjustments are at the end of `src/styles/pages.css`. To adopt
one, change the `--door-summer` default and drop the test block.

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
  Re-export after changing originals in `img/`: `python -I tools/images.py img public/img`
- `public/logo/`: FamilyCoachMD SVGs traced from `FamilyCoachMD.png` (`tools/vectorize.py`).
- `src/partials/sprite.svg`: the shared icons.
- Brand icons: `public/favicon.svg` (Arch & Sun, simple version), `public/favicon-32.png`, `public/apple-touch-icon.png` and the share image `public/og-image.png` (1200 x 630) are generated by `python -I tools/brand_assets.py` (Pillow, Georgia for the text). The mark comes from `entregas/marca-ep/KIT-MARCA-EP/03-simbolo-porta/`. The EP monogram is not approved: never use EP letters.
- Dev only: `?shot=<section-id>&dy=<px>` skips the loader and the curtain and jumps to a section (used for screenshots).
