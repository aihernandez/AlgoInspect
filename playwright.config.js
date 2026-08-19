const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: "dotnet run --no-build --project ./src/backend/AlgoInspect.Api --urls http://127.0.0.1:4398",
    env: {
      // Cada carga de la aplicacion hace 19 llamadas a /api, asi que la suite
      // agota el limite de produccion (120/min por IP) a mitad de camino y los
      // ultimos tests reciben 429. El limite es endurecimiento para internet,
      // no algo contra lo que deban pelear las pruebas.
      InternetHosting__RateLimit__PermitLimit: "100000",
    },
    url: "http://127.0.0.1:4398/api/health",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4398",
    trace: "retain-on-failure",
  },
});
