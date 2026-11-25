import { z } from 'zod';

export const loopInputSchema = z.object({
  supplyApyPct: z.number().describe('Supply APY in percent, e.g. 3.5'),
  borrowApyPct: z.number().describe('Borrow APY in percent'),
  ltv: z.number().min(0).max(1).describe('Max LTV as decimal, e.g. 0.75'),
  liquidationThreshold: z.number().min(0).max(1),
  loops: z.number().int().min(0).max(20).optional(),
  targetLeverage: z.number().min(1).max(20).optional(),
  priceShockPct: z.array(z.number()).default([0, -10, -20, -30]),
  initialDepositUsd: z.number().positive().default(10_000),
});

export type LoopInput = z.infer<typeof loopInputSchema>;

export const loopStepSchema = z.object({
  loop: z.number().int(),
  collateralUsd: z.number(),
  debtUsd: z.number(),
  leverage: z.number(),
  healthFactor: z.number(),
});

export const loopResultSchema = z.object({
  leverage: z.number(),
  netApyPct: z.number(),
  healthFactor: z.number(),
  liquidationPriceDropPct: z.number(),
  loopsExecuted: z.number().int(),
  steps: z.array(loopStepSchema),
  warnings: z.array(z.string()),
  shockScenarios: z.array(
    z.object({
      priceShockPct: z.number(),
      healthFactor: z.number(),
      liquidated: z.boolean(),
    }),
  ),
});

export type LoopResult = z.infer<typeof loopResultSchema>;

export function simulateLoop(input: LoopInput): LoopResult {
  const warnings: string[] = [];
  const effectiveLtv = Math.min(input.ltv, input.liquidationThreshold - 0.01);

  if (effectiveLtv <= 0) {
    throw new Error('LTV must be below liquidation threshold.');
  }

  let targetLev = input.targetLeverage;
  if (targetLev == null) {
    const loops = input.loops ?? 3;
    targetLev = 1 / (1 - Math.pow(effectiveLtv, loops + 1));
  }

  const steps: LoopResult['steps'] = [];
  let collateral = input.initialDepositUsd;
  let debt = 0;
  let loopsExecuted = 0;
  const maxLoops = 25;

  while (loopsExecuted < maxLoops) {
    const leverageNow = collateral / (collateral - debt);
    if (leverageNow >= targetLev - 0.02) break;

    const borrowAmount = collateral * effectiveLtv - debt;
    if (borrowAmount <= 1) break;
    debt += borrowAmount;
    collateral += borrowAmount;
    loopsExecuted += 1;

    const hf = healthFactor(collateral, debt, input.liquidationThreshold);
    steps.push({
      loop: loopsExecuted,
      collateralUsd: round(collateral),
      debtUsd: round(debt),
      leverage: round(leverageNow),
      healthFactor: round(hf),
    });
  }

  const leverage = collateral / (collateral - debt);
  const netApyPct =
    leverage * input.supplyApyPct - (leverage - 1) * input.borrowApyPct;
  const hf = healthFactor(collateral, debt, input.liquidationThreshold);
  const liquidationPriceDropPct = liquidationDropPct(hf);

  if (netApyPct < 0) warnings.push('Net APY is negative after borrow cost.');
  if (hf < 1.2) warnings.push('Health factor below 1.2 — fragile to small price moves.');
  if (input.borrowApyPct > input.supplyApyPct)
    warnings.push('Borrow APY exceeds supply APY — leverage hurts carry.');

  const shockScenarios = input.priceShockPct.map((shock) => {
    const shockedCollateral = collateral * (1 + shock / 100);
    const shockedHf = healthFactor(shockedCollateral, debt, input.liquidationThreshold);
    return {
      priceShockPct: shock,
      healthFactor: round(shockedHf),
      liquidated: shockedHf < 1,
    };
  });

  return {
    leverage: round(leverage),
    netApyPct: round(netApyPct),
    healthFactor: round(hf),
    liquidationPriceDropPct: round(liquidationPriceDropPct),
    loopsExecuted,
    steps,
    warnings,
    shockScenarios,
  };
}

function healthFactor(collateral: number, debt: number, liqThreshold: number) {
  if (debt <= 0) return Infinity;
  return (collateral * liqThreshold) / debt;
}

/** Approximate % spot drop until HF hits 1 (collateral-only shock). */
function liquidationDropPct(hf: number) {
  if (!Number.isFinite(hf) || hf <= 1) return 0;
  return (1 - 1 / hf) * 100;
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}