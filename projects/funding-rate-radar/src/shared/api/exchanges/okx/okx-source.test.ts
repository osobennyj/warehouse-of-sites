import { describe, expect, it } from "vitest";
import { createFixtureHttpClient } from "../testing/fixture-http-client";
import { createOkxSource } from "./okx-source";
import fundingRates from "./__fixtures__/funding-rates.json";
import fundingHistory from "./__fixtures__/funding-history-btc.json";
import markPrices from "./__fixtures__/mark-prices.json";
import openInterest from "./__fixtures__/open-interest.json";
import tickers from "./__fixtures__/tickers.json";

function setup(historyPayload: unknown = fundingHistory) {
  const http = createFixtureHttpClient([
    { match: "/public/funding-rate-history", payload: historyPayload },
    { match: "/public/funding-rate", payload: fundingRates },
    { match: "/market/tickers", payload: tickers },
    { match: "/public/open-interest", payload: openInterest },
    { match: "/public/mark-price", payload: markPrices },
  ]);
  return { ...http, source: createOkxSource(http.client, "https://okx.test") };
}

describe("okx source", () => {
  it("maps USDT swaps only and derives the interval from period boundaries", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });
    const btc = snapshots.find((s) => s.asset === "BTC");
    const rawBtc = fundingRates.data.find((r) => r.instId === "BTC-USDT-SWAP")!;

    expect(snapshots.map((s) => s.symbol)).not.toContain("BTC-USD-SWAP");
    expect(btc).toMatchObject({
      symbol: "BTC-USDT-SWAP",
      fundingRate: Number(rawBtc.fundingRate),
      fundingIntervalHours: (Number(rawBtc.nextFundingTime) - Number(rawBtc.fundingTime)) / 3_600_000,
      nextFundingTime: Number(rawBtc.fundingTime),
    });
  });

  it("computes USD volume from base-currency volume and uses reported USD open interest", async () => {
    const snapshots = await setup().source.fetchSnapshots({ limit: 50 });
    const doge = snapshots.find((s) => s.asset === "DOGE")!;
    const ticker = tickers.data.find((t) => t.instId === "DOGE-USDT-SWAP")!;
    const oi = openInterest.data.find((o) => o.instId === "DOGE-USDT-SWAP")!;

    expect(doge.volume24hUsd).toBeCloseTo(Number(ticker.volCcy24h) * Number(ticker.last));
    expect(doge.openInterestUsd).toBeCloseTo(Number(oi.oiUsd));
  });

  it("returns realized history rates in chronological order", async () => {
    const points = await setup().source.fetchHistory({
      symbol: "BTC-USDT-SWAP",
      from: 0,
      to: Number.MAX_SAFE_INTEGER,
    });

    expect(points).toHaveLength(fundingHistory.data.length);
    expect(points[0]!.time).toBeLessThan(points.at(-1)!.time);
  });

  it("paginates history backwards until the window start is covered", async () => {
    const fullPage = {
      code: "0",
      data: Array.from({ length: 100 }, (_, i) => ({
        fundingTime: String(1_000_000 - i * 1000),
        realizedRate: "0.0001",
      })),
    };
    const { source, requests } = setup(fullPage);

    await source.fetchHistory({ symbol: "BTC-USDT-SWAP", from: 0, to: Number.MAX_SAFE_INTEGER });

    expect(requests.filter((r) => r.url.includes("funding-rate-history"))).toHaveLength(4);
    expect(requests.at(-1)?.url).toContain("&after=901000");
  });
});
