// Single source for facts that change over time. index.html and the other
// pages use them as {{key}} tokens (replaced at build by vite.config.js);
// JS imports them too.
//
// Two kinds of settings live here and in content/:
// - what is code: the site address, the contact email and the opening date
//   (site-facts.js) and the *structure* of the week (this file: which activity
//   sits on which weekday, its icon, anchor and color);
// - what is copy (content/*.json, edited in the editor): names, blurbs, hours and
//   the "coming soon" flags of each afternoon, and the social links.
import site from '../content/site.json';
import enrichment from '../content/enrichment.json';
import { SITE as FACTS } from './site-facts.js';

// Build time only (the browser imports site-facts.js and never ships the copy).
export const SITE = {
  ...FACTS,
  socials: {
    instagram: site.socials.instagram || null, // content/site.json; empty = "Coming soon"
    facebook: site.socials.facebook || null,
    substack: site.socials.substack || null,
  },
};

// The school week, in one place. Moving an activity to another day means
// changing its `weekday` in STRUCTURE: the day strip, the enrichment cards, the
// microschool week, the request form and the sample day all follow.
// - open:      also open to other children after school (the marigold dot)
// - sampleDay: the day "Follow the sun" walks through
// - anchor:    the id of its card on /enrichment/
// - soon:      (content, "Coming soon" box) not confirmed yet: cards show a "Coming
//              soon" badge instead of the hours, the buttons read "Get updates" and
//              the form says "coming soon"
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Code-only part of each afternoon.
// 14/11/2026, Dr. Che's voice note: the makerspace partners can host on
// Wednesdays, so CREATE moves there and Thursday becomes Tech Thursday
// (humane tech and the podcast). Golf stays on Tuesday.
const STRUCTURE = [
  { key: 'arts', weekday: 'Monday', icon: 'i-artist', open: false },
  { key: 'golf', weekday: 'Tuesday', chip: 'Golf', strip: 'Golf', icon: 'd-flag', open: true, anchor: 'golf', hours: 'See dates and times' },
  { key: 'create', weekday: 'Wednesday', icon: 'd-hammer', open: true, anchor: 'enr-create', tint: 'var(--tint-green)', tab: '#3B5E1A' },
  { key: 'podcast', weekday: 'Thursday', icon: 'i-talker', open: true, sampleDay: true, anchor: 'enr-podcast', tint: 'var(--tint-sun)', tab: '#744A26' },
  { key: 'cuisine', weekday: 'Friday', icon: 'd-whisk', open: true, anchor: 'enr-cuisine', tint: 'var(--tint-clay)', tab: '#B8894C' },
];

export const SCHEDULE = STRUCTURE.map((s) => {
  const c = enrichment.afternoons[s.key];
  return {
    ...s,
    name: c.name,
    week: c.weekLabel,
    title: c.title || undefined,
    chipNote: c.chipNote || undefined,
    startsLine: c.startsLine || undefined,
    blurb: c.blurb || undefined,
    hours: c.hours || s.hours,
    ask: c.ask || undefined,
    soon: c.comingSoon || undefined,
  };
});

// Sorted by weekday, so a moved activity lands in the right place everywhere.
export const week = () => [...SCHEDULE].sort((a, b) => WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday));
export const openDays = () => week().filter((d) => d.open);
export const dayOf = (key) => SCHEDULE.find((d) => d.key === key)?.weekday;
