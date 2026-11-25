import type { Facts } from "./schema";

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Builds the set of numeric literals the LLM is allowed to cite in prose (with rounding tolerance). */
export function collectAllowedNumbers(facts: Facts): Set<string> {
  const nums = new Set<number>();
  const push = (value: number | null | undefined) => {
    if (value != null && Number.isFinite(value)) {
      nums.add(value);
      nums.add(round(value));
      if (Math.abs(value) >= 1) nums.add(Math.round(value));
    }
  };

  const walk = (obj: unknown) => {
    if (obj == null || typeof obj !== "object") return;
    if (Array.isArray(obj)) return obj.forEach(walk);
    for (const val of Object.values(obj)) {
      if (typeof val === "number") push(val);
      else if (typeof val === "object") walk(val);
    }
  };

  walk(facts);
  return new Set([...nums].map((n) => formatNumberToken(n)));
}

export function extractNumbersFromText(text: string): string[] {
  const matches = text.match(
    /-?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|-?\d+(?:\.\d+)?%?/g,
  );
  return matches?.map(normalizeToken) ?? [];
}

export function verifyAnalysisNumbers(
  texts: string[],
  allowed: Set<string>,
): { passed: boolean; unverified: string[] } {
  const unverified = new Set<string>();
  for (const text of texts) {
    for (const token of extractNumbersFromText(text)) {
      if (isYearLike(token)) continue;
      if (isOrdinalIndex(token)) continue;
      if (!allowed.has(token) && !hasFuzzyMatch(token, allowed)) unverified.add(token);
    }
  }
  return { passed: unverified.size === 0, unverified: [...unverified] };
}

function formatNumberToken(n: number): string {
  return normalizeToken(String(n));
}

function normalizeToken(raw: string): string {
  return raw.replace(/,/g, "").replace(/%$/, "");
}

function isYearLike(token: string): boolean {
  const n = Number(token);
  return n >= 2015 && n <= 2035 && Number.isInteger(n);
}

function isOrdinalIndex(token: string): boolean {
  const n = Number(token);
  return Number.isInteger(n) && n >= 0 && n <= 10;
}

function hasFuzzyMatch(token: string, allowed: Set<string>): boolean {
  const value = Number(token);
  if (!Number.isFinite(value)) return false;
  for (const a of allowed) {
    const av = Number(a);
    if (!Number.isFinite(av)) continue;
    const tolerance = Math.max(0.05, Math.abs(av) * 0.02);
    if (Math.abs(av - value) <= tolerance) return true;
  }
  return false;
}