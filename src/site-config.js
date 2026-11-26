// Single source for facts that change over time. index.html and the other
// pages use them as {{key}} tokens (replaced at build by vite.config.js);
// JS imports them too. Edit here, not in the HTML.
export const SITE = {
  url: 'https://entrepreneurs-at-play.vercel.app', // final domain still to be decided
  openingLong: 'January 4, 2027',
  copyrightYear: 2026,
  email: 'Grow@familycoachmd.com',
  socials: {
    instagram: null,
    facebook: null,
    substack: 'https://larisachemd.substack.com/',
  },
};

// The school week, in one place. Moving an activity to another day means
// changing its `weekday` here: the day strip, the enrichment cards, the
// microschool week, the request form and the sample day all follow.
// - open:      also open to other children after school (the marigold dot)
// - sampleDay: the day "Follow the sun" walks through
// - anchor:    the id of its card on /enrichment/
// - soon:      not confirmed yet: cards show a "Coming soon" badge instead of the
//              hours, the buttons read "Get updates" and the form says "coming soon"
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const SCHEDULE = [
  {
    key: 'arts', weekday: 'Monday', name: 'Fine arts', week: 'Fine arts', icon: 'i-artist', open: false,
  },
  {
    key: 'golf', weekday: 'Tuesday', name: 'Golf · Tuesdays from Jan 5', title: 'Golf', chip: 'Golf', chipNote: 'Tuesdays from Jan 5', week: 'Golf', strip: 'Golf', icon: 'd-flag', open: true,
    anchor: 'golf', hours: 'See dates and times', startsLine: 'Starts January 5',
  },
  // 14/11/2026, Dr. Che's voice note: the makerspace partners can host on
  // Wednesdays, so CREATE moves there and Thursday becomes Tech Thursday
  // (humane tech and the podcast). Golf stays on Tuesday.
  {
    key: 'create', weekday: 'Wednesday', name: 'CREATE', week: 'CREATE · Makerspace', icon: 'd-hammer', open: true,
    anchor: 'enr-create', hours: '4–6 PM', soon: true, tint: 'var(--tint-green)', tab: '#3B5E1A',
    title: 'CREATE: makerspace day',
    blurb: 'Children make and test their own ideas: art, sewing, woodworking and engineering, for example.',
    ask: 'Get updates',
  },
  {
    key: 'podcast', weekday: 'Thursday', name: 'Podcasting', week: 'Tech Thursday · Podcast', icon: 'i-talker', open: true, sampleDay: true,
    anchor: 'enr-podcast', hours: '4–5 PM', soon: true, tint: 'var(--tint-sun)', tab: '#744A26',
    title: 'Tech Thursday: podcasting',
    blurb: 'Humane tech and our podcast. Children practice interviewing and speaking. In 3-3-3 LIFT, local business owners share lessons, setbacks, first steps and tips for grown-ups.',
    ask: 'Get updates',
  },
  {
    key: 'cuisine', weekday: 'Friday', name: 'Culture & Cuisine', week: 'Culture & Cuisine', icon: 'd-whisk', open: true,
    anchor: 'enr-cuisine', hours: '4–6 PM', soon: true, tint: 'var(--tint-clay)', tab: '#B8894C',
    blurb: 'Children cook together and explore the stories and traditions behind dishes from around the world.',
    ask: 'Get updates',
  },
];

// Sorted by weekday, so a moved activity lands in the right place everywhere.
export const week = () => [...SCHEDULE].sort((a, b) => WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday));
export const openDays = () => week().filter((d) => d.open);
export const dayOf = (key) => SCHEDULE.find((d) => d.key === key)?.weekday;
