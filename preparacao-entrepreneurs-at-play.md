# Preparation — Entrepreneurs at Play landing page

> Design and build plan for a public, award-level landing page. **Planning only: nothing here has been built yet.**
> Prepared 2026-11-01 by Haderach Solutions for Dr. Larisa Che, MD (FamilyCoachMD).
> All on-page copy below is final-draft English, ready to use.

---

## 1. Project snapshot

| | |
|---|---|
| **Business** | Entrepreneurs at Play (EP), "A FamilyCoachMD program" |
| **What it is** | A physician-founded, multi-age collaborative home educator immersion program that runs like a microschool in the Omaha, Nebraska area. Mornings are rigorous academics taught through the Socratic method. Afternoons are real-world learning out in the community. |
| **Founder** | Dr. Larisa Che, MD, board-certified child and adolescent psychiatrist, founder of FamilyCoachMD, Omaha mom |
| **Key facts** | Opens **January 4, 2027** · ages 2–11 · **5 children to start, up to 12** · 2 trained adults on site (1 : 2.5) · Mon–Fri, 9 a.m.–4 p.m. · spring semester Jan 4 – May 28 · location "Omaha area, announced soon" · fees by email |
| **Future offers** | After-school and "school's out" enrichment weeks, summer camp. (A younger-children sub-brand was mentioned once on WhatsApp. It stays **out of this landing page** until Larisa defines it.) |
| **Single goal** | **Book a visit.** Every section ends one tap away from "Book a visit" → Grow@familycoachmd.com |
| **Audience** | Omaha parents of 2–11 year olds: homeschool families, families of advanced or gifted learners, and families looking for enrichment beyond the classroom. They are educated and research-minded, and want both rigor and a happy childhood. |
| **First 5 seconds** | *"This is a serious, doctor-led program, and my child would have the time of their life here."* Warm, trustworthy, joyful. Never chaotic, never clinical. |
| **Stack** | Vite + vanilla JS · GSAP 3 (ScrollTrigger, SplitText, Draggable, Flip, DrawSVG) · Lenis smooth scroll · Three.js (hero only) · SVG logo animation for the loader |
| **Language** | English (US) |

---

## 2. Big idea: "Play'sWork, and children grow"

The FamilyCoachMD logo is a **hand-drawn stem with two leaves, one big and one small**, like a parent and a child growing from the same line. That stem becomes the site's signature:

1. **The Growth Line.** One continuous, hand-drawn olive stem (same stroke style as the logo) **draws itself down the whole page as you scroll**. It runs behind sections like a garden path, and at each section it **sprouts a pair of leaves** (big + small) that unfold. By the footer, the line ends in the FamilyCoachMD logo. The page *is* a child growing up.
2. **The logo grows.** The loading screen is the vectorized FamilyCoachMD logo **growing like a real plant**: the stem draws itself, the leaves unfurl, and the wordmark writes itself in letter by letter. It sets up the growth metaphor in about 2.5 seconds.
3. **The Toy Box.** The hero is a soft 3D scene of clay-like objects, one for each of the 8 things that set EP apart (golf ball, microphone, paper plane, typewriter key, coin, guitar, leaf, globe). They float and drift away from the cursor. Play made visible.

**Personality in one line:** *Headspace's warmth and playfulness × Patagonia's real-world, outdoor storytelling × a quiet, earthy luxury that belongs to EP alone.*

**What makes it ours, not a copy:** Headspace is flat-illustration and app-commerce. Patagonia is e-commerce and big photography. EP gets a **storybook-garden** layer neither has: the drawing Growth Line, seed-packet cards, the sun-dial day, and hand-drawn doodle notes on real photos, plus a **3D toy box** that neither uses.

---

## 3. Brand analysis

### 3.1 New logo: `FamilyCoachMD.png` (3392 × 1248, transparent PNG), now vectorized

| Element | Observation | Approx. hex |
|---|---|---|
| Wordmark "FamilyCoachMD" | Warm old-style serif, letters tilted to ride the stem's wave, with a cream "halo" gap where the "y" and "D" cross the stem | ochre `#B5894C` |
| Stem | Hand-inked, tapered, one sweeping curve that underlines the name and rises into the leaves | charcoal-olive `#3C4136` |
| Big leaf | Matte, thick dark outline, center vein | olive `#6E7157` |
| Small leaf | Lighter, with a sage outline | tan `#BDAF90` / sage `#9A9B86` |

**Vector files (done)** in `entregas/site/logo/`. They were traced from the PNG one color layer at a time, so every part has its own `<path id>` and can animate on its own. Shared `viewBox="197 79 3162 1043"`.

| File | Use |
|---|---|
| `familycoachmd-logo.svg` | Full-color master. Paths: `#leaf-small`, `#leaf-small-line`, `#leaf-big`, `#stem`, `#wordmark` |
| `familycoachmd-logo-on-dark.svg` | Dark sections: cream stem, light-ochre wordmark (`#D9B27A`) |
| `familycoachmd-logo-mono-ink.svg` / `-mono-cream.svg` | One-color versions (print, watermark, stamps) |
| `familycoachmd-symbol.svg` | Stem + leaves only, with the letter gaps closed (favicon, Growth Line ending, stickers) |
| `familycoachmd-wordmark.svg` | Letters only |

Build notes: the traced stem is a **filled shape**, not a stroke. To "draw" it, reveal it through a **mask whose stroke follows the stem's centerline** (a hand-drawn polyline path, `stroke-width` ≈ 1.4× the stem's thickest point, animated with DrawSVG). For per-letter animation, split `#wordmark` into one `<path>` per glyph (13 sub-paths, ordered left to right by bounding box) at build time.

### 3.2 Photos (17 real program photos from her prototype)

Mood: **candid, real, community-rooted.** Black kids and families, farms, kitchens, a flight simulator, a business fair. About half are **black-and-white** and half warm color. Resolution is modest (≈ 540–1206 px wide).

