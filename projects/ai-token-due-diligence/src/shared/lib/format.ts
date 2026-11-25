const COMPACT_UNITS = [
  { value: 1e12, suffix: "T" },
  { value: 1e9, suffix: "B" },
  { value: 1e6, suffix: "M" },
  { value: 1e3, suffix: "K" },
] as const;

const NOT_AVAILABLE = "n/a";

export function formatCompact(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return NOT_AVAILABLE;
  const abs = Math.abs(value);
  const unit = COMPACT_UNITS.find((u) => abs >= u.value);
  if (!unit) return trimZeros(value.toFixed(abs >= 1 ? 2 : 4));
  return `${trimZeros((value / unit.value).toFixed(digits))}${unit.suffix}`;
}

export function formatUsd(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return NOT_AVAILABLE;
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs > 0 && abs < 1) return `${sign}$${trimZeros(abs.toPrecision(4))}`;
  return `${sign}$${formatCompact(abs, digits)}`;
}

export function formatPct(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return NOT_AVAILABLE;
  return `${trimZeros(value.toFixed(digits))}%`;
}

export function formatSignedPct(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return NOT_AVAILABLE;
  return `${value > 0 ? "+" : ""}${formatPct(value, digits)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function trimZeros(text: string): string {
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}
