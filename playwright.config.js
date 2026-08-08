const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: "python -m http.server 4398 --bind 127.0.0.1",
    url: "http://127.0.0.1:4398/apps/web/index.html",
    reuseExistingServer: true,
    timeout: 15_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4398",
    trace: "retain-on-failure",
  },
});
