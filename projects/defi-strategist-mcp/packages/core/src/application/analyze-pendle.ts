import { z } from 'zod';
import { analyzePendleMarket, pendleAnalysisSchema } from '../domain/pendle';
import type { PendleSource } from '../data-sources/ports';

export const analyzePendleInputSchema = z.object({
  chainId: z.number().int().default(1),
  market: z.string().describe('Market name or address, e.g. wstETH'),
});

export const analyzePendleOutputSchema = pendleAnalysisSchema;

export class AnalyzePendleUseCase {
  constructor(private readonly source: PendleSource) {}

  async execute(input: z.infer<typeof analyzePendleInputSchema>) {
    const market = await this.source.getMarket(input.chainId, input.market);
    if (!market) {
      throw new Error(
        `Pendle market not found for "${input.market}" on chain ${input.chainId}. Try an active market name from list.`,
      );
    }
    return analyzePendleMarket(market);
  }
}