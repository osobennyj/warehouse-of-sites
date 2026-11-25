import type { ExchangeId, FundingHistoryPoint } from "@/shared/api";

export interface AssetHistorySeries {
  exchange: ExchangeId;
  points: FundingHistoryPoint[];
}