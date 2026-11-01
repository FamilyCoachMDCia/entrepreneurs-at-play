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

## Visit form

Without setup, "Request a visit" opens the visitor's email app with a pre-filled
message to Grow@familycoachmd.com. To receive submissions directly, create a
Formspree form and add its URL to the form: `<form ... data-endpoint="https://formspree.io/f/XXXX">`.

## Assets and tools

- `public/img/`: photos exported by `tools/images.py` (WebP `-sm` 480 px and `-lg` up to 1200 px; B&W photos get the forest/cream duotone).
  Re-export after changing originals in `img/`: `python -I tools/images.py img public/img`
- `public/logo/`: FamilyCoachMD SVGs traced from `FamilyCoachMD.png` (`tools/vectorize.py`).
- `src/partials/logo-anim.svg`: the animatable logo used by the loader (`tools/logo_anim.py`), inlined into `index.html` at build time.
- Dev only: `?shot=<section-id>&dy=<px>` skips the loader and jumps to a section (used for screenshots).
