import { z } from 'zod';
import { loopInputSchema, simulateLoop } from './loop';
import { computeFundingCarry, fundingSnapshotSchema } from './funding';

export const strategyKindSchema = z.enum([
  'hold',
  'pendle_pt',
  'loop',
  'funding_carry',
  'custom_apy',
]);

export const strategyInputSchema = z.object({
  name: z.string(),
  kind: strategyKindSchema,
  netApyPct: z.number().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  keyRisks: z.array(z.string()).default([]),
  loop: loopInputSchema.optional(),
  funding: fundingSnapshotSchema.optional(),
});

export const compareStrategiesInputSchema = z.object({
  strategies: z.array(strategyInputSchema).min(2).max(5),
  feePct: z.number().default(0.1),
});

export const comparedStrategySchema = z.object({
  name: z.string(),
  kind: z.string(),
  netApyPct: z.number(),
  riskScore: z.number(),
  keyRisks: z.array(z.string()),
  summary: z.string(),
});

export type CompareStrategiesInput = z.infer<typeof compareStrategiesInputSchema>;
export type ComparedStrategy = z.infer<typeof comparedStrategySchema>;

const defaultRiskByKind: Record<z.infer<typeof strategyKindSchema>, number> = {
  hold: 25,
  pendle_pt: 35,
  loop: 65,
  funding_carry: 55,
  custom_apy: 50,
};

export function compareStrategies(input: CompareStrategiesInput): ComparedStrategy[] {
  return input.strategies.map((s) => {
    let netApy = s.netApyPct ?? 0;
    let risk = s.riskScore ?? defaultRiskByKind[s.kind];
    const risks = [...s.keyRisks];

    if (s.kind === 'loop' && s.loop) {
      const r = simulateLoop(s.loop);
      netApy = r.netApyPct;
      if (r.healthFactor < 1.5) risk = Math.max(risk, 80);
      risks.push(...r.warnings);
    }

    if (s.kind === 'funding_carry' && s.funding) {
      const c = computeFundingCarry(s.funding, input.feePct);
      netApy = c.netCarryPct;
      risks.push('Funding flips sign in volatile regimes.');
    }

    const summary = `${s.name}: ~${round(netApy)}% net APY, risk ${round(risk)}/100`;

    return {
      name: s.name,
      kind: s.kind,
      netApyPct: round(netApy),
      riskScore: round(risk),
      keyRisks: risks,
      summary,
    };
  });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}