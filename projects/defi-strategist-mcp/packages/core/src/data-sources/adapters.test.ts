import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DefiLlamaYieldSource, FixtureYieldSource } from './defillama-yield';
import { FixturePendleSource } from './pendle';

const dir = dirname(fileURLToPath(import.meta.url));
const yieldsFixture = JSON.parse(readFileSync(join(dir, '__fixtures__/yields.json'), 'utf8'));
const pendleFixture = JSON.parse(readFileSync(join(dir, '__fixtures__/pendle.json'), 'utf8'));

describe('adapters', () => {
  it('parses yield fixture', async () => {
    const pools = await new FixtureYieldSource(yieldsFixture).fetchPools();
    expect(pools.length).toBeGreaterThan(0);
    expect(pools[0].tvlUsd).toBeGreaterThan(0);
  });

  it('parses pendle fixture', async () => {
    const markets = await new FixturePendleSource(pendleFixture).listMarkets();
    expect(markets[0].impliedApy).toBeGreaterThan(0);
  });

  it('defillama class exposes endpoint', () => {
    expect(new DefiLlamaYieldSource().fetchPools).toBeTypeOf('function');
  });
});