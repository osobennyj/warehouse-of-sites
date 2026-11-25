import { MARKETS_PER_EXCHANGE } from "@/shared/config";
import { exchangeSources, EXCHANGE_IDS, type ExchangeId, type FundingSnapshot } from "@/shared/api";

export interface ExchangeFetchStatus {
  exchange: ExchangeId;
  ok: boolean;
  error?: string;
  fetchedAt: number;
  count: number;
}

export interface SnapshotCollection {
  snapshots: FundingSnapshot[];
  statuses: ExchangeFetchStatus[];
}

export async function collectSnapshots(signal?: AbortSignal): Promise<SnapshotCollection> {
  const fetchedAt = Date.now();
  const settled = await Promise.allSettled(
    EXCHANGE_IDS.map((exchange) =>
      exchangeSources[exchange].fetchSnapshots({ limit: MARKETS_PER_EXCHANGE, signal }),
    ),
  );

  const snapshots: FundingSnapshot[] = [];
  const statuses: ExchangeFetchStatus[] = settled.map((result, index) => {
    const exchange = EXCHANGE_IDS[index]!;
    if (result.status === "fulfilled") {
      snapshots.push(...result.value);
      return { exchange, ok: true, fetchedAt, count: result.value.length };
    }
    return {
      exchange,
      ok: false,
      error: result.reason instanceof Error ? result.reason.message : "Unknown error",
      fetchedAt,
      count: 0,
    };
  });

  return { snapshots, statuses };
}