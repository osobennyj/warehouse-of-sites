export interface NetYieldInput {
  capitalUsd: number;
  leverage: number;
  holdingDays: number;
  spreadApr: number;
  longTakerFee: number;
  shortTakerFee: number;
  /** When true, use half the taker fee rate (maker assumption). */
  useMakerFees: boolean;
}

export interface NetYieldResult {
  grossApr: number;
  feeDragApr: number;
  netApr: number;
  grossPnlUsd: number;
  feesUsd: number;
  netPnlUsd: number;
  notionalUsd: number;
  /** Human-readable breakdown for the UI. */
  formula: string;
}

const round = (value: number, digits = 4) => Number(value.toFixed(digits));

export function calculateNetYield(input: NetYieldInput): NetYieldResult {
  const {
    capitalUsd,
    leverage,
    holdingDays,
    spreadApr,
    longTakerFee,
    shortTakerFee,
    useMakerFees,
  } = input;

  const safeCapital = Math.max(0, capitalUsd);
  const safeLeverage = Math.max(1, leverage);
  const safeDays = Math.max(0, holdingDays);
  const notionalUsd = safeCapital * safeLeverage;

  const grossApr = spreadApr;
  const grossPnlUsd = notionalUsd * grossApr * (safeDays / 365);

  const longFee = useMakerFees ? longTakerFee / 2 : longTakerFee;
  const shortFee = useMakerFees ? shortTakerFee / 2 : shortTakerFee;
  const roundTripFeeRate = (longFee + shortFee) * 2;
  const feesUsd = notionalUsd * roundTripFeeRate;
  const feeDragApr = safeDays > 0 ? (feesUsd / notionalUsd) * (365 / safeDays) : 0;

  const netPnlUsd = grossPnlUsd - feesUsd;
  const netApr = grossApr - feeDragApr;

  const formula = [
    `Gross ≈ notional × spreadAPR × (days/365)`,
    `Fees ≈ notional × 2 × (longFee + shortFee) for entry + exit`,
    `Net = Gross − Fees`,
  ].join(" · ");

  return {
    grossApr: round(grossApr, 6),
    feeDragApr: round(feeDragApr, 6),
    netApr: round(netApr, 6),
    grossPnlUsd: round(grossPnlUsd, 2),
    feesUsd: round(feesUsd, 2),
    netPnlUsd: round(netPnlUsd, 2),
    notionalUsd: round(notionalUsd, 2),
    formula,
  };
}