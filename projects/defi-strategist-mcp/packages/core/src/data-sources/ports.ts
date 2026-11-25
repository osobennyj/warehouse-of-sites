import type { YieldPool } from '../domain/types';
import type { PendleMarketInput } from '../domain/pendle';
import type { FundingSnapshot } from '../domain/funding';

export interface YieldSource {
  fetchPools(): Promise<YieldPool[]>;
}

export interface PendleSource {
  listMarkets(chainId?: number): Promise<PendleMarketInput[]>;
  getMarket(chainId: number, symbolOrAddress: string): Promise<PendleMarketInput | null>;
}

export interface FundingSource {
  getFunding(asset: string): Promise<FundingSnapshot>;
}