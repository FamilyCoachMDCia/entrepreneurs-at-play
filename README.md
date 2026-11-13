# Entrepreneurs at Play: landing page

Vite + vanilla JS, GSAP (ScrollTrigger, SplitText, DrawSVG, MotionPath), Lenis, Three.js (hero only).
The design plan is in `preparacao-entrepreneurs-at-play.md`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Deploy (Vercel)

```bash
npx vercel           # first time: link/create the project, gives a preview URL
npx vercel --prod    # publish to production
```

Vercel detects Vite automatically (build `npm run build`, output `dist`).

## Site settings

The microschool beta opening date, contact email and site URL live in
`src/site-config.js`. Vite fills the corresponding `{{tokens}}` in `index.html`.

## Program requests

Program links preselect the corresponding request. The microschool waitlist
uses the child's age to identify The Hatch or The Studio. “Prepare my email”
opens the visitor's email app with the request filled in. The visitor sends the
email from that app.

## Publishing extras

`public/robots.txt`, `public/sitemap.xml` and `public/404.html` assume the
current domain (https://entrepreneurs-at-play.vercel.app). Update them and
`url` in `src/site-config.js` when the final domain is chosen.

## Assets and tools

- `public/img/`: photos exported by `tools/images.py` (WebP `-sm` 480 px and `-lg` up to 1200 px; B&W photos get the forest/cream duotone).
  Re-export after changing originals in `img/`: `python -I tools/images.py img public/img`
- `public/logo/`: FamilyCoachMD SVGs traced from `FamilyCoachMD.png` (`tools/vectorize.py`).
- `src/partials/logo-anim.svg`: the animatable logo used by the loader (`tools/logo_anim.py`), inlined into `index.html` at build time.
- Dev only: `?shot=<section-id>&dy=<px>` skips the loader and jumps to a section (used for screenshots).
