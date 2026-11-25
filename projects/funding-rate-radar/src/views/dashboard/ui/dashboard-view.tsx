"use client";

import { useState } from "react";
import { groupSnapshotsByAsset, rankOpportunities } from "@/entities/funding-rate";
import { defaultFilters, filterOpportunities } from "@/features/filter-opportunities";
import { MARKETS_PER_EXCHANGE, SNAPSHOT_REFRESH_MS } from "@/shared/config";
import { env } from "@/shared/config";
import { ExchangeStatusBar } from "@/widgets/funding-snapshots";
import { NetYieldCalculator } from "@/widgets/net-yield-calculator";
import { OpportunitiesTable } from "@/widgets/opportunities-table";
import { OpportunityFiltersPanel } from "@/widgets/opportunity-filters";
import { useFundingSnapshots } from "@/widgets/funding-snapshots";

export function DashboardView() {
  const { data, isLoading, isFetching, dataUpdatedAt, error } = useFundingSnapshots();
  const [filters, setFilters] = useState(defaultFilters);

  const opportunities = filterOpportunities(
    rankOpportunities(groupSnapshotsByAsset(data?.snapshots ?? [])),
    filters,
  );

  const top = opportunities[0];

  return (
    <DashboardShell>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Funding Rate Radar</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Cross-exchange perpetual funding spreads across Binance, Bybit, OKX and Hyperliquid. Refreshes every{" "}
            {SNAPSHOT_REFRESH_MS / 60_000} minutes — client-side, no API keys.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {isFetching ? "Refreshing…" : dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : null}
        </div>
      </section>

      {error ? (
        <p className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
          Failed to load market data: {(error as Error).message}
        </p>
      ) : null}

      <ExchangeStatusBar statuses={data?.statuses ?? []} updatedAt={dataUpdatedAt} />

      <div className="grid gap-4 text-sm text-slate-400 md:grid-cols-3">
        <Stat label="Markets / exchange" value={`${MARKETS_PER_EXCHANGE}`} />
        <Stat label="Live opportunities" value={isLoading ? "…" : String(opportunities.length)} />
        <Stat label="Source" value={<a href={env.repositoryUrl} className="text-emerald-300 hover:underline">GitHub</a>} />
      </div>

      <OpportunityFiltersPanel filters={filters} onChange={setFilters} />
      <OpportunitiesTable rows={opportunities} />
      <NetYieldCalculator opportunity={top} />
      <Disclaimer />
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
      <Label>{label}</Label>
      <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Educational dashboard only — not financial advice. Rates and spreads are indicative; execution, basis risk, borrow
      costs and exchange outages are not modeled beyond the fee calculator defaults.
    </p>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 py-6">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wide text-slate-500">{children}</div>;
}