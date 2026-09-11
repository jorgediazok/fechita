import { defineConfig, devices } from "@playwright/test";

// E2E corre siempre contra FIXTURE_SOURCE=mock (sin red, con el panel dev de /pronosticos) —
// nunca contra theoddsapi, para no quemar créditos ni depender de que haya partidos reales
// pendientes en este momento. `npm run test:e2e` siembra el usuario fijo antes de esto
// (scripts/seed-e2e.ts).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { FIXTURE_SOURCE: "mock" },
  },
});
