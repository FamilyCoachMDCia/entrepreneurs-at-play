// The content editor for the Entrepreneurs at Play site.
//
// One "singleton" per file in the repo-root content/ folder:
//   content/site.json, home.json, enrichment.json, summer.json, microschool.json,
//   about.json, theme.json   (read by the site build, see ../build/content.js)
// Uploaded photos go to content/photos/ (exported to WebP at build time).
//
// Paths are relative to the REPOSITORY ROOT, not to editor/. Cloud and GitHub modes
// work that way already; in local mode scripts/run.mjs starts Astro from the repo root.
//
// Every field here matches a key in content/*.json. Layout, sections, animations
// and the forms stay in code. If a field is added here, the build (build/content.js
// and build/partials.js) has to read it too.
import { config, fields, singleton } from '@keystatic/core';
import { PHOTO_LIBRARY } from './photo-library';

// Set by astro.config.mjs from the environment (see editor/README.md). They are
// not secrets: the cloud project name is public by design.
declare const __KS_STORAGE__: string; // '' (local) | 'cloud' | 'github'
declare const __KS_CLOUD_PROJECT__: string; // 'team/project'
declare const __KS_GITHUB_REPO__: string; // 'owner/name'

const storage =
  __KS_STORAGE__ === 'cloud'
    ? ({ kind: 'cloud' } as const)
    : __KS_STORAGE__ === 'github'
      ? ({ kind: 'github', repo: (__KS_GITHUB_REPO__ || 'FamilyCoachMDCia/entrepreneurs-at-play') as `${string}/${string}` } as const)
      : ({ kind: 'local' } as const);

if (__KS_STORAGE__ === 'cloud' && !__KS_CLOUD_PROJECT__) {
  throw new Error('KEYSTATIC_STORAGE=cloud needs KEYSTATIC_CLOUD_PROJECT (the "team/project" of the Keystatic Cloud project).');
}

/* ---------- Field helpers ---------- */

type TextOpts = { max: number; hint?: string; multiline?: boolean; optional?: boolean };

// Short text with a character limit, so a long sentence cannot break the layout.
const text = (label: string, { max, hint, multiline, optional }: TextOpts) =>
  fields.text({
    label,
    description: `${hint ? `${hint} ` : ''}(max ${max} characters)${optional ? ' Can be left empty.' : ''}`,
    multiline,
    validation: { length: { max }, isRequired: !optional },
  });

const link = (label: string, hint?: string) => fields.url({ label, description: hint ?? 'Starts with https://. Leave empty if there is none yet.' });

const yesNo = (label: string, description: string) => fields.checkbox({ label, description, defaultValue: false });

// Photo: pick one from the library, or upload a new one (saved in content/photos/).
// The photo field is always followed by a required "Photo description" next to it.
function photo(label: string, shape: string, optional = false) {
  const library = fields.select({
    label: 'Photo from the library',
    options: PHOTO_LIBRARY,
    defaultValue: PHOTO_LIBRARY[0].value,
  });
  const upload = fields.image({
    label: 'New photo',
    description: `JPG or PNG, at least 1200 pixels wide. Best shape here: ${shape}. Metadata (GPS, camera) is removed automatically.`,
    directory: 'content/photos',
    validation: { isRequired: true },
  });
  const how = (extra: Array<{ label: string; value: 'none' }>) => [
    ...extra,
    { label: 'A photo from the library', value: 'library' as const },
    { label: 'Upload a new photo', value: 'upload' as const },
  ];
  const description = 'Choose one from the library, or upload your own. Use real photos only, with permission from the families.';
  return optional
    ? fields.conditional(
        fields.select({ label, description, options: how([{ label: 'No photo (show a drawing)', value: 'none' }]), defaultValue: 'none' }),
        { none: fields.empty(), library, upload },
      )
    : fields.conditional(
        fields.select({ label, description, options: how([]), defaultValue: 'library' }),
        { library, upload } as never,
      );
}

const photoAlt = (what: string, optional = false) =>
  text('Photo description (for screen readers)', {
    max: 140,
    hint: `Describe ${what} in one sentence, as if telling someone who cannot see it.`,
    optional,
  });

const itemLabel = (key: string) => (props: any) => props.fields[key].value || 'Untitled';

/* ---------- Pages people can link to ---------- */

const LINKS = [
  { label: 'Microschool', value: '/microschool/' },
  { label: 'Microschool · waitlist form', value: '/microschool/#visit' },
  { label: 'Enrichment', value: '/enrichment/' },
  { label: 'Enrichment · Golf', value: '/enrichment/#golf' },
  { label: 'Summer camp', value: '/summer/' },
  { label: 'Who we are', value: '/about/' },
  { label: 'Contact form (home page)', value: '/#visit' },
];

/* ---------- Colors ---------- */

