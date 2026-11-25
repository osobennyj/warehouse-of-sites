import { describe, expect, it } from "vitest";
import { createFixtureHttpClient } from "../testing/fixture-http-client";
import { createBybitSource } from "./bybit-source";
import fundingHistory from "./__fixtures__/funding-history-btc.json";
import instruments from "./__fixtures__/instruments.json";
import tickers from "./__fixtures__/tickers.json";

function setup() {
  const http = createFixtureHttpClient([
    { match: "/tickers", payload: tickers },
    { match: "/instruments-info", payload: instruments },
    { match: "/funding/history", payload: fundingHistory },
  ]);
  return { ...http, source: createBybitSource(http.client, "https://bybit.test") };
}

describe("bybit source", () => {
  it("maps USDT linear perpetuals and skips USDC contracts", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });

    expect(snapshots.map((s) => s.symbol)).not.toContain("BTCPERP");
    expect(snapshots.map((s) => s.asset).sort()).toEqual(["BTC", "DOGE", "ETH", "PEPE", "SOL"]);
  });

  it("converts the funding interval from minutes and keeps open interest in USD", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });
    const pepe = snapshots.find((s) => s.asset === "PEPE");

    expect(pepe).toMatchObject({
      symbol: "1000PEPEUSDT",
      fundingIntervalHours: 4,
      fundingRate: 0.0001,
      openInterestUsd: 62_830_000,
      volume24hUsd: 120_500_000,
    });
  });

  it("supports negative funding rates", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });

    expect(snapshots.find((s) => s.asset === "SOL")?.fundingRate).toBeLessThan(0);
  });

  it("returns history sorted ascending and passes both window bounds", async () => {
    const { source, requests } = setup();
    const points = await source.fetchHistory({ symbol: "BTCUSDT", from: 0, to: Number.MAX_SAFE_INTEGER });

    expect(points).toHaveLength(6);
    expect(points[0]!.time).toBeLessThan(points[5]!.time);
    expect(requests[0]?.url).toMatch(/startTime=0&endTime=\d+/);
  });
});
