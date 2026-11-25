import type { TokenRef } from "@/entities/report";

/**
 * Ports for every external data provider. The agent's tools depend on these interfaces only,
 * so providers can be swapped (or replayed from snapshots in evals) without touching the agent.
 */

export interface TokenResolver {
  /** Resolves a ticker, CoinGecko id or EVM contract address to a canonical token. */
  resolve(query: string): Promise<TokenRef>;
}

export interface MarketSnapshot {
  sourceUrl: string;
  priceUsd: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  volume24hUsd: number | null;
  marketCapRank: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  athUsd: number | null;
  athChangePct: number | null;
  priceChange24hPct: number | null;
  priceChange30dPct: number | null;
  priceChange1yPct: number | null;
}

export interface MarketDataSource {
  getMarketData(tokenId: string): Promise<MarketSnapshot>;
}

export interface PeriodTotalsSnapshot {
  last24hUsd: number | null;
  last30dUsd: number | null;
  last365dUsd: number | null;
}

export interface ProtocolSnapshot {
  sourceUrl: string;
  name: string;
  category: string | null;
  chains: string[];
  tvlUsd: number | null;
  tvl30dAgoUsd: number | null;
  fees: PeriodTotalsSnapshot | null;
  revenue: PeriodTotalsSnapshot | null;
}

export interface ProtocolDataSource {
  /** Returns null when the token has no matching DeFi protocol (e.g. L1/L2 or meme tokens). */
  getProtocolMetrics(token: TokenRef): Promise<ProtocolSnapshot | null>;
}

export interface VestingTranche {
  category: string;
  cliff?: { date: string; tokens: number };
  /** Released in equal monthly steps after `start`, the last one on `end`. */
  linear?: { start: string; end: string; tokens: number };
}

export interface VestingSchedule {
  tokenId: string;
  sourceUrl: string;
  sourceTitle: string;
  notes: string;
  tranches: VestingTranche[];
}

export interface UnlockDataSource {
  getSchedule(tokenId: string): Promise<VestingSchedule | null>;
}

export interface HolderSnapshot {
  sourceUrl: string;
  chain: string;
  contract: string;
  holders: { address: string; sharePct: number }[];
}

export interface HolderDataSource {
  /** Returns null when the token has no contract on a supported chain. */
  getTopHolders(token: TokenRef, limit: number): Promise<HolderSnapshot | null>;
}

export interface NewsArticle {
  title: string;
  url: string;
  outlet: string;
  publishedAt: string;
}

export interface NewsSource {
  getRecentNews(token: TokenRef, limit: number): Promise<NewsArticle[]>;
}

export interface DataSources {
  tokens: TokenResolver;
  market: MarketDataSource;
  protocol: ProtocolDataSource;
  unlocks: UnlockDataSource;
  holders: HolderDataSource;
  news: NewsSource;
}

export class TokenNotFoundError extends Error {
  constructor(readonly query: string) {
    super(`No token found for "${query}"`);
    this.name = "TokenNotFoundError";
  }
}
