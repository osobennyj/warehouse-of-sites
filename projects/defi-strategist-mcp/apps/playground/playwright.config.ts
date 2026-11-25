import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: 'e2e',
  use: { ...devices['Desktop Chrome'] },
  webServer: {
    command: 'VITE_BASE=/ pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    cwd: root,
  },
});