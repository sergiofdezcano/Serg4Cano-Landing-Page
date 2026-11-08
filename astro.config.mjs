// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves the site under /<repo>/. With a custom domain later,
// set SITE to that domain and BASE to '/'.
export default defineConfig({
  site: process.env.SITE ?? 'https://sergiofdezcano.github.io',
  base: process.env.BASE ?? '/Serg4Cano-Landing-Page',
  trailingSlash: 'ignore',
});
