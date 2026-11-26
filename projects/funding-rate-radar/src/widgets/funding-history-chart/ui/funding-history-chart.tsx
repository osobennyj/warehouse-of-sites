"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EXCHANGE_CATALOG } from "@/entities/exchange";
import { intervalRateToApr } from "@/entities/funding-rate";
import type { AssetHistorySeries } from "@/entities/funding-rate";

const COLORS: Record<string, string> = {
  binance: "#f59e0b",
  bybit: "#f97316",
  okx: "var(--chart-okx)",
  hyperliquid: "#34d399",
};

export function FundingHistoryChart({ series }: { series: AssetHistorySeries[] }) {
  if (!series.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
        History is loading or unavailable for this asset.
      </p>
    );
  }

  type ChartRow = { time: number } & Partial<Record<string, number>>;
  const byTime = new Map<number, ChartRow>();
  for (const { exchange, points } of series) {
    for (const point of points) {
      const row = byTime.get(point.time) ?? { time: point.time };
      row[exchange] = intervalRateToApr(point.fundingRate, defaultInterval(exchange)) * 100;
      byTime.set(point.time, row);
    }
  }

  const data = [...byTime.values()].sort((a, b) => a.time - b.time);

  return (
    <div className="h-80 w-full rounded-xl border border-slate-800 bg-slate-950/50 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            stroke="var(--chart-axis)"
            fontSize={11}
          />
          <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`} stroke="var(--chart-axis)" fontSize={11} width={48} />
          <Tooltip
            contentStyle={{ background: "var(--chart-tooltip)", border: "1px solid var(--chart-grid)", borderRadius: 8 }}
            labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);
              const key = String(name);
              const label = EXCHANGE_CATALOG[key as keyof typeof EXCHANGE_CATALOG]?.label ?? key;
              return [`${num.toFixed(3)}% APR`, label];
            }}
          />
          <Legend />
          {series.map(({ exchange }) => (
            <Line
              key={exchange}
              type="monotone"
              dataKey={exchange}
              name={EXCHANGE_CATALOG[exchange].label}
              stroke={COLORS[exchange]}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function defaultInterval(exchange: string): number {
  return exchange === "hyperliquid" ? 1 : 8;
}