const SWATCHES = [
  { label: 'Sand (warm beige)', value: 'Sand' },
  { label: 'Sun (soft yellow)', value: 'Sun' },
  { label: 'Tan (light brown)', value: 'Tan' },
  { label: 'Clay blush (pale rose)', value: 'Clay blush' },
  { label: 'Sage (soft green)', value: 'Sage' },
  { label: 'Mist (pale blue)', value: 'Mist' },
];
const doorColor = (label: string, defaultValue: string) =>
  fields.select({ label, description: 'Colors are fixed so the text always stays easy to read.', options: SWATCHES, defaultValue });

/* ---------- The singletons ---------- */

const siteSingleton = singleton({
  label: 'Whole site',
  path: 'content/site',
  format: { data: 'json' },
  schema: {
    tagline: text('Tagline', { max: 70, hint: 'The sentence under the name on the home page, on Who we are and in the footer and share previews.' }),
    ticker: fields.object(
      {
        golf: text('Announcement 1 (links to Golf)', { max: 60, hint: 'Moving bar at the top of every page.' }),
        afterSchool: text('Announcement 2 (links to Enrichment)', { max: 60 }),
        microschool: text('Announcement 3 (links to the waitlist)', { max: 60 }),
      },
      { label: 'Announcement bar' },
    ),
    headerCta: fields.object(
      {
        home: text('Button on the home page', { max: 24 }),
        enrichment: text('Button on Enrichment', { max: 24 }),
        summer: text('Button on Summer', { max: 24 }),
        microschool: text('Button on Microschool', { max: 24 }),
        about: text('Button on Who we are', { max: 24 }),
      },
      { label: 'Header button', description: 'The green button at the top right (and the floating button on phones).' },
    ),
    footerLine: text('Footer line', { max: 70, hint: 'Under the logo at the bottom of every page.' }),
    socials: fields.object(
      {
        instagram: link('Instagram link', 'Leave empty until the account exists: the site shows "Coming soon".'),
        facebook: link('Facebook link', 'Leave empty until the page exists: the site shows "Coming soon".'),
        substack: link('Substack link'),
      },
      { label: 'Social links' },
    ),
  },
});

const homeSingleton = singleton({
  label: 'Home page',
  path: 'content/home',
  format: { data: 'json' },
  schema: {
    heroLede: text('Opening paragraph', { max: 260, multiline: true, hint: 'Under the tagline at the top of the home page.' }),
    doors: fields.object(
      Object.fromEntries(
        (['enrichment', 'summer', 'microschool'] as const).map((k) => [
          k,
          fields.object(
            {
              kicker: text('Small handwritten word', { max: 16, hint: 'Shown above the door title.' }),
              line: text('Short line under the title', { max: 90 }),
              status: text('Badge', { max: 22, hint: 'The little label on the door, such as "Summer 2027".' }),
            },
            { label: { enrichment: 'Enrichment door', summer: 'Summer door', microschool: 'Microschool door' }[k] },
          ),
        ]),
      ) as any,
      { label: 'The three doors', description: 'The door titles and pictures stay as they are.' },
    ),
    nameStrip: fields.object(
      { result: text("What's in a name: the result", { max: 110, hint: 'Completes "Entrepreneurs + at Play =" on the home page.' }) },
      { label: "What's in a name" },
    ),
    week: fields.object({ subtitle: text('Text under "Something new every afternoon"', { max: 150, multiline: true }) }, { label: 'A week at EP' }),
    dates: fields.array(
      fields.object({
        date: text('Date', { max: 12, hint: 'For example "Jan 4" or "Summer".' }),
        year: text('Year', { max: 6 }),
        title: text('Title', { max: 36 }),
        text: text('Text', { max: 100 }),
        link: fields.select({ label: 'Where it leads', options: LINKS, defaultValue: '/microschool/' }),
      }),
      { label: 'Dates to remember', itemLabel: itemLabel('title'), validation: { length: { min: 1, max: 6 } }, description: 'Up to 6 dates, in the order shown.' },
    ),
  },
});

const afternoon = (name: string, extra: Record<string, any>) =>
  fields.object({ name: text('Name', { max: 30 }), weekLabel: text('Name in the week overview', { max: 36 }), ...extra }, { label: name });

const afternoonCard = {
  title: text('Card title', { max: 40, optional: true, hint: 'Leave empty to use the name.' }),
  blurb: text('Description', { max: 210, multiline: true }),
  hours: text('Hours', { max: 14, hint: 'For example "4–6 PM". Shown when the box below is not ticked.' }),
  comingSoon: yesNo('Coming soon', 'Tick while the day is not confirmed: the card shows a "Coming soon" tag instead of the hours.'),
  ask: text('Button text', { max: 20, hint: 'For example "Get updates".' }),
};

