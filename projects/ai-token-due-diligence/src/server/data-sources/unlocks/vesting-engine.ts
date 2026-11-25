import type { VestingSchedule } from "../types";

export interface UnlockEvent {
  date: string;
  category: string;
  tokens: number;
}

const DAY_MS = 86_400_000;

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const addMonths = (iso: string, months: number): Date => {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
};

export const monthsBetween = (startIso: string, endIso: string): number => {
  const start = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  return (
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth()
  );
};

/** Expands cliffs and monthly linear tranches into dated unlock events, sorted by date. */
export function expandSchedule(schedule: VestingSchedule): UnlockEvent[] {
  const events = schedule.tranches.flatMap(({ category, cliff, linear }) => {
    const out: UnlockEvent[] = [];
    if (cliff) out.push({ date: cliff.date, category, tokens: cliff.tokens });
    if (linear) {
      const steps = Math.max(1, monthsBetween(linear.start, linear.end));
      for (let i = 1; i <= steps; i++) {
        out.push({
          date: toIsoDate(addMonths(linear.start, i)),
          category,
          tokens: linear.tokens / steps,
        });
      }
    }
    return out;
  });
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export interface UnlockSummary {
  windows: { days: number; tokens: number }[];
  upcoming: UnlockEvent[];
  remainingLockedTokens: number;
  scheduleEndsOn: string | null;
}

export function summarizeUnlocks(
  events: UnlockEvent[],
  now: Date,
  windowDays: readonly number[] = [30, 90, 365],
  upcomingLimit = 6,
): UnlockSummary {
  const today = toIsoDate(now);
  const future = events.filter((e) => e.date > today);
  const sumUntil = (days: number) => {
    const until = toIsoDate(new Date(now.getTime() + days * DAY_MS));
    return future.filter((e) => e.date <= until).reduce((sum, e) => sum + e.tokens, 0);
  };
  return {
    windows: windowDays.map((days) => ({ days, tokens: sumUntil(days) })),
    upcoming: mergeSameDay(future).slice(0, upcomingLimit),
    remainingLockedTokens: future.reduce((sum, e) => sum + e.tokens, 0),
    scheduleEndsOn: future.at(-1)?.date ?? null,
  };
}

function mergeSameDay(events: UnlockEvent[]): UnlockEvent[] {
  const merged = new Map<string, UnlockEvent>();
  for (const event of events) {
    const existing = merged.get(event.date);
    if (existing) {
      merged.set(event.date, {
        date: event.date,
        category: existing.category === event.category ? existing.category : `${existing.category} + ${event.category}`,
        tokens: existing.tokens + event.tokens,
      });
    } else {
      merged.set(event.date, { ...event });
    }
  }
  return [...merged.values()];
}
