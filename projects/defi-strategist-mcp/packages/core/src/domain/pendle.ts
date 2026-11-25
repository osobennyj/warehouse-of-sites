import { z } from 'zod';

export const pendleMarketSchema = z.object({
  name: z.string(),
  address: z.string(),
  expiry: z.string(),
  impliedApy: z.number(),
  underlyingApy: z.number(),
  pendleApy: z.number().optional(),
  liquidityUsd: z.number(),
  chainId: z.number().default(1),
});

export type PendleMarketInput = z.infer<typeof pendleMarketSchema>;

export const pendleAnalysisSchema = z.object({
  market: z.string(),
  expiry: z.string(),
  daysToMaturity: z.number(),
  impliedApyPct: z.number(),
  underlyingApyPct: z.number(),
  ptFixedYieldToMaturityPct: z.number(),
  ptDiscountPct: z.number(),
  ytBreakevenUnderlyingApyPct: z.number(),
  spreadImpliedMinusUnderlyingPct: z.number(),
  ptVerdict: z.enum(['cheap', 'fair', 'rich']),
  verdictFormula: z.string(),
  notes: z.array(z.string()),
});

export type PendleAnalysis = z.infer<typeof pendleAnalysisSchema>;

const MS_PER_DAY = 86_400_000;

export function analyzePendleMarket(input: PendleMarketInput, nowMs = Date.now()): PendleAnalysis {
  const expiryMs = Date.parse(input.expiry);
  const daysToMaturity = Math.max((expiryMs - nowMs) / MS_PER_DAY, 0);

  const impliedApyPct = input.impliedApy * 100;
  const underlyingApyPct = input.underlyingApy * 100;

  const ptFixedYieldToMaturityPct = impliedApyPct;
  const ptDiscountPct =
    daysToMaturity > 0
      ? (1 - 1 / (1 + (input.impliedApy * daysToMaturity) / 365)) * 100
      : 0;

  const ytBreakevenUnderlyingApyPct =
    daysToMaturity > 0
      ? ((Math.pow(1 + input.impliedApy, daysToMaturity / 365) - 1) / (daysToMaturity / 365)) *
        100
      : underlyingApyPct;

  const spread = impliedApyPct - underlyingApyPct;
  const threshold = 0.75; // percentage points
  let ptVerdict: PendleAnalysis['ptVerdict'] = 'fair';
  if (spread < -threshold) ptVerdict = 'cheap';
  else if (spread > threshold) ptVerdict = 'rich';

  const verdictFormula =
    'PT is cheap if impliedApy - underlyingApy < -0.75pp; rich if > +0.75pp; else fair';

  const notes: string[] = [];
  if (daysToMaturity < 1) notes.push('Market matures in under 1 day — metrics may be unstable.');
  if (input.liquidityUsd < 100_000)
    notes.push('Low liquidity (<$100k) — PT/YT pricing may slip on size.');

  return {
    market: input.name,
    expiry: input.expiry,
    daysToMaturity: round(daysToMaturity),
    impliedApyPct: round(impliedApyPct),
    underlyingApyPct: round(underlyingApyPct),
    ptFixedYieldToMaturityPct: round(ptFixedYieldToMaturityPct),
    ptDiscountPct: round(ptDiscountPct),
    ytBreakevenUnderlyingApyPct: round(ytBreakevenUnderlyingApyPct),
    spreadImpliedMinusUnderlyingPct: round(spread),
    ptVerdict,
    verdictFormula,
    notes,
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export const METHODOLOGY_FORMULAS = `# Core formulas

## Pendle PT verdict
- **Implied APY** from Pendle market metadata
- **Underlying APY** ≈ \`aggregatedApy\` on the SY/market
- Spread = implied − underlying (percentage points)
- PT **cheap** if spread < −0.75pp, **rich** if > +0.75pp

## Looping
Iterative borrow-and-redeposit until target leverage.  
**Health factor** ≈ (collateral × liqThreshold) / debt.  
**Net APY** ≈ leverage × supplyApy − (leverage − 1) × borrowApy (simple, no compounding fee).

## Hyperliquid carry
Hourly \`funding\` annualized: \`rate × 24 × 365 × 100%\`.  
Delta-neutral carry ≈ funding APR − estimated round-trip fees (default 0.1%).

**Not financial advice.**
`;