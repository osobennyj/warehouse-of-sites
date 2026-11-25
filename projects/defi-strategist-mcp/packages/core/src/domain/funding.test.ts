import { describe, expect, it } from 'vitest';
import { avgFundingFromHistory, computeFundingCarry } from './funding';

describe('funding', () => {
  it('annualizes carry after fees', () => {
    const out = computeFundingCarry(
      {
        asset: 'BTC',
        currentFundingRate: 0.00001,
        avgFunding7d: 0.000008,
        openInterestUsd: 1,
        markPx: 1,
      },
      0.1,
    );
    expect(out.annualizedFundingPct).toBeCloseTo(87.6, 0);
    expect(out.netCarryPct).toBeLessThan(out.annualizedFundingPct);
  });

  it('averages history', () => {
    expect(avgFundingFromHistory([0.001, 0.003])).toBe(0.002);
  });
});