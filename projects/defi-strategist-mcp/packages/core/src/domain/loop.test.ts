import { describe, expect, it } from 'vitest';
import { simulateLoop } from './loop';

describe('simulateLoop', () => {
  it('increases leverage with loops', () => {
    const result = simulateLoop({
      supplyApyPct: 4,
      borrowApyPct: 2,
      ltv: 0.7,
      liquidationThreshold: 0.82,
      loops: 3,
      priceShockPct: [0, -15],
      initialDepositUsd: 10_000,
    });
    expect(result.leverage).toBeGreaterThan(1.5);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.netApyPct).toBeGreaterThan(4);
  });

  it('warns when borrow exceeds supply', () => {
    const result = simulateLoop({
      supplyApyPct: 1,
      borrowApyPct: 8,
      ltv: 0.75,
      liquidationThreshold: 0.85,
      targetLeverage: 2.5,
      priceShockPct: [0],
      initialDepositUsd: 5_000,
    });
    expect(result.netApyPct).toBeLessThan(1);
    expect(result.warnings.some((w) => w.includes('negative'))).toBe(true);
  });
});