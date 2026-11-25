import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ReportSchema } from "@/entities/report";
import { createMockAnalysis } from "@/server/agent/mock-analysis";
import { runHallucinationGuard } from "@/entities/report/model/guard";

async function main() {
  const dir = path.join(process.cwd(), "data", "reports");
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".json")) continue;
    const report = ReportSchema.parse(
      JSON.parse(await readFile(path.join(dir, file), "utf8")),
    );
    const analysis = createMockAnalysis(report.token, report.facts, report.score);
    const guard = runHallucinationGuard(analysis, report.facts);
    const updated = { ...report, analysis, meta: { ...report.meta, guard } };
    await writeFile(path.join(dir, file), `${JSON.stringify(updated, null, 2)}\n`);
    console.log(file, guard.passed, guard.unverifiedNumbers);
  }
}

main();