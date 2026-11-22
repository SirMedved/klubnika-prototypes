// @ts-check
import { defineConfig } from 'astro/config';

// Прототип живёт на GitHub Pages по адресу /klubnika-prototypes/variant2/.
// На проде (hoster.by, корень домена) SITE_BASE = '/'.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sirmedved.github.io',
  base: process.env.SITE_BASE ?? '/klubnika-prototypes/variant2',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
