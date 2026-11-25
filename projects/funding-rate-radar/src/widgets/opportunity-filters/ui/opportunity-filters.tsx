"use client";

import { EXCHANGE_CATALOG } from "@/entities/exchange";
import type { OpportunityFilters } from "@/features/filter-opportunities";
import { EXCHANGE_IDS, type ExchangeId } from "@/shared/api";
import { Input } from "@/shared/ui";

export function OpportunityFiltersPanel({
  filters,
  onChange,
}: {
  filters: OpportunityFilters;
  onChange: (next: OpportunityFilters) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-4">
      <label className="grid gap-1 text-xs text-slate-400" htmlFor="min-spread-apr">
        Min spread APR
        <Input
          id="min-spread-apr"
          type="number"
          step="0.01"
          value={filters.minSpreadApr * 100}
          onChange={(e) => onChange({ ...filters, minSpreadApr: Number(e.target.value) / 100 || 0 })}
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-400" htmlFor="min-volume-usd">
        Min 24h volume (USD)
        <Input
          id="min-volume-usd"
          type="number"
          step="1000000"
          value={filters.minVolumeUsd}
          onChange={(e) => onChange({ ...filters, minVolumeUsd: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-400 md:col-span-2" htmlFor="asset-search">
        Search asset
        <Input
          id="asset-search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="BTC"
        />
      </label>
      <fieldset className="col-span-full">
        <legend className="mb-2 text-xs text-slate-400">Exchanges (both legs must be selected)</legend>
        <div className="flex flex-wrap gap-2">
          {EXCHANGE_IDS.map((id) => (
            <ToggleChip
              key={id}
              label={EXCHANGE_CATALOG[id].label}
              active={filters.exchanges.includes(id)}
              onClick={() => toggleExchange(filters, id, onChange)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function toggleExchange(filters: OpportunityFilters, id: ExchangeId, onChange: (next: OpportunityFilters) => void) {
  const set = new Set(filters.exchanges);
  if (set.has(id)) {
    if (set.size === 1) return;
    set.delete(id);
  } else {
    set.add(id);
  }
  onChange({ ...filters, exchanges: [...set] });
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs ${
        active ? "border-emerald-600 bg-emerald-950 text-emerald-200" : "border-slate-700 text-slate-400"
      }`}
    >
      {label}
    </button>
  );
}