type NumericInput = string | number | null | undefined;

const toNumber = (value: NumericInput): number => {
  if (value === null || value === undefined || value === "") return Number.NaN;
  return typeof value === "number" ? value : Number(value);
};

/** Parses numeric strings from exchange payloads, returning `fallback` for empty or invalid input. */
export function parseNumber(value: NumericInput, fallback = 0): number {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseOptionalNumber(value: NumericInput): number | null {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Positive epoch-ms timestamp or null (exchanges use 0 / "" for "not scheduled"). */
export function parseTimestamp(value: NumericInput): number | null {
  const parsed = parseOptionalNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

export function topByVolume<T extends { volume24hUsd: number }>(items: T[], limit: number): T[] {
  return [...items].sort((a, b) => b.volume24hUsd - a.volume24hUsd).slice(0, limit);
}

export function withinRange<T extends { time: number }>(points: T[], from: number, to: number): T[] {
  return points.filter((point) => point.time >= from && point.time <= to).sort((a, b) => a.time - b.time);
}
