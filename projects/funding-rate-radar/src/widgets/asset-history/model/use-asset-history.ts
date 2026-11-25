"use client";

import { useQueries } from "@tanstack/react-query";
import { HISTORY_WINDOW_DAYS } from "@/shared/config";
import { exchangeSources } from "@/shared/api";
import { groupSnapshotsByAsset, type AssetHistorySeries } from "@/entities/funding-rate";
import type { FundingSnapshot } from "@/shared/api";

const windowMs = HISTORY_WINDOW_DAYS * 24 * 3_600_000;

export function useAssetHistory(asset: string, snapshots: FundingSnapshot[]) {
  const byAsset = groupSnapshotsByAsset(snapshots);
  const venueSnapshots = (byAsset.get(asset.toUpperCase()) ?? []).filter((s) => s.asset === asset.toUpperCase());

  return useQueries({
    queries: venueSnapshots.map((snapshot) => ({
      queryKey: ["funding-history", asset, snapshot.exchange, snapshot.symbol] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) => {
        const to = Date.now();
        return exchangeSources[snapshot.exchange].fetchHistory({
          symbol: snapshot.symbol,
          from: to - windowMs,
          to,
          signal,
        });
      },
      staleTime: 5 * 60_000,
      enabled: Boolean(snapshot.symbol),
    })),
    combine: (results) => ({
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
      series: results
        .map((result, index) => ({
          exchange: venueSnapshots[index]!.exchange,
          points: result.data ?? [],
        }))
        .filter((row) => row.points.length > 0) satisfies AssetHistorySeries[],
    }),
  });
}