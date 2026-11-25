import { z } from 'zod';
import { rankedPoolSchema } from '../domain/types';
import { scoreYieldPool } from '../domain/yield-scoring';
import type { YieldSource } from '../data-sources/ports';

export const findYieldsInputSchema = z.object({
  asset: z.string().optional().describe('Filter symbol substring, e.g. USDC or ETH'),
  chain: z.string().optional().describe('Filter chain name, e.g. Ethereum'),
  minTvlUsd: z.number().nonnegative().default(100_000),
  stablecoinOnly: z.boolean().default(false),
  excludeIlRisk: z.boolean().default(true),
  limit: z.number().int().min(1).max(25).default(10),
});

export type FindYieldsInput = z.infer<typeof findYieldsInputSchema>;

export const findYieldsOutputSchema = z.object({
  filtersApplied: findYieldsInputSchema,
  pools: z.array(rankedPoolSchema),
  methodologyNote: z.string(),
});

export type FindYieldsOutput = z.infer<typeof findYieldsOutputSchema>;

export class FindYieldsUseCase {
  constructor(private readonly source: YieldSource) {}

  async execute(input: FindYieldsInput): Promise<FindYieldsOutput> {
    const all = await this.source.fetchPools();

    let filtered = all.filter((p) => p.tvlUsd >= input.minTvlUsd);
    if (input.stablecoinOnly) filtered = filtered.filter((p) => p.stablecoin);
    if (input.excludeIlRisk) filtered = filtered.filter((p) => p.ilRisk !== 'yes');
    if (input.chain) {
      const c = input.chain.toLowerCase();
      filtered = filtered.filter((p) => p.chain.toLowerCase().includes(c));
    }
    if (input.asset) {
      const a = input.asset.toLowerCase();
      filtered = filtered.filter(
        (p) => p.symbol.toLowerCase().includes(a) || p.project.toLowerCase().includes(a),
      );
    }

    const ranked = filtered
      .map((pool) => {
        const breakdown = scoreYieldPool(pool);
        return rankedPoolSchema.parse({ ...pool, riskAdjustedScore: breakdown.total, breakdown });
      })
      .sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore)
      .slice(0, input.limit);

    return {
      filtersApplied: input,
      pools: ranked,
      methodologyNote:
        'Scores are relative (0-100) from TVL depth, APY stability/volatility, base-yield share, track record, and IL penalty.',
    };
  }
}