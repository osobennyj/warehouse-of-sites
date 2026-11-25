import { describe, expect, it } from "vitest";
import type { FundingOpportunity } from "@/entities/funding-rate";
import { defaultFilters, filterOpportunities } from "./filters";

const leg = (exchange: FundingOpportunity["longLeg"]["exchange"]): FundingOpportunity["longLeg"] => ({
  exchange,
  symbol: "X",
  fundingRate: 0.0001,
  fundingApr: 0.1,
  fundingIntervalHours: 8,
  nextFundingTime: null,
  markPrice: 1,
  volume24hUsd: 1e9,
  openInterestUsd: 1e8,
});

const row = (partial: Partial<FundingOpportunity> & Pick<FundingOpportunity, "asset">): FundingOpportunity => ({
  asset: partial.asset,
  spreadApr: partial.spreadApr ?? 0.05,
  minVolume24hUsd: partial.minVolume24hUsd ?? 1e9,
  minOpenInterestUsd: partial.minOpenInterestUsd ?? 1e8,
  longLeg: partial.longLeg ?? leg("okx"),
  shortLeg: partial.shortLeg ?? leg("binance"),
});

describe("filterOpportunities", () => {
  it("filters by spread, volume, query and exchanges", () => {
    const rows = [
      row({ asset: "BTC", spreadApr: 0.02 }),
      row({ asset: "ETH", spreadApr: 0.08, minVolume24hUsd: 1e5 }),
      row({
        asset: "SOL",
        longLeg: leg("bybit"),
        shortLeg: leg("hyperliquid"),
      }),
    ];

    expect(
      filterOpportunities(rows, {
        ...defaultFilters,
        minSpreadApr: 0.05,
        minVolumeUsd: 1e6,
        query: "so",
        exchanges: ["bybit", "hyperliquid"],
      }),
    ).toEqual([rows[2]]);
  });
});