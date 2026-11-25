import { loopInputSchema, loopResultSchema, simulateLoop } from '../domain/loop';

export const simulateLoopInputSchema = loopInputSchema;
export const simulateLoopOutputSchema = loopResultSchema;

import type { z } from 'zod';

export class SimulateLoopUseCase {
  execute(input: z.infer<typeof simulateLoopInputSchema>) {
    return simulateLoop(input);
  }
}