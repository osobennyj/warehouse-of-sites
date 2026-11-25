"use client";

import { useMemo, useState } from "react";
import { groupSnapshotsByAsset, rankOpportunities, rankOpportunitiesByNetUsd } from "@/entities/funding-rate";
import { defaultFilters, filterOpportunities } from "@/features/filter-opportunities";
import { SNAPSHOT_REFRESH_MS } from "@/shared/config";
import { ArbFocus } from "@/widgets/arb-focus";
import { ExchangeStatusBar } from "@/widgets/funding-snapshots";
import { OpportunitiesTable } from "@/widgets/opportunities-table";
import { OpportunityFiltersPanel } from "@/widgets/opportunity-filters";
import { useFundingSnapshots } from "@/widgets/funding-snapshots";

export function DashboardView() {
  const { data, isLoading, isFetching, dataUpdatedAt, error } = useFundingSnapshots();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const opportunities = useMemo(() => {
    const spreadRanked = rankOpportunities(groupSnapshotsByAsset(data?.snapshots ?? []));
    const filtered = filterOpportunities(spreadRanked, filters);
    return rankOpportunitiesByNetUsd(filtered);
  }, [data?.snapshots, filters]);

  const activeAsset = selectedAsset ?? opportunities[0]?.asset ?? null;

  return (
    <DashboardShell>
      <p className="text-sm text-slate-400">
        Live funding spreads · Binance, Bybit, OKX, Hyperliquid · refresh every {SNAPSHOT_REFRESH_MS / 60_000} min ·
        no API keys
        <span className="text-slate-600">
          {" "}
          · {isFetching ? "Refreshing…" : dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : null}
        </span>
      </p>

      {error ? (
        <p className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
          Failed to load market data: {(error as Error).message}
        </p>
      ) : null}

      <ArbFocus opportunities={opportunities} selectedAsset={activeAsset} onSelectAsset={setSelectedAsset} />

      <ExchangeStatusBar statuses={data?.statuses ?? []} updatedAt={dataUpdatedAt} />

      <details className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-200">
          All ranked spreads ({isLoading ? "…" : opportunities.length})
        </summary>
        <div className="mt-4 space-y-4">
          <OpportunityFiltersPanel filters={filters} onChange={setFilters} />
          <OpportunitiesTable rows={opportunities} selectedAsset={activeAsset} onSelectAsset={setSelectedAsset} />
        </div>
      </details>

      <Disclaimer />
    </DashboardShell>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Educational dashboard only, not financial advice. Rates and spreads are indicative. Execution, basis risk, borrow
      costs and exchange outages are not modeled beyond the fee assumptions above.
    </p>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 py-4">{children}</div>;
}