import {
  compareStrategies,
  compareStrategiesInputSchema,
  comparedStrategySchema,
} from '../domain/compare';
import { z } from 'zod';

export const compareStrategiesInput = compareStrategiesInputSchema;
export const compareStrategiesOutputSchema = z.object({
  strategies: z.array(comparedStrategySchema),
});

export class CompareStrategiesUseCase {
  execute(input: z.infer<typeof compareStrategiesInputSchema>) {
    return { strategies: compareStrategies(input) };
  }
}