"use client";

import { useQuery } from "@tanstack/react-query";
import { SNAPSHOT_REFRESH_MS } from "@/shared/config";
import { collectSnapshots } from "./collect-snapshots";

export function useFundingSnapshots() {
  return useQuery({
    queryKey: ["funding-snapshots"],
    queryFn: ({ signal }) => collectSnapshots(signal),
    refetchInterval: SNAPSHOT_REFRESH_MS,
    staleTime: 60_000,
  });
}