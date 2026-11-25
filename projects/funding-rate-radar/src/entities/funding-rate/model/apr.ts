const HOURS_PER_YEAR = 24 * 365;

/** Converts a per-interval funding rate (decimal) to simple annualized APR. */
export function intervalRateToApr(fundingRate: number, intervalHours: number): number {
  if (!Number.isFinite(fundingRate) || intervalHours <= 0) return 0;
  return fundingRate * (HOURS_PER_YEAR / intervalHours);
}

export function formatApr(apr: number, digits = 2): string {
  if (!Number.isFinite(apr)) return "—";
  return `${(apr * 100).toFixed(digits)}%`;
}

export function formatFundingRate(rate: number, digits = 4): string {
  if (!Number.isFinite(rate)) return "—";
  return `${(rate * 100).toFixed(digits)}%`;
}