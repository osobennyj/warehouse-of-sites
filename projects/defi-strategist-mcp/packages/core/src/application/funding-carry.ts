import { z } from 'zod';
import { computeFundingCarry, fundingCarrySchema } from '../domain/funding';
import type { FundingSource } from '../data-sources/ports';

export const fundingCarryInputSchema = z.object({
  asset: z.string().default('BTC'),
  feePct: z.number().default(0.1).describe('Round-trip fee drag in % APR'),
});

export const fundingCarryOutputSchema = fundingCarrySchema;

export class FundingCarryUseCase {
  constructor(private readonly source: FundingSource) {}

  async execute(input: z.infer<typeof fundingCarryInputSchema>) {
    const snapshot = await this.source.getFunding(input.asset);
    return computeFundingCarry(snapshot, input.feePct);
  }
}