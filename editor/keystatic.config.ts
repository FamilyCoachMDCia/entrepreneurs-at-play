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
import { createElement } from 'react';
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

const WEBSITE = 'https://entrepreneurs-at-play.vercel.app';

// A field with no stored value: it guides editing without changing content JSON.
const pageGuide = (path: string, description: string, label = 'Open the live page') => ({
  ...fields.empty(),
  Input: () => createElement(
    'aside',
    { style: { padding: '14px 16px', border: '1px solid currentColor', borderRadius: 8 } },
    createElement('strong', null, 'Where your edits appear'),
    createElement('p', { style: { margin: '6px 0 8px' } }, description),
    createElement('a', { href: WEBSITE + path, target: '_blank', rel: 'noopener', style: { textDecoration: 'underline' } }, label),
  ),
});

function libraryPhoto() {
  const select = fields.select({
    label: 'Photo from the library',
    description: 'The picture below follows your selection. Select a different name to preview it before saving.',
    options: PHOTO_LIBRARY,
    defaultValue: PHOTO_LIBRARY[0].value,
  });
  return {
    ...select,
    Input: (props: Parameters<typeof select.Input>[0]) => {
      const name = PHOTO_LIBRARY.find(({ value }) => value === props.value);
      return createElement(
        'div',
        null,
        createElement(select.Input, props),
        name && createElement(
          'figure',
          { style: { margin: '12px 0 0' } },
          createElement('img', {
            src: `${WEBSITE}/img/${name.value}-sm.webp`,
            alt: name.label,
            loading: 'lazy',
            style: { display: 'block', maxWidth: '100%', maxHeight: 150, width: 'auto', borderRadius: 8 },
          }),
          createElement('figcaption', { style: { marginTop: 6, fontSize: '0.875rem' } }, `Selected photo: ${name.label}`),
        ),
      );
    },
  };
}

// Photo: pick one from the library, or upload a new one (saved in content/photos/).
// The photo field is always followed by a required "Photo description" next to it.
function photo(label: string, shape: string, optional = false) {
  const library = libraryPhoto();
  const upload = fields.image({
    label: 'New photo',
    description: `The picture shown here is the selected upload. To replace it, choose a JPG or PNG at least 1200 pixels wide. Best shape: ${shape}.`,
    directory: 'content/photos',
    validation: { isRequired: true },
  });
  const how = (extra: Array<{ label: string; value: 'none' }>) => [
    ...extra,
    { label: 'A photo from the library', value: 'library' as const },
    { label: 'Upload a new photo', value: 'upload' as const },
  ];
  const description = 'The current selection is shown below. Choose a library photo or upload a replacement. Use real photos with the families’ permission.';
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
    hint: `Describe ${what} in one sentence, as if telling someone who cannot see it. Update this whenever you change the picture.`,
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
    editorGuide: pageGuide('/', 'These edits appear across the site. The tagline is under the name on the home page, the announcements scroll across the top, and social links appear near the contact details.', 'Open the live home page'),
    tagline: text('Tagline', { max: 70, hint: 'The sentence under the name on the home page, on Who we are and in the footer and share previews.' }),
    ticker: fields.object(
      {
        golf: text('Announcement 1 (links to Golf)', { max: 60, hint: 'Moving bar at the top of every page.' }),
        afterSchool: text('Announcement 2 (links to Enrichment)', { max: 60, hint: 'Second message in the moving bar at the top of every page.' }),
        microschool: text('Announcement 3 (links to the waitlist)', { max: 60, hint: 'Third message in the moving bar at the top of every page.' }),
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
      { label: 'Social links', description: 'These appear in the footer and contact section, and near the founder bio on the home page.' },
    ),
  },
});

