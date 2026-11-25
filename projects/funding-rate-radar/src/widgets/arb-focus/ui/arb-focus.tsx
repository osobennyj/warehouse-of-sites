"use client";

import { useMemo, useState } from "react";
import { calculateNetYield } from "@/features/calculate-net-yield";
import { EXCHANGE_CATALOG, exchangeLabel } from "@/entities/exchange";
import type { FundingOpportunity } from "@/entities/funding-rate";
import { formatApr } from "@/entities/funding-rate";
import { formatUsd } from "@/shared/lib/format";
import { Card, CardDescription, CardTitle, Input } from "@/shared/ui";

/** Rough hours until next funding payment (public APIs rarely expose exact clocks; 8h is the common perp default). */
const NEXT_FUNDING_DAYS = 8 / 24;

type ArbFocusProps = {
  opportunities: FundingOpportunity[];
  selectedAsset: string | null;
  onSelectAsset: (asset: string) => void;
};

export function ArbFocus({ opportunities, selectedAsset, onSelectAsset }: ArbFocusProps) {
  const opportunity =
    opportunities.find((o) => o.asset === selectedAsset) ?? opportunities[0] ?? null;

  const [longCapitalUsd, setLongCapitalUsd] = useState("5000");
  const [shortCapitalUsd, setShortCapitalUsd] = useState("5000");
  const [leverage, setLeverage] = useState("1");

  const result = useMemo(() => {
    if (!opportunity) return null;
    const longCap = Number(longCapitalUsd) || 0;
    const shortCap = Number(shortCapitalUsd) || 0;
    const lev = Math.max(1, Number(leverage) || 1);
    const notionalUsd = (longCap + shortCap) * lev;

    const longFee = EXCHANGE_CATALOG[opportunity.longLeg.exchange].defaultTakerFee;
    const shortFee = EXCHANGE_CATALOG[opportunity.shortLeg.exchange].defaultTakerFee;

    const calc = calculateNetYield({
      capitalUsd: longCap + shortCap,
      leverage: lev,
      holdingDays: NEXT_FUNDING_DAYS,
      spreadApr: opportunity.spreadApr,
      longTakerFee: longFee,
      shortTakerFee: shortFee,
      useMakerFees: false,
    });

    return { ...calc, notionalUsd, longCap, shortCap };
  }, [longCapitalUsd, shortCapitalUsd, leverage, opportunity]);

  return (
    <Card className="border-emerald-900/60 bg-gradient-to-b from-emerald-950/40 to-slate-950/80">
      <CardTitle>Funding arb, next payment</CardTitle>
      <CardDescription className="mt-1">
        Pick an asset, set size on each leg, see estimated PnL after taker fees for the next ~8h funding window.
        Illustrative only, not financial advice.
      </CardDescription>

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunities.slice(0, 8).map((row) => (
          <button
            key={row.asset}
            type="button"
            onClick={() => onSelectAsset(row.asset)}
            className={`rounded-full border px-3 py-1 text-sm ${
              row.asset === opportunity?.asset
                ? "border-emerald-400 bg-emerald-950/60 text-emerald-200"
                : "border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            {row.asset} · {formatApr(row.spreadApr)}
          </button>
        ))}
      </div>

      {!opportunity ? (
        <p className="mt-4 text-sm text-slate-400">Waiting for live spreads…</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-300">
            Long{" "}
            <strong className="text-white">{exchangeLabel(opportunity.longLeg.exchange)}</strong> · Short{" "}
            <strong className="text-white">{exchangeLabel(opportunity.shortLeg.exchange)}</strong>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-xs text-slate-400">
              Long leg size (USD)
              <Input value={longCapitalUsd} onChange={(e) => setLongCapitalUsd(e.target.value)} inputMode="decimal" />
            </label>
            <label className="grid gap-1 text-xs text-slate-400">
              Short leg size (USD)
              <Input value={shortCapitalUsd} onChange={(e) => setShortCapitalUsd(e.target.value)} inputMode="decimal" />
            </label>
            <label className="grid gap-1 text-xs text-slate-400">
              Leverage (both legs)
              <Input value={leverage} onChange={(e) => setLeverage(e.target.value)} inputMode="decimal" />
            </label>
          </div>

          {result ? (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Spread APR" value={formatApr(opportunity.spreadApr)} />
              <Metric label="Gross (next window)" value={formatUsd(result.grossPnlUsd)} />
              <Metric label="Fees (entry + exit, both legs)" value={formatUsd(result.feesUsd)} highlight />
              <Metric label="Net (next window)" value={formatUsd(result.netPnlUsd)} highlight accent />
            </dl>
          ) : null}
          {result ? (
            <p className="mt-3 text-xs text-slate-500">
              Assumes {NEXT_FUNDING_DAYS * 24}h until funding, notional ≈ {formatUsd(result.notionalUsd)} (
              {formatUsd(result.longCap)} + {formatUsd(result.shortCap)} × leverage). Basis, borrow, and outages not
              modeled.
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}

function Metric({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={
          accent
            ? "font-mono text-lg text-emerald-300"
            : highlight
              ? "font-mono text-slate-200"
              : "font-mono text-slate-300"
        }
      >
        {value}
      </dd>
    </div>
  );
}