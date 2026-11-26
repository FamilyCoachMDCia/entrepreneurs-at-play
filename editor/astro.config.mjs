// The content editor (Keystatic) for the EP site. Separate app, same repository:
// the site (Vite) never builds or imports anything from here.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// Read from the environment when the editor starts or builds (nothing secret):
//   KEYSTATIC_STORAGE        unset = local files; "cloud" = Keystatic Cloud; "github" = GitHub mode
//   KEYSTATIC_CLOUD_PROJECT  "team/project" (cloud only)
//   KEYSTATIC_GITHUB_REPO    "owner/name" (github only)
const env = process.env;
if (env.KEYSTATIC_STORAGE === 'cloud' && !env.KEYSTATIC_CLOUD_PROJECT) {
  throw new Error('KEYSTATIC_STORAGE=cloud needs KEYSTATIC_CLOUD_PROJECT (the "team/project" of the Keystatic Cloud project).');
}

export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: vercel(),
  // "/" has nothing to show: go straight to the editor.
  redirects: { '/': '/keystatic' },
  vite: {
    define: {
      __KS_STORAGE__: JSON.stringify(env.KEYSTATIC_STORAGE ?? ''),
      __KS_CLOUD_PROJECT__: JSON.stringify(env.KEYSTATIC_CLOUD_PROJECT ?? ''),
      __KS_GITHUB_REPO__: JSON.stringify(env.KEYSTATIC_GITHUB_REPO ?? ''),
    },
  },
});
