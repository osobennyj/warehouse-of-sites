import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "evals/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/entities/**", "src/server/**", "src/shared/lib/**"],
      thresholds: { lines: 80, statements: 80, functions: 75, branches: 70 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});