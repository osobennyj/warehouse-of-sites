import { describe, expect, it } from "vitest";
import type { FundingSnapshot } from "@/shared/api";
import { buildOpportunity, groupSnapshotsByAsset, rankOpportunities } from "./spread";

const snapshot = (partial: Partial<FundingSnapshot> & Pick<FundingSnapshot, "exchange" | "asset" | "fundingRate">): FundingSnapshot => ({
  symbol: `${partial.asset}USDT`,
  fundingIntervalHours: 8,
  nextFundingTime: null,
  markPrice: 100,
  volume24hUsd: 1_000_000,
  openInterestUsd: 500_000,
  ...partial,
});

describe("funding spread", () => {
  it("picks lowest APR for long and highest for short", () => {
    const opportunity = buildOpportunity("BTC", [
      snapshot({ exchange: "binance", asset: "BTC", fundingRate: 0.0001 }),
      snapshot({ exchange: "bybit", asset: "BTC", fundingRate: 0.00005 }),
      snapshot({ exchange: "okx", asset: "BTC", fundingRate: -0.00002 }),
    ]);

    expect(opportunity?.longLeg.exchange).toBe("okx");
    expect(opportunity?.shortLeg.exchange).toBe("binance");
    expect(opportunity!.spreadApr).toBeGreaterThan(0);
  });

  it("returns null for a single venue", () => {
    expect(buildOpportunity("ETH", [snapshot({ exchange: "binance", asset: "ETH", fundingRate: 0.0001 })])).toBeNull();
  });

  it("ranks by spread descending", () => {
    const grouped = groupSnapshotsByAsset([
      snapshot({ exchange: "binance", asset: "BTC", fundingRate: 0.0002 }),
      snapshot({ exchange: "bybit", asset: "BTC", fundingRate: 0 }),
      snapshot({ exchange: "binance", asset: "ETH", fundingRate: 0.00005 }),
      snapshot({ exchange: "bybit", asset: "ETH", fundingRate: 0.0002 }),
    ]);
    const ranked = rankOpportunities(grouped);
    expect(ranked[0]!.spreadApr).toBeGreaterThanOrEqual(ranked[1]!.spreadApr);
  });

  it("uses min volume and OI across legs", () => {
    const opportunity = buildOpportunity("SOL", [
      snapshot({ exchange: "binance", asset: "SOL", fundingRate: 0.0001, volume24hUsd: 2e6, openInterestUsd: 100 }),
      snapshot({ exchange: "bybit", asset: "SOL", fundingRate: -0.0001, volume24hUsd: 5e6, openInterestUsd: 50 }),
    ]);
    expect(opportunity?.minVolume24hUsd).toBe(2e6);
    expect(opportunity?.minOpenInterestUsd).toBe(50);
  });
});