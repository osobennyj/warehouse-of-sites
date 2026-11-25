import type { RequestOptions } from "../http";

export const EXCHANGE_IDS = ["binance", "bybit", "okx", "hyperliquid"] as const;
export type ExchangeId = (typeof EXCHANGE_IDS)[number];

/** Venue-agnostic snapshot of one perpetual contract. Rates are decimals per funding interval. */
export interface FundingSnapshot {
  exchange: ExchangeId;
  /** Canonical base asset shared by all venues, e.g. "PEPE" for 1000PEPEUSDT and kPEPE. */
  asset: string;
  /** Venue-native instrument id used for follow-up requests, e.g. "BTC-USDT-SWAP". */
  symbol: string;
  fundingRate: number;
  fundingIntervalHours: number;
  nextFundingTime: number | null;
  markPrice: number;
  volume24hUsd: number;
  openInterestUsd: number | null;
}

export interface FundingHistoryPoint {
  time: number;
  fundingRate: number;
}

export interface SnapshotQuery extends RequestOptions {
  /** Keep the N most liquid contracts by 24h USD volume. */
  limit: number;
}

export interface HistoryQuery extends RequestOptions {
  symbol: string;
  from: number;
  to: number;
}

/** Port every exchange adapter implements; adding a venue = one new adapter + registry entry. */
export interface ExchangeFundingSource {
  readonly id: ExchangeId;
  fetchSnapshots(query: SnapshotQuery): Promise<FundingSnapshot[]>;
  fetchHistory(query: HistoryQuery): Promise<FundingHistoryPoint[]>;
}
