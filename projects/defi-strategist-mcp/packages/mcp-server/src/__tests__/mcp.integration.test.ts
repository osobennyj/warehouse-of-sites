import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import {
  FixtureFundingSource,
  FixturePendleSource,
  FixtureYieldSource,
} from '@defi-strategist/core';
import { createMcpServer } from '../server';
import { buildDefaultSources } from '../server';

const dir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(dir, '../../../core/src/data-sources/__fixtures__');
const yieldsFixture = JSON.parse(readFileSync(join(fixturesDir, 'yields.json'), 'utf8'));

describe('MCP integration', () => {
  it('lists tools and runs simulate_loop', async () => {
    const sources = buildDefaultSources();
    sources.yields = new FixtureYieldSource(yieldsFixture);
    sources.pendle = new FixturePendleSource(
      JSON.parse(readFileSync(join(fixturesDir, 'pendle.json'), 'utf8')),
    );
    sources.funding = new FixtureFundingSource({
      asset: 'BTC',
      currentFundingRate: 0.00001,
      avgFunding7d: 0.000008,
      openInterestUsd: 1e9,
      markPx: 60_000,
    });

    const server = createMcpServer(sources);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    const client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(clientTransport);

    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name).sort()).toEqual(
      [
        'analyze_pendle_market',
        'compare_strategies',
        'find_yields',
        'funding_carry',
        'simulate_loop',
      ].sort(),
    );

    const loop = await client.callTool({
      name: 'simulate_loop',
      arguments: {
        supplyApyPct: 5,
        borrowApyPct: 2,
        ltv: 0.7,
        liquidationThreshold: 0.82,
        loops: 2,
        priceShockPct: [0, -10],
      },
    });
    expect(loop.isError).toBeFalsy();

    const yields = await client.callTool({
      name: 'find_yields',
      arguments: { stablecoinOnly: true, limit: 3, minTvlUsd: 1_000_000 },
    });
    expect(yields.isError).toBeFalsy();

    await client.close();
  });
});