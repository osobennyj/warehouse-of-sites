import { defineConfig, devices } from "@playwright/test";

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/warehouse-of-sites/projects/ai-token-due-diligence";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  `http://127.0.0.1:${process.env.PORT ?? "3000"}${basePath.replace(/\/?$/, "/")}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: { ...devices["Desktop Chrome"], baseURL },
  webServer: {
    command: "pnpm start:static",
    url: `${baseURL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_BASE_PATH: basePath,
      PORT: process.env.PORT ?? "3000",
    },
  },
});