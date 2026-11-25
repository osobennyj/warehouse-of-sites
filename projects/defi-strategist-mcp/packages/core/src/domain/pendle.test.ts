import { describe, expect, it } from 'vitest';
import { analyzePendleMarket } from './pendle';

describe('analyzePendleMarket', () => {
  it('marks PT cheap when implied is below underlying', () => {
    const out = analyzePendleMarket(
      {
        name: 'wstETH',
        address: '0xabc',
        expiry: '2027-12-30T00:00:00.000Z',
        impliedApy: 0.02,
        underlyingApy: 0.035,
        liquidityUsd: 1_000_000,
        chainId: 1,
      },
      Date.parse('2026-01-01T00:00:00.000Z'),
    );
    expect(out.ptVerdict).toBe('cheap');
    expect(out.daysToMaturity).toBeGreaterThan(300);
  });
});