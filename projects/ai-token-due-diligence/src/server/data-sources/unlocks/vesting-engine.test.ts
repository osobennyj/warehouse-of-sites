import { describe, expect, it } from "vitest";
import { expandSchedule, monthsBetween, summarizeUnlocks } from "./vesting-engine";
import type { VestingSchedule } from "../types";

const schedule: VestingSchedule = {
  tokenId: "demo",
  sourceTitle: "Demo",
  sourceUrl: "https://example.com",
  notes: "",
  tranches: [
    {
      category: "Team",
      cliff: { date: "2024-01-01", tokens: 100 },
      linear: { start: "2024-01-01", end: "2024-03-01", tokens: 300 },
    },
  ],
};

describe("vesting engine", () => {
  it("expands cliff and linear tranches", () => {
    const events = expandSchedule(schedule);
    expect(events[0]?.tokens).toBe(100);
    expect(events.length).toBeGreaterThan(1);
  });

  it("counts months between dates", () => {
    expect(monthsBetween("2024-01-01", "2024-03-01")).toBe(2);
  });

  it("summarises unlock windows", () => {
    const summary = summarizeUnlocks(expandSchedule(schedule), new Date("2024-02-01T00:00:00Z"));
    expect(summary.remainingLockedTokens).toBeGreaterThan(0);
    expect(summary.windows[0]?.tokens).toBeGreaterThan(0);
  });
});