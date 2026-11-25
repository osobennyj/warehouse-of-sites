import { z } from "zod";

export const TOOL_NAMES = [
  "getMarketData",
  "getProtocolMetrics",
  "getTokenUnlocks",
  "getHolderConcentration",
  "getRecentNews",
] as const;

export const ToolNameSchema = z.enum(TOOL_NAMES);
export type ToolName = z.infer<typeof ToolNameSchema>;

const nullableNumber = z.number().nullable();

export const SourceSchema = z.object({
  id: z.string().regex(/^S\d+$/),
  tool: ToolNameSchema,
  title: z.string(),
  url: z.url(),
  fetchedAt: z.iso.datetime(),
});
export type Source = z.infer<typeof SourceSchema>;

export const TokenRefSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.url().nullable(),
  homepage: z.url().nullable(),
  categories: z.array(z.string()),
  contracts: z.record(z.string(), z.string()),
});
export type TokenRef = z.infer<typeof TokenRefSchema>;

export const MarketFactsSchema = z.object({
  sourceId: z.string(),
  priceUsd: z.number().nonnegative(),
  marketCapUsd: nullableNumber,
  fdvUsd: nullableNumber,
  volume24hUsd: nullableNumber,
  marketCapRank: z.number().int().nullable(),
  circulatingSupply: nullableNumber,
  totalSupply: nullableNumber,
  maxSupply: nullableNumber,
  athUsd: nullableNumber,
  athChangePct: nullableNumber,
  priceChange24hPct: nullableNumber,
  priceChange30dPct: nullableNumber,
  priceChange1yPct: nullableNumber,
  /** market cap / FDV, in percent */
  mcapToFdvPct: nullableNumber,
  /** 24h volume / market cap, in percent */
  volumeToMcapPct: nullableNumber,
});
export type MarketFacts = z.infer<typeof MarketFactsSchema>;

const PeriodTotalsSchema = z.object({
  last24hUsd: nullableNumber,
  last30dUsd: nullableNumber,
  last365dUsd: nullableNumber,
});
export type PeriodTotals = z.infer<typeof PeriodTotalsSchema>;

export const ProtocolFactsSchema = z.object({
  sourceId: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  chains: z.array(z.string()),
  tvlUsd: nullableNumber,
  tvlChange30dPct: nullableNumber,
  fees: PeriodTotalsSchema.nullable(),
  revenue: PeriodTotalsSchema.nullable(),
  /** trailing 365d revenue / market cap, in percent */
  revenueYieldPct: nullableNumber,
  /** market cap / trailing 365d revenue */
  priceToRevenue: nullableNumber,
});
export type ProtocolFacts = z.infer<typeof ProtocolFactsSchema>;

const UnlockWindowSchema = z.object({
  days: z.number().int().positive(),
  tokens: z.number().nonnegative(),
  usd: nullableNumber,
  pctOfCirculating: nullableNumber,
});
export type UnlockWindow = z.infer<typeof UnlockWindowSchema>;

export const UnlockFactsSchema = z.object({
  sourceId: z.string(),
  windows: z.array(UnlockWindowSchema),
  upcoming: z.array(
    z.object({
      date: z.iso.date(),
      category: z.string(),
      tokens: z.number().nonnegative(),
      usd: nullableNumber,
    }),
  ),
  remainingLockedTokens: z.number().nonnegative(),
  scheduleEndsOn: z.iso.date().nullable(),
  notes: z.string(),
});
export type UnlockFacts = z.infer<typeof UnlockFactsSchema>;

export const HolderFactsSchema = z.object({
  sourceId: z.string(),
  chain: z.string(),
  contract: z.string(),
  top1SharePct: z.number().nonnegative(),
  top10SharePct: z.number().nonnegative(),
  holders: z.array(z.object({ address: z.string(), sharePct: z.number().nonnegative() })),
});
export type HolderFacts = z.infer<typeof HolderFactsSchema>;

export const NewsItemSchema = z.object({
  sourceId: z.string(),
  title: z.string(),
  url: z.url(),
  outlet: z.string(),
  publishedAt: z.iso.datetime(),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const FactsSchema = z.object({
  market: MarketFactsSchema.nullable(),
  protocol: ProtocolFactsSchema.nullable(),
  unlocks: UnlockFactsSchema.nullable(),
  holders: HolderFactsSchema.nullable(),
  news: z.array(NewsItemSchema),
});
export type Facts = z.infer<typeof FactsSchema>;

const CitedPointSchema = z.object({
  title: z.string().min(1).max(120),
  detail: z.string().min(1).max(600),
  sourceIds: z.array(z.string()),
});

/** The only part of a report written by the LLM. Numbers inside it are verified by the guard. */
export const AnalysisSchema = z.object({
  summary: z.string().min(1).max(1200),
  tokenomics: z.string().min(1).max(1200),
  fundamentals: z.string().min(1).max(1200),
  distribution: z.string().min(1).max(1000),
  catalysts: z.array(CitedPointSchema).max(5),
  risks: z
    .array(CitedPointSchema.extend({ severity: z.enum(["low", "medium", "high"]) }))
    .max(6),
  redFlags: z.array(CitedPointSchema).max(5),
  verdict: z.string().min(1).max(600),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const ScoreFactorSchema = z.object({
  key: z.string(),
  label: z.string(),
  weight: z.number().nonnegative(),
  score: z.number().min(0).max(100).nullable(),
  value: nullableNumber,
  rationale: z.string(),
});
export type ScoreFactor = z.infer<typeof ScoreFactorSchema>;

export const GRADES = ["A", "B", "C", "D", "F"] as const;

export const ScoreSchema = z.object({
  total: z.number().min(0).max(100),
  grade: z.enum(GRADES),
  coveragePct: z.number().min(0).max(100),
  factors: z.array(ScoreFactorSchema),
});
export type Score = z.infer<typeof ScoreSchema>;

export const GuardResultSchema = z.object({
  passed: z.boolean(),
  unverifiedNumbers: z.array(z.string()),
  invalidCitations: z.array(z.string()),
  repairAttempts: z.number().int().nonnegative(),
});
export type GuardResult = z.infer<typeof GuardResultSchema>;

export const ReportMetaSchema = z.object({
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  durationMs: z.number().nonnegative(),
  steps: z.number().int().nonnegative(),
  toolCalls: z.array(
    z.object({ tool: ToolNameSchema, ok: z.boolean(), durationMs: z.number().nonnegative() }),
  ),
  usage: z.object({ inputTokens: z.number().int(), outputTokens: z.number().int() }),
  estimatedCostUsd: nullableNumber,
  guard: GuardResultSchema,
});
export type ReportMeta = z.infer<typeof ReportMetaSchema>;

export const REPORT_SCHEMA_VERSION = 1;

export const ReportSchema = z.object({
  schemaVersion: z.literal(REPORT_SCHEMA_VERSION),
  id: z.string().regex(/^[a-z0-9-]+$/),
  createdAt: z.iso.datetime(),
  query: z.string(),
  token: TokenRefSchema,
  facts: FactsSchema,
  analysis: AnalysisSchema,
  score: ScoreSchema,
  sources: z.array(SourceSchema),
  meta: ReportMetaSchema,
});
export type Report = z.infer<typeof ReportSchema>;

export type ReportSummary = Pick<Report, "id" | "createdAt" | "token" | "score"> & {
  headline: string;
  model: string;
};

export const toReportSummary = (report: Report): ReportSummary => ({
  id: report.id,
  createdAt: report.createdAt,
  token: report.token,
  score: report.score,
  headline: report.analysis.verdict,
  model: report.meta.model,
});
