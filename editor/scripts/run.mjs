// Starts Astro for local editing with the REPOSITORY ROOT as the working directory.
//
// Keystatic's local mode reads and writes files relative to the folder it was
// started from, and the files it edits (content/*.json, content/photos/) live one
// level above editor/. Starting Astro from the repo root, with --root editor,
// keeps the paths in keystatic.config.ts identical in every mode (local, cloud, GitHub).
//
//   npm run dev        -> astro dev --root editor   (from the repo root)
//   npm run preview    -> astro preview --root editor
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const editorDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(editorDir, '..');
const astroPkg = createRequire(join(editorDir, 'package.json')).resolve('astro/package.json');
const astroBin = join(dirname(astroPkg), 'bin', 'astro.mjs');

const child = spawn(process.execPath, [astroBin, ...process.argv.slice(2), '--root', editorDir], { cwd: repoRoot, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
