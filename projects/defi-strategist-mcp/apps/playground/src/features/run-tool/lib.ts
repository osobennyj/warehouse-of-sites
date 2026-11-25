import {
  AnalyzePendleUseCase,
  CompareStrategiesUseCase,
  DefiLlamaYieldSource,
  FindYieldsUseCase,
  FixturePendleSource,
  FixtureYieldSource,
  FundingCarryUseCase,
  HyperliquidFundingSource,
  PendleApiSource,
  SimulateLoopUseCase,
} from '@defi-strategist/core';
import type { ToolId } from '@/shared/config/tools';

async function yieldSource() {
  try {
    const live = new DefiLlamaYieldSource();
    await live.fetchPools().then((p) => {
      if (p.length === 0) throw new Error('empty');
    });
    return live;
  } catch {
    const res = await fetch(`${import.meta.env.BASE_URL}snapshots/yields.json`);
    const json = await res.json();
    return new FixtureYieldSource(json);
  }
}

async function pendleSource() {
  try {
    const live = new PendleApiSource(1);
    const m = await live.listMarkets();
    if (!m.length) throw new Error('empty');
    return live;
  } catch {
    const res = await fetch(`${import.meta.env.BASE_URL}snapshots/pendle.json`);
    return new FixturePendleSource(await res.json());
  }
}

export async function runTool(id: ToolId, params: Record<string, unknown>) {
  switch (id) {
    case 'find_yields': {
      const uc = new FindYieldsUseCase(await yieldSource());
      return uc.execute({
        stablecoinOnly: Boolean(params.stablecoinOnly),
        excludeIlRisk: true,
        minTvlUsd: Number(params.minTvlUsd ?? 1_000_000),
        limit: Number(params.limit ?? 8),
        asset: params.asset ? String(params.asset) : undefined,
      });
    }
    case 'analyze_pendle': {
      const uc = new AnalyzePendleUseCase(await pendleSource());
      return uc.execute({ chainId: 1, market: String(params.market ?? 'wstETH') });
    }
    case 'simulate_loop': {
      return new SimulateLoopUseCase().execute({
        supplyApyPct: Number(params.supplyApyPct ?? 3.5),
        borrowApyPct: Number(params.borrowApyPct ?? 2.2),
        ltv: Number(params.ltv ?? 0.72),
        liquidationThreshold: Number(params.liq ?? 0.82),
        loops: Number(params.loops ?? 3),
        priceShockPct: [-10, -20, -30],
        initialDepositUsd: 10_000,
      });
    }
    case 'funding_carry': {
      const uc = new FundingCarryUseCase(new HyperliquidFundingSource());
      return uc.execute({ asset: String(params.asset ?? 'BTC'), feePct: 0.1 });
    }
    case 'compare': {
      return new CompareStrategiesUseCase().execute({
        feePct: 0.1,
        strategies: [
          {
            name: 'Hold stETH',
            kind: 'hold',
            netApyPct: 2.4,
            riskScore: 30,
            keyRisks: ['ETH beta'],
          },
          {
            name: 'PT-stETH (illustrative)',
            kind: 'pendle_pt',
            netApyPct: Number(params.ptApy ?? 4.8),
            riskScore: 38,
            keyRisks: ['Maturity/concentration'],
          },
          {
            name: 'stETH loop 3x',
            kind: 'loop',
            loop: {
              supplyApyPct: 3.5,
              borrowApyPct: 2.2,
              ltv: 0.72,
              liquidationThreshold: 0.82,
              loops: 3,
              priceShockPct: [-15],
              initialDepositUsd: 10_000,
            },
            riskScore: 65,
            keyRisks: ['Liquidation', 'Borrow rate spike'],
          },
          {
            name: 'BTC funding carry',
            kind: 'funding_carry',
            funding: {
              asset: 'BTC',
              currentFundingRate: Number(params.fundingRate ?? 0.00001),
              avgFunding7d: 0.000008,
              openInterestUsd: 1e9,
              markPx: 60_000,
            },
            riskScore: 55,
            keyRisks: ['Funding sign flip'],
          },
        ],
      });
    }
    default:
      throw new Error('Unknown tool');
  }
}