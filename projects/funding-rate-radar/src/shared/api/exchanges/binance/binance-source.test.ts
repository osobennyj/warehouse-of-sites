import { describe, expect, it } from "vitest";
import { createFixtureHttpClient } from "../testing/fixture-http-client";
import { createBinanceSource } from "./binance-source";
import fundingHistory from "./__fixtures__/funding-history-btc.json";
import fundingInfo from "./__fixtures__/funding-info.json";
import openInterest from "./__fixtures__/open-interest-btc.json";
import premiumIndex from "./__fixtures__/premium-index.json";
import tickers from "./__fixtures__/ticker-24hr.json";

const BASE = "https://binance.test";

function setup(extraRoutes: { match: string; payload: unknown }[] = []) {
  const http = createFixtureHttpClient([
    ...extraRoutes,
    { match: "/premiumIndex", payload: premiumIndex },
    { match: "/ticker/24hr", payload: tickers },
    { match: "/fundingInfo", payload: fundingInfo },
    { match: "/openInterest", payload: openInterest },
    { match: "/fundingRate", payload: fundingHistory },
  ]);
  return { ...http, source: createBinanceSource(http.client, BASE) };
}

describe("binance source", () => {
  it("maps USDT perpetuals to normalized snapshots, excluding delivery contracts", async () => {
    const { source } = setup();
    const snapshots = await source.fetchSnapshots({ limit: 50 });

    expect(snapshots.map((s) => s.symbol)).not.toContain("BTCUSDT_261225");
    expect(snapshots.map((s) => s.asset).sort()).toEqual(["BTC", "DOGE", "ETH", "PEPE", "SOL"]);

    const btc = snapshots.find((s) => s.asset === "BTC");
    expect(btc).toMatchObject({
      exchange: "binance",
      symbol: "BTCUSDT",
      fundingIntervalHours: 8,
      fundingRate: Number(premiumIndex.find((r) => r.symbol === "BTCUSDT")?.lastFundingRate),
    });
    expect(btc?.volume24hUsd).toBeGreaterThan(0);
    expect(btc?.openInterestUsd).toBeCloseTo(Number(openInterest.openInterest) * (btc?.markPrice ?? 0));
  });

  it("keeps the most liquid contracts and sorts them by volume", async () => {
    const { source, requests } = setup();
    const snapshots = await source.fetchSnapshots({ limit: 2 });

    expect(snapshots).toHaveLength(2);
    expect(snapshots[0]!.volume24hUsd).toBeGreaterThanOrEqual(snapshots[1]!.volume24hUsd);
    expect(requests.filter((r) => r.url.includes("/openInterest"))).toHaveLength(2);
  });

  it("degrades to null open interest when the per-symbol request fails", async () => {
    const { source } = setup([{ match: "/openInterest", payload: { unexpected: true } }]);
    const snapshots = await source.fetchSnapshots({ limit: 1 });

    expect(snapshots[0]?.openInterestUsd).toBeNull();
  });

  it("returns funding history inside the requested window in chronological order", async () => {
    const { source, requests } = setup();
    const times = fundingHistory.map((r) => r.fundingTime);
    const from = times[1]!;
    const to = times.at(-1)!;

    const points = await source.fetchHistory({ symbol: "BTCUSDT", from, to });

    expect(points[0]?.time).toBe(from);
    expect(points).toHaveLength(times.length - 1);
    expect(requests[0]?.url).toContain(`symbol=BTCUSDT&startTime=${from}&endTime=${to}`);
  });
});