const enrichmentSingleton = singleton({
  label: 'Enrichment',
  path: 'content/enrichment',
  format: { data: 'json' },
  schema: {
    intro: text('Opening paragraph', { max: 170, multiline: true, hint: 'You can write {{golf_day}} for the golf weekday (it follows the schedule).' }),
    golf: fields.object(
      {
        title: text('Title', { max: 30 }),
        chips: fields.array(text('Chip', { max: 24 }), {
          label: 'Chips (small facts)',
          itemLabel: (p: any) => p.value || 'Chip',
          validation: { length: { min: 1, max: 6 } },
          description: 'For example "Ages 8–12". {{golf_day}} becomes the weekday.',
        }),
        sessions: fields.array(
          fields.object({
            month: text('Heading', { max: 28, hint: 'For example "January · Golf".' }),
            dates: text('Dates and times', { max: 48, optional: true }),
            place: text('Place', { max: 40, optional: true }),
            placeLink: link('Place link'),
            comingSoon: yesNo('Coming soon', 'Tick to show "Coming soon" instead of dates and place.'),
          }),
          { label: 'Sessions', itemLabel: itemLabel('month'), validation: { length: { min: 1, max: 6 } } },
        ),
        button: text('Button text', { max: 30 }),
        photo: photo('Photo', 'landscape, about 3:2'),
        photoAlt: photoAlt('the photo'),
      },
      { label: 'Golf block', description: 'The big card at the top of the Enrichment page.' },
    ),
    afternoons: fields.object(
      {
        arts: afternoon('Monday · Fine arts', {}),
        golf: fields.object(
          {
            name: text('Name', { max: 40, hint: 'Used in the contact form.' }),
            title: text('Title', { max: 20 }),
            weekLabel: text('Name in the week overview', { max: 20 }),
            chipNote: text('Small note on the form choice', { max: 30 }),
            startsLine: text('"Starts" line', { max: 26, hint: 'Shown in the home page week.' }),
          },
          { label: 'Tuesday · Golf' },
        ),
        create: afternoon('Wednesday · CREATE', afternoonCard),
        podcast: afternoon('Thursday · Podcast', afternoonCard),
        cuisine: afternoon('Friday · Culture & Cuisine', afternoonCard),
      },
      { label: 'The week', description: 'The weekday of each afternoon is set by the web developer.' },
    ),
    faq: fields.array(
      fields.object({
        q: text('Question', { max: 80 }),
        a: text('Answer', {
          max: 360,
          multiline: true,
          hint: 'To add a link write [words to click](https://address). Bold: **word**.',
        }),
      }),
      { label: 'Questions parents ask', itemLabel: itemLabel('q'), validation: { length: { min: 1, max: 12 } } },
    ),
  },
});

const summerSingleton = singleton({
  label: 'Summer',
  path: 'content/summer',
  format: { data: 'json' },
  schema: {
    hoursFrom: text('Camp starts', { max: 10, hint: 'For example "9 a.m.".' }),
    hoursTo: text('Camp ends', { max: 10, hint: 'For example "3 p.m.".' }),
    intro: text('Text under the hours', { max: 180, multiline: true }),
    activities: fields.array(
      fields.object({ name: text('Name', { max: 24 }), text: text('Short description', { max: 90 }) }),
      { label: 'The four activities', itemLabel: itemLabel('name'), validation: { length: { min: 4, max: 4 } }, description: 'Exactly four. The pictures stay as they are.' },
    ),
  },
});

const pathway = (label: string, extra: Record<string, any>) =>
  fields.object(
    {
      text: text('Description', { max: 190, multiline: true }),
      words: fields.array(text('Word', { max: 14 }), {
        label: 'Three words',
        itemLabel: (p: any) => p.value || 'Word',
        validation: { length: { min: 3, max: 3 } },
        description: 'Exactly three, for example Play, Wonder, Grow.',
      }),
      ...extra,
      button: text('Button text', { max: 30 }),
      photo: photo('Photo', 'landscape, about 3:2'),
      photoAlt: photoAlt('the photo'),
    },
    { label },
  );

const photoText = (label: string, max: number, shape: string) =>
  fields.object({ text: text('Caption', { max, multiline: true }), photo: photo('Photo', shape), photoAlt: photoAlt('the photo') }, { label });

const microschoolSingleton = singleton({
  label: 'Microschool',
  path: 'content/microschool',
  format: { data: 'json' },
  schema: {
    intro: text('Text at the top', { max: 330, multiline: true, hint: 'You can write {{opening_long}} for the opening date.' }),
    hatch: pathway('The Hatch (ages 2–6)', {
      comingSoon: yesNo('Coming soon', 'Tick while The Hatch is not open: shows the "Coming soon" stamp and note.'),
      soonNote: text('Note shown while it is coming soon', { max: 120, optional: true }),
    }),
    studio: pathway('The Studio (ages 7–12)', {}),
    morning: photoText('Mornings', 120, 'landscape, 3:2'),
    afternoon: photoText('Afternoons', 190, 'landscape, 3:2'),
    sampleDay: fields.array(
      fields.object({
        time: text('Time', { max: 8, hint: 'For example "9:10".' }),
        title: text('Title', { max: 40 }),
        text: text('Text', { max: 130 }),
        photo: photo('Photo', 'landscape, about 3:2'),
        photoAlt: photoAlt('the photo'),
      }),
      { label: 'A sample day', itemLabel: (p: any) => `${p.fields.time.value} ${p.fields.title.value}`, validation: { length: { min: 3, max: 12 } }, description: 'From 3 to 12 moments, in time order.' },
    ),
    subjects: fields.array(
      fields.object({
        name: text('Name on the card', { max: 24 }),
        short: text('Line under the name', { max: 28 }),
        area: text('Subject area (back of the card)', { max: 50 }),
        details: text('Description (back of the card)', { max: 90 }),
      }),
      { label: 'The eleven subjects', itemLabel: itemLabel('name'), validation: { length: { min: 11, max: 11 } }, description: 'Exactly eleven. The icons stay as they are.' },
    ),
  },
});

const aboutSingleton = singleton({
  label: 'Who we are',
  path: 'content/about',
  format: { data: 'json' },
  schema: {
    lede: text('Opening paragraph', { max: 260, multiline: true }),
    beliefs: fields.array(
      fields.object({ title: text('Belief', { max: 80 }), text: text('Explanation', { max: 260, multiline: true }) }),
      { label: 'What we believe', itemLabel: itemLabel('title'), validation: { length: { min: 1, max: 16 } }, description: 'Numbered automatically, in this order.' },
    ),
    create: fields.array(
      fields.object({ name: text('Word', { max: 28, hint: 'The first letter is the big letter on the card.' }), text: text('Short line', { max: 60 }) }),
      { label: 'CREATE', itemLabel: itemLabel('name'), validation: { length: { min: 6, max: 6 } }, description: 'Exactly six. The home page headline cycles through the same words.' },
    ),
    nineThings: fields.array(
      fields.object({
        title: text('Title', { max: 50 }),
        text: text('Text', { max: 170, multiline: true }),
        photo: photo('Picture on the front', 'portrait or square', true),
        photoAlt: photoAlt('the photo', true),
        frontNote: text('Handwritten note on the drawing', { max: 24, optional: true, hint: 'Only used when there is no photo.' }),
        story: text('Story on the back', { max: 220, multiline: true, optional: true, hint: 'Leave empty for a card without a back.' }),
        storyNote: text('Handwritten note on the back', { max: 28, optional: true }),
      }),
      { label: 'Nine things that set EP apart', itemLabel: itemLabel('title'), validation: { length: { min: 9, max: 9 } }, description: 'Exactly nine, in this order.' },
    ),
    founder: fields.object(
      {
        quote: text('Quote', { max: 200, multiline: true, hint: 'Shown with quotation marks.' }),
        bio: text('Short bio', { max: 420, multiline: true }),
      },
      { label: 'Founder (home page and Who we are)' },
    ),
  },
});

const themeSingleton = singleton({
  label: 'Colors',
  path: 'content/theme',
  format: { data: 'json' },
  schema: {
    doors: fields.object(
      {
        enrichment: doorColor('Enrichment', 'Sand'),
        summer: doorColor('Summer', 'Mist'),
        microschool: doorColor('Microschool', 'Sage'),
      },
      { label: 'Program colors', description: 'Used on the home page doors, the menu, the page top card and the "next step" doors.' },
    ),
    background: fields.select({
      label: 'Page background',
      description: 'The notebook grid always stays.',
      options: [
        { label: 'Cream (the current look)', value: 'Cream' },
        { label: 'Linen (a bit lighter)', value: 'Linen' },
        { label: 'Milk (almost white)', value: 'Milk' },
      ],
      defaultValue: 'Cream',
    }),
  },
});

export default config({
  storage,
  ...(storage.kind === 'cloud' ? { cloud: { project: __KS_CLOUD_PROJECT__ } } : {}),
  ui: {
    brand: { name: 'EP Site Editor' },
    navigation: {
      Pages: ['home', 'enrichment', 'summer', 'microschool', 'about'],
      'Whole site': ['site', 'theme'],
    },
  },
  singletons: {
    site: siteSingleton,
    home: homeSingleton,
    enrichment: enrichmentSingleton,
    summer: summerSingleton,
    microschool: microschoolSingleton,
    about: aboutSingleton,
    theme: themeSingleton,
  },
} as any);

