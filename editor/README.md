# EP site editor (Keystatic)

A small separate app that lets Dr. Che change the site's words, photos and colors
without touching code. It lives in this repository (`editor/`) but is built and
deployed on its own. The site (Vite, repository root) never builds or imports it.

```
Larisa -> editor (this app) -> commit to content/*.json and content/photos/ on main
       -> Vercel rebuilds the site (npm run build) -> live in about 1 to 2 minutes
```

There is no draft: every **Save** publishes. Roll back from the Vercel dashboard
(Deployments, "Instant Rollback") or by reverting the commit.

## What she can edit, and what stays in code

| Editor section | File | Fields |
|---|---|---|
| Whole site | `content/site.json` | tagline, announcement bar (3 lines), header button label per page, footer line, Instagram / Facebook / Substack links |
| Colors | `content/theme.json` | door color of Enrichment, Summer, Microschool (6 swatches), page background (Cream, Linen, Milk) |
| Home page | `content/home.json` | opening paragraph, the three doors (small word, line, badge), "What's in a name" result, week subtitle, dates to remember |
| Enrichment | `content/enrichment.json` | opening paragraph, golf block (title, chips, sessions, button, photo), each afternoon (name, description, hours, "Coming soon"), questions parents ask |
| Summer | `content/summer.json` | camp hours, text, the four activities |
| Microschool | `content/microschool.json` | top text, The Hatch and The Studio (text, three words, "Coming soon", photo), mornings and afternoons (text, photo), the sample day, the eleven subjects |
| Who we are | `content/about.json` | opening paragraph, the 12 beliefs, CREATE words, the nine things (text, photo, back story), founder quote and bio |

Code only (the web developer): sections, layout, animations, the contact form, SEO
tags, the weekday of each afternoon, icons and drawings, the home page 3D toys,
the domain. Texts have character limits so a long sentence cannot break a layout.
Lists with a fixed count (nine things, eleven subjects, CREATE, four activities)
cannot be added to or shortened: the editor refuses to save.

Photos: each photo slot offers "a photo from the library" (the photos already on the
site) or "Upload a new photo" (saved in `content/photos/`, turned into WebP at build
time by `tools/build-photos.mjs`, metadata removed). Every photo needs a description
(alt text). The repository is **public**: nothing with phone numbers, addresses or
students' names or faces without consent.

## Run it locally

```bash
cd editor
npm i
npm run dev        # http://127.0.0.1:4321  (opens the editor at /keystatic)
```

Local mode edits the real files in `../content/` (and `../content/photos/`) in your
working copy, nothing is committed for you. To see the result on the site: from the
repository root run `npm run dev` (or `npm run build`) in another terminal. Reload the
site dev server after saving, because the content is read when it starts.

`npm run dev` starts Astro from the repository root (`scripts/run.mjs`) because
Keystatic's local mode reads paths relative to the folder it starts in. That keeps
the paths in `keystatic.config.ts` the same in every mode (they are relative to the
repository root).

## Storage modes (environment variables, none of them secret)

| `KEYSTATIC_STORAGE` | Where it saves | Also needs |
|---|---|---|
| unset | local files (development) | nothing |
| `cloud` | GitHub, through Keystatic Cloud | `KEYSTATIC_CLOUD_PROJECT=<team>/<project>` |
| `github` | GitHub, with our own GitHub App | `KEYSTATIC_GITHUB_REPO=FamilyCoachMDCia/entrepreneurs-at-play` plus the GitHub App secrets (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`) set **only in Vercel**, never in the repository |

Cloud is the plan: she signs in with her own email and does not need a GitHub account.

## Deploy (second Vercel project)

Not done yet, needs a person (see "Still to do").

1. Vercel (team FamilyCoachMD): New Project, import `FamilyCoachMDCia/entrepreneurs-at-play`.
2. **Root Directory:** `editor`. Framework: Astro (detected; `editor/vercel.json` also says so).
   Install and build commands stay at the defaults (`npm install`, `npm run build`).
   `@astrojs/vercel` (pinned in `package.json`) is already the adapter.
3. **Environment Variables** (Production): `KEYSTATIC_STORAGE=cloud`, `KEYSTATIC_CLOUD_PROJECT=<team>/<project>`.
4. **Ignored Build Step:** already set in `editor/vercel.json`: the editor rebuilds only when something
   inside `editor/` changed, so her saves (which touch only `content/`) do not rebuild it.
5. The site project (repository root) has the opposite rule in the root `vercel.json`: a push that touches only
   `editor/` does not rebuild the site.
   Both commands (sh) are `BASE=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}; git cat-file -e "$BASE^{commit}" 2>/dev/null || exit 1; git diff --quiet "$BASE" HEAD -- <path>`.
   They compare the whole push (the last built commit, not just the last commit) and, if that commit is not in the
   shallow clone, exit 1, which makes Vercel **build** rather than skip. Exit 0 = skip, 1 = build.
6. Optional later: a nicer address such as `edit.<her domain>`; the editor has
   `noindex` (`public/robots.txt`).

## How she signs in (Keystatic Cloud)

1. Create a free Keystatic Cloud account at keystatic.cloud with **her own email**
   (done together on a call; nobody creates an account for her).
2. Create a project there, link the GitHub repository `FamilyCoachMDCia/entrepreneurs-at-play`
   (GitHub asks for permission once; the owner of the organization approves it) and
   add her as a team member. Free up to 3 people per team.
3. Put the project name (`team/project`) in the Vercel variable `KEYSTATIC_CLOUD_PROJECT`.
4. She opens the editor address, clicks **Sign in**, and edits. Save commits to `main`.

## Changing what the editor offers

A field exists in three places and they must match:

1. `content/<file>.json`: the value (the editor writes it).
2. `keystatic.config.ts`: the field, label, description and character limit.
3. The build: `../build/content.js` (validation) and `../build/partials.js` or the page
   HTML (`{{path.to.field}}` token or a partial) put it on the page.

Keystatic writes only the fields it knows, so never keep extra keys in a content file.
Photo fields store `{ "discriminant": "library" | "upload" | "none", "value": ... }`.
`photo-library.ts` lists the library photos by name (the files in `../public/img`).

## Still to do (needs a human)

- Keystatic Cloud account and project with Dr. Che, then the Vercel project for `editor/`.
- Rehearsal: edit a sentence and a photo, check the commit, the deploy and the phone view, undo.
- Put the editor address in `GUIDE.md` (the one-page guide for her, in plain English) and send it to her.
