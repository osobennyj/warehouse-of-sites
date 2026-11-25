"use client";

import { useMemo, useState } from "react";
import { calculateNetYield } from "@/features/calculate-net-yield";
import { EXCHANGE_CATALOG } from "@/entities/exchange";
import type { FundingOpportunity } from "@/entities/funding-rate";
import { formatApr } from "@/entities/funding-rate";
import { formatUsd } from "@/shared/lib/format";
import { Card, CardDescription, CardTitle, Input } from "@/shared/ui";

export function NetYieldCalculator({ opportunity }: { opportunity?: FundingOpportunity }) {
  const [capitalUsd, setCapitalUsd] = useState("10000");
  const [leverage, setLeverage] = useState("2");
  const [holdingDays, setHoldingDays] = useState("7");
  const [useMakerFees, setUseMakerFees] = useState(false);

  const result = useMemo(() => {
    if (!opportunity) return null;
    const longFee = EXCHANGE_CATALOG[opportunity.longLeg.exchange].defaultTakerFee;
    const shortFee = EXCHANGE_CATALOG[opportunity.shortLeg.exchange].defaultTakerFee;
    return calculateNetYield({
      capitalUsd: Number(capitalUsd) || 0,
      leverage: Number(leverage) || 1,
      holdingDays: Number(holdingDays) || 0,
      spreadApr: opportunity.spreadApr,
      longTakerFee: longFee,
      shortTakerFee: shortFee,
      useMakerFees,
    });
  }, [capitalUsd, leverage, holdingDays, opportunity, useMakerFees]);

  return (
    <Card>
      <CardTitle>Net yield calculator</CardTitle>
      <CardDescription className="mt-1">
        Delta-neutral funding arb after entry/exit taker fees on both legs. Not financial advice.
      </CardDescription>

      {!opportunity ? (
        <p className="mt-4 text-sm text-slate-400">Select an asset or wait for opportunities to load.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-slate-400">
            Capital (USD)
            <Input value={capitalUsd} onChange={(e) => setCapitalUsd(e.target.value)} inputMode="decimal" />
          </label>
          <label className="grid gap-1 text-xs text-slate-400">
            Leverage
            <Input value={leverage} onChange={(e) => setLeverage(e.target.value)} inputMode="decimal" />
          </label>
          <label className="grid gap-1 text-xs text-slate-400">
            Holding days
            <Input value={holdingDays} onChange={(e) => setHoldingDays(e.target.value)} inputMode="numeric" />
          </label>
          <label className="col-span-full flex items-center gap-2 text-sm text-slate-300 sm:col-span-3">
            <input type="checkbox" checked={useMakerFees} onChange={(e) => setUseMakerFees(e.target.checked)} />
            Assume maker fees (½ taker)
          </label>
        </div>
      )}

      {result ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <Metric label="Gross APR" value={formatApr(result.grossApr)} />
          <Metric label="Fee drag APR" value={formatApr(result.feeDragApr)} />
          <Metric label="Net APR" value={formatApr(result.netApr)} highlight />
          <Metric label="Net PnL" value={formatUsd(result.netPnlUsd)} highlight />
          <Metric label="Fees" value={formatUsd(result.feesUsd)} />
          <Metric label="Notional" value={formatUsd(result.notionalUsd)} />
        </dl>
      ) : null}
      {result ? <p className="mt-3 text-xs text-slate-500">{result.formula}</p> : null}
    </Card>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={highlight ? "font-mono text-emerald-300" : "font-mono text-slate-200"}>{value}</dd>
    </div>
  );
}