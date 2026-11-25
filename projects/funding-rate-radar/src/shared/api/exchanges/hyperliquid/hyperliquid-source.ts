import { z } from "zod";
import type { HttpClient } from "../../http";
import { normalizeAsset } from "../parsing/normalize-asset";
import { parseNumber, topByVolume, withinRange } from "../parsing/parse";
import type { ExchangeFundingSource, FundingSnapshot } from "../types";

const HOUR_MS = 3_600_000;
const FUNDING_INTERVAL_HOURS = 1;

const metaAndContextsSchema = z.tuple([
  z.object({
    universe: z.array(z.object({ name: z.string(), isDelisted: z.boolean().optional() })),
  }),
  z.array(
    z.object({
      funding: z.string(),
      openInterest: z.string(),
      markPx: z.string(),
      dayNtlVlm: z.string(),
    }),
  ),
]);
const historySchema = z.array(z.object({ time: z.number(), fundingRate: z.string() }));

/** Hyperliquid settles funding every hour, on the hour. */
const nextHour = (now: number) => Math.floor(now / HOUR_MS) * HOUR_MS + HOUR_MS;

export function createHyperliquidSource(
  http: HttpClient,
  infoUrl: string,
  now: () => number = Date.now,
): ExchangeFundingSource {
  return {
    id: "hyperliquid",

    async fetchSnapshots({ limit, signal }) {
      const [meta, contexts] = await http.post(infoUrl, { type: "metaAndAssetCtxs" }, metaAndContextsSchema, {
        signal,
      });
      const nextFundingTime = nextHour(now());

      const snapshots = meta.universe.flatMap((asset, index): FundingSnapshot[] => {
        const context = contexts[index];
        if (!context || asset.isDelisted) return [];
        const markPrice = parseNumber(context.markPx);
        const volume24hUsd = parseNumber(context.dayNtlVlm);
        if (volume24hUsd <= 0) return [];
        return [
          {
            exchange: "hyperliquid",
            asset: normalizeAsset(asset.name),
            symbol: asset.name,
            fundingRate: parseNumber(context.funding),
            fundingIntervalHours: FUNDING_INTERVAL_HOURS,
            nextFundingTime,
            markPrice,
            volume24hUsd,
            openInterestUsd: parseNumber(context.openInterest) * markPrice,
          },
        ];
      });
      return topByVolume(snapshots, limit);
    },

    async fetchHistory({ symbol, from, to, signal }) {
      const rows = await http.post(
        infoUrl,
        { type: "fundingHistory", coin: symbol, startTime: from, endTime: to },
        historySchema,
        { signal },
      );
      return withinRange(
        rows.map((row) => ({ time: row.time, fundingRate: parseNumber(row.fundingRate) })),
        from,
        to,
      );
    },
  };
}
