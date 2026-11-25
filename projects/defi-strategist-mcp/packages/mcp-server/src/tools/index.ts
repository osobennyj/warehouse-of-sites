import type { McpServer } from '@modelcontextprotocol/server';
import {
  FindYieldsUseCase,
  AnalyzePendleUseCase,
  SimulateLoopUseCase,
  FundingCarryUseCase,
  CompareStrategiesUseCase,
  findYieldsInputSchema,
  findYieldsOutputSchema,
  analyzePendleInputSchema,
  analyzePendleOutputSchema,
  simulateLoopInputSchema,
  simulateLoopOutputSchema,
  fundingCarryInputSchema,
  fundingCarryOutputSchema,
  compareStrategiesInput,
  compareStrategiesOutputSchema,
} from '@defi-strategist/core';
import type { CoreSources } from './context';
import { toolError, toolText } from './format';

const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

export function registerTools(server: McpServer, sources: CoreSources) {
  const findYields = new FindYieldsUseCase(sources.yields);
  const analyzePendle = new AnalyzePendleUseCase(sources.pendle);
  const simulateLoop = new SimulateLoopUseCase();
  const fundingCarry = new FundingCarryUseCase(sources.funding);
  const compare = new CompareStrategiesUseCase();

  server.registerTool(
    'find_yields',
    {
      title: 'Find risk-adjusted yields',
      description:
        'Filter DefiLlama yield pools and rank by a transparent 0–100 risk-adjusted score (TVL, APY stability, volatility, base-yield share, track record, IL). Use when the user asks for stablecoin yield ideas or safer farms.',
      inputSchema: findYieldsInputSchema,
      outputSchema: findYieldsOutputSchema,
      annotations: readOnly,
    },
    async (input) => {
      try {
        const data = await findYields.execute(input);
        const top = data.pools[0];
        const summary = top
          ? `Top: ${top.project} ${top.symbol} on ${top.chain} — APY ${top.apy}% score ${top.riskAdjustedScore}/100`
          : 'No pools matched filters.';
        return toolText(summary, data);
      } catch (e) {
        return toolError(e instanceof Error ? e.message : 'find_yields failed');
      }
    },
  );

  server.registerTool(
    'analyze_pendle_market',
    {
      title: 'Analyze Pendle PT/YT market',
      description:
        'Compare implied vs underlying APY on a Pendle market, PT fixed yield, YT breakeven, and a cheap/fair/rich PT verdict. Use for fixed-income or points trades on Pendle.',
      inputSchema: analyzePendleInputSchema,
      outputSchema: analyzePendleOutputSchema,
      annotations: readOnly,
    },
    async (input) => {
      try {
        const data = await analyzePendle.execute(input);
        return toolText(
          `${data.market}: PT is ${data.ptVerdict.toUpperCase()} vs underlying (spread ${data.spreadImpliedMinusUnderlyingPct}pp)`,
          data,
        );
      } catch (e) {
        return toolError(e instanceof Error ? e.message : 'analyze_pendle_market failed');
      }
    },
  );

  server.registerTool(
    'simulate_loop',
    {
      title: 'Simulate recursive borrow loop',
      description:
        'Model leverage loops (supply/borrow APY, LTV, liq threshold) with health factor, net APY, liquidation price drop, and shock scenarios. Use before recommending recursive staking or LP loops.',
      inputSchema: simulateLoopInputSchema,
      outputSchema: simulateLoopOutputSchema,
      annotations: readOnly,
    },
    async (input) => {
      try {
        const data = simulateLoop.execute(input);
        return toolText(
          `Leverage ~${data.leverage}x, net APY ${data.netApyPct}%, HF ${data.healthFactor}`,
          data,
        );
      } catch (e) {
        return toolError(e instanceof Error ? e.message : 'simulate_loop failed');
      }
    },
  );

  server.registerTool(
    'funding_carry',
    {
      title: 'Hyperliquid funding carry',
      description:
        'Current and 7d average Hyperliquid perp funding, annualized, with a simple delta-neutral carry estimate after fees. Use for funding arbitrage or cash-and-carry ideas.',
      inputSchema: fundingCarryInputSchema,
      outputSchema: fundingCarryOutputSchema,
      annotations: readOnly,
    },
    async (input) => {
      try {
        const data = await fundingCarry.execute(input);
        return toolText(
          `${data.asset} net carry ~${data.netCarryPct}% APR after ${data.estimatedFeesPct}% fees`,
          data,
        );
      } catch (e) {
        return toolError(e instanceof Error ? e.message : 'funding_carry failed');
      }
    },
  );

  server.registerTool(
    'compare_strategies',
    {
      title: 'Compare DeFi strategies',
      description:
        'Side-by-side 2–5 strategies (hold, Pendle PT, loop, funding carry, custom APY) on net APY, risk score, and key risks. Use to answer "which is better" questions.',
      inputSchema: compareStrategiesInput,
      outputSchema: compareStrategiesOutputSchema,
      annotations: readOnly,
    },
    async (input) => {
      try {
        const data = compare.execute(input);
        const summary = data.strategies
          .map((s) => s.summary)
          .slice(0, 3)
          .join(' | ');
        return toolText(summary, data);
      } catch (e) {
        return toolError(e instanceof Error ? e.message : 'compare_strategies failed');
      }
    },
  );
}