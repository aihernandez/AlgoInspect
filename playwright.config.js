const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: "dotnet run --no-build --project ./src/backend/AlgoInspect.Api --urls http://127.0.0.1:4398",
    url: "http://127.0.0.1:4398/api/health",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4398",
    trace: "retain-on-failure",
  },
});
