import { describe, expect, it } from "vitest";
import { intervalRateToApr } from "./apr";

describe("intervalRateToApr", () => {
  it("scales 8h rate to annual", () => {
    const apr = intervalRateToApr(0.0001, 8);
    expect(apr).toBeCloseTo(0.0001 * (24 * 365) / 8, 8);
  });

  it("returns 0 for invalid interval", () => {
    expect(intervalRateToApr(0.001, 0)).toBe(0);
  });
});