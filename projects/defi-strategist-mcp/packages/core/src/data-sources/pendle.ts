import { z } from 'zod';
import { pendleMarketSchema, type PendleMarketInput } from '../domain/pendle';
import type { PendleSource } from './ports';

const marketSchema = z.object({
  name: z.string(),
  address: z.string(),
  expiry: z.string(),
  details: z.object({
    liquidity: z.number(),
    impliedApy: z.number(),
    aggregatedApy: z.number(),
    pendleApy: z.number().optional(),
  }),
});

const responseSchema = z.object({ markets: z.array(marketSchema) });

export class PendleApiSource implements PendleSource {
  constructor(
    private readonly chainId = 1,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private base() {
    return `https://api-v2.pendle.finance/core/v1/${this.chainId}/markets`;
  }

  async listMarkets(chainId = this.chainId): Promise<PendleMarketInput[]> {
    const res = await this.fetchImpl(`${this.base().replace(`/${this.chainId}/`, `/${chainId}/`)}/active`);
    if (!res.ok) throw new Error(`Pendle markets: HTTP ${res.status}`);
    const json = await res.json();
    return parseMarkets(json, chainId);
  }

  async getMarket(chainId: number, symbolOrAddress: string): Promise<PendleMarketInput | null> {
    const markets = await this.listMarkets(chainId);
    const needle = symbolOrAddress.toLowerCase();
    return (
      markets.find(
        (m) =>
          m.name.toLowerCase() === needle ||
          m.address.toLowerCase() === needle ||
          m.name.toLowerCase().includes(needle),
      ) ?? null
    );
  }
}

export class FixturePendleSource implements PendleSource {
  constructor(private readonly fixture: unknown, private readonly chainId = 1) {}

  async listMarkets(): Promise<PendleMarketInput[]> {
    return parseMarkets(this.fixture, this.chainId);
  }

  async getMarket(_chainId: number, symbolOrAddress: string) {
    const all = await this.listMarkets();
    const needle = symbolOrAddress.toLowerCase();
    return (
      all.find((m) => m.name.toLowerCase().includes(needle) || m.address.toLowerCase() === needle) ??
      null
    );
  }
}

function parseMarkets(json: unknown, chainId: number): PendleMarketInput[] {
  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) throw new Error(`Pendle parse error: ${parsed.error.message}`);
  return parsed.data.markets.map((m) =>
    pendleMarketSchema.parse({
      name: m.name,
      address: m.address,
      expiry: m.expiry,
      impliedApy: m.details.impliedApy,
      underlyingApy: m.details.aggregatedApy,
      pendleApy: m.details.pendleApy,
      liquidityUsd: m.details.liquidity,
      chainId,
    }),
  );
}