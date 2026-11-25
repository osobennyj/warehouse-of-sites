"use client";

import { EXCHANGE_CATALOG } from "@/entities/exchange";
import type { ExchangeFetchStatus } from "../model/collect-snapshots";
import { Badge } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

export function ExchangeStatusBar({ statuses }: { statuses: ExchangeFetchStatus[]; updatedAt?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const meta = EXCHANGE_CATALOG[status.exchange];
        return (
          <div
            key={status.exchange}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <span className={cn("text-sm font-medium", meta.accentClass)}>{meta.label}</span>
            <Badge className={cn(status.ok ? "border-emerald-800 text-emerald-300" : "border-rose-800 text-rose-300")}>
              {status.ok ? `${status.count} markets` : "offline"}
            </Badge>
            {!status.ok && status.error ? (
              <span className="max-w-[12rem] truncate text-xs text-slate-500" title={status.error}>
                {status.error}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}