import { z } from "zod";
import type { HttpClient } from "../../http";
import { normalizeAsset } from "../parsing/normalize-asset";
import { parseNumber, parseOptionalNumber, parseTimestamp, topByVolume, withinRange } from "../parsing/parse";
import type { ExchangeFundingSource, FundingHistoryPoint, FundingSnapshot } from "../types";

const HOUR_MS = 3_600_000;
const DEFAULT_INTERVAL_HOURS = 8;
const HISTORY_PAGE_SIZE = 100;
const MAX_HISTORY_PAGES = 4;
const USDT_SWAP = /^([A-Z0-9]+)-USDT-SWAP$/;

const envelope = <T extends z.ZodType>(row: T) => z.object({ code: z.literal("0"), data: z.array(row) });

const fundingSchema = envelope(
  z.object({
    instId: z.string(),
    fundingRate: z.string(),
    fundingTime: z.string(),
    nextFundingTime: z.string(),
  }),
);
const tickersSchema = envelope(z.object({ instId: z.string(), last: z.string(), volCcy24h: z.string() }));
const openInterestSchema = envelope(z.object({ instId: z.string(), oiUsd: z.string() }));
const markPriceSchema = envelope(z.object({ instId: z.string(), markPx: z.string() }));
const historySchema = envelope(z.object({ fundingTime: z.string(), realizedRate: z.string() }));

/** OKX reports the current period boundaries instead of an interval field. */
function intervalHours(fundingTime: string, nextFundingTime: string): number {
  const hours = Math.round((parseNumber(nextFundingTime) - parseNumber(fundingTime)) / HOUR_MS);
  return hours > 0 ? hours : DEFAULT_INTERVAL_HOURS;
}

const byInstrument = <T extends { instId: string }>(rows: T[]) => new Map(rows.map((row) => [row.instId, row]));

export function createOkxSource(http: HttpClient, baseUrl: string): ExchangeFundingSource {
  const api = `${baseUrl}/api/v5`;

  return {
    id: "okx",

    async fetchSnapshots({ limit, signal }) {
      const [funding, tickers, openInterest, markPrices] = await Promise.all([
        http.get(`${api}/public/funding-rate?instId=ANY`, fundingSchema, { signal }),
        http.get(`${api}/market/tickers?instType=SWAP`, tickersSchema, { signal }),
        http.get(`${api}/public/open-interest?instType=SWAP`, openInterestSchema, { signal }),
        http.get(`${api}/public/mark-price?instType=SWAP`, markPriceSchema, { signal }),
      ]);
      const tickerById = byInstrument(tickers.data);
      const oiById = byInstrument(openInterest.data);
      const markById = byInstrument(markPrices.data);

      const snapshots = funding.data.flatMap((row): FundingSnapshot[] => {
        const base = USDT_SWAP.exec(row.instId)?.[1];
        const ticker = tickerById.get(row.instId);
        if (!base || !ticker) return [];
        const lastPrice = parseNumber(ticker.last);
        const volume24hUsd = parseNumber(ticker.volCcy24h) * lastPrice;
        if (volume24hUsd <= 0) return [];
        return [
          {
            exchange: "okx",
            asset: normalizeAsset(base),
            symbol: row.instId,
            fundingRate: parseNumber(row.fundingRate),
            fundingIntervalHours: intervalHours(row.fundingTime, row.nextFundingTime),
            nextFundingTime: parseTimestamp(row.fundingTime),
            markPrice: parseNumber(markById.get(row.instId)?.markPx, lastPrice),
            volume24hUsd,
            openInterestUsd: parseOptionalNumber(oiById.get(row.instId)?.oiUsd),
          },
        ];
      });
      return topByVolume(snapshots, limit);
    },

    async fetchHistory({ symbol, from, to, signal }) {
      const points: FundingHistoryPoint[] = [];
      let cursor = "";
      for (let page = 0; page < MAX_HISTORY_PAGES; page += 1) {
        const { data } = await http.get(
          `${api}/public/funding-rate-history?instId=${symbol}&limit=${HISTORY_PAGE_SIZE}${cursor}`,
          historySchema,
          { signal },
        );
        points.push(
          ...data.map((row) => ({ time: parseNumber(row.fundingTime), fundingRate: parseNumber(row.realizedRate) })),
        );
        const oldest = data.at(-1)?.fundingTime;
        if (data.length < HISTORY_PAGE_SIZE || !oldest || parseNumber(oldest) <= from) break;
        cursor = `&after=${oldest}`;
      }
      return withinRange(points, from, to);
    },
  };
}
