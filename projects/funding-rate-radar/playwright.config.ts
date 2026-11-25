import { defineConfig, devices } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const port = 4173;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${port}${basePath}`,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `pnpm exec serve out -l ${port}`,
    cwd: process.cwd(),
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});