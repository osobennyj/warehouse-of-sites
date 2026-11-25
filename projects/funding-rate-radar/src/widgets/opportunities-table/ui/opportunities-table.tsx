"use client";

import Link from "next/link";
import { formatApr } from "@/entities/funding-rate";
import { exchangeLabel } from "@/entities/exchange";
import type { FundingOpportunity } from "@/entities/funding-rate";
import { formatCompactUsd } from "@/shared/lib/format";

export function OpportunitiesTable({ rows }: { rows: FundingOpportunity[] }) {
  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-sm text-slate-400">
        No opportunities match the current filters. Try lowering the minimum spread or volume.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Asset</th>
            <th className="px-4 py-3">Long leg</th>
            <th className="px-4 py-3">Short leg</th>
            <th className="px-4 py-3">Spread APR</th>
            <th className="px-4 py-3">24h vol (min)</th>
            <th className="px-4 py-3">OI (min)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 bg-slate-950/50">
          {rows.map((row) => (
            <tr key={row.asset} className="hover:bg-slate-900/50">
              <td className="px-4 py-3 font-semibold text-white">
                <Link href={`/asset/${row.asset}/`} className="hover:text-emerald-300">
                  {row.asset}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">
                <div>{exchangeLabel(row.longLeg.exchange)}</div>
                <div className="text-xs text-slate-500">{formatApr(row.longLeg.fundingApr)} APR</div>
              </td>
              <td className="px-4 py-3 text-slate-300">
                <div>{exchangeLabel(row.shortLeg.exchange)}</div>
                <div className="text-xs text-slate-500">{formatApr(row.shortLeg.fundingApr)} APR</div>
              </td>
              <td className="px-4 py-3 font-mono text-emerald-300">{formatApr(row.spreadApr)}</td>
              <td className="px-4 py-3 text-slate-300">{formatCompactUsd(row.minVolume24hUsd)}</td>
              <td className="px-4 py-3 text-slate-300">{formatCompactUsd(row.minOpenInterestUsd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}