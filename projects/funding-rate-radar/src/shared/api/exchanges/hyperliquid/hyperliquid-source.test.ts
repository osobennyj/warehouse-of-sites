import { describe, expect, it } from "vitest";
import { createFixtureHttpClient } from "../testing/fixture-http-client";
import { createHyperliquidSource } from "./hyperliquid-source";
import fundingHistory from "./__fixtures__/funding-history-btc.json";
import metaAndContexts from "./__fixtures__/meta-and-asset-ctxs.json";

const NOW = Date.UTC(2026, 10, 25, 10, 20);

function setup(meta: unknown = metaAndContexts) {
  const http = createFixtureHttpClient([
    { match: "#metaAndAssetCtxs", payload: meta },
    { match: "#fundingHistory", payload: fundingHistory },
  ]);
  return { ...http, source: createHyperliquidSource(http.client, "https://hl.test/info", () => NOW) };
}

describe("hyperliquid source", () => {
  it("joins universe with asset contexts and normalizes kPEPE to PEPE", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });
    const pepe = snapshots.find((s) => s.asset === "PEPE");

    expect(snapshots.map((s) => s.asset).sort()).toEqual(["BTC", "DOGE", "ETH", "PEPE", "SOL"]);
    expect(pepe?.symbol).toBe("kPEPE");
  });

  it("uses hourly funding settled on the next full hour and OI in USD", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });
    const btc = snapshots.find((s) => s.asset === "BTC")!;
    const contexts = metaAndContexts as [unknown, { openInterest: string; markPx: string }[]];
    const context = contexts[1][0]!;

    expect(btc.fundingIntervalHours).toBe(1);
    expect(btc.nextFundingTime).toBe(Date.UTC(2026, 10, 25, 11));
    expect(btc.openInterestUsd).toBeCloseTo(Number(context.openInterest) * Number(context.markPx));
  });

  it("skips delisted markets", async () => {
    const typed = metaAndContexts as [{ universe: { name: string }[] }, unknown[]];
    const [meta, contexts] = typed;
    const delisted = [
      { universe: meta.universe.map((u, i) => (i === 0 ? { ...u, isDelisted: true } : u)) },
      contexts,
    ];
    const snapshots = await setup(delisted).source.fetchSnapshots({ limit: 50 });

    expect(snapshots.map((s) => s.asset)).not.toContain("BTC");
  });

  it("requests history for the coin within the window", async () => {
    const { source, requests } = setup();
    const points = await source.fetchHistory({ symbol: "BTC", from: 0, to: Number.MAX_SAFE_INTEGER });

    expect(points).toHaveLength(fundingHistory.length);
    expect(requests[0]?.body).toMatchObject({ type: "fundingHistory", coin: "BTC", startTime: 0 });
  });
});
