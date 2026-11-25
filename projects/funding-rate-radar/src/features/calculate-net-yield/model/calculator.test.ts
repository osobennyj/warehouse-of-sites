import { describe, expect, it } from "vitest";
import { calculateNetYield } from "./calculator";

const base = {
  capitalUsd: 10_000,
  leverage: 2,
  holdingDays: 7,
  spreadApr: 0.12,
  longTakerFee: 0.0005,
  shortTakerFee: 0.0005,
  useMakerFees: false,
};

describe("calculateNetYield", () => {
  it("computes gross PnL from spread APR", () => {
    const result = calculateNetYield(base);
    expect(result.notionalUsd).toBe(20_000);
    expect(result.grossPnlUsd).toBeCloseTo(20_000 * 0.12 * (7 / 365), 0);
  });

  it("subtracts round-trip fees on both legs", () => {
    const result = calculateNetYield(base);
    expect(result.feesUsd).toBeCloseTo(20_000 * 2 * 0.001, 0);
    expect(result.netPnlUsd).toBeLessThan(result.grossPnlUsd);
  });

  it("halves fees in maker mode", () => {
    const taker = calculateNetYield(base).feesUsd;
    const maker = calculateNetYield({ ...base, useMakerFees: true }).feesUsd;
    expect(maker).toBeCloseTo(taker / 2, 0);
  });

  it("handles zero capital", () => {
    const result = calculateNetYield({ ...base, capitalUsd: 0 });
    expect(result.netPnlUsd).toBe(0);
  });
});