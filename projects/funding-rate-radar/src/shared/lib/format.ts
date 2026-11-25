const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const usdFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const rel = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatCompactUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return usd.format(value);
}

export function formatUsd(value: number): string {
  return usdFull.format(value);
}

export function formatRelativeTime(epochMs: number | null): string {
  if (!epochMs) return "—";
  const deltaMin = Math.round((epochMs - Date.now()) / 60_000);
  if (Math.abs(deltaMin) < 60) return rel.format(deltaMin, "minute");
  const deltaH = Math.round(deltaMin / 60);
  if (Math.abs(deltaH) < 48) return rel.format(deltaH, "hour");
  return rel.format(Math.round(deltaH / 24), "day");
}