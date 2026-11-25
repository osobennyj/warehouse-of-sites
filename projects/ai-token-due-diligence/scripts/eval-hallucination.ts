#!/usr/bin/env tsx
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { ReportSchema } from "@/entities/report";
import { runHallucinationGuard } from "@/entities/report/model/guard";

async function main() {
  const dir = path.join(process.cwd(), "data", "reports");
  const files = await readdir(dir);
  let failed = 0;
  for (const file of files.filter((f) => f.endsWith(".json"))) {
    const report = ReportSchema.parse(JSON.parse(await readFile(path.join(dir, file), "utf8")));
    const guard = runHallucinationGuard(report.analysis, report.facts);
    const ok = guard.passed;
    console.log(`${ok ? "✓" : "✗"} ${report.id}`, guard.unverifiedNumbers);
    if (!ok) failed += 1;
  }
  if (failed) process.exit(1);
  console.log(`All reports passed hallucination guard (${files.length} files).`);
}

main();