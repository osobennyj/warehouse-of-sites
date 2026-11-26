import { formatDateKey, getDaysInMonth } from "@/shared/lib/date";
import type {
  DayAttachment,
  DayRecord,
  MoodTag,
  SkippedTradeRecord,
  TradeRecord,
  TradingJournal,
  ViolationTag,
} from "@/shared/types/trading";

/**
 * Demo backend: same function signatures as the Supabase API, but everything lives in the
 * browser (localStorage). Past weekdays of every visited month are filled with sample entries.
 * The data is invented for the demo and is not real trading history.
 */

const STORAGE_KEY = "dc_demo_journal_v1";
const SEEDED_KEY = "dc_demo_seeded_v1";

let store: TradingJournal | null = null;
let seeded: Set<string> | null = null;

const hasStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const load = (): void => {
  if (store && seeded) return;
  store = {};
  seeded = new Set();
  if (!hasStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) store = JSON.parse(raw) as TradingJournal;
    const seededRaw = window.localStorage.getItem(SEEDED_KEY);
    if (seededRaw) seeded = new Set(JSON.parse(seededRaw) as string[]);
  } catch {
    store = {};
    seeded = new Set();
  }
};

const persist = (): void => {
  if (!hasStorage() || !store || !seeded) return;
  try {
    // Screenshot previews are object URLs that die with the page, so they are not saved.
    const clean: TradingJournal = {};
    Object.entries(store).forEach(([key, day]) => {
      clean[key] = { ...day, attachments: [] };
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.localStorage.setItem(SEEDED_KEY, JSON.stringify([...seeded]));
  } catch {
    // Storage full or blocked: the demo keeps working in memory.
  }
};

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashKey = (key: string): number => [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 17);

const ASSETS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "EURUSD", "XAUUSD"];
const GOOD_NOTES = [
  "Waited for the level, entered on the plan.",
  "Stuck to the checklist. Stop was where I set it.",
  "One clean setup, no extra trades.",
  "Followed the plan even after a small loss.",
];
const BAD_NOTES = [
  "Entered early, before the setup was complete.",
  "Chased a move after missing the entry.",
  "Took a second trade to win back the first loss.",
  "Moved the stop. Not part of the plan.",
];
const SKIP_REASONS = ["Setup was not clean", "News in 20 minutes", "Risk limit already used", "Spread too wide"];
const VIOLATIONS: ViolationTag[] = ["fomo", "revenge", "overtrade", "impulse"];
const MOODS: MoodTag[] = ["calm", "neutral", "stressed", "tilted"];

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`;

const round = (value: number): number => Math.round(value * 10) / 10;

const makeTrade = (rand: () => number, byPlan: boolean): TradeRecord => {
  const win = byPlan ? rand() < 0.6 : rand() < 0.35;
  const long = rand() < 0.55;
  return {
    id: newId(),
    asset: ASSETS[Math.floor(rand() * ASSETS.length)],
    positionType: long ? "long" : "short",
    result: win ? "win" : "lose",
    rr: win ? round(1 + rand() * 1.8) : 1,
    byPlan,
    violationTag: byPlan ? undefined : VIOLATIONS[Math.floor(rand() * VIOLATIONS.length)],
  };
};

const seedDay = (dateKey: string): DayRecord | null => {
  const rand = mulberry32(hashKey(dateKey));
  const roll = rand();
  const base: DayRecord = { date: dateKey, comment: "", noTradeDay: false, trades: [], skippedTrades: [], attachments: [] };

  if (roll < 0.14) return null; // some days stay empty
  if (roll < 0.26) {
    return { ...base, noTradeDay: true, mood: "calm", comment: "No setup that fit the plan. Stayed out." };
  }
  if (roll < 0.36) {
    return {
      ...base,
      mood: "neutral",
      comment: "Skipped everything today.",
      skippedTrades: [
        {
          id: newId(),
          asset: ASSETS[Math.floor(rand() * ASSETS.length)],
          reason: SKIP_REASONS[Math.floor(rand() * SKIP_REASONS.length)],
          hypotheticalResult: rand() < 0.5 ? "win" : "lose",
          hypotheticalRr: round(1 + rand() * 1.5),
        },
      ],
    };
  }
  if (roll < 0.72) {
    const count = rand() < 0.6 ? 1 : 2;
    return {
      ...base,
      mood: rand() < 0.7 ? "calm" : "neutral",
      comment: GOOD_NOTES[Math.floor(rand() * GOOD_NOTES.length)],
      trades: Array.from({ length: count }, () => makeTrade(rand, true)),
    };
  }
  const trades = [makeTrade(rand, true), makeTrade(rand, false)];
  return {
    ...base,
    mood: rand() < 0.5 ? "stressed" : "tilted",
    comment: BAD_NOTES[Math.floor(rand() * BAD_NOTES.length)],
    trades,
  };
};

const ensureSeeded = (monthDate: Date): void => {
  load();
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
  if (!store || !seeded || seeded.has(monthKey)) return;
  const today = formatDateKey(new Date());
  const total = getDaysInMonth(monthDate);
  for (let day = 1; day <= total; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const weekday = date.getDay();
    const key = formatDateKey(date);
    if (weekday === 0 || weekday === 6 || key >= today || store[key]) continue;
    const record = seedDay(key);
    if (record) store[key] = record;
  }
  seeded.add(monthKey);
  persist();
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getOrCreateDay = (date: string): DayRecord => {
  load();
  const current = store as TradingJournal;
  if (!current[date]) {
    current[date] = { date, comment: "", noTradeDay: false, trades: [], skippedTrades: [], attachments: [] };
  }
  return current[date];
};

const findDayByTrade = (tradeId: string): DayRecord | undefined =>
  Object.values(store ?? {}).find((day) => day.trades.some((trade) => trade.id === tradeId));

const findDayBySkipped = (recordId: string): DayRecord | undefined =>
  Object.values(store ?? {}).find((day) => day.skippedTrades.some((record) => record.id === recordId));

export const fetchJournalForMonth = async (_userId: string, monthDate: Date): Promise<TradingJournal> => {
  ensureSeeded(monthDate);
  const prefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}-`;
  const result: TradingJournal = {};
  Object.entries(store ?? {}).forEach(([key, day]) => {
    if (key.startsWith(prefix)) result[key] = clone(day);
  });
  return result;
};

