import { z } from 'zod';
import { avgFundingFromHistory, fundingSnapshotSchema, type FundingSnapshot } from '../domain/funding';
import type { FundingSource } from './ports';

const metaSchema = z.tuple([
  z.object({ universe: z.array(z.object({ name: z.string() })) }),
  z.array(
    z.object({
      funding: z.union([z.string(), z.number()]),
      openInterest: z.union([z.string(), z.number()]).optional(),
      markPx: z.union([z.string(), z.number()]).optional(),
    }),
  ),
]);

const historySchema = z.array(
  z.object({
    coin: z.string(),
    fundingRate: z.union([z.string(), z.number()]),
    time: z.number(),
  }),
);

export class HyperliquidFundingSource implements FundingSource {
  constructor(
    private readonly endpoint = 'https://api.hyperliquid.xyz/info',
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async getFunding(asset: string): Promise<FundingSnapshot> {
    const symbol = asset.toUpperCase();
    const metaRes = await this.post({ type: 'metaAndAssetCtxs' });
    const metaParsed = metaSchema.safeParse(metaRes);
    if (!metaParsed.success) {
      throw new Error('Hyperliquid metaAndAssetCtxs payload changed or unavailable.');
    }
    const [meta, ctxs] = metaParsed.data;
    const idx = meta.universe.findIndex((u) => u.name.toUpperCase() === symbol);
    if (idx < 0) {
      throw new Error(
        `Asset "${symbol}" not on Hyperliquid perps. Try BTC, ETH, SOL, or list meta universe.`,
      );
    }
    const row = ctxs[idx];
    const current = Number(row.funding);

    const weekAgo = Date.now() - 7 * 86_400_000;
    const histRes = await this.post({
      type: 'fundingHistory',
      coin: symbol,
      startTime: weekAgo,
    });
    const histParsed = historySchema.safeParse(histRes);
    const rates = histParsed.success
      ? histParsed.data.map((h) => Number(h.fundingRate))
      : [current];
    const avg = avgFundingFromHistory(rates);

    return fundingSnapshotSchema.parse({
      asset: symbol,
      currentFundingRate: current,
      avgFunding7d: avg,
      openInterestUsd: row.openInterest ? Number(row.openInterest) : null,
      markPx: row.markPx ? Number(row.markPx) : null,
    });
  }

  private async post(body: unknown) {
    const res = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Hyperliquid info failed: HTTP ${res.status}`);
    return res.json();
  }
}

export class FixtureFundingSource implements FundingSource {
  constructor(private readonly snapshot: FundingSnapshot) {}

  async getFunding(asset: string): Promise<FundingSnapshot> {
    if (asset.toUpperCase() !== this.snapshot.asset.toUpperCase()) {
      throw new Error(`Fixture only has ${this.snapshot.asset}`);
    }
    return this.snapshot;
  }
}