**Design decisions from this:**
- **Unify the two photo worlds.** B&W photos get a **forest/cream duotone** (`#1F2A17` → `#F6F2EA`) applied at export. Color photos keep natural color but get a light warm grade (+5 warmth, −8 saturation). Every photo gets a subtle **film-grain overlay** (CSS, 4% opacity). Low resolution then reads as intentional texture, not as a flaw.
- **No photo is ever full-bleed wider than ~1100 px.** Full-width moments use photos *inside* shapes (rounded frames, a giant "5", a leaf mask) or a two-up split, never one stretched 2560 px image. **Ask Larisa for 3–5 high-res originals** (hero-worthy outdoor shots) to unlock true Patagonia-style full-bleed moments later.
- **Consent.** Confirmed by Ithalo (2026-11-01): all photos are already authorized for public use.

### 3.3 Old concept (`Entrepreneurs at Play.html`): kept / changed

- **Keep:** all copy and facts (it's well written), the 8 differentiators, the 11 domains with their playful names, the forest/brown/gold palette direction, the FAQ, the founder quote, "Play'sWork", "Inspiring thinkers, crafting nation builders."
- **Change:** Poppins gives way to a warmer serif display (see 3.5), because Poppins reads generic. The flat white page becomes a cream "paper" with motion. Long text walls are cut into interactive moments. The single long scroll gains rhythm through color-banded sections.

### 3.4 Color system

Built from the old concept + the new logo, with one "play" accent borrowed in spirit from Headspace's brightness.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F6F2EA` | Main background (warm cream) |
| `--paper-2` | `#EDE6D8` | Alternate band, cards |
| `--ink` | `#23261F` | Body text, outlines (13.9:1 on paper) |
| `--forest` | `#3B5E1A` | Primary brand, buttons, links (7.0:1 on paper) |
| `--forest-deep` | `#1F2A17` | Dark sections, duotone shadow |
| `--olive` | `#6B7055` | Growth Line stroke, big leaf |
| `--sage` | `#A9AE93` | Small leaf, dividers, soft fills |
| `--ochre` | `#B8894C` | Logo gold, numerals, highlights. **Large text and decoration only** (≈2.9:1 on paper) |
| `--clay` | `#744A26` | Secondary text accents, seed-packet ink |
| `--marigold` | `#F2B33D` | **Play accent**: stickers, sun, the "5" badge, hover states. ≤5% of any screen |
| `--sky` | `#CFE0DF` | Afternoon / outdoors band |

Rules: cream dominates (~60%), forest and deep forest (~25%), ochre/clay (~10%), marigold as spice (~5%). Dark mode is **not** offered on this public landing page: the paper texture is part of the identity.

### 3.5 Typography

| Use | Font | Weights | Fallback | Why |
|---|---|---|---|---|
| Display / headlines | **Fraunces** (Google, variable: `opsz`, `SOFT`, `WONK`) | 400, 600, 800 + *italic* | `Georgia, serif` | Its soft, rounded serifs echo the logo's slab wordmark. Set `SOFT 100`, `WONK 1` on italic words for a storybook wink. |
| Body / UI | **Figtree** (kept from her concept) | 400, 500, 600 | `system-ui, sans-serif` | Friendly geometric sans, close cousin of Headspace's Apercu, very legible. |
| Doodle notes | **Caveat** | 500, 700 | `cursive` | Hand-written annotations on photos ("he made $14 that day!"). Max 6 words, never for information-critical text. |

Scale (fluid, `clamp`): H1 `clamp(3rem, 9vw, 8.5rem)` · H2 `clamp(2.1rem, 5vw, 4.25rem)` · H3 `clamp(1.3rem, 2.2vw, 1.75rem)` · body `clamp(1rem, 1.1vw, 1.125rem)` / line-height 1.6 · eyebrow 0.8rem, uppercase, letter-spacing .14em, Figtree 600.
Signature move: in every headline **one word is set in Fraunces italic in forest or ochre** (e.g. "at *Play*", "the *world*").

### 3.6 Graphic language

- **Rounded everything** (Headspace): cards `border-radius: 28px`, buttons are full pills, photos 24px.
- **Doodle stickers** (Headspace stickers + Patagonia line art): a small SVG set in ink/marigold. Sparkle ✦, sun, leaf, curly arrow, scribble underline, circle-around, star, paper plane. They pop onto photos as you scroll by (scale 0 → 1 with `back.out(2)`).
- **Seed-packet motif:** cream cards with a clay-ink border, a small illustrated header and a "plant by" date. Used for the 11 domains.
- **Grain:** global SVG-noise overlay, `opacity .04`, `mix-blend-mode: multiply`.

---

## 4. Inspiration analysis (observed live in Chrome, 2026-11-01)

### 4.1 Headspace: headspace.com

**Observed:** sticky white nav with a pill CTA ("Try for free") · a **rotating phrase above the H1** ("Feel less anxious" → … "all with Headspace"), with the swapping phrase animating in and out · light-blush rounded panels (`#F9F4F2`) side by side with app mockups · a **chip grid "What kind of headspace are you looking for?"**: six bordered cards, each with a small colorful animated icon and a chevron · **pill tabs** switching full-color rounded panels (bright yellow, blue), with carousel dots underneath · a mascot **blob character (Ebb) with closed, smiling eyes**, gradient orange-pink, sitting inside the UI · a **chat bubble that "types"** ("Thinking…" → answer) · testimonial cards with smiling blob faces peeking around the headline · a collage of real people's photos with **illustrated stickers (sparkles, clouds) overlapping the photos** · **count-up stats** that start at 0 ("0M+ Downloads") and climb on scroll · FAQ accordion. One custom typeface (Headspace Apercu), H2 ≈ 52px, very generous whitespace, saturated brand colors on white.

| Borrow | Adapt | Skip |
|---|---|---|
| Rotating phrase above the H1 | Chip grid → **"What kind of learner is your child?"** with personality chips that reveal matching EP features | App mockups and phone frames (EP is not an app) |
| Pill buttons, 28px rounded panels, airy spacing | Saturated primary colors → **earthy palette + one marigold play accent** | Promo banner bar style (yellow HSA bar): replaced by a calmer ticker |
| Photos + illustrated stickers | Ebb mascot → **no mascot face**. Instead the logo's **two leaves act as "characters"** that react (sway, wave, unfold). Faces on a psychiatrist-founded brand risk feeling infantile. | Insurance and pricing CTAs |
| Count-up stats on scroll | Tabbed color panels → the **day-dial**, where color shifts with the time of day | AI chat feature |
| FAQ accordion, calm tone of voice | "Typing" chat bubble → **parent question → Dr. Che's answer**, typed in the FAQ teaser | |

### 4.2 Patagonia: patagonia.com/home

**Observed:** black top utility bar with a **rotating announcement** ("Free Shipping…", "Earth Is Now Our Only Shareholder", "Get Your People to the Polls") · clean white nav · **full-bleed outdoor hero photo** with a huge white grotesk H1 "Used to be cool. Still is.", a one-line sub and **white pill buttons on the photo** · a **camera icon on the photo that opens a story card** ("Sam Stuckey and Danny Parker sport our timeless rugby shirts while climbing… Canyonlands National Park, Utah." + photographer credit) · a **horizontal card carousel** with a round arrow button (photo, title, small sub-links) · a section on light-stone `#F3F3EF` where a **giant numeral "11.2" is built entirely from hand-drawn black-line illustrations of people** marching and biking, with an orange italic headline under it · large activity tiles (Climbing / Trail Running / Surfing) with sub-links · "Latest Stories" cards with "6 min read" pills · a **black band of 5 brand promises** with line icons ("We guarantee everything we make." "We give our profits to the planet."). One typeface family (Ridgeway Sans), photo-first and confident.

| Borrow | Adapt | Skip |
|---|---|---|
| Rotating announcement bar | Giant "11.2" made of people → **giant "5"** (Only 5 spots) **filled with EP photos and line doodles of children** | Mega-menu, e-commerce, cart, search |
| Camera icon → photo story card | Black promises band → **deep-forest "Our promises to your family"** band | "Recently viewed" and other commerce modules |
| Horizontal draggable card carousel | Full-bleed hero photo → **split and framed photo moments** (resolution limits, see 3.2) | Chat widget (email is the channel) |
| Pills over photos | Activity tiles → **"Afternoons out in the world"** destination tiles (farm, flight deck, business fair, kitchen) | Story read-time cards (no blog yet; add once there is a podcast) |
| Big, confident, short headlines | | |

**Not observed** (screenshots froze in the lower parts of both sites): page transitions between internal pages and fine hover physics. They are not needed for a one-page landing. Hover specs below are my own.

---

## 5. Page architecture and section-by-section experience

Desktop reference 1440 px, mobile reference 390 px. Max content width 1240 px; gutters `clamp(16px, 4vw, 56px)`.

```
00 Loader: the logo grows
01 Ticker + Nav
02 Hero: The Toy Box (Three.js)
03 Manifesto (scroll-scrubbed text)
04 "What kind of learner is your child?" (chips)
05 Eight things that set EP apart (draggable carousel + photo stories)
06 A day at EP (pinned sun-dial)
07 Minds in the morning / the world in the afternoon (drag split)
08 One program, every age (2–11)
09 Eleven domains (seed packets)
10 Proof in numbers (count-up)
11 Only 5 (giant numeral)
12 Meet the founder
13 Our promises to your family (dark band)
14 Questions parents ask (FAQ)
15 Book a visit (form + email)
16 Footer
```

The **Growth Line** (SVG, fixed width column, `position:absolute` in a page-tall wrapper) runs from section 03 to 16 and sprouts leaves at 04, 06, 09, 12 and 15.

---

### 00 · Loader: the logo grows (≈ 2.6 s, max 3.2 s)

Pure SVG + GSAP (no WebGL), so it starts instantly. It uses `logo/familycoachmd-logo.svg` **inlined** in the HTML, centered on the cream `--paper` screen, 72vw wide on mobile and 640 px max on desktop.

| Time | What happens | How |
|---|---|---|
| 0.0–0.2 s | Empty cream. A tiny olive seed-dot (6 px) fades in at the stem's left tip. | `opacity 0→1`, `power2.out` |
| 0.2–1.3 s | **The stem grows** from the left tip, along the wave, then curves up toward the leaves, like a vine reaching for light. | Mask path along the stem centerline, DrawSVG `0% → 100%`, `power2.inOut`. A soft olive glow dot rides the growing tip (MotionPath on the same centerline). |
| 0.9–1.6 s | **The small leaf unfurls**: it starts folded at its base, rotates open and scales up, its sage outline drawing just ahead of the tan fill. | `#leaf-small-line` DrawSVG-style mask reveal, then `#leaf-small` `scale .1→1`, `rotate -40°→0`, `transformOrigin` at the leaf base, `back.out(1.6)` |
| 1.1–1.9 s | **The big leaf unfurls** the same way, bigger and slower, overshooting slightly and then settling with a sway. | `#leaf-big` `scale .1→1.05→1`, `rotate -55°→0`, `elastic.out(1, .55)` |
| 1.2–2.2 s | **The wordmark writes itself** letter by letter, F → D, following the stem's wave. Each glyph rises from just below the stem line and fades in. | Per-glyph paths: `y: 24→0`, `opacity 0→1`, `rotate 6°→0`, stagger 0.055 s, `power3.out`. A thin ochre wipe line runs ahead of the letters. |
| 2.2–2.5 s | Gentle "breath": the whole logo scales 1 → 1.03 → 1, and both leaves sway ±3° once. A small Figtree line fades in under it: **"Entrepreneurs at Play · A FamilyCoachMD program"**. | `sine.inOut` |
| 2.5–3.2 s | **Exit:** the cream screen wipes up like a curtain while the logo shrinks and flies to its nav position (GSAP Flip to the nav lockup), so the brand visibly "lands" in the header. | `clip-path: inset(0 0 100% 0)`, 0.8 s, `expo.inOut`; Flip 0.8 s |

- **Real loading:** the timeline plays at full speed, but the exit waits until critical assets are ready (fonts plus hero images, `document.fonts.ready` + image decode). If they are ready earlier, the exit plays right away. Hard cap 3.2 s, then exit anyway.
- **Return visits** (sessionStorage flag): a 900 ms short version (stem, leaves and wordmark together, then the exit).
- **Reduced motion:** the finished logo fades in (300 ms), holds 400 ms and fades out. No drawing, no Flip.
- **Mobile:** same sequence; the logo is 72vw wide. Test that the per-glyph stagger stays smooth on a mid-range Android (use `will-change: transform` only during the loader).

### 01 · Ticker + Nav

- **Ticker bar** (Patagonia), deep forest `#1F2A17`, cream 13px Figtree. It rotates every 4 s with a vertical slide:
  `Opening January 4, 2027` · `Only 5 spots to start: book a visit` · `Omaha area · Ages 2–11 · Mon–Fri 9–4` · `A physician-founded program`
- **Nav** (Headspace), on cream, sticky. It hides on scroll down and returns on scroll up (`y: -100%` ↔ `0`, 0.35 s).
  - Left: **EP wordmark lockup**: "Entrepreneurs *at Play*" in Fraunces 600 + the small leaf glyph.
  - Center: `Why EP` · `A day` · `Programs` · `Founder` · `FAQ`, with a hand-drawn underline that draws in on hover (DrawSVG, 0.3 s).
  - Right: **"Book a visit"** forest pill, **magnetic** on desktop (moves ≤ 8 px toward the cursor) with a marigold dot that grows on hover.
- **Mobile:** logo + pill + a two-line burger that morphs into ×. The menu is a full-screen cream sheet with big Fraunces links staggering in (`y: 40 → 0`, 0.06 s stagger), a mini ticker at the bottom, and email.

### 02 · Hero: "The Toy Box"

**Layout desktop:** 12-column grid. Copy on columns 1–6, Three.js canvas spanning the full hero behind and to the right. Height `100svh` (min 640 px).
**Layout mobile:** copy first, and the canvas becomes a 46 svh band *under* the copy with 5 objects.

Copy:
- Rotating eyebrow line (Headspace), Caveat 28px, marigold scribble-underlined. It swaps every 2.2 s with a SplitText char roll: **"Kids who build." → "Kids who sell." → "Kids who speak." → "Kids who wonder." → "Kids who lead."**
- H1 (Fraunces 800, `opsz` 144): **Entrepreneurs** / **at *Play*** (with "Play" in italic forest, `WONK 1`)
- Tagline: **"Play'sWork."** Fraunces italic, ochre, with a tiny hand-drawn arrow pointing at it reading *"say it out loud"* (Caveat).
- Lede (Figtree 18px, max 34ch): *A physician-founded, multi-age program in Omaha where advanced academics, character, real-world play and practical life skills come together.*
- CTAs: **[Book a visit]** forest pill (magnetic) · **[See a day at EP ↓]** ghost pill.
- Fact chips (pills, paper-2): `Opens Jan 4, 2027` · `Ages 2–11` · `2 adults, always`
- Rotating badge (top right of the copy column, desktop): a marigold circle with circular text "ONLY 5 SPOTS · OPENING JANUARY 2027 ·" rotating slowly (20 s/turn) around a big Fraunces "5".

**3D scene (Three.js, the only heavy 3D on the page):**
- 8 procedural **clay toys**, built in code with no model downloads: golf ball (dimpled sphere via normal map), microphone (capsule + cylinder), paper plane (extruded shape), typewriter key (rounded cylinder with a letter decal "P"), coin (cylinder, ochre, embossed "¢"), mini guitar (extruded silhouette), leaf (from the logo SVG path, extruded), globe (sphere with simple continent texture in sage/forest).
- Material: `MeshPhysicalMaterial`, roughness .65, clearcoat .15, colors from the palette. Soft `HemisphereLight` + one warm directional light with a `ContactShadows`-style blurred shadow plane. Background transparent over cream.
- Motion: each toy floats with its own slow sine bob (2.5–4.5 s) and rotation. **Cursor repulsion:** toys within 180 px of the cursor ease away (lerp .08) and spin a little. **Click/tap a toy:** it bounces (`elastic.out`) and a small cream tooltip names the matching differentiator ("Podcasting: children interview, record and publish their own podcast").
- Scroll: as the hero leaves, toys drift upward and scatter outward at different speeds (parallax depth), so the page feels like it is falling past them.
- Perf: `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`, render loop **paused when off-screen** (IntersectionObserver) and when the tab is hidden; Three.js loaded via **dynamic `import()` after first paint**; the hero text never waits for 3D.
- **Mobile:** 5 toys, no cursor; touch-drag nudges toys; optional gentle tilt from `deviceorientation` (only after a user tap, iOS permission).
- **Fallback:** a pre-rendered transparent WebP of the toy scene (`hero-toys.webp`, render it once from the same scene) with a CSS float animation.

Scroll cue at the bottom: a tiny sprout icon bobbing with the text "scroll to grow" (Caveat).

### 03 · Manifesto

- Paper background. The **Growth Line begins here**: the stem emerges from the bottom of the hero and starts drawing as the user scrolls (DrawSVG, `scrub: 1`).
- Big statement in Fraunces 600, `clamp(2rem, 4.6vw, 3.9rem)`, max 22ch, centered left:
  **"Every child carries an *entrepreneurial spirit*. We give it room to play."**
- **Scroll-scrubbed word reveal:** words start at `opacity .15` and turn ink in sequence as the section scrolls through (SplitText words + ScrollTrigger scrub).
- Below it, three pillars in a row (stacked on mobile), each with a doodle icon that draws in:
  - **Rigor**: Advanced academics aligned to Nebraska standards, at each child's own pace.
  - **Heart**: Empathy, emotional health and "Humanese," the shared language of being human, every day.
  - **Enterprise**: Children design, build, pitch and lead real projects, and learn to cook and handle money.
- First leaf pair sprouts next to the pillars.

### 04 · "What kind of learner is your child?" (Headspace chips, adapted)

- H2: **What kind of learner is your *child*?** · sub: *Tap one. Every kind of child has a place at EP.*
- 6 chips in a 3×2 grid (2×3 on mobile), bordered 1.5px ink at 12% opacity, 28px radius, each with a tiny looping SVG doodle icon (like Headspace's colorful icons):
  `The builder 🔧` · `The talker 🎙` · `The explorer 🧭` · `The artist 🎨` · `The deep thinker 💭` · `The littlest one 🌱`
  (Icons are custom doodles, not emoji. The emoji here only describe them.)
- **Interaction:** tapping a chip expands an answer panel below the grid using GSAP Flip, in the chip's soft tint. It shows 2–3 EP features with a photo and a "See it in the day ↓" link. Copy:
  - *The builder*: "Real products, real customers. Engage and Engineer, CrunchLabs builds and hackathons, and a weekly stock market game."
  - *The talker*: "Their own podcast, one-on-one speech coaching from experts, and a mini United Nations."
  - *The explorer*: "Afternoons out in Omaha: farms, college campuses, flight decks and nature, rain or shine."
  - *The artist*: "Music, choir, theater and art with local studios, plus world cuisines in the kitchen."
  - *The deep thinker*: "Socratic reading groups, advanced academics at their own pace, MAP Growth testing to prove it."
  - *The littlest one*: "From age 2: free play, sign language, gentle routines, and big kids who mentor them every day."
- Chip hover: lift `y:-4`, the icon plays faster, border turns forest.

### 05 · Eight things that set EP apart (Patagonia carousel, adapted)

- Eyebrow `What makes us stand out` · H2: **Eight things that set *EP* apart**
- **Horizontal draggable carousel** (GSAP Draggable + inertia-style momentum, snap to card) with Patagonia's round arrow buttons at the right edge (desktop) and a progress bar under it (thin olive line filling as you drag). Native scroll-snap on mobile.
- Card (≈ 380 × 520 desktop, 78vw on mobile): rounded photo (duotone or warm), big ochre numeral `01`, title, one line, and a **camera icon** that flips the photo over into a **story card** (Patagonia), with a doodle note in Caveat.

| # | Title | Line | Photo | Story card (on camera tap) |
|---|---|---|---|---|
| 01 | Real-life entrepreneurship | Children make, price and sell real products to real customers. | `business-fair.jpg` | *One of our young entrepreneurs at a real business fair: greeting customers, explaining his product, making the sale himself.* |
| 02 | Podcasting | Children interview, record and publish their own podcast. | `podcast.jpg` | *They choose a question, interview someone making a difference for kids, then record and publish it themselves.* |
| 03 | Golf | Weekly coaching for focus, patience and honesty. | `golf.jpg` | *Golf builds self-control, and it's a game they can share with mentors for life.* |
| 04 | Academic excellence | Advanced academics at each child's pace, from farms to flight decks. | `flight.jpg` | *Learning goes where the lessons are used: here, in the cockpit of a flight simulator.* |
| 05 | Childhood play | Free play every day, guided play and real work outdoors. | `garden.jpg` | *Childhood is for getting your hands dirty and your mind inspired.* |
| 06 | Cultural immersion | French, sign language (ASL), many faiths and world cuisines. | `cuisine.jpg` | *Every dish comes with its own words, stories and manners. Fridays happen in French.* |
| 07 | Arts and humanities | Music, choir, theater and art, fully engaged. | `guitar.jpg` | *Partnerships with local studios bring music and theater to life.* |
| 08 | Communication coaching | One-on-one speech coaching from experts. | `speaking.jpg` | *Learning to listen well, organize thoughts and speak with confidence.* |

- Stickers pop onto 3 cards as they enter view (sparkle on 01, sun on 05, star on 08).
- Card hover (desktop): photo scales 1.04 inside its mask, and the card tilts ≤ 3° toward the cursor (perspective 900px).

### 06 · A day at EP: the sun-dial (my own centerpiece)

- **Pinned section** (ScrollTrigger `pin: true`, scroll length ≈ 250 vh desktop, 180 vh mobile).
- Big semicircle **sun arc** drawn in dashed olive across the top. A marigold **sun** travels along it from 9:00 (left) to 4:00 (right) as you scroll (MotionPath).
- **Background color tracks the time of day:** dawn cream `#F6F2EA` → bright `#FBF3DC` at noon → afternoon sky `#CFE0DF` → golden `#F3E2C4` at 4:00. Section text stays ink.
- Below the arc, a **giant clock time** (Fraunces 800, 12vw) rolls digit by digit (`9:00 → 9:10 → 10:15…`). Beside it, the block title and one line swap with a soft vertical slide, and a matching photo cross-fades in a rounded frame.
- Sample Wednesday (real schedule from her flyer):

| Time | Block | Line | Photo |
|---|---|---|---|
| 9:00 | Mindfulness and check-in | A calm start together. Our youngest practice sign language. | `mentoring.jpg` |
| 9:10 | Math and Me | Small groups, each child at their own level. | `typewriter.jpg` |
| 10:15 | Literature Is Lit | Reading groups and Socratic questions: think, discuss, defend. | `surprise.jpg` |
| 11:00 | Money and leadership | Financial literacy, plus Model UN coaching for older learners. | `speaking.jpg` |
| 12:00 | Lunch and free play | Time to eat, rest and play freely. | `cooking.jpg` |
| 1:00 | Golf | Weekly coaching: focus, patience and honesty. | `golf.jpg` |
| 2:30 | Stock market simulation | Learning finance by following the market in real time. | `business-fair.jpg` |
| 4:00 | Group uplift and check-out | We close the day lifting each other up. | `hens.jpg` |

- Footnote: *A sample Wednesday. Some activities rotate through the semester.*
- **Mobile:** same pin, shorter. The arc shrinks to the top 30% and the clock is 18vw.
- **Reduced motion:** no pin. A simple vertical timeline with a static sun icon at each step.

### 07 · Minds in the morning / the world in the afternoon

- H2: **Minds in the *morning*. The *world* in the afternoon.**
- **Drag-to-compare split** (Patagonia's confident photography meets interaction): two photos side by side in one rounded frame. Left: **Morning** (`typewriter.jpg`, duotone). Right: **Afternoon** (`horse.jpg`, warm color). A vertical handle with a sun/leaf knob can be dragged left or right (clip-path). Captions swap as each side dominates:
  - **Mornings · 9:00–12:00**: *Academic excellence, led by experts through the Socratic method.*
  - **Afternoons · 1:00–4:00**: *Real-world learning out in the community, from farms to flight decks.*
- Below: a row of **destination tiles** (Patagonia's activity tiles): `The farm` (hens.jpg), `The flight deck` (flight.jpg), `The kitchen` (cooking.jpg), `The capitol` (capitol.jpg), each with a pill label on the photo. On hover the label slides to show one line.
- Mobile: the handle starts centered and is draggable by touch. Tiles become a 2×2 grid.

### 08 · One program, every age

- H2: **Ages 2 to 11, *learning together*.**
- The logo's two leaves (big + small) are the visual: a large rounded card with the **big leaf / small leaf** drawing, explaining **Axial Mentorship**:
  - *"Older children mentor younger ones, and teaching a younger child deepens what the older child knows. Each child works at their own level in small groups. It works much like a close family."*
  - Photos: `mentoring.jpg` (older child helping a younger one) and `cooking.jpg` (mixing batter together), overlapping in rounded frames.
  - Three small chips: `Mixed-age by design` · `Each child at their own level` · `Big kids mentor little kids`
- A thin strip below: **"Coming next: after-school enrichment, school's-out weeks and summer camp."** with a "Get notified" text link (mailto).
- Interaction: when the card scrolls into view, the big leaf unfurls first and the small one follows 0.15 s later (scale .2 → 1, rotate −30° → 0, `elastic.out`), echoing the loader.

### 09 · Eleven domains: seed packets

- H2: **Eleven subjects. One *curious* child.** · sub: *We want children who can solve an equation, write a strong essay, cook a meal, run a small business and speak with confidence.*
- **11 seed-packet cards** in a masonry-ish grid (4 / 3 / 2 columns). Cream with a clay border, a doodle header icon, and the playful name in Fraunces. **Tap or hover flips** the packet (rotateY 180°, 0.6 s, `power3.inOut`) to show the formal subject and one line. Corner stamp: "Plant: Spring 2027".
  1. Math and Me: Mathematics
  2. Literature Is Lit: Language Arts and Literature
  3. Sciencey Stuff: Science and Animal Studies
  4. Engage and Engineer: Engineering and Design
  5. Heart and Soil: Nature, Mindfulness and SEL
  6. Finance Is Fun: Finance and Entrepreneurship
  7. Culture and Cuisine: World Cultures, Languages and Life Skills
  8. Soulful Sounds: Arts, Theater, Music and Spirituality
  9. Humane Tech: Technology and Media
  10. Ubuntu: "I am because we are." Leadership and Self-Governance
  11. Play: Guided and Free Play, Health and PE
- Entry: packets "drop" into place from 30 px above with a small rotation and stagger (0.05 s). The Growth Line sprouts a leaf pair here.

### 10 · Proof in numbers (Headspace count-up)

- Paper-2 band. 4 stats; the numerals **count up from 0** when 60% visible (1.6 s, `power2.out`), in ochre Fraunces 800:
  - **1 : 2.5**: adults to children. Two trained guides on site at all times.
  - **11**: brain-based learning principles behind every lesson.
  - **2× a year**: NWEA MAP Growth testing, so progress is visible.
  - **400+**: studies behind our technology policy (Brookings, 2026).
- Small doodle-circle drawn around "1 : 2.5" after the count finishes.

### 11 · Only 5 (Patagonia's giant numeral, reimagined)

- Stone band `#EDE6D8`, full width.
- A **giant "5"** (Fraunces 800, ≈ 70vh tall) used as a **mask** (`background-clip: text` or an SVG `<mask>`) filled with a slowly panning **collage of EP photos** (duotone), with **line-drawn doodles of children** (running, holding a microphone, swinging a golf club, carrying a crate) overlaid in ink. As you scroll, the collage pans inside the numeral (parallax `y: -15%`).
- Below, in Fraunces italic ochre: ***Only 5 spots to start.*** · Figtree: *A small group by design, so every child gets small-group teaching and one-on-one time every day. Opening January 4, 2027.* · **[Book a visit]**
- Mobile: the numeral is 55vh tall and the collage is a single photo.
- Illustration note: the doodle children are a small commissioned SVG set (6 figures) **or** traced from her photos as single-weight line art. Budget a few hours.

### 12 · Meet the founder

- Two columns. Left: `founder.jpg` in an **organic leaf-shaped mask** (SVG path from the logo's big leaf), with a thin olive stroke drawing around it. Right: copy.
- Eyebrow `Meet the founder` · H2: **Dr. Larisa Che, *MD***
- Credential chips: `Board-certified child & adolescent psychiatrist` · `Founder, FamilyCoachMD` · `Creighton fellowship-trained` · `Omaha mom`
- Quote, Fraunces italic 2rem, **revealed line by line** (SplitText lines, mask reveal, 0.08 s stagger):
  *"Childhood is not merely a holding space for adulthood. The time is now; the time is here; Entrepreneurs are at play."*
- Body: *My background informs my passion for raising resilient and capable kids who learn to harness the power of failure and success alike. Emotional health, calm guidance and character are built into every day, alongside rigorous academics.*
- Signature in Caveat: *— Dr. Larisa Che*
- The Growth Line sprouts its biggest leaf pair beside the portrait.

### 13 · Our promises to your family (Patagonia's black band, in deep forest)

- `--forest-deep` background, cream text. Five columns (two-column grid on mobile, last one centered), each with a hand-drawn cream line icon that draws on reveal:
  - **Two adults, always.** Background-checked and trained in CPR, first aid and child safety.
  - **Your child's pace.** Each child is assessed and goes further and deeper, never waiting.
  - **Very little screen time.** Technology that helps children think, never thinks for them.
  - **Progress you can see.** MAP Growth testing in January and May, aligned to Nebraska standards.
  - **Real work, real world.** Every week, children make things that matter to real people.

### 14 · Questions parents ask

- Two-column (title left, sticky on desktop; accordion right).
- Teaser above the list (Headspace's typing chat, reimagined): a parent bubble ("Is this a school?") appears, then three typing dots, then Dr. Che's answer bubble types out. It plays once on reveal.
- Accordion (`<details>`, GSAP height animation, + rotates into ×):
  - **Is this a school?** Yes. We run 9 a.m. to 4 p.m., five days a week, and operate like a microschool; our school license is pending. Homeschooled children and families seeking school-break enrichment are welcome.
  - **Where?** In the Omaha area. Our location will be announced soon.
  - **How much does it cost?** Email us for program fee details.
  - **Is it safe?** Two adults are on site at all times, background-checked and trained in CPR, first aid and child safety.
  - **How can a 2-year-old and a 10-year-old learn together?** Through Axial Mentorship, or learning across ages. Each child works at their own level, and older children mentor younger ones, much like a close family.
  - **Will my child keep up academically?** Academics follow Nebraska standards, and NWEA MAP Growth testing twice a year tracks each child's progress.
  - **How much screen time?** Very little. Technology is limited and purposeful, and our youngest have almost none.
  - **What about children who learn differently?** Our founder is a board-certified child and adolescent psychiatrist, and our small size lets us adapt to each child. Contact us, and we will be honest about whether EP is the right fit.
  - **Is the program religious?** EP welcomes families of all faiths and cultures. Reflection drawn from many traditions is one part of our arts and spirituality strand.

### 15 · Book a visit (the conversion moment)

- Forest `#3B5E1A` full-width panel with 40px top radius, rising over the previous section (`y: 80 → 0` on reveal). The Growth Line's last leaf pair sprouts at its top edge.
- H2 (cream): **Come visit. Meet us. *See if EP is right for your child.***
- Three steps as connected pills with a dotted path drawing between them: `1 Email us` → `2 Visit with your child` → `3 Join the program`
- **Mini form** (cream card): Parent name · Email · Child's age (select 2–11) · Best week to visit (select) · Message (optional) · **[Request a visit]**. On submit: the button morphs into a sprout check-mark plus "Thank you! We'll be in touch within 2 days."
  - Backend: **Formspree** (or Vercel serverless function + Resend) sending to Grow@familycoachmd.com. No child names are collected. Add a one-line privacy note under the button.
  - Fallback link: *Prefer email?* **Grow@familycoachmd.com** with a copy-to-clipboard button (toast "Copied!").
- Fine print: *Opening January 4, 2027 · Omaha area · Program fee details by email*

### 16 · Footer

- Cream. The **Growth Line ends here and becomes the FamilyCoachMD logo** (the stem flows into the logo stem; the leaves settle into place).
- Columns: EP wordmark + "Inspiring thinkers, crafting nation builders." · Quick links · Contact (email, Omaha, NE) · "A FamilyCoachMD program" with `logo/familycoachmd-logo.svg`.
- Bottom line: © 2026 Entrepreneurs at Play · FamilyCoachMD · Privacy · "Play'sWork." Credit: Site by Haderach Solutions.

---

## 6. Motion system

**Personality:** *calm, then delightful.* Movements are soft and slow (like breathing, from Headspace) with small bursts of springy joy (play). Nothing flashes, nothing loops aggressively. A psychiatrist-founded brand should never feel frantic.

| Token | Value | Use |
|---|---|---|
| `ease-soft` | `power3.out` | Most reveals |
| `ease-calm` | `sine.inOut` | Floating, breathing loops |
| `ease-play` | `back.out(1.8)` / `elastic.out(1,.5)` | Stickers, leaves, bounces |
| `ease-curtain` | `expo.inOut` | Loader wipe, big transitions |
| `dur-xs / s / m / l` | 0.2 / 0.4 / 0.7 / 1.1 s | Hover / UI / reveals / hero |
| Stagger | 0.04 chars · 0.06 words · 0.08 lines · 0.1 cards | |

**Global behaviors**
- **Lenis smooth scroll** (`lerp: 0.1`), synced with ScrollTrigger. Disabled on touch devices (native scroll) and under reduced motion.
- **Default reveal:** elements fade up `y: 32 → 0, opacity 0 → 1`, 0.7 s, when their top reaches 85% of the viewport. Each runs once.
- **Headlines:** SplitText lines with a mask reveal (`yPercent: 110 → 0`).
- **Custom cursor (desktop only):** a 10 px ink dot plus a 36 px olive ring trailing it (lerp .15). Over photos the ring grows to 72 px with the label "look". Over the 3D toys: "play". Over the carousel: "drag". Hidden on touch.
- **Magnetic buttons:** primary CTAs only, max 8 px pull.
- **Growth Line:** a single SVG path, DrawSVG scrubbed to the page scroll. Leaf pairs are triggered at section anchors (`scale 0 → 1`, `rotate −25° → 0`, `elastic.out`), and each leaf keeps a gentle 4 s sway afterwards.

---

## 7. Responsive plan

| Breakpoint | Behavior |
|---|---|
| ≥ 1280 | Full experience as described |
| 1024–1279 | Same, tighter gutters; 3D toys at 7 |
| 768–1023 | Two-column sections stack where noted; carousel shows 2.2 cards; sun-dial pin length 200 vh |
| < 768 | Single column, burger menu, 3D hero band with 5 toys under the copy, native scroll (no Lenis), carousel uses CSS scroll-snap, 2-column chips, 2-column seed packets, compare-split stays (touch drag), FAQ title not sticky |

- Minimum tap target 44 × 44 px. Use `100svh` units (iOS bars). Test at 360, 390, 768, 1024, 1440 and 1920.
- The Growth Line moves to the left edge on mobile (12 px from the gutter, thinner stroke 2px) so it never crosses text.

---

## 8. Accessibility and reduced motion

- `prefers-reduced-motion: reduce`: loader shows the finished logo with a short fade · no Lenis · no pins (sun-dial becomes a vertical timeline) · Growth Line shown fully drawn · counters show final values · 3D replaced by the static WebP · stickers appear without bounce · auto-rotating text stops on its first phrase.
- A visible **pause button** for the ticker and the rotating hero phrase (WCAG 2.2.2).
- Semantic landmarks, one H1, logical H2s. All interactive cards are buttons or links with focus rings (`2px solid --forest`, offset 3px).
- Every photo gets real alt text (from her prototype). Decorative doodles get `aria-hidden`.
- The canvas gets `aria-hidden="true"`, and the toy tooltips are duplicated as normal text in section 05.
- Color: ochre and marigold never carry small text. Check all text pairs at ≥ 4.5:1.

---

## 9. Technical plan

**Stack**
- **Vite** (vanilla JS, ES modules), deployed on **Vercel** (static output). Pin exact versions at install time.
- `gsap` 3.13+ (ScrollTrigger, SplitText, Draggable, Flip, DrawSVGPlugin, MotionPathPlugin, all free and included in the npm package).
- `lenis` for smooth scroll.
- `three` (lazy-loaded) for the hero toy box only.
- No CSS framework: hand-written CSS with custom properties (tokens in section 3).

**Suggested structure**
```
entregas/site/
  index.html
  src/
    main.js            # boot, Lenis, ScrollTrigger setup, reduced-motion switch
    loader.js          # logo grows (inline SVG + GSAP, reduced-motion fallback)
    hero-toys.js       # Three.js toy box
    growth-line.js     # SVG path + leaf sprouts
    sections/*.js      # chips, carousel, sundial, compare, packets, counters, faq, form
    styles/
      tokens.css  base.css  sections.css
  public/
    img/ (optimized AVIF/WebP + JPG fallback)
    svg/ (logo, doodles, leaf, growth-line)
    fonts/ (self-hosted Fraunces, Figtree, Caveat subsets)
```

**Performance budget**
- LCP < 2.0 s on 4G (the H1 is the LCP element; fonts preloaded with `font-display: swap`).
- JS ≤ 180 KB gzip before Three.js; Three.js chunk loaded after first paint.
- CLS < 0.05 (fixed aspect ratios on all images).
- 60 fps target on a mid-range phone. The 3D render loop pauses off-screen.

**Images**
- Export each photo at 480 / 960 / 1200 widths as **AVIF + WebP** (+ JPG fallback), quality 60–70. Use `<picture>` with `srcset` and `sizes`, and lazy-load everything below the hero.
- Make the duotone versions of B&W photos at export (sharp or Squoosh), not with heavy CSS filters.
- Logo: the SVGs in `logo/` (inline the master in the HTML for the loader); the PNG is only a reference.

**SEO and sharing**
- Title: *Entrepreneurs at Play · Physician-founded microschool in Omaha, NE*
- Meta description: *A physician-founded, multi-age program in Omaha for ages 2–11: advanced academics, real-world entrepreneurship and joyful play. Opening January 4, 2027. Only 5 spots.*
- Open Graph image 1200×630 (hero H1 + toy render + "Only 5 spots"). Favicon: the leaf.
- `LocalBusiness`/`EducationalOrganization` JSON-LD with the founder, email and Omaha area.

---

## 10. Image and asset map

All photos are in `entregas/site/img/` (identical to `entregas/instagram/src/img/pNN`).

| File | Same as | Content | Used in |
|---|---|---|---|
| `familycoachmd-logo.png` | `FamilyCoachMD.png` | New logo, PNG reference (use the SVGs in `logo/`) | Loader, nav lockup, footer, favicon, Growth Line ending |
| `business-fair.jpg` | p03 | Boy selling at a business fair | 05-01, 06 2:30, 08 EP card, 11 collage |
| `podcast.jpg` | p04 | Podcast microphone (B&W) | 05-02 |
| `golf.jpg` | p05 | Golf club and ball | 05-03, 06 1:00 |
| `flight.jpg` | p06 | Two children in a flight simulator | 05-04, 07 tile, 11 collage |
| `garden.jpg` | p07 | Child pulling weeds (B&W) | 05-05 |
| `cuisine.jpg` | p08 | Table of plantains, fruit, muffins | 05-06 |
| `guitar.jpg` | p09 | Child with guitar (B&W) | 05-07 |
| `speaking.jpg` | p10 | Boy in a vest speaking (B&W) | 05-08, 06 11:00 |
| `mentoring.jpg` | p11 | Older child helping a younger one | 06 9:00 |
| `typewriter.jpg` | p14 | Child at an antique typewriter | 06 9:10, 07 morning |
| `surprise.jpg` | p02 | Two dressed-up children (B&W) | 06 10:15 |
| `cooking.jpg` | p12 | Kids mixing batter | 06 12:00, 07 tile |
| `hens.jpg` | p13 | Child feeding hens | 06 4:00, 07 tile, 11 collage |
| `horse.jpg` | p15 | Child with a white horse | 07 afternoon |
| `capitol.jpg` | p01 | Toddler at the Lincoln statue (B&W) | 07 tile |
| `founder.jpg` | p16 | Dr. Larisa Che portrait | 12 |
| `logo-fcmd.png` | p00 | Old FamilyCoachMD logo | Not used (replaced) |

**To create:** stem centerline mask path + per-glyph split of `#wordmark` (from the existing SVGs) · Growth Line SVG path · 14 doodle stickers and icons (sparkle, sun, leaf, arrow, underline, circle, star, plane + 6 chip icons) · 6 line-drawn children for the "5" · `hero-toys.webp` fallback render · OG image.

**To request from Larisa:** 3–5 high-res outdoor photos · original logo file · confirmed age ranges · the golf wording (coach vs PGA professional) · the location reveal date.

---

## 11. Content flags to resolve before going public

1. **Spots:** use **"5 children to start, up to 12"** / "Only 5 spots to start". Avoid "Only 5 spots left", which implies some are taken.
2. **Ages:** the page uses **2–11** (her materials). WhatsApp mentioned 2–12; confirm.
3. **Golf:** "golf coach" vs "PGA golf professional". Use the PGA claim only if it is confirmed.
4. **License:** keep "our school license is pending" wording exact. Don't call it a "licensed school".
5. **Brookings / MacKenzie Price references:** keep the attributions exactly as in her prototype.
6. **"The Hatch":** mentioned once on WhatsApp (01/11, 11:37) as a 2–6 track, and not in any of her files. **Left out of the landing page on purpose** until Larisa explains it.

---

## 12. Build order (when approved)

1. Tokens, fonts, base layout, all sections as static HTML with real copy (mobile first).
2. Images optimized; logo prep (stem centerline mask, per-glyph wordmark).
3. Core motion: Lenis, reveals, SplitText headlines, nav, ticker.
4. Signature pieces: Growth Line → sun-dial → carousel + photo stories → compare split → seed packets → giant 5.
5. Loader (logo grows) → Three.js hero toy box → fallbacks.
6. Form backend and SEO metadata.
7. Reduced-motion pass, accessibility pass, Lighthouse (target ≥ 90 in all four categories on mobile).
8. Device testing (iPhone Safari, Android Chrome, desktop Chrome/Safari/Firefox), then a Vercel preview link for Larisa.

> **Next step:** review this plan, then give the go-ahead to start step 1. Nothing will be built before that confirmation.
