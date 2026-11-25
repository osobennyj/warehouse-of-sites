import { describe, expect, it } from 'vitest';
import { compareStrategies } from './compare';

describe('compareStrategies', () => {
  it('ranks loop vs hold', () => {
    const out = compareStrategies({
      feePct: 0.1,
      strategies: [
        { name: 'hold', kind: 'hold', netApyPct: 2, riskScore: 20, keyRisks: [] },
        {
          name: 'loop',
          kind: 'loop',
          keyRisks: [],
          loop: {
            supplyApyPct: 4,
            borrowApyPct: 2,
            ltv: 0.7,
            liquidationThreshold: 0.82,
            loops: 2,
            priceShockPct: [0],
            initialDepositUsd: 1000,
          },
        },
      ],
    });
    expect(out[1].netApyPct).toBeGreaterThan(out[0].netApyPct);
  });
});