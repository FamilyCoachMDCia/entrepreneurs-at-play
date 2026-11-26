// Photo helpers shared by the build (vite.config.js, build/partials.js) and
// the prebuild step (tools/build-photos.mjs). Node only.
//
// A photo is referred to by its "name": the exports are public/img/<name>-sm.webp
// and public/img/<name>-lg.webp. Names come from two places:
//  - the photo library: the originals in img/ (exported by tools/images.py);
//  - editor uploads: files in content/photos/ (exported by tools/build-photos.mjs).
import { closeSync, openSync, readSync } from 'node:fs';

// 'golf' -> 'golf'; 'sampleDay/2/photo/value.jpg' -> 'sampleday-2-photo-value' (lower case)
export function photoSlug(file) {
  return String(file)
    .replace(/\\/g, '/')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .toLowerCase()
    .split('/')
    .filter(Boolean)
    .join('-')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// The value an editor field holds ({discriminant, value}) or a plain name.
// Returns the photo name, or null when the slot has no photo.
export function photoName(ref) {
  if (ref == null || ref === '') return null;
  if (typeof ref === 'string') return photoSlug(ref) || null;
  if (ref.discriminant === 'none') return null;
  return ref.value ? photoSlug(ref.value) : null;
}

const IMG_DIR = new URL('../public/img/', import.meta.url);

// [width, height] of the exported -lg photo, read from the WebP header.
export function photoSize(name) {
  const file = new URL(`${name}-lg.webp`, IMG_DIR);
  let fd;
  try {
    fd = openSync(file, 'r');
  } catch {
    throw new Error(`Unknown photo "${name}": public/img/${name}-lg.webp does not exist. Run "npm run photos" (uploads) or tools/images.py (library).`);
  }
  try {
    const b = Buffer.alloc(32);
    readSync(fd, b, 0, 32, 0);
    if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`public/img/${name}-lg.webp is not a WebP file`);
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    if (kind === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
    throw new Error(`public/img/${name}-lg.webp: unknown WebP chunk "${kind}"`);
  } finally {
    closeSync(fd);
  }
}
