import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const expectTimeout = Number(process.env.EXPECT_TIMEOUT_MS || 30_000);
const actionTimeout = Number(process.env.ACTION_TIMEOUT_MS || 60_000);
const navigationTimeout = Number(process.env.NAVIGATION_TIMEOUT_MS || 120_000);
const testTimeout = Number(process.env.TEST_TIMEOUT_MS || 240_000);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: testTimeout,
  expect: {
    timeout: expectTimeout,
  },
  use: {
    baseURL: 'https://www.amazon.in',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    actionTimeout,
    navigationTimeout,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 960 },
        headless: process.env.HEADLESS !== 'false',
      },
    },
  ],
});
