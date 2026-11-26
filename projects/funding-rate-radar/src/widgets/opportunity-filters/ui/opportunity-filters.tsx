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
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
      <label className="grid gap-1 text-xs text-slate-400" htmlFor="asset-search">
        Search
        <Input
          id="asset-search"
          className="w-32"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="BTC"
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-400" htmlFor="min-spread-apr">
        Min spread, %
        <Input
          id="min-spread-apr"
          className="w-28"
          type="number"
          step="0.01"
          value={filters.minSpreadApr * 100}
          onChange={(e) => onChange({ ...filters, minSpreadApr: Number(e.target.value) / 100 || 0 })}
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-400" htmlFor="min-volume-usd">
        Min 24h volume, USD
        <Input
          id="min-volume-usd"
          className="w-36"
          type="number"
          step="1000000"
          value={filters.minVolumeUsd}
          onChange={(e) => onChange({ ...filters, minVolumeUsd: Number(e.target.value) || 0 })}
        />
      </label>
      <fieldset className="pb-1">
        <legend className="sr-only">Exchanges (both legs must be selected)</legend>
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