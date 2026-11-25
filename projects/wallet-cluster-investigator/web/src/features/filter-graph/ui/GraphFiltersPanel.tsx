import type { GraphFilters } from "../model";

type Props = {
  filters: GraphFilters;
  onChange: (next: GraphFilters) => void;
  availableHeuristics: string[];
};

export function GraphFiltersPanel({ filters, onChange, availableHeuristics }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-surface-border bg-surface-raised p-4 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Min transfers</span>
        <input
          type="number"
          min={1}
          className="w-24 rounded border border-surface-border bg-surface px-2 py-1 text-slate-100"
          value={filters.minTransferCount}
          onChange={(e) =>
            onChange({ ...filters, minTransferCount: Math.max(1, Number(e.target.value) || 1) })
          }
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Heuristic</span>
        <select
          className="min-w-48 rounded border border-surface-border bg-surface px-2 py-1 text-slate-100"
          value={filters.heuristic}
          onChange={(e) => onChange({ ...filters, heuristic: e.target.value })}
        >
          <option value="all">All clusters</option>
          {availableHeuristics.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Since (ISO date)</span>
        <input
          type="date"
          className="rounded border border-surface-border bg-surface px-2 py-1 text-slate-100"
          value={filters.since?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...filters, since: e.target.value ? `${e.target.value}T00:00:00` : null })}
        />
      </label>
    </div>
  );
}