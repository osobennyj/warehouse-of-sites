import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    'due_diligence_yield',
    {
      title: 'Due diligence a yield pool',
      description: 'Structured workflow to diligence a yield opportunity with find_yields',
      argsSchema: z.object({
        asset: z.string().describe('Asset or pool symbol to focus on, e.g. USDC on Aave'),
      }),
    },
    ({ asset }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Run find_yields filtered for "${asset}", read methodology://scoring, and explain TVL, APY composition, IL risk, and whether rewards dominate. Flag red flags for a research note. Not financial advice.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'stablecoin_yield_ladder',
    {
      title: 'Build a stablecoin yield ladder',
      description: 'Design a tiered stablecoin allocation across risk scores',
      argsSchema: z.object({
        capitalUsd: z.string().describe('Capital to allocate, e.g. 100000'),
      }),
    },
    ({ capitalUsd }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `For $${capitalUsd} stablecoin capital, call find_yields (stablecoinOnly, excludeIlRisk, min TVL 1M), propose a 3-tier ladder (core/balanced/boost), and compare one Pendle PT leg via analyze_pendle_market if relevant. Cite scores and risks.`,
          },
        },
      ],
    }),
  );
}