// Prebuild step: exports the photos uploaded in the editor.
//
//   content/photos/**/*.{jpg,png,webp,...}   (written by the Keystatic editor)
//     -> public/img/<name>-sm.webp   480 px wide
//     -> public/img/<name>-lg.webp   up to 1200 px wide (never enlarged)
//
// <name> is the file path without extension, folders joined with "-", lower case
// (content/photos/hatch/photo/value.jpg -> "hatch-photo-value"; see build/photos.js).
// The look follows tools/images.py: black-and-white photos get the forest/cream
// duotone, color photos a light warm grade, WebP quality 72. All metadata
// (EXIF, GPS, camera, ICC) is dropped; the orientation is applied first.
//
// A photo is skipped when both exports exist and its source has not changed
// since the last export (a hash kept in node_modules/.cache). Run by npm as
// "prebuild" / "predev"; `npm run photos -- --force` redoes every photo.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photoSlug } from '../build/photos.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(root, 'content', 'photos');
const OUT = join(root, 'public', 'img');
const CACHE = join(root, 'node_modules', '.cache', 'ep-photos.json');
const EXT = /\.(jpe?g|png|webp|avif|tiff?|gif)$/i;
const force = process.argv.includes('--force');

const SHADOW = [0x1f, 0x2a, 0x17]; // --forest-deep
const LIGHT = [0xf6, 0xf2, 0xea]; // --paper

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}

// Mean HSV saturation under 18/255: a black-and-white photo (same test as images.py).
function isBlackAndWhite(rgb) {
  let sum = 0;
  const px = rgb.length / 3;
  for (let i = 0; i < rgb.length; i += 3) {
    const max = Math.max(rgb[i], rgb[i + 1], rgb[i + 2]);
    if (max) sum += ((max - Math.min(rgb[i], rgb[i + 1], rgb[i + 2])) / max) * 255;
  }
  return sum / px < 18;
}

function grade(rgb) {
  const out = new Uint8ClampedArray(rgb.length); // clamps to 0-255
  if (isBlackAndWhite(rgb)) {
    for (let i = 0; i < rgb.length; i += 3) {
      const lum = Math.min(1, Math.max(0, ((0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2]) / 255 - 0.04) / 0.92));
      for (let c = 0; c < 3; c++) out[i + c] = SHADOW[c] * (1 - lum) + LIGHT[c] * lum;
    }
    return { buf: Buffer.from(out.buffer), look: 'duotone' };
  }
  for (let i = 0; i < rgb.length; i += 3) {
    const gray = 0.299 * rgb[i] + 0.587 * rgb[i + 1] + 0.114 * rgb[i + 2];
    out[i] = (gray + 0.92 * (rgb[i] - gray)) * 1.03;
    out[i + 1] = gray + 0.92 * (rgb[i + 1] - gray);
    out[i + 2] = (gray + 0.92 * (rgb[i + 2] - gray)) * 0.96;
  }
  return { buf: Buffer.from(out.buffer), look: 'warm' };
}

let cache = {};
try { cache = JSON.parse(readFileSync(CACHE, 'utf8')); } catch { /* first run */ }

const files = walk(SRC).filter((f) => EXT.test(f));
const seen = new Map();
let done = 0;

for (const file of files) {
  const rel = relative(SRC, file);
  const name = photoSlug(rel);
  if (!name) throw new Error(`content/photos/${rel}: cannot make a photo name from this file name`);
  if (seen.has(name)) throw new Error(`content/photos/${rel} and content/photos/${seen.get(name)} both become "${name}". Rename one of them.`);
  seen.set(name, rel);

  const data = readFileSync(file);
  const hash = createHash('sha1').update(data).digest('hex');
  const sm = join(OUT, `${name}-sm.webp`);
  const lg = join(OUT, `${name}-lg.webp`);
  if (!force && cache[name] === hash && existsSync(sm) && existsSync(lg)) continue;

  // Orientation applied, transparency flattened onto the paper color, metadata gone.
  const { data: rgb, info } = await sharp(data, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#F6F2EA' })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { buf, look } = grade(rgb);
  mkdirSync(OUT, { recursive: true });
  for (const [path, width] of [[sm, 480], [lg, 1200]]) {
    await sharp(buf, { raw: { width: info.width, height: info.height, channels: 3 } })
      .resize({ width, withoutEnlargement: true, kernel: 'lanczos3' })
      .webp({ quality: 72, effort: 6 })
      .toFile(path);
  }
  cache[name] = hash;
  done++;
  console.log(`photos: ${name} (${info.width}x${info.height}, ${look})`);
}

if (done) {
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
}
console.log(`photos: ${files.length} upload${files.length === 1 ? '' : 's'} in content/photos, ${done} exported`);
