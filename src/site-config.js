// Single source for facts that change over time. index.html uses them as
// {{key}} tokens (replaced at build by vite.config.js); JS imports them too.
// Edit here, not in the HTML.
export const SITE = {
  url: 'https://entrepreneurs-at-play.vercel.app', // final domain still to be decided
  openingLong: 'January 4, 2027',
  copyrightYear: 2026,
  email: 'Grow@familycoachmd.com',
};
