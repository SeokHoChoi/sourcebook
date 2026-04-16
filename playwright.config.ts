import { defineConfig, devices } from '@playwright/test';

const host = '127.0.0.1';
const port = process.env.PLAYWRIGHT_PORT ?? '3100';
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }]],
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The Playwright server address is an internal test binding, not the deployed public app URL.
    command:
      `APP_ENV=test NEXT_PUBLIC_APP_ENV=test NEXT_PUBLIC_APP_URL=${baseUrl} ` +
      `pnpm exec next start --hostname ${host} --port ${port}`,
    url: baseUrl,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  ...(process.env.CI ? { workers: 1 } : {}),
});
