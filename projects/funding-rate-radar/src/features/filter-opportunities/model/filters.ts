import type { ExchangeId } from "@/shared/api";
import type { FundingOpportunity } from "@/entities/funding-rate";

export interface OpportunityFilters {
  minSpreadApr: number;
  minVolumeUsd: number;
  exchanges: ExchangeId[];
  query: string;
}

export const defaultFilters: OpportunityFilters = {
  minSpreadApr: 0,
  minVolumeUsd: 0,
  exchanges: ["binance", "bybit", "okx", "hyperliquid"],
  query: "",
};

export function filterOpportunities(rows: FundingOpportunity[], filters: OpportunityFilters): FundingOpportunity[] {
  const q = filters.query.trim().toUpperCase();
  return rows.filter((row) => {
    if (row.spreadApr < filters.minSpreadApr) return false;
    if (row.minVolume24hUsd < filters.minVolumeUsd) return false;
    if (q && !row.asset.includes(q)) return false;
    const active = new Set(filters.exchanges);
    return active.has(row.longLeg.exchange) && active.has(row.shortLeg.exchange);
  });
}