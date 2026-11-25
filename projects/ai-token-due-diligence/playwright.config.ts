import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://127.0.0.1:${process.env.PORT ?? "3000"}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: { ...devices["Desktop Chrome"], baseURL },
  webServer: process.env.CI
    ? {
        command: "pnpm start:static",
        url: baseURL,
        timeout: 120_000,
      }
    : undefined,
});