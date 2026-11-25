import { z } from "zod";
import type { HttpClient } from "../../http";
import { normalizeAsset } from "../parsing/normalize-asset";
import { parseNumber, parseTimestamp, topByVolume, withinRange } from "../parsing/parse";
import type { ExchangeFundingSource, FundingSnapshot } from "../types";

const DEFAULT_INTERVAL_HOURS = 8;
const PERPETUAL_USDT = /^([A-Z0-9]+)USDT$/;

const premiumIndexSchema = z.array(
  z.object({
    symbol: z.string(),
    markPrice: z.string(),
    lastFundingRate: z.string(),
    nextFundingTime: z.number(),
  }),
);
const tickerSchema = z.array(z.object({ symbol: z.string(), quoteVolume: z.string() }));
const fundingInfoSchema = z.array(z.object({ symbol: z.string(), fundingIntervalHours: z.number() }));
const openInterestSchema = z.object({ symbol: z.string(), openInterest: z.string() });
const historySchema = z.array(z.object({ fundingTime: z.number(), fundingRate: z.string() }));

export function createBinanceSource(http: HttpClient, baseUrl: string): ExchangeFundingSource {
  const api = `${baseUrl}/fapi/v1`;

  async function fetchOpenInterest(symbol: string, markPrice: number, signal?: AbortSignal) {
    try {
      const { openInterest } = await http.get(`${api}/openInterest?symbol=${symbol}`, openInterestSchema, {
        signal,
      });
      return parseNumber(openInterest) * markPrice;
    } catch {
      return null;
    }
  }

  return {
    id: "binance",

    async fetchSnapshots({ limit, signal }) {
      const [premium, tickers, fundingInfo] = await Promise.all([
        http.get(`${api}/premiumIndex`, premiumIndexSchema, { signal }),
        http.get(`${api}/ticker/24hr`, tickerSchema, { signal }),
        http.get(`${api}/fundingInfo`, fundingInfoSchema, { signal }),
      ]);
      const volumes = new Map(tickers.map((t) => [t.symbol, parseNumber(t.quoteVolume)]));
      const intervals = new Map(fundingInfo.map((f) => [f.symbol, f.fundingIntervalHours]));

      const perpetuals = premium.flatMap((row): FundingSnapshot[] => {
        const base = PERPETUAL_USDT.exec(row.symbol)?.[1];
        const volume24hUsd = volumes.get(row.symbol) ?? 0;
        if (!base || volume24hUsd <= 0) return [];
        return [
          {
            exchange: "binance",
            asset: normalizeAsset(base),
            symbol: row.symbol,
            fundingRate: parseNumber(row.lastFundingRate),
            fundingIntervalHours: intervals.get(row.symbol) ?? DEFAULT_INTERVAL_HOURS,
            nextFundingTime: parseTimestamp(row.nextFundingTime),
            markPrice: parseNumber(row.markPrice),
            volume24hUsd,
            openInterestUsd: null,
          },
        ];
      });

      // Binance only exposes open interest per symbol, so it is fetched for the shortlisted contracts only.
      const top = topByVolume(perpetuals, limit);
      const openInterest = await Promise.all(
        top.map((s) => fetchOpenInterest(s.symbol, s.markPrice, signal)),
      );
      return top.map((snapshot, index) => ({ ...snapshot, openInterestUsd: openInterest[index] ?? null }));
    },

    async fetchHistory({ symbol, from, to, signal }) {
      const rows = await http.get(
        `${api}/fundingRate?symbol=${symbol}&startTime=${from}&endTime=${to}&limit=1000`,
        historySchema,
        { signal },
      );
      return withinRange(
        rows.map((row) => ({ time: row.fundingTime, fundingRate: parseNumber(row.fundingRate) })),
        from,
        to,
      );
    },
  };
}
