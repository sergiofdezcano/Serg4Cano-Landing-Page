import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4322/Serg4Cano-Landing-Page/' },
  webServer: {
    command: 'npx astro preview --port 4322 --force',
    url: 'http://localhost:4322/Serg4Cano-Landing-Page/',
    reuseExistingServer: !process.env.CI,
  },
});
