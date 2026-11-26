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

const INITIAL_ROWS = 10;

export function DashboardView() {
  const { data, isLoading, isFetching, dataUpdatedAt, error } = useFundingSnapshots();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const opportunities = useMemo(() => {
    const spreadRanked = rankOpportunities(groupSnapshotsByAsset(data?.snapshots ?? []));
    const filtered = filterOpportunities(spreadRanked, filters);
    return rankOpportunitiesByNetUsd(filtered);
  }, [data?.snapshots, filters]);

  const activeAsset = selectedAsset ?? opportunities[0]?.asset ?? null;

  return (
    <DashboardShell>
      <section className="grid gap-2.5 pt-6">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-teal-400 uppercase">Demo</p>
        <h1 className="text-[clamp(1.9rem,1.4rem+1.6vw,2.75rem)] leading-[1.1] font-semibold tracking-tight">
          Funding Rate Radar
        </h1>
        <p className="max-w-[44rem] text-zinc-400">
          Compares perpetual funding rates across Binance, Bybit, OKX and Hyperliquid and ranks the spreads by net
          profit after fees at the position size you set.
        </p>
        <p className="max-w-[44rem] rounded-xl border border-teal-400/35 bg-teal-400/10 px-3 py-2.5 text-sm text-teal-100">
          Live data from public exchange APIs, refreshed every {SNAPSHOT_REFRESH_MS / 60_000} minutes. No API keys, no
          orders. Not investment advice.
          <span className="text-teal-200/70">
            {" "}
            {isFetching ? "Refreshing…" : dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}.` : null}
          </span>
        </p>
      </section>

      {error ? (
        <p className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
          Failed to load market data: {(error as Error).message}
        </p>
      ) : null}

      <section aria-labelledby="spreads-title" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="spreads-title" className="text-lg font-semibold tracking-tight">
            Spreads{" "}
            <span className="text-sm font-normal text-slate-500">
              {isLoading ? "loading…" : `${opportunities.length} assets, ranked by net USD`}
            </span>
          </h2>
          <p className="text-xs text-slate-500">Click a row to size it below.</p>
        </div>
        <OpportunityFiltersPanel filters={filters} onChange={setFilters} />
        <OpportunitiesTable
          rows={showAll ? opportunities : opportunities.slice(0, INITIAL_ROWS)}
          selectedAsset={activeAsset}
          onSelectAsset={setSelectedAsset}
        />
        {opportunities.length > INITIAL_ROWS ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="justify-self-center rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:border-slate-500"
          >
            {showAll ? "Show top " + INITIAL_ROWS : `Show all ${opportunities.length}`}
          </button>
        ) : null}
      </section>

      <ArbFocus opportunities={opportunities} selectedAsset={activeAsset} />

      <ExchangeStatusBar statuses={data?.statuses ?? []} updatedAt={dataUpdatedAt} />

      <Disclaimer />
    </DashboardShell>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Not investment advice. Rates are indicative. Very high spread APRs usually mean thin liquidity on one leg. Execution,
      basis risk, borrow costs and exchange outages are not modeled beyond the taker fees shown.
    </p>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 py-4">{children}</div>;
}