export const saveDayMeta = async (
  _userId: string,
  date: string,
  fields: { comment?: string; mood?: MoodTag | undefined; noTradeDay?: boolean },
): Promise<DayRecord> => {
  const day = getOrCreateDay(date);
  day.comment = fields.comment ?? day.comment;
  day.mood = fields.mood;
  day.noTradeDay = fields.noTradeDay ?? day.noTradeDay ?? false;
  persist();
  return clone(day);
};

export const addTrade = async (_userId: string, date: string, trade: TradeRecord): Promise<TradeRecord> => {
  const day = getOrCreateDay(date);
  const saved = { ...trade, id: trade.id || newId() };
  day.trades.push(saved);
  persist();
  return clone(saved);
};

export const addSkippedTrade = async (
  _userId: string,
  date: string,
  record: SkippedTradeRecord,
): Promise<SkippedTradeRecord> => {
  const day = getOrCreateDay(date);
  const saved = { ...record, id: record.id || newId() };
  day.skippedTrades.push(saved);
  persist();
  return clone(saved);
};

export const updateTrade = async (_userId: string, trade: TradeRecord): Promise<TradeRecord> => {
  load();
  const day = findDayByTrade(trade.id);
  if (!day) throw new Error("Trade not found.");
  day.trades = day.trades.map((item) => (item.id === trade.id ? { ...trade } : item));
  persist();
  return clone(trade);
};

export const updateSkippedTrade = async (_userId: string, record: SkippedTradeRecord): Promise<SkippedTradeRecord> => {
  load();
  const day = findDayBySkipped(record.id);
  if (!day) throw new Error("Skipped trade not found.");
  day.skippedTrades = day.skippedTrades.map((item) => (item.id === record.id ? { ...record } : item));
  persist();
  return clone(record);
};

export const deleteTrade = async (_userId: string, tradeId: string): Promise<TradeRecord> => {
  load();
  const day = findDayByTrade(tradeId);
  const trade = day?.trades.find((item) => item.id === tradeId);
  if (!day || !trade) throw new Error("Trade not found.");
  day.trades = day.trades.filter((item) => item.id !== tradeId);
  persist();
  return clone(trade);
};

export const deleteSkippedTrade = async (_userId: string, skippedId: string): Promise<SkippedTradeRecord> => {
  load();
  const day = findDayBySkipped(skippedId);
  const record = day?.skippedTrades.find((item) => item.id === skippedId);
  if (!day || !record) throw new Error("Skipped trade not found.");
  day.skippedTrades = day.skippedTrades.filter((item) => item.id !== skippedId);
  persist();
  return clone(record);
};

export const restoreTrade = addTrade;
export const restoreSkippedTrade = addSkippedTrade;

export const addDayAttachment = async (_userId: string, date: string, file: File): Promise<DayAttachment> => {
  const day = getOrCreateDay(date);
  const attachment: DayAttachment = {
    id: newId(),
    path: `demo/${file.name}`,
    name: file.name,
    url: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
  };
  day.attachments.push(attachment);
  return attachment;
};

export const removeDayAttachment = async (attachment: DayAttachment): Promise<void> => {
  load();
  Object.values(store ?? {}).forEach((day) => {
    day.attachments = day.attachments.filter((item) => item.id !== attachment.id);
  });
};

export const clearDay = async (_userId: string, date: string): Promise<void> => {
  load();
  if (store) delete store[date];
  persist();
};
