#!/usr/bin/env tsx
/**
 * Captures live API fixtures and writes gallery reports (mock LLM — no API key required).
 * Usage: pnpm generate:samples
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { generateDueDiligenceReport, galleryReportId } from "@/server/agent/orchestrator";
import { createDataSources } from "@/server/data-sources";
import { recordDataSources, type DataSnapshot } from "@/server/data-sources/snapshot";
import { loadEnv } from "@/server/config/env";
import { saveReport } from "@/server/reports/report-store";
import { siteConfig } from "@/shared/config/site";

const env = loadEnv({ LLM_PROVIDER: "mock", NODE_ENV: "production" });
const sources = createDataSources(env);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(path.join(process.cwd(), "evals", "snapshots"), { recursive: true });
  for (const query of siteConfig.sampleTokens) {
    await sleep(2_500);
    console.log(`\n→ ${query}`);
    const { sources: recorded, calls } = recordDataSources(sources);
    const token = await sources.tokens.resolve(query);
    const report = await generateDueDiligenceReport({
      query,
      env,
      sources: recorded,
      token,
    });
    const galleryId = galleryReportId(token.id);
    const final = { ...report, id: galleryId };
    await saveReport(final);
    const snapshot: DataSnapshot = {
      capturedAt: new Date().toISOString(),
      query,
      token,
      calls: calls(),
    };
    await writeFile(
      path.join(process.cwd(), "evals", "snapshots", `${token.id}.json`),
      `${JSON.stringify(snapshot, null, 2)}\n`,
    );
    console.log(`  saved report ${galleryId} (score ${final.score.total}/${final.score.grade})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});