import { describe, expect, it } from "vitest";
import { ReportSchema } from "@/entities/report";
import { runHallucinationGuard } from "@/entities/report/model/guard";
import arbitrum from "../evals/fixtures/report-arbitrum-minimal.json";

describe("sample report eval", () => {
  it("fixture passes guard", () => {
    const report = ReportSchema.parse(arbitrum);
    const guard = runHallucinationGuard(report.analysis, report.facts);
    expect(guard.passed).toBe(true);
  });
});