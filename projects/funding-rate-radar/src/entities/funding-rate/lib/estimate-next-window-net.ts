import { EXCHANGE_CATALOG } from "@/entities/exchange";
import { calculateNetYield } from "@/features/calculate-net-yield";

import type { FundingOpportunity } from "../model/spread";

const NEXT_FUNDING_DAYS = 8 / 24;

export function estimateNextWindowNetUsd(
  opportunity: FundingOpportunity,
  longCapUsd = 5_000,
  shortCapUsd = 5_000,
  leverage = 1,
) {
  const longFee = EXCHANGE_CATALOG[opportunity.longLeg.exchange].defaultTakerFee;
  const shortFee = EXCHANGE_CATALOG[opportunity.shortLeg.exchange].defaultTakerFee;

  return calculateNetYield({
    capitalUsd: longCapUsd + shortCapUsd,
    leverage,
    holdingDays: NEXT_FUNDING_DAYS,
    spreadApr: opportunity.spreadApr,
    longTakerFee: longFee,
    shortTakerFee: shortFee,
    useMakerFees: false,
  }).netPnlUsd;
}

export function rankOpportunitiesByNetUsd(opportunities: readonly FundingOpportunity[]) {
  return [...opportunities].sort(
    (a, b) => estimateNextWindowNetUsd(b) - estimateNextWindowNetUsd(a),
  );
}