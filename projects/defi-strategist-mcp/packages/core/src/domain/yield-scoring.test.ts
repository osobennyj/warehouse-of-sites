import { describe, expect, it } from 'vitest';
import { scoreYieldPool } from './yield-scoring';
import type { YieldPool } from './types';

const base: YieldPool = {
  poolId: 'x',
  chain: 'Ethereum',
  project: 'aave',
  symbol: 'USDC',
  tvlUsd: 50_000_000,
  apy: 5,
  apyBase: 4.5,
  apyReward: 0.5,
  stablecoin: true,
  ilRisk: 'no',
  sigma: 0.05,
  count: 800,
  apyMean30d: 4.8,
  apyPct30D: 0.1,
};

describe('scoreYieldPool', () => {
  it('scores deep stable pools higher than shallow IL pools', () => {
    const good = scoreYieldPool(base);
    const bad = scoreYieldPool({ ...base, tvlUsd: 50_000, ilRisk: 'yes', apyReward: 4, apyBase: 1 });
    expect(good.total).toBeGreaterThan(bad.total);
  });
});