import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/entities/*/model/**", "src/features/*/model/**", "src/widgets/*/model/**", "src/shared/api/**", "src/shared/lib/**"],
      exclude: ["**/*.test.*", "**/index.ts", "**/__fixtures__/**", "**/testing/**"],
      thresholds: { lines: 78, functions: 73, branches: 69, statements: 78 },
    },
  },
});
