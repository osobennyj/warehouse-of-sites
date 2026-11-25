import { z } from 'zod';

export const fundingSnapshotSchema = z.object({
  asset: z.string(),
  currentFundingRate: z.number(),
  avgFunding7d: z.number(),
  openInterestUsd: z.number().nullable(),
  markPx: z.number().nullable(),
});

export type FundingSnapshot = z.infer<typeof fundingSnapshotSchema>;

export const fundingCarrySchema = z.object({
  asset: z.string(),
  hourlyFundingRate: z.number(),
  annualizedFundingPct: z.number(),
  annualizedAvg7dPct: z.number(),
  estimatedFeesPct: z.number(),
  netCarryPct: z.number(),
  interpretation: z.string(),
});

export type FundingCarry = z.infer<typeof fundingCarrySchema>;

const HOURS_PER_YEAR = 24 * 365;

export function computeFundingCarry(
  snapshot: FundingSnapshot,
  feePct = 0.1,
): FundingCarry {
  const annualizedFundingPct = snapshot.currentFundingRate * HOURS_PER_YEAR * 100;
  const annualizedAvg7dPct = snapshot.avgFunding7d * HOURS_PER_YEAR * 100;
  const netCarryPct = annualizedFundingPct - feePct;

  let interpretation = 'Neutral carry after fees.';
  if (netCarryPct > 1)
    interpretation = 'Positive delta-neutral carry — shorts pay longs on average.';
  else if (netCarryPct < -1)
    interpretation = 'Negative carry — longs pay shorts; hedged short perp wins funding.';

  return {
    asset: snapshot.asset,
    hourlyFundingRate: snapshot.currentFundingRate,
    annualizedFundingPct: round(annualizedFundingPct),
    annualizedAvg7dPct: round(annualizedAvg7dPct),
    estimatedFeesPct: feePct,
    netCarryPct: round(netCarryPct),
    interpretation,
  };
}

function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

export function avgFundingFromHistory(rates: number[]): number {
  if (rates.length === 0) return 0;
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}