const homeSingleton = singleton({
  label: 'Home page',
  path: 'content/home',
  format: { data: 'json' },
  schema: {
    editorGuide: pageGuide('/', 'Edit the opening paragraph, the three program doors, and the weekly and date sections on the home page. Use Whole site to edit the tagline.'),
    heroLede: text('Opening paragraph', { max: 260, multiline: true, hint: 'Under the tagline at the top of the home page.' }),
    doors: fields.object(
      Object.fromEntries(
        (['enrichment', 'summer', 'microschool'] as const).map((k) => [
          k,
          fields.object(
            {
              kicker: text('Small handwritten word', { max: 16, hint: 'Shown above the door title.' }),
              line: text('Short line under the title', { max: 90, hint: 'The program summary on the front of this door.' }),
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
    week: fields.object({ subtitle: text('Text under "Something new every afternoon"', { max: 150, multiline: true, hint: 'This paragraph sits immediately above the weekday cards. Edit the cards themselves in Enrichment → The week.' }) }, { label: 'A week at EP' }),
    dates: fields.array(
      fields.object({
        date: text('Date', { max: 12, hint: 'For example "Jan 4" or "Summer".' }),
        year: text('Year', { max: 6, hint: 'Small text in the date badge.' }),
        title: text('Title', { max: 36, hint: 'Bold heading of the date card.' }),
        text: text('Text', { max: 100, hint: 'The sentence below this card’s heading.' }),
        link: fields.select({ label: 'Where it leads', description: 'The whole date card opens this page or form when clicked.', options: LINKS, defaultValue: '/microschool/' }),
      }),
      { label: 'Dates to remember', itemLabel: itemLabel('title'), validation: { length: { min: 1, max: 6 } }, description: 'The cards below the weekly section on the home page. Keep up to 6, in the order you want them to appear.' },
    ),
  },
});

const afternoon = (name: string, extra: Record<string, any>) =>
  fields.object({
    name: text('Name', { max: 30, hint: 'Short program name used in the weekday navigation and form, when this day is open.' }),
    weekLabel: text('Name in the week overview', { max: 36, hint: 'Short name on the Microschool weekly schedule, where this weekday is shown.' }),
    ...extra,
  }, { label: name });

const afternoonCard = {
  title: text('Card title', { max: 40, optional: true, hint: 'Leave empty to use the name.' }),
  blurb: text('Description', { max: 210, multiline: true, hint: 'The paragraph under the title on this weekday card on the Enrichment page.' }),
  hours: text('Hours', { max: 14, hint: 'For example "4–6 PM". Shown when the box below is not ticked.' }),
  comingSoon: yesNo('Coming soon', 'Tick while the day is not confirmed: the card shows a "Coming soon" tag instead of the hours.'),
  ask: text('Button text', { max: 20, hint: 'The link at the bottom of this weekday card opens the form. For example, “Get updates”.' }),
};

const enrichmentSingleton = singleton({
  label: 'Enrichment',
  path: 'content/enrichment',
  format: { data: 'json' },
  schema: {
    editorGuide: pageGuide('/enrichment/', 'Edit the opening paragraph, the golf card, the weekday cards and the parent questions. Each weekday also has short labels used in the schedule or sign-up form.'),
    intro: text('Opening paragraph', { max: 170, multiline: true, hint: 'The paragraph under the Enrichment heading. {{golf_day}} automatically shows the golf weekday.' }),
    golf: fields.object(
      {
        title: text('Title', { max: 30, hint: 'The bold heading inside the golf card.' }),
        chips: fields.array(text('Chip', { max: 24, hint: 'A short fact in a small pill at the top of the golf card.' }), {
          label: 'Chips (small facts)',
          itemLabel: (p: any) => p.value || 'Chip',
          validation: { length: { min: 1, max: 6 } },
          description: 'For example "Ages 8–12". {{golf_day}} becomes the weekday.',
        }),
        sessions: fields.array(
          fields.object({
            month: text('Heading', { max: 28, hint: 'For example "January · Golf".' }),
            dates: text('Dates and times', { max: 48, optional: true, hint: 'The schedule shown below this session heading.' }),
            place: text('Place', { max: 40, optional: true, hint: 'Venue name shown in this session.' }),
            placeLink: link('Place link', 'Optional website or map for the venue. Paste the full link starting with https://.'),
            comingSoon: yesNo('Coming soon', 'Tick to show "Coming soon" instead of dates and place.'),
          }),
          { label: 'Sessions', itemLabel: itemLabel('month'), validation: { length: { min: 1, max: 6 } }, description: 'The month-by-month rows inside the golf card. Drag to change their order.' },
        ),
        button: text('Button text', { max: 30, hint: 'The green registration button at the bottom of the golf card.' }),
        photo: photo('Golf card photo', 'landscape, about 3:2'),
        photoAlt: photoAlt('the golf picture'),
      },
      { label: 'Golf block', description: 'The big card at the top of the Enrichment page.' },
    ),
    afternoons: fields.object(
      {
        arts: afternoon('Monday · Fine arts', {}),
        golf: fields.object(
          {
            name: text('Name', { max: 40, hint: 'Used in the contact form.' }),
            title: text('Title', { max: 20, hint: 'Short golf title used in weekly views. Edit the larger Enrichment heading under Golf block.' }),
            weekLabel: text('Name in the week overview', { max: 20, hint: 'Short label in the weekly schedule.' }),
            chipNote: text('Small note on the form choice', { max: 30, hint: 'Small print beneath Golf in the contact form’s program choices.' }),
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
        q: text('Question', { max: 80, hint: 'The line a parent clicks to open the answer.' }),
        a: text('Answer', {
          max: 360,
          multiline: true,
          hint: 'To add a link write [words to click](https://address). Bold: **word**.',
        }),
      }),
      { label: 'Questions parents ask', itemLabel: itemLabel('q'), validation: { length: { min: 1, max: 12 } }, description: 'The expandable FAQ near the bottom of Enrichment, above the sign-up form.' },
    ),
  },
});

const summerSingleton = singleton({
  label: 'Summer',
  path: 'content/summer',
  format: { data: 'json' },
  schema: {
    editorGuide: pageGuide('/summer/', 'Edit the camp hours and introduction at the top of the Summer page, and the four activities listed below.'),
    hoursFrom: text('Camp starts', { max: 10, hint: 'The first time shown near the top of the Summer page. For example, “9 a.m.”.' }),
    hoursTo: text('Camp ends', { max: 10, hint: 'The second time shown near the top of the Summer page. For example, “3 p.m.”.' }),
    intro: text('Text under the hours', { max: 180, multiline: true, hint: 'The main paragraph next to the picture at the top of the Summer page.' }),
    activities: fields.array(
      fields.object({ name: text('Name', { max: 24, hint: 'Bold name of an activity in the Summer activities list.' }), text: text('Short description', { max: 90, hint: 'The line under this activity’s name.' }) }),
      { label: 'The four activities', itemLabel: itemLabel('name'), validation: { length: { min: 4, max: 4 } }, description: 'Exactly four. The pictures stay as they are.' },
    ),
  },
});

const pathway = (label: string, extra: Record<string, any>) =>
  fields.object(
    {
      text: text('Description', { max: 190, multiline: true, hint: 'The paragraph on this pathway card in “Two pathways”.' }),
      words: fields.array(text('Word', { max: 14, hint: 'One of the three short words displayed on this pathway card.' }), {
        label: 'Three words',
        itemLabel: (p: any) => p.value || 'Word',
        validation: { length: { min: 3, max: 3 } },
        description: 'Exactly three, for example Play, Wonder, Grow.',
      }),
      ...extra,
      button: text('Button text', { max: 30, hint: 'The sign-up or updates link at the bottom of this pathway card.' }),
      photo: photo('Pathway card photo', 'landscape, about 3:2'),
      photoAlt: photoAlt('the pathway picture'),
    },
    { label },
  );

const photoText = (label: string, max: number, shape: string) =>
  fields.object({
    text: text('Caption', { max, multiline: true, hint: 'The sentence beside this photo in “Minds in the morning. The world in the afternoon.”' }),
    photo: photo(`${label} photo`, shape),
    photoAlt: photoAlt('the picture for this side of the comparison'),
  }, { label });

const microschoolSingleton = singleton({
  label: 'Microschool',
  path: 'content/microschool',
  format: { data: 'json' },
  schema: {
    editorGuide: pageGuide('/microschool/', 'Edit the opening paragraph, The Hatch and The Studio cards, the morning and afternoon comparison, the sample day, and the eleven subject cards.'),
    intro: text('Text at the top', { max: 330, multiline: true, hint: 'The paragraph under the Microschool heading. {{opening_long}} inserts the opening date.' }),
    hatch: pathway('The Hatch (ages 2–6)', {
      comingSoon: yesNo('Coming soon', 'Tick while The Hatch is not open: shows the "Coming soon" stamp and note.'),
      soonNote: text('Note shown while it is coming soon', { max: 120, optional: true, hint: 'Appears on The Hatch card only while Coming soon is checked.' }),
    }),
    studio: pathway('The Studio (ages 7–12)', {}),
    morning: photoText('Mornings', 120, 'landscape, 3:2'),
    afternoon: photoText('Afternoons', 190, 'landscape, 3:2'),
    sampleDay: fields.array(
      fields.object({
        time: text('Time', { max: 8, hint: 'Printed above the activity in the sample-day timeline, for example “9:10”.' }),
        title: text('Title', { max: 40, hint: 'The heading for this moment in the day.' }),
        text: text('Text', { max: 130, hint: 'The sentence beneath this moment’s title.' }),
        photo: photo('Sample-day photo', 'landscape, about 3:2'),
        photoAlt: photoAlt('this moment’s picture'),
      }),
      { label: 'A sample day', itemLabel: (p: any) => `${p.fields.time.value} ${p.fields.title.value}`, validation: { length: { min: 3, max: 12 } }, description: 'From 3 to 12 moments, in time order.' },
    ),
    subjects: fields.array(
      fields.object({
        name: text('Name on the card', { max: 24, hint: 'The heading on the front of this subject card.' }),
        short: text('Line under the name', { max: 28, hint: 'The second line on the front of the card.' }),
        area: text('Subject area (back of the card)', { max: 50, hint: 'Bold heading after a visitor flips the card.' }),
        details: text('Description (back of the card)', { max: 90, hint: 'The explanation beneath the heading on the back.' }),
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
    editorGuide: pageGuide('/about/', 'Edit the introduction, beliefs, CREATE cards, the nine things that set EP apart and the founder text. The founder bio and quote also appear on the home page.'),
    lede: text('Opening paragraph', { max: 260, multiline: true, hint: 'The first paragraph beneath the “Who we are” heading.' }),
    beliefs: fields.array(
      fields.object({
        title: text('Belief', { max: 80, hint: 'Heading of a numbered card in “What we believe”.' }),
        text: text('Explanation', { max: 260, multiline: true, hint: 'Paragraph beneath this belief’s heading.' }),
      }),
      { label: 'What we believe', itemLabel: itemLabel('title'), validation: { length: { min: 1, max: 16 } }, description: 'Numbered automatically, in this order.' },
    ),
    create: fields.array(
      fields.object({ name: text('Word', { max: 28, hint: 'The first letter is the big letter on the card.' }), text: text('Short line', { max: 60, hint: 'Shown when a visitor opens this CREATE card.' }) }),
      { label: 'CREATE', itemLabel: itemLabel('name'), validation: { length: { min: 6, max: 6 } }, description: 'Exactly six. The home page headline cycles through the same words.' },
    ),
    nineThings: fields.array(
      fields.object({
        title: text('Title', { max: 50, hint: 'The headline under the image or drawing on this card.' }),
        text: text('Text', { max: 170, multiline: true, hint: 'The paragraph beneath this card’s headline.' }),
        photo: photo('Picture on the front', 'portrait or square', true),
        photoAlt: photoAlt('the photo', true),
        frontNote: text('Handwritten note on the drawing', { max: 24, optional: true, hint: 'Only used when there is no photo.' }),
        story: text('Story on the back', { max: 220, multiline: true, optional: true, hint: 'Leave empty for a card without a back.' }),
        storyNote: text('Handwritten note on the back', { max: 28, optional: true, hint: 'Small note below the story after the visitor opens the card.' }),
      }),
      { label: 'Nine things that set EP apart', itemLabel: itemLabel('title'), validation: { length: { min: 9, max: 9 } }, description: 'Exactly nine, in this order.' },
    ),
    founder: fields.object(
      {
        quote: text('Quote', { max: 200, multiline: true, hint: 'Shown with quotation marks.' }),
        bio: text('Short bio', { max: 420, multiline: true, hint: 'The paragraph under Dr. Che’s quote. Credentials listed separately are set in the site layout.' }),
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
    editorGuide: pageGuide('/#programs', 'Edit the colors on the program doors, menus, and program pages, or change the background across the whole site.', 'Open the three doors on the home page'),
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

