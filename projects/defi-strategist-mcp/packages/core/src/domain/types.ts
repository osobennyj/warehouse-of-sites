import { z } from 'zod';

export const yieldPoolSchema = z.object({
  poolId: z.string(),
  chain: z.string(),
  project: z.string(),
  symbol: z.string(),
  tvlUsd: z.number(),
  apy: z.number(),
  apyBase: z.number().nullable(),
  apyReward: z.number().nullable(),
  stablecoin: z.boolean(),
  ilRisk: z.string(),
  sigma: z.number().nullable(),
  count: z.number().nullable(),
  apyMean30d: z.number().nullable(),
  apyPct30D: z.number().nullable(),
});

export type YieldPool = z.infer<typeof yieldPoolSchema>;

export const scoreBreakdownSchema = z.object({
  tvlSize: z.number(),
  tvlStability: z.number(),
  apyVolatility: z.number(),
  baseYieldShare: z.number(),
  trackRecord: z.number(),
  ilPenalty: z.number(),
  total: z.number(),
});

export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>;

export const rankedPoolSchema = yieldPoolSchema.extend({
  riskAdjustedScore: z.number(),
  breakdown: scoreBreakdownSchema,
});

export type RankedPool = z.infer<typeof rankedPoolSchema>;