import { describe, expect, it } from "vitest";
import { parseNumber, parseOptionalNumber, parseTimestamp, topByVolume, withinRange } from "./parse";

describe("parse helpers", () => {
  it("parses numeric strings and falls back on empty or invalid input", () => {
    expect(parseNumber("0.0001")).toBe(0.0001);
    expect(parseNumber(-2)).toBe(-2);
    expect(parseNumber("")).toBe(0);
    expect(parseNumber("abc", 7)).toBe(7);
    expect(parseNumber(undefined)).toBe(0);
  });

  it("returns null for missing optional numbers", () => {
    expect(parseOptionalNumber(null)).toBeNull();
    expect(parseOptionalNumber("12.5")).toBe(12.5);
  });

  it("treats zero timestamps as not scheduled", () => {
    expect(parseTimestamp(0)).toBeNull();
    expect(parseTimestamp("")).toBeNull();
    expect(parseTimestamp("1795622400000")).toBe(1795622400000);
  });

  it("sorts by volume descending and applies the limit", () => {
    const items = [{ volume24hUsd: 1 }, { volume24hUsd: 3 }, { volume24hUsd: 2 }];
    expect(topByVolume(items, 2)).toEqual([{ volume24hUsd: 3 }, { volume24hUsd: 2 }]);
  });

  it("filters points to an inclusive window in ascending order", () => {
    const points = [{ time: 30 }, { time: 10 }, { time: 20 }, { time: 40 }];
    expect(withinRange(points, 10, 30)).toEqual([{ time: 10 }, { time: 20 }, { time: 30 }]);
  });
});
