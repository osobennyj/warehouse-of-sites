import type { ScoreBreakdown, YieldPool } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Transparent 0–100 risk-adjusted yield score (higher = more attractive on a risk basis). */
export function scoreYieldPool(pool: YieldPool): ScoreBreakdown {
  const tvlSize = clamp((Math.log10(Math.max(pool.tvlUsd, 1)) / 10) * 25, 0, 25);

  const stabilitySignal = pool.apyPct30D ?? 0;
  const tvlStability = clamp(15 - Math.abs(stabilitySignal) * 1.5, 0, 15);

  const sigma = pool.sigma ?? 0.1;
  const apyVolatility = clamp(15 - sigma * 30, 0, 15);

  const base = pool.apyBase ?? pool.apy;
  const baseShare = pool.apy > 0 ? base / pool.apy : 1;
  const baseYieldShare = clamp(baseShare * 20, 0, 20);

  const days = pool.count ?? 30;
  const trackRecord = clamp((days / 365) * 15, 0, 15);

  const ilPenalty =
    pool.ilRisk === 'yes'
      ? -10
      : pool.ilRisk === 'no'
        ? 0
        : pool.ilRisk === 'small'
          ? -3
          : -5;

  const total = clamp(
    tvlSize + tvlStability + apyVolatility + baseYieldShare + trackRecord + ilPenalty,
    0,
    100,
  );

  return {
    tvlSize: round(tvlSize),
    tvlStability: round(tvlStability),
    apyVolatility: round(apyVolatility),
    baseYieldShare: round(baseYieldShare),
    trackRecord: round(trackRecord),
    ilPenalty: round(ilPenalty),
    total: round(total),
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export const METHODOLOGY_SCORING = `# Yield risk-adjusted score

Each pool earns up to **100 points** from additive components:

| Component | Max | Logic |
|-----------|-----|--------|
| TVL size | 25 | log10(TVL) scaled — deeper liquidity scores higher |
| APY stability | 15 | Lower |30d APY change| is better (proxy for TVL stability) |
| APY volatility | 15 | Lower DefiLlama \`sigma\` is better |
| Base yield share | 20 | Higher share of APY from \`apyBase\` vs emissions |
| Track record | 15 | More historical \`count\` days |
| IL penalty | −10…0 | \`ilRisk=yes\` penalized hardest |

**Not financial advice.** Scores rank relative attractiveness; they do not guarantee safety.
`;