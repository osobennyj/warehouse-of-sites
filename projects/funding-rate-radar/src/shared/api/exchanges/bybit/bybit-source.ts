import { z } from "zod";
import type { HttpClient } from "../../http";
import { normalizeAsset } from "../parsing/normalize-asset";
import { parseNumber, parseOptionalNumber, parseTimestamp, topByVolume, withinRange } from "../parsing/parse";
import type { ExchangeFundingSource, FundingSnapshot } from "../types";

const DEFAULT_INTERVAL_MINUTES = 480;

const envelope = <T extends z.ZodType>(list: T) =>
  z.object({
    retCode: z.literal(0),
    result: z.object({ list: z.array(list) }),
  });

const tickersSchema = envelope(
  z.object({
    symbol: z.string(),
    markPrice: z.string(),
    fundingRate: z.string(),
    nextFundingTime: z.string(),
    turnover24h: z.string(),
    openInterestValue: z.string(),
  }),
);
const instrumentsSchema = envelope(
  z.object({
    symbol: z.string(),
    status: z.string(),
    quoteCoin: z.string(),
    baseCoin: z.string(),
    contractType: z.string(),
    fundingInterval: z.number(),
  }),
);
const historySchema = envelope(z.object({ fundingRate: z.string(), fundingRateTimestamp: z.string() }));

export function createBybitSource(http: HttpClient, baseUrl: string): ExchangeFundingSource {
  const api = `${baseUrl}/v5/market`;

  return {
    id: "bybit",

    async fetchSnapshots({ limit, signal }) {
      const [tickers, instruments] = await Promise.all([
        http.get(`${api}/tickers?category=linear`, tickersSchema, { signal }),
        http.get(`${api}/instruments-info?category=linear&limit=1000`, instrumentsSchema, { signal }),
      ]);
      const perpetuals = new Map(
        instruments.result.list
          .filter((i) => i.contractType === "LinearPerpetual" && i.quoteCoin === "USDT" && i.status === "Trading")
          .map((i) => [i.symbol, i]),
      );

      const snapshots = tickers.result.list.flatMap((ticker): FundingSnapshot[] => {
        const instrument = perpetuals.get(ticker.symbol);
        const volume24hUsd = parseNumber(ticker.turnover24h);
        if (!instrument || volume24hUsd <= 0) return [];
        return [
          {
            exchange: "bybit",
            asset: normalizeAsset(ticker.symbol.replace(/USDT$/, "")),
            symbol: ticker.symbol,
            fundingRate: parseNumber(ticker.fundingRate),
            fundingIntervalHours: (instrument.fundingInterval || DEFAULT_INTERVAL_MINUTES) / 60,
            nextFundingTime: parseTimestamp(ticker.nextFundingTime),
            markPrice: parseNumber(ticker.markPrice),
            volume24hUsd,
            openInterestUsd: parseOptionalNumber(ticker.openInterestValue),
          },
        ];
      });
      return topByVolume(snapshots, limit);
    },

    async fetchHistory({ symbol, from, to, signal }) {
      const { result } = await http.get(
        `${api}/funding/history?category=linear&symbol=${symbol}&startTime=${from}&endTime=${to}&limit=200`,
        historySchema,
        { signal },
      );
      return withinRange(
        result.list.map((row) => ({
          time: parseNumber(row.fundingRateTimestamp),
          fundingRate: parseNumber(row.fundingRate),
        })),
        from,
        to,
      );
    },
  };
}
