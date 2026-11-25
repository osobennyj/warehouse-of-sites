import { z } from "zod";
import { TokenRefSchema } from "@/entities/report";
import type { DataSources } from "./types";

/**
 * A frozen copy of every data-source response for one token. Used to make sample reports
 * reproducible and to run evals offline (no network, no rate limits).
 */
const CallSchema = z.union([
  z.object({ ok: z.literal(true), value: z.unknown() }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

export const DataSnapshotSchema = z.object({
  capturedAt: z.iso.datetime(),
  query: z.string(),
  token: TokenRefSchema,
  calls: z.record(z.string(), CallSchema),
});
export type DataSnapshot = z.infer<typeof DataSnapshotSchema>;

type Call = z.infer<typeof CallSchema>;
type SnapshotKey = "market" | "protocol" | "unlocks" | "holders" | "news";

export function recordDataSources(sources: DataSources) {
  const calls: Record<string, Call> = {};
  const record = async <T>(key: SnapshotKey, load: () => Promise<T>): Promise<T> => {
    try {
      const value = await load();
      calls[key] = { ok: true, value };
      return value;
    } catch (error) {
      calls[key] = { ok: false, error: error instanceof Error ? error.message : String(error) };
      throw error;
    }
  };

  const recorded: DataSources = {
    tokens: sources.tokens,
    market: { getMarketData: (id) => record("market", () => sources.market.getMarketData(id)) },
    protocol: {
      getProtocolMetrics: (t) => record("protocol", () => sources.protocol.getProtocolMetrics(t)),
    },
    unlocks: { getSchedule: (id) => record("unlocks", () => sources.unlocks.getSchedule(id)) },
    holders: {
      getTopHolders: (t, n) => record("holders", () => sources.holders.getTopHolders(t, n)),
    },
    news: { getRecentNews: (t, n) => record("news", () => sources.news.getRecentNews(t, n)) },
  };

  return { sources: recorded, calls: () => ({ ...calls }) };
}

export function replayDataSources(snapshot: DataSnapshot): DataSources {
  // Snapshot values were produced by the same adapters, so their shapes are trusted here.
  const replay = async <T>(key: SnapshotKey, whenMissing: () => T): Promise<T> => {
    const call = snapshot.calls[key];
    if (!call) return whenMissing();
    if (!call.ok) throw new Error(call.error);
    return call.value as T;
  };

  return {
    tokens: { resolve: async () => snapshot.token },
    market: { getMarketData: () => replay("market", () => {
        throw new Error(`Market data was not recorded for ${snapshot.token.id}`);
      }) },
    protocol: { getProtocolMetrics: () => replay("protocol", () => null) },
    unlocks: { getSchedule: () => replay("unlocks", () => null) },
    holders: { getTopHolders: () => replay("holders", () => null) },
    news: { getRecentNews: () => replay("news", () => []) },
  };
}
