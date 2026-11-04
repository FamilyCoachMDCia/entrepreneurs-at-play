// Single source for facts that change over time. index.html uses them as
// {{key}} tokens (replaced at build by vite.config.js); JS imports them too.
// Edit here, not in the HTML.
export const SITE = {
  url: 'https://entrepreneurs-at-play.vercel.app', // final domain still to be decided
  openingLong: 'January 4, 2027',
  openingShort: 'Jan 4, 2027',
  openingMonthYear: 'January 2027',
  spotsToStart: 5,
  maxChildren: 12,
  copyrightYear: 2026,
  email: 'Grow@familycoachmd.com',
  // Preferred visit weeks (a request, not a booking). Past weeks are hidden
  // automatically by the form script; add new ones as the calendar fills.
  visitWeeks: [
    { start: '2026-11-09', label: 'Nov 9–13, 2026' },
    { start: '2026-11-16', label: 'Nov 16–20, 2026' },
    { start: '2026-11-30', label: 'Nov 30–Dec 4, 2026' },
    { start: '2026-12-07', label: 'Dec 7–11, 2026' },
    { start: '2026-12-14', label: 'Dec 14–18, 2026' },
  ],
};
