// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Per-test timeout — generous to cover fake-clock fast-forward + DOM settle
  timeout: 20000,

  // Per-assertion timeout
  expect: { timeout: 8000 },

  // Run tests sequentially (stateful app; each test gets its own page context anyway)
  fullyParallel: false,
  workers: 1,

  // Retry once on CI to absorb occasional timing flakes
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: 'http://localhost:8080',

    // Capture trace on first retry to help debug CI failures
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',
  },

  // Start a local static server before running tests
  webServer: {
    // -c-1 disables HTTP caching so edits always reflect immediately
    command: 'npx http-server . -p 8080 -c-1 --silent',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
