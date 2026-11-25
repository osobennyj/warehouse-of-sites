import { describe, expect, it } from "vitest";
import { runHallucinationGuard } from "./guard";
import type { Analysis, Facts } from "./schema";

const facts: Facts = {
  market: {
    sourceId: "S1",
    priceUsd: 1.5,
    marketCapUsd: 100,
    fdvUsd: null,
    volume24hUsd: null,
    marketCapRank: null,
    circulatingSupply: null,
    totalSupply: null,
    maxSupply: null,
    athUsd: null,
    athChangePct: null,
    priceChange24hPct: null,
    priceChange30dPct: null,
    priceChange1yPct: null,
    mcapToFdvPct: null,
    volumeToMcapPct: null,
  },
  protocol: null,
  unlocks: null,
  holders: null,
  news: [],
};

const baseAnalysis = (): Analysis => ({
  summary: "Market data loaded from CoinGecko.",
  tokenomics: "No vesting file.",
  fundamentals: "No protocol.",
  distribution: "No holder data.",
  catalysts: [],
  risks: [],
  redFlags: [],
  verdict: "Neutral.",
});

describe("hallucination guard", () => {
  it("passes when numbers match facts", () => {
    const result = runHallucinationGuard(baseAnalysis(), facts);
    expect(result.passed).toBe(true);
  });

  it("flags invented numbers", () => {
    const analysis = { ...baseAnalysis(), summary: "Mysterious FDV of 9999999 dollars." };
    const result = runHallucinationGuard(analysis, facts);
    expect(result.passed).toBe(false);
    expect(result.unverifiedNumbers.length).toBeGreaterThan(0);
  });
});