import { getDayStatus } from "@/entities/day/model/day-status";
import { formatDateKey, getDaysInMonth } from "@/shared/lib/date";
import type { DayRecord, TradeRecord, TradingJournal } from "@/shared/types/trading";

export interface MonthlyMetrics {
  greenDaysPercent: number;
  filledDays: number;
  greenDays: number;
  redDays: number;
  byPlanTrades: number;
  offPlanTrades: number;
  greenStreak: number;
  byPlanWinrate: number;
  offPlanWinrate: number;
  avgByPlanRr: number;
  avgOffPlanRr: number;
  skippedWins: number;
  skippedLosses: number;
  skippedTotalRr: number;
  bestAsset: { ticker: string; rr: number } | null;
  worstAsset: { ticker: string; rr: number } | null;
}

const round = (value: number): number => Math.round(value * 100) / 100;

const average = (items: number[]): number => {
  if (!items.length) return 0;
  return round(items.reduce((sum, val) => sum + val, 0) / items.length);
};

const winrate = (trades: TradeRecord[]): number => {
  if (!trades.length) return 0;
  const wins = trades.filter((trade) => trade.result === "win").length;
  return round((wins / trades.length) * 100);
};

const toAssetTicker = (asset: string): string => {
  const upper = asset.trim().toUpperCase();
  if (!upper) return "";
  const [rawTicker] = upper.split(/[\/\s-]/);
  if (rawTicker.endsWith("USDT") && rawTicker.length > 4) {
    return rawTicker.slice(0, -4);
  }
  return rawTicker;
};

const toMonthRecords = (journal: TradingJournal, monthDate: Date): DayRecord[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  return Object.values(journal).filter((record) => {
    const date = new Date(record.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

const getCurrentGreenStreak = (journal: TradingJournal, monthDate: Date): number => {
  const now = new Date();
  const daysInMonth = getDaysInMonth(monthDate);
  const isCurrentMonth =
    monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth();
  const isFutureMonth =
    monthDate.getFullYear() > now.getFullYear() ||
    (monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() > now.getMonth());

  if (isFutureMonth) return 0;

  const lastEvaluatedDay = isCurrentMonth ? Math.max(now.getDate() - 1, 0) : daysInMonth;
  if (lastEvaluatedDay === 0) return 0;

  let streak = 0;

  for (let day = lastEvaluatedDay; day >= 1; day -= 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const key = formatDateKey(date);
    const status = getDayStatus(journal[key]);
    if (status === "green") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateMonthlyMetrics = (journal: TradingJournal, monthDate: Date): MonthlyMetrics => {
  const records = toMonthRecords(journal, monthDate);
  const daysInMonth = getDaysInMonth(monthDate);
  const statuses = records.map((record) => getDayStatus(record));
  const redDays = statuses.filter((status) => status === "red").length;
  const greenDays = statuses.filter((status) => status === "green").length;
  const filledDays = greenDays + redDays;

  const trades = records.flatMap((record) => record.trades);
  const byPlanTrades = trades.filter((trade) => trade.byPlan);
  const offPlanTrades = trades.filter((trade) => !trade.byPlan);
  const assetRrMap = new Map<string, number>();

  trades.forEach((trade) => {
    const ticker = toAssetTicker(trade.asset);
    if (!ticker) return;
    const signedRr = trade.result === "win" ? Math.abs(trade.rr) : -Math.abs(trade.rr);
    assetRrMap.set(ticker, round((assetRrMap.get(ticker) ?? 0) + signedRr));
  });

  const assetStats = Array.from(assetRrMap.entries())
    .map(([ticker, rr]) => ({ ticker, rr }))
    .sort((a, b) => b.rr - a.rr);
  const bestAsset = assetStats[0] ?? null;
  const worstAsset = assetStats.length > 0 ? assetStats[assetStats.length - 1] : null;

  const skipped = records.flatMap((record) => record.skippedTrades);
  const skippedWins = skipped.filter((item) => item.hypotheticalResult === "win").length;
  const skippedLosses = skipped.filter((item) => item.hypotheticalResult === "lose").length;
  const skippedTotalRr = round(skipped.reduce((sum, item) => sum + item.hypotheticalRr, 0));

  return {
    greenDaysPercent: filledDays > 0 ? round((greenDays / filledDays) * 100) : 0,
    filledDays,
    greenDays,
    redDays,
    byPlanTrades: byPlanTrades.length,
    offPlanTrades: offPlanTrades.length,
    greenStreak: getCurrentGreenStreak(journal, monthDate),
    byPlanWinrate: winrate(byPlanTrades),
    offPlanWinrate: winrate(offPlanTrades),
    avgByPlanRr: average(byPlanTrades.map((trade) => trade.rr)),
    avgOffPlanRr: average(offPlanTrades.map((trade) => trade.rr)),
    skippedWins,
    skippedLosses,
    skippedTotalRr,
    bestAsset,
    worstAsset,
  };
};
