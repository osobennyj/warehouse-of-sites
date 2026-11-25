import type { AgentEventListener, Report, TokenRef } from "@/entities/report";
import { REPORT_SCHEMA_VERSION, ReportSchema } from "@/entities/report";
import { computeScore } from "@/entities/report";
import { runHallucinationGuard } from "@/entities/report/model/guard";
import type { DataSources } from "@/server/data-sources/types";
import type { AppEnv } from "@/server/config/env";
import { createAnalysisProvider, PROMPT_VERSION } from "./llm-analysis";
import { runResearch } from "./research";

export interface GenerateReportInput {
  query: string;
  env: AppEnv;
  sources: DataSources;
  token?: TokenRef;
  onEvent?: AgentEventListener;
}

export async function generateDueDiligenceReport(
  input: GenerateReportInput,
): Promise<Report> {
  const started = Date.now();
  const onEvent = input.onEvent;
  onEvent?.({ type: "stage", stage: "resolving", message: "Resolving token…" });
  const token = input.token ?? (await input.sources.tokens.resolve(input.query));

  const { facts, sources } = await runResearch(token, input.sources, onEvent);
  const score = computeScore(facts);

  onEvent?.({ type: "stage", stage: "writing", message: "Drafting narrative…" });
  const provider = createAnalysisProvider(input.env);
  const llm = await provider.generate({
    token,
    facts,
    score,
    sourcesJson: JSON.stringify(sources, null, 2),
  });

  onEvent?.({ type: "stage", stage: "verifying", message: "Running hallucination guard…" });
  const guard = runHallucinationGuard(llm.analysis, facts);

  const id = `${token.id}-${started}`;
  const report: Report = {
    schemaVersion: REPORT_SCHEMA_VERSION,
    id,
    createdAt: new Date(started).toISOString(),
    query: input.query,
    token,
    facts,
    analysis: llm.analysis,
    score,
    sources,
    meta: {
      provider: llm.provider,
      model: llm.model,
      promptVersion: PROMPT_VERSION,
      durationMs: Date.now() - started,
      steps: 1,
      toolCalls: [],
      usage: llm.usage,
      estimatedCostUsd: estimateCost(llm.provider, llm.usage),
      guard,
    },
  };

  onEvent?.({ type: "stage", stage: "saving", message: "Report ready." });
  return ReportSchema.parse(report);
}

function estimateCost(
  provider: string,
  usage: { inputTokens: number; outputTokens: number },
): number | null {
  if (provider === "mock") return 0;
  // Rough Sonnet 4.6 list pricing for portfolio demo only.
  const inPrice = 3 / 1_000_000;
  const outPrice = 15 / 1_000_000;
  return usage.inputTokens * inPrice + usage.outputTokens * outPrice;
}

export function galleryReportId(tokenId: string): string {
  return tokenId;
}