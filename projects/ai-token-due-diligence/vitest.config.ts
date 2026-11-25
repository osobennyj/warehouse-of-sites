import path from "node:path";
import { defineConfig } from "vitest/config";

/** Measured domain modules with unit tests (adapters need live/fixture tests later). */
const coverageInclude = [
  "src/entities/report/model/score.ts",
  "src/entities/report/model/guard.ts",
  "src/entities/report/model/allowed-numbers.ts",
  "src/server/data-sources/unlocks/vesting-engine.ts",
  "src/server/data-sources/news/rss-news.ts",
];

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "evals/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: coverageInclude,
      thresholds: { lines: 75, statements: 75, functions: 70, branches: 55 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});