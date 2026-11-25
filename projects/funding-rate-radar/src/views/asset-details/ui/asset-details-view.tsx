"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildOpportunity, groupSnapshotsByAsset, formatFundingRate, formatApr } from "@/entities/funding-rate";
import { exchangeLabel } from "@/entities/exchange";
import { useFundingSnapshots } from "@/widgets/funding-snapshots";
import { useAssetHistory } from "@/widgets/asset-history";
import { FundingHistoryChart } from "@/widgets/funding-history-chart";
import { NetYieldCalculator } from "@/widgets/net-yield-calculator";

export function AssetDetailsView({ asset }: { asset: string }) {
  const normalized = asset.toUpperCase();
  const { data, isLoading } = useFundingSnapshots();
  const snapshots = data?.snapshots ?? [];

  const opportunity = useMemo(() => {
    const grouped = groupSnapshotsByAsset(snapshots);
    return buildOpportunity(normalized, grouped.get(normalized) ?? []);
  }, [snapshots, normalized]);

  const { series, isLoading: historyLoading } = useAssetHistory(normalized, snapshots);

  return (
    <div className="grid gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            <Link href="/" className="hover:text-emerald-300">
              Dashboard
            </Link>{" "}
            / Asset
          </p>
          <h1 className="text-3xl font-semibold text-white">{normalized}</h1>
        </div>
        {opportunity ? (
          <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 px-4 py-3 text-right">
            <div className="text-xs text-emerald-200/80">Cross-venue spread APR</div>
            <div className="font-mono text-2xl text-emerald-300">{formatApr(opportunity.spreadApr)}</div>
          </div>
        ) : null}
      </div>

      {isLoading ? <p className="text-sm text-slate-400">Loading live funding…</p> : null}

      {opportunity ? (
        <VenueGrid>
          <VenueCard title="Long leg (lower funding)" leg={opportunity.longLeg} />
          <VenueCard title="Short leg (higher funding)" leg={opportunity.shortLeg} />
        </VenueGrid>
      ) : (
        <p className="text-sm text-amber-200">Need at least two exchanges online for this asset to compute a spread.</p>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-200">{`7-day funding APR by exchange`}</h2>
        {historyLoading ? <p className="text-sm text-slate-500">Loading history…</p> : null}
        <FundingHistoryChart series={series} />
      </section>

      <NetYieldCalculator opportunity={opportunity ?? undefined} />
    </div>
  );
}

function VenueCard({
  title,
  leg,
}: {
  title: string;
  leg: NonNullable<ReturnType<typeof buildOpportunity>>["longLeg"];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-white">{exchangeLabel(leg.exchange)}</div>
      <dl className="mt-3 grid gap-2 text-sm text-slate-300">
        <Row label="Interval rate" value={formatFundingRate(leg.fundingRate)} />
        <Row label="APR" value={formatApr(leg.fundingApr)} />
        <Row label="Mark" value={`$${leg.markPrice.toLocaleString()}`} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-mono text-slate-200">{value}</dd>
    </div>
  );
}

function VenueGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}