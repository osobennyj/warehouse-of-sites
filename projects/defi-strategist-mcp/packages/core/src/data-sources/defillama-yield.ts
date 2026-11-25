import { z } from 'zod';
import { yieldPoolSchema, type YieldPool } from '../domain/types';
import type { YieldSource } from './ports';

const apiPoolSchema = z.object({
  pool: z.string(),
  chain: z.string(),
  project: z.string(),
  symbol: z.string(),
  tvlUsd: z.number(),
  apy: z.number(),
  apyBase: z.number().nullable().optional(),
  apyReward: z.number().nullable().optional(),
  stablecoin: z.boolean().optional(),
  ilRisk: z.string(),
  sigma: z.number().nullable().optional(),
  count: z.number().nullable().optional(),
  apyMean30d: z.number().nullable().optional(),
  apyPct30D: z.number().nullable().optional(),
});

const responseSchema = z.object({ data: z.array(apiPoolSchema) });

export class DefiLlamaYieldSource implements YieldSource {
  constructor(
    private readonly endpoint = 'https://yields.llama.fi/pools',
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetchPools(): Promise<YieldPool[]> {
    const res = await this.fetchImpl(this.endpoint);
    if (!res.ok) {
      throw new Error(`DefiLlama yields failed: HTTP ${res.status}. Retry later or use snapshot.`);
    }
    const raw = await res.json();
    const parsed = responseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`DefiLlama yields: unexpected payload — ${parsed.error.message}`);
    }
    return parsed.data.data.map(mapPool);
  }
}

export class FixtureYieldSource implements YieldSource {
  constructor(private readonly fixture: unknown) {}

  async fetchPools(): Promise<YieldPool[]> {
    const parsed = responseSchema.safeParse(this.fixture);
    if (!parsed.success) throw new Error('Invalid yield fixture');
    return parsed.data.data.map(mapPool);
  }
}

function mapPool(p: z.infer<typeof apiPoolSchema>): YieldPool {
  return yieldPoolSchema.parse({
    poolId: p.pool,
    chain: p.chain,
    project: p.project,
    symbol: p.symbol,
    tvlUsd: p.tvlUsd,
    apy: p.apy,
    apyBase: p.apyBase ?? null,
    apyReward: p.apyReward ?? null,
    stablecoin: p.stablecoin ?? false,
    ilRisk: p.ilRisk,
    sigma: p.sigma ?? null,
    count: p.count ?? null,
    apyMean30d: p.apyMean30d ?? null,
    apyPct30D: p.apyPct30D ?? null,
  });
}