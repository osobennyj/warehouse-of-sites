import type { DayRecord } from "@/shared/types/trading";

export type DayStatus = "green" | "red" | "gray";

const hasText = (value: string): boolean => value.trim().length > 0;

export const isDayFilled = (day?: DayRecord): boolean => {
  if (!day) return false;

  return (
    Boolean(day.noTradeDay) ||
    day.trades.length > 0 ||
    day.skippedTrades.length > 0 ||
    (day.attachments?.length ?? 0) > 0 ||
    Boolean(day.mood) ||
    hasText(day.comment)
  );
};

export const getDayStatus = (day?: DayRecord): DayStatus => {
  if (!day || !isDayFilled(day)) {
    return "gray";
  }

  const hasViolationTrade = day.trades.some((trade) => !trade.byPlan);
  return hasViolationTrade ? "red" : "green";
};
