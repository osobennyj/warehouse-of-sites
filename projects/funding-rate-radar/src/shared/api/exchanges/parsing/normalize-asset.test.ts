import { describe, expect, it } from "vitest";
import { normalizeAsset } from "./normalize-asset";

describe("normalizeAsset", () => {
  it.each([
    ["BTC", "BTC"],
    ["1000PEPE", "PEPE"],
    ["1000000MOG", "MOG"],
    ["10000LADYS", "LADYS"],
    ["kPEPE", "PEPE"],
    ["kBONK", "BONK"],
    ["XBT", "BTC"],
    [" eth ", "ETH"],
  ])("maps %s to %s", (raw, expected) => {
    expect(normalizeAsset(raw)).toBe(expected);
  });

  it.each(["1INCH", "KAVA", "KAS", "100", "1000"])("keeps %s intact when the prefix is part of the ticker", (raw) => {
    expect(normalizeAsset(raw)).toBe(raw);
  });
});
