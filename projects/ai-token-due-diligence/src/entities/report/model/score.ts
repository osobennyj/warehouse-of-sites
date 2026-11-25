import type { Facts, Score, ScoreFactor } from "./schema";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * A factor maps facts to a 0–100 sub-score (higher = healthier) or null when data is missing.
 * Adding a factor means adding an entry here; existing factors stay untouched.
 */
export interface ScoreFactorDefinition {
  key: string;
  label: string;
  weight: number;
  evaluate(facts: Facts): { value: number; score: number; rationale: string } | null;
}

export const SCORE_FACTORS: readonly ScoreFactorDefinition[] = [
  {
    key: "valuation",
    label: "Float vs FDV",
    weight: 20,
    evaluate: ({ market }) => {
      const value = market?.mcapToFdvPct;
      if (value == null) return null;
      return {
        value,
        score: clamp(value),
        rationale: `Market cap is ${round1(value)}% of FDV; a low float means future supply can dilute holders.`,
      };
    },
  },
  {
    key: "supplyOverhang",
    label: "Unlock overhang (12m)",
    weight: 25,
    evaluate: ({ unlocks }) => {
      const window = unlocks?.windows.find((w) => w.days === 365);
      if (!window || window.pctOfCirculating == null) return null;
      const value = window.pctOfCirculating;
      return {
        value,
        score: clamp(100 - value * 2.5),
        rationale: `Scheduled unlocks over the next 365 days equal ${round1(value)}% of circulating supply (40%+ scores 0).`,
      };
    },
  },
  {
    key: "liquidity",
    label: "Liquidity (volume / mcap)",
    weight: 15,
    evaluate: ({ market }) => {
      const value = market?.volumeToMcapPct;
      if (value == null) return null;
      return {
        value,
        score: clamp(value * 10),
        rationale: `24h volume is ${round1(value)}% of market cap (10%+ scores 100).`,
      };
    },
  },
  {
    key: "fundamentals",
    label: "Revenue yield",
    weight: 25,
    evaluate: ({ protocol }) => {
      const value = protocol?.revenueYieldPct;
      if (value == null) return null;
      return {
        value,
        score: clamp(value * 20),
        rationale: `Trailing 365d protocol revenue equals ${round1(value)}% of market cap (5%+ scores 100).`,
      };
    },
  },
  {
    key: "concentration",
    label: "Holder concentration",
    weight: 15,
    evaluate: ({ holders }) => {
      const value = holders?.top10SharePct;
      if (value == null) return null;
      return {
        value,
        score: clamp(((80 - value) / 60) * 100),
        rationale: `Top 10 addresses hold ${round1(value)}% of supply on ${holders?.chain} (20% or less scores 100, 80%+ scores 0; includes exchange and contract wallets).`,
      };
    },
  },
];

export const toGrade = (total: number): Score["grade"] => {
  if (total >= 80) return "A";
  if (total >= 65) return "B";
  if (total >= 50) return "C";
  if (total >= 35) return "D";
  return "F";
};

export function computeScore(
  facts: Facts,
  definitions: readonly ScoreFactorDefinition[] = SCORE_FACTORS,
): Score {
  const factors: ScoreFactor[] = definitions.map((definition) => {
    const result = definition.evaluate(facts);
    return {
      key: definition.key,
      label: definition.label,
      weight: definition.weight,
      score: result ? Math.round(result.score) : null,
      value: result ? round1(result.value) : null,
      rationale: result?.rationale ?? "Not enough data — factor excluded and weights renormalised.",
    };
  });

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const scored = factors.filter((f): f is ScoreFactor & { score: number } => f.score !== null);
  const coveredWeight = scored.reduce((sum, f) => sum + f.weight, 0);
  const total =
    coveredWeight === 0
      ? 0
      : Math.round(scored.reduce((sum, f) => sum + f.score * f.weight, 0) / coveredWeight);

  return {
    total,
    grade: toGrade(total),
    coveragePct: totalWeight === 0 ? 0 : Math.round((coveredWeight / totalWeight) * 100),
    factors,
  };
}
