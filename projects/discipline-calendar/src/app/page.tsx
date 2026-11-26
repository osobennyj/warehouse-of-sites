"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addDayAttachment,
  addSkippedTrade,
  addTrade,
  clearDay,
  deleteSkippedTrade,
  deleteTrade,
  fetchJournalForMonth,
  restoreSkippedTrade,
  restoreTrade,
  saveDayMeta,
  updateSkippedTrade,
  updateTrade,
} from "@/entities/record/api/journal-api";
import { calculateMonthlyMetrics } from "@/entities/record/model/metrics";
import { getCurrentUser, signOut } from "@/entities/user/api/auth-api";
import { isDemoMode } from "@/shared/config/demo";
import { formatDateKey } from "@/shared/lib/date";
import type { UserAccount } from "@/shared/types/auth";
import type { DayRecord, MoodTag, SkippedTradeRecord, TradeRecord, TradingJournal } from "@/shared/types/trading";
import { AuthPanel } from "@/features/auth/ui/auth-panel";
import { DisciplineCalendar } from "@/widgets/calendar/ui/discipline-calendar";
import { DayDetails } from "@/widgets/day-details/ui/day-details";
import { PortfolioTopBar } from "@/widgets/portfolio-chrome/ui/portfolio-top-bar";
import { StatsDashboard } from "@/widgets/dashboard/ui/stats-dashboard";

const createEmptyDayRecord = (dateKey: string): DayRecord => ({
  date: dateKey,
  comment: "",
  noTradeDay: false,
  trades: [],
  skippedTrades: [],
  attachments: [],
});

const normalizeDayRecord = (day: Partial<DayRecord>, dateKey: string): DayRecord => ({
  date: day.date ?? dateKey,
  comment: day.comment ?? "",
  mood: day.mood,
  noTradeDay: day.noTradeDay ?? false,
  trades: day.trades ?? [],
  skippedTrades: day.skippedTrades ?? [],
  attachments: day.attachments ?? [],
});

const getDay = (journal: TradingJournal, dateKey: string): DayRecord => {
  const day = journal[dateKey];
  return day ? normalizeDayRecord(day, dateKey) : createEmptyDayRecord(dateKey);
};

export default function HomePage() {
  const now = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(now));
  const [user, setUser] = useState<UserAccount | null>(null);
  const [journal, setJournal] = useState<TradingJournal>({});
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [error, setError] = useState("");
  const [undoAction, setUndoAction] = useState<
    | { kind: "trade"; payload: TradeRecord; dateKey: string }
    | { kind: "skipped"; payload: SkippedTradeRecord; dateKey: string }
    | null
  >(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (sessionError) {
        const message = sessionError instanceof Error ? sessionError.message : "Failed to load session.";
        setError(message);
      } finally {
        setIsBootLoading(false);
      }
    };
    void loadSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadJournal = async () => {
      try {
        setIsMonthLoading(true);
        const next = await fetchJournalForMonth(user.id, monthDate);
        setJournal(next);
      } catch (journalError) {
        const message = journalError instanceof Error ? journalError.message : "Failed to load data.";
        setError(message);
      } finally {
        setIsMonthLoading(false);
      }
    };

    void loadJournal();
  }, [user, monthDate]);

  const selectedDay = getDay(journal, selectedDateKey);
  const monthlyMetrics = useMemo(() => calculateMonthlyMetrics(journal, monthDate), [journal, monthDate]);

  const refreshMonth = async () => {
    if (!user) return;
    const next = await fetchJournalForMonth(user.id, monthDate);
    setJournal(next);
  };

  if (isBootLoading) {
    return (
      <main className="page">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return <AuthPanel onAuthenticated={setUser} />;
  }

  const updateComment = async (comment: string) => {
    try {
      setError("");
      await saveDayMeta(user.id, selectedDateKey, {
        comment,
        mood: selectedDay.mood,
        noTradeDay: selectedDay.noTradeDay,
      });
      setJournal((previous) => ({
        ...previous,
        [selectedDateKey]: {
          ...getDay(previous, selectedDateKey),
          comment,
        },
      }));
    } catch (commentError) {
      const message = commentError instanceof Error ? commentError.message : "Failed to save comment.";
      setError(message);
    }
  };

  const updateMood = async (mood?: MoodTag) => {
    try {
      setError("");
      await saveDayMeta(user.id, selectedDateKey, {
        comment: selectedDay.comment,
        mood,
        noTradeDay: selectedDay.noTradeDay,
      });
      setJournal((previous) => ({
        ...previous,
        [selectedDateKey]: {
          ...getDay(previous, selectedDateKey),
          mood,
        },
      }));
    } catch (moodError) {
      const message = moodError instanceof Error ? moodError.message : "Failed to save mood.";
      setError(message);
    }
  };

  const addTradeHandler = async (trade: TradeRecord) => {
    try {
      setError("");
      await addTrade(user.id, selectedDateKey, trade);
      await refreshMonth();
    } catch (tradeError) {
      const message = tradeError instanceof Error ? tradeError.message : "Failed to save trade.";
      setError(message);
    }
  };

  const updateTradeHandler = async (trade: TradeRecord) => {
    try {
      setError("");
      await updateTrade(user.id, trade);
      await refreshMonth();
    } catch (tradeError) {
      const message = tradeError instanceof Error ? tradeError.message : "Failed to update trade.";
      setError(message);
    }
  };

  const deleteTradeHandler = async (tradeId: string) => {
    try {
      setError("");
      const deleted = await deleteTrade(user.id, tradeId);
      setUndoAction({
        kind: "trade",
        payload: deleted,
        dateKey: selectedDateKey,
      });
      await refreshMonth();
    } catch (tradeError) {
      const message = tradeError instanceof Error ? tradeError.message : "Failed to delete trade.";
      setError(message);
    }
  };

  const toggleNoTradeDay = async (checked: boolean) => {
    try {
      setError("");
      await saveDayMeta(user.id, selectedDateKey, {
        comment: selectedDay.comment,
        mood: selectedDay.mood,
        noTradeDay: checked,
      });
      setJournal((previous) => ({
        ...previous,
        [selectedDateKey]: {
          ...getDay(previous, selectedDateKey),
          noTradeDay: checked,
        },
      }));
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : "Failed to update no-trade day status.";
      setError(message);
    }
  };

  const addSkippedTradeHandler = async (record: SkippedTradeRecord) => {
    try {
      setError("");
      await addSkippedTrade(user.id, selectedDateKey, record);
      await refreshMonth();
    } catch (skippedError) {
      const message = skippedError instanceof Error ? skippedError.message : "Failed to save skipped trade.";
      setError(message);
    }
  };

  const updateSkippedTradeHandler = async (record: SkippedTradeRecord) => {
    try {
      setError("");
      await updateSkippedTrade(user.id, record);
      await refreshMonth();
    } catch (skippedError) {
      const message = skippedError instanceof Error ? skippedError.message : "Failed to update skipped trade.";
      setError(message);
    }
  };

  const deleteSkippedTradeHandler = async (recordId: string) => {
    try {
      setError("");
      const deleted = await deleteSkippedTrade(user.id, recordId);
      setUndoAction({
        kind: "skipped",
        payload: deleted,
        dateKey: selectedDateKey,
      });
      await refreshMonth();
    } catch (skippedError) {
      const message = skippedError instanceof Error ? skippedError.message : "Failed to delete skipped trade.";
      setError(message);
    }
  };

  const undoDelete = async () => {
    if (!undoAction) return;

    try {
      setError("");
      if (undoAction.kind === "trade") {
        await restoreTrade(user.id, undoAction.dateKey, undoAction.payload);
      } else {
        await restoreSkippedTrade(user.id, undoAction.dateKey, undoAction.payload);
      }
      setUndoAction(null);
      await refreshMonth();
    } catch (undoError) {
      const message = undoError instanceof Error ? undoError.message : "Failed to restore deleted entry.";
      setError(message);
    }
  };

  const addAttachments = async (files: File[]) => {
    try {
      setError("");
      await Promise.all(files.map((file) => addDayAttachment(user.id, selectedDateKey, file)));
      await refreshMonth();
    } catch (attachmentError) {
      const message = attachmentError instanceof Error ? attachmentError.message : "Failed to upload screenshots.";
      setError(message);
    }
  };

  const clearSelectedDay = async () => {
    try {
      setError("");
      await clearDay(user.id, selectedDateKey);
      setUndoAction(null);
      setJournal((previous) => {
        const next = { ...previous };
        delete next[selectedDateKey];
        return next;
      });
    } catch (clearError) {
      const message = clearError instanceof Error ? clearError.message : "Failed to clear day.";
      setError(message);
    }
  };

  const goToPreviousMonth = () =>
    setMonthDate((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setMonthDate((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));

  return (
    <>
    {isDemoMode && <PortfolioTopBar title="Discipline Calendar" />}
    <main className={isDemoMode ? "page page--with-bar" : "page"}>
      {isDemoMode && (
        <section className="demo-intro">
          <p className="demo-intro__eyebrow">Demo</p>
          <h1>Discipline Calendar</h1>
          <p>
            Each day is green if every trade followed the plan and red if at least one did not. Click a day to log
            trades, skipped setups, mood and notes.
          </p>
          <p className="demo-intro__note">
            Sample data, generated in your browser. Anything you add stays on this device. Not investment advice.
          </p>
        </section>
      )}
      <header className="page__header">
        <div>
          {isMonthLoading && <p className="subtitle">Updating data…</p>}
          {error && <p className="auth-error">{error}</p>}
        </div>
        <div className="page__actions">
          {!isDemoMode && (
          <button
            type="button"
            className="page__signout"
            onClick={async () => {
              try {
                await signOut();
                setUser(null);
                setJournal({});
              } catch (signOutError) {
                const message = signOutError instanceof Error ? signOutError.message : "Failed to sign out.";
                setError(message);
              }
            }}
          >
            Sign Out
          </button>
          )}
        </div>
      </header>

      {undoAction && (
        <div className="undo-bar">
          <span>Entry deleted.</span>
          <button type="button" className="undo-bar__action" onClick={undoDelete}>
            Undo
          </button>
          <button type="button" className="undo-bar__dismiss" onClick={() => setUndoAction(null)}>
            Close
          </button>
        </div>
      )}

      <StatsDashboard metrics={monthlyMetrics} />

      <DisciplineCalendar
        monthDate={monthDate}
        selectedDateKey={selectedDateKey}
        journal={journal}
        onSelectDate={setSelectedDateKey}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <DayDetails
        key={selectedDateKey}
        dayRecord={selectedDay}
        onAddTrade={addTradeHandler}
        onUpdateTrade={updateTradeHandler}
        onDeleteTrade={deleteTradeHandler}
        onAddSkipped={addSkippedTradeHandler}
        onUpdateSkipped={updateSkippedTradeHandler}
        onDeleteSkipped={deleteSkippedTradeHandler}
        onUpdateComment={updateComment}
        onUpdateMood={updateMood}
        onToggleNoTradeDay={toggleNoTradeDay}
        onAddAttachments={addAttachments}
        onClearDay={clearSelectedDay}
      />
    </main>
    </>
  );
}
