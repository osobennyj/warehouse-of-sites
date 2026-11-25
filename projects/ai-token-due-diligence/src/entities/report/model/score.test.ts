import { describe, expect, it } from "vitest";
import { computeScore } from "./score";
import type { Facts } from "./schema";

const baseFacts = (): Facts => ({
  market: {
    sourceId: "S1",
    priceUsd: 1,
    marketCapUsd: 100,
    fdvUsd: 200,
    volume24hUsd: 12,
    marketCapRank: 10,
    circulatingSupply: 50,
    totalSupply: 100,
    maxSupply: 100,
    athUsd: 4,
    athChangePct: -75,
    priceChange24hPct: -2,
    priceChange30dPct: -10,
    priceChange1yPct: -20,
    mcapToFdvPct: 50,
    volumeToMcapPct: 12,
  },
  protocol: {
    sourceId: "S2",
    name: "Demo",
    category: "DEX",
    chains: ["Ethereum"],
    tvlUsd: 1_000,
    tvlChange30dPct: 5,
    fees: { last24hUsd: 1, last30dUsd: 30, last365dUsd: 400 },
    revenue: { last24hUsd: 1, last30dUsd: 20, last365dUsd: 200 },
    revenueYieldPct: 200,
    priceToRevenue: 0.5,
  },
  unlocks: {
    sourceId: "S3",
    windows: [
      { days: 30, tokens: 1, usd: 1, pctOfCirculating: 2 },
      { days: 90, tokens: 2, usd: 2, pctOfCirculating: 4 },
      { days: 365, tokens: 10, usd: 10, pctOfCirculating: 20 },
    ],
    upcoming: [],
    remainingLockedTokens: 10,
    scheduleEndsOn: "2027-01-01",
    notes: "Test",
  },
  holders: {
    sourceId: "S4",
    chain: "Ethereum",
    contract: "0x0",
    top1SharePct: 10,
    top10SharePct: 40,
    holders: [],
  },
  news: [],
});

describe("computeScore", () => {
  it("returns grade A for healthy facts", () => {
    const score = computeScore(baseFacts());
    expect(score.total).toBeGreaterThanOrEqual(65);
    expect(score.coveragePct).toBe(100);
  });

  it("lowers score when unlock overhang is high", () => {
    const facts = baseFacts();
    facts.unlocks!.windows = [{ days: 365, tokens: 80, usd: 80, pctOfCirculating: 80 }];
    const score = computeScore(facts);
    expect(score.total).toBeLessThan(65);
    expect(["C", "D", "F"]).toContain(score.grade);
  });
});