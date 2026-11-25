import type { ExchangeId, FundingSnapshot } from "@/shared/api";
import { intervalRateToApr } from "./apr";

export interface VenueLeg {
  exchange: ExchangeId;
  symbol: string;
  fundingRate: number;
  fundingApr: number;
  fundingIntervalHours: number;
  nextFundingTime: number | null;
  markPrice: number;
  volume24hUsd: number;
  openInterestUsd: number | null;
}

export interface FundingOpportunity {
  asset: string;
  /** Venue to go long (lowest funding — you pay less / receive more when rate is negative). */
  longLeg: VenueLeg;
  /** Venue to go short (highest funding). */
  shortLeg: VenueLeg;
  spreadApr: number;
  /** Conservative liquidity proxy: min volume and OI across both legs. */
  minVolume24hUsd: number;
  minOpenInterestUsd: number | null;
}

export function toVenueLeg(snapshot: FundingSnapshot): VenueLeg {
  return {
    exchange: snapshot.exchange,
    symbol: snapshot.symbol,
    fundingRate: snapshot.fundingRate,
    fundingApr: intervalRateToApr(snapshot.fundingRate, snapshot.fundingIntervalHours),
    fundingIntervalHours: snapshot.fundingIntervalHours,
    nextFundingTime: snapshot.nextFundingTime,
    markPrice: snapshot.markPrice,
    volume24hUsd: snapshot.volume24hUsd,
    openInterestUsd: snapshot.openInterestUsd,
  };
}

export function buildOpportunity(asset: string, snapshots: FundingSnapshot[]): FundingOpportunity | null {
  if (snapshots.length < 2) return null;

  const legs = snapshots.map(toVenueLeg);
  const sorted = [...legs].sort((a, b) => a.fundingApr - b.fundingApr);
  const longLeg = sorted[0]!;
  const shortLeg = sorted[sorted.length - 1]!;

  if (longLeg.exchange === shortLeg.exchange) return null;

  const spreadApr = shortLeg.fundingApr - longLeg.fundingApr;
  const minVolume24hUsd = Math.min(longLeg.volume24hUsd, shortLeg.volume24hUsd);
  const oiValues = [longLeg.openInterestUsd, shortLeg.openInterestUsd].filter((v): v is number => v !== null);
  const minOpenInterestUsd = oiValues.length ? Math.min(...oiValues) : null;

  return { asset, longLeg, shortLeg, spreadApr, minVolume24hUsd, minOpenInterestUsd };
}

export function rankOpportunities(byAsset: Map<string, FundingSnapshot[]>): FundingOpportunity[] {
  return [...byAsset.entries()]
    .map(([asset, snapshots]) => buildOpportunity(asset, snapshots))
    .filter((row): row is FundingOpportunity => row !== null)
    .sort((a, b) => b.spreadApr - a.spreadApr);
}

export function groupSnapshotsByAsset(snapshots: FundingSnapshot[]): Map<string, FundingSnapshot[]> {
  const map = new Map<string, FundingSnapshot[]>();
  for (const snapshot of snapshots) {
    const list = map.get(snapshot.asset) ?? [];
    list.push(snapshot);
    map.set(snapshot.asset, list);
  }
  return map;
}