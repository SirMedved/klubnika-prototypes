import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4322/klubnika-prototypes/variant2/' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'node scripts/serve.mjs', url: 'http://127.0.0.1:4322/klubnika-prototypes/variant2/', reuseExistingServer: !process.env.CI },
});
