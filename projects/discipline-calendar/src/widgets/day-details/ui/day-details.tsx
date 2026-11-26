import { TradeForm } from "@/features/trade-entry/ui/trade-form";
import { SkipForm } from "@/features/skip-entry/ui/skip-form";
import { useEffect, useRef, useState } from "react";

import { getDayTitleLabel, getDayWeekdayLabel } from "@/shared/lib/date";
import type { DayRecord, MoodTag, PositionType, SkippedTradeRecord, TradeRecord, TradeResult, ViolationTag } from "@/shared/types/trading";

interface DayDetailsProps {
  dayRecord: DayRecord;
  onAddTrade: (trade: TradeRecord) => void;
  onUpdateTrade: (trade: TradeRecord) => void;
  onDeleteTrade: (tradeId: string) => void;
  onAddSkipped: (record: SkippedTradeRecord) => void;
  onUpdateSkipped: (record: SkippedTradeRecord) => void;
  onDeleteSkipped: (recordId: string) => void;
  onUpdateComment: (comment: string) => void;
  onUpdateMood: (mood?: MoodTag) => void;
  onToggleNoTradeDay: (checked: boolean) => void;
  onAddAttachments: (files: File[]) => void;
  onClearDay: () => void;
}

const moodOptions: Array<{ value: MoodTag; label: string }> = [
  { value: "calm", label: "Calm" },
  { value: "neutral", label: "Neutral" },
  { value: "stressed", label: "Stressed" },
  { value: "tilted", label: "Tilted" },
];

const violationOptions: Array<{ label: string; value: ViolationTag }> = [
  { label: "FOMO", value: "fomo" },
  { label: "Revenge", value: "revenge" },
  { label: "Overtrade", value: "overtrade" },
  { label: "Impulse", value: "impulse" },
  { label: "Other", value: "other" },
];

const toAssetTicker = (asset: string): string => {
  const upper = asset.trim().toUpperCase();
  if (!upper) return "";
  const [rawTicker] = upper.split(/[\/\s-]/);
  if (rawTicker.endsWith("USDT") && rawTicker.length > 4) {
    return rawTicker.slice(0, -4);
  }
  return rawTicker;
};

const toAssetDisplayLabel = (asset: string): string => {
  const ticker = toAssetTicker(asset);
  if (!ticker) return "";
  return ticker;
};

const KEY_MISTAKE_MARKER = "[[KEY_MISTAKE]]";

const parseDayNotes = (raw: string): { comment: string; keyMistake: string } => {
  const markerIndex = raw.indexOf(KEY_MISTAKE_MARKER);
  if (markerIndex === -1) {
    return { comment: raw, keyMistake: "" };
  }

  const comment = raw.slice(0, markerIndex).trimEnd();
  const keyMistake = raw.slice(markerIndex + KEY_MISTAKE_MARKER.length).trim();
  return { comment, keyMistake };
};

const composeDayNotes = (comment: string, keyMistake: string): string => {
  const cleanComment = comment.trimEnd();
  const cleanKeyMistake = keyMistake.trim();
  if (!cleanKeyMistake) {
    return cleanComment;
  }
  if (!cleanComment) {
    return `${KEY_MISTAKE_MARKER} ${cleanKeyMistake}`;
  }
  return `${cleanComment}\n\n${KEY_MISTAKE_MARKER} ${cleanKeyMistake}`;
};

export const DayDetails = ({
  dayRecord,
  onAddTrade,
  onUpdateTrade,
  onDeleteTrade,
  onAddSkipped,
  onUpdateSkipped,
  onDeleteSkipped,
  onUpdateComment,
  onUpdateMood,
  onToggleNoTradeDay,
  onAddAttachments,
  onClearDay,
}: DayDetailsProps) => {
  const parsedNotes = parseDayNotes(dayRecord.comment);
  const [tradeDraft, setTradeDraft] = useState<TradeRecord | null>(null);
  const [skippedDraft, setSkippedDraft] = useState<SkippedTradeRecord | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isSkippedModalOpen, setIsSkippedModalOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState(parsedNotes.comment);
  const [keyMistakeDraft, setKeyMistakeDraft] = useState(parsedNotes.keyMistake);
  const [moodDraft, setMoodDraft] = useState<MoodTag | "">(dayRecord.mood ?? "");
  const commentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dayTitle = getDayTitleLabel(dayRecord.date);
  const dayWeekday = getDayWeekdayLabel(dayRecord.date);
  const dayFocusText = `${dayTitle} • ${dayWeekday}`;
  const dayTradeCount = dayRecord.trades.length;
  const dayWins = dayRecord.trades.filter((trade) => trade.result === "win").length;
  const dayLosses = dayTradeCount - dayWins;
  const dayByPlan = dayRecord.trades.filter((trade) => trade.byPlan).length;
  const dayOffPlan = dayTradeCount - dayByPlan;
  const dayTotalRrValue = dayRecord.trades.reduce((sum, trade) => {
    const tradeRr = Math.abs(trade.rr);
    return sum + (trade.result === "win" ? tradeRr : -tradeRr);
  }, 0);
  const dayTotalRr = `${dayTotalRrValue > 0 ? "+" : ""}${dayTotalRrValue.toFixed(2)}`;
  const skippedCount = dayRecord.skippedTrades.length;
  const skippedTotalRrValue = dayRecord.skippedTrades.reduce((sum, item) => sum + item.hypotheticalRr, 0);
  const skippedTotalRr = `${skippedTotalRrValue > 0 ? "+" : ""}${skippedTotalRrValue.toFixed(2)}`;
  const dayTone =
    dayTradeCount === 0
      ? "neutral"
      : dayOffPlan > 0 || dayLosses > dayWins || dayTotalRrValue < 0
        ? "bad"
        : dayTotalRrValue > 0 && dayWins >= dayLosses
          ? "good"
          : "neutral";
  const wlTone = dayTradeCount === 0 ? "neutral" : dayWins > dayLosses ? "good" : dayWins < dayLosses ? "bad" : "neutral";
  const planTone = dayOffPlan === 0 && dayByPlan > 0 ? "good" : dayOffPlan > dayByPlan ? "bad" : "neutral";
  const rrTone = dayTotalRrValue > 0 ? "good" : dayTotalRrValue < 0 ? "bad" : "neutral";
  const skippedTone = skippedCount === 0 ? "neutral" : skippedTotalRrValue <= 0 ? "good" : "bad";
  const tradedAssets = Array.from(
    new Set(
      dayRecord.trades
        .map((trade) => toAssetDisplayLabel(trade.asset))
        .filter((asset) => asset.length > 0),
    ),
  );

  useEffect(
    () => () => {
      if (commentDebounceRef.current) {
        clearTimeout(commentDebounceRef.current);
      }
      if (moodDebounceRef.current) {
        clearTimeout(moodDebounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const textarea = commentTextareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(92, textarea.scrollHeight)}px`;
  }, [commentDraft]);

  const scheduleDayNoteSave = (nextComment: string, nextKeyMistake: string) => {
    if (commentDebounceRef.current) {
      clearTimeout(commentDebounceRef.current);
    }
    commentDebounceRef.current = setTimeout(() => {
      onUpdateComment(composeDayNotes(nextComment, nextKeyMistake));
    }, 450);
  };

  return (
    <section className="details">
      <div className="details__header">
        <div className="details__date-focus">
          <h2>{dayFocusText}</h2>
        </div>
        <div className="details__header-actions">
          <label className="details__no-trade details__no-trade--header">
            <input
              type="checkbox"
              checked={Boolean(dayRecord.noTradeDay)}
              onChange={(event) => onToggleNoTradeDay(event.target.checked)}
            />
            <span>No-Trade Day</span>
          </label>
          <button
            type="button"
            className="details__clear-day"
            onClick={() => {
              if (window.confirm("Clear this day? This will remove trades, skips, screenshots, and notes.")) {
                onClearDay();
              }
            }}
          >
            Clear Day
          </button>
        </div>
      </div>
      <div className="details__top">
        <div className="details__meta">
          <label className="details__comment">
            Daily Comment
            <textarea
              ref={commentTextareaRef}
              value={commentDraft}
              onChange={(event) => {
                const nextComment = event.target.value;
                setCommentDraft(nextComment);
                scheduleDayNoteSave(nextComment, keyMistakeDraft);
              }}
              rows={2}
            />
          </label>
        </div>
      </div>

      <div className="details__controls">
        <label>
          Emotional State
          <select
            value={moodDraft}
            onChange={(event) => {
              const nextMood = event.target.value ? (event.target.value as MoodTag) : undefined;
              setMoodDraft(event.target.value as MoodTag | "");
              if (moodDebounceRef.current) {
                clearTimeout(moodDebounceRef.current);
              }
              moodDebounceRef.current = setTimeout(() => {
                onUpdateMood(nextMood);
              }, 300);
            }}
          >
            <option value="">Not set</option>
            {moodOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="details__key-mistake">
          Key mistake today
          <input
            type="text"
            value={keyMistakeDraft}
            onChange={(event) => {
              const nextKeyMistake = event.target.value;
              setKeyMistakeDraft(nextKeyMistake);
              scheduleDayNoteSave(commentDraft, nextKeyMistake);
            }}
          />
        </label>
      </div>

      <div className="details__divider" />

      <div className="details__actions">
        <button type="button" onClick={() => setIsTradeModalOpen(true)}>
          Add Trade
        </button>
        <button type="button" onClick={() => setIsSkippedModalOpen(true)}>
          Add Skipped Trade
        </button>
      </div>

      <div className="details__divider" />

      <div className="details__bottom">
        <article className={`day-info day-info--${dayTone}`}>
          <h3>Trades for the Day</h3>
          <div className="day-info__stats">
            <div className="day-info__stat">
              <span className="day-info__stat-label">Trades</span>
              <strong className="day-info__stat-value">{dayTradeCount}</strong>
            </div>
            <div className={`day-info__stat day-info__stat--${wlTone}`}>
              <span className="day-info__stat-label">Win/Lose</span>
              <strong className="day-info__stat-value">
                {dayWins} • {dayLosses}
              </strong>
            </div>
            <div className={`day-info__stat day-info__stat--${planTone}`}>
              <span className="day-info__stat-label">By Plan / Off Plan</span>
              <strong className="day-info__stat-value">
                {dayByPlan} • {dayOffPlan}
              </strong>
            </div>
            <div className={`day-info__stat day-info__stat--${rrTone}`}>
              <span className="day-info__stat-label">Total RR</span>
              <strong className="day-info__stat-value">{dayTotalRr}</strong>
            </div>
            <div className={`day-info__stat day-info__stat--${skippedTone}`}>
              <span className="day-info__stat-label">Skipped / RR</span>
              <strong className="day-info__stat-value">
                {skippedCount} • {skippedTotalRr}
              </strong>
            </div>
            <div className="day-info__stat day-info__stat--neutral day-info__stat--assets">
              <span className="day-info__stat-label">Traded Assets</span>
              <strong className="day-info__stat-value">
                {tradedAssets.length > 0 ? tradedAssets.join(", ") : "No trades"}
              </strong>
            </div>
          </div>

          <div className="day-info__list">
            {dayRecord.trades.slice(-4).map((trade) => (
              <div key={trade.id} className="day-info__item">
                <div className="day-info__item-meta">
                  <p className="day-info__item-text">{toAssetDisplayLabel(trade.asset) || trade.asset}</p>
                  <div className="day-info__item-tags">
                    <span className="day-info__tag day-info__tag--neutral">{trade.positionType === "long" ? "Long" : "Short"}</span>
                    <span className={`day-info__tag day-info__tag--${trade.result === "win" ? "good" : "bad"}`}>
                      {trade.result === "win" ? "Win" : "Lose"}
                    </span>
                    <span className={`day-info__tag day-info__tag--${trade.byPlan ? "good" : "bad"}`}>
                      {trade.byPlan ? "By Plan" : "Off Plan"}
                    </span>
                  </div>
                </div>
                <div className="day-info__item-actions">
                  <button type="button" onClick={() => setTradeDraft(trade)}>
                    Details
                  </button>
                  <button type="button" onClick={() => onDeleteTrade(trade.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {dayRecord.skippedTrades.slice(-4).map((record) => (
              <div key={record.id} className="day-info__item">
                <div className="day-info__item-meta">
                  <p className="day-info__item-text">{toAssetDisplayLabel(record.asset) || record.asset}</p>
                  <div className="day-info__item-tags">
                    <span className={`day-info__tag day-info__tag--${record.hypotheticalResult === "win" ? "good" : "bad"}`}>
                      {record.hypotheticalResult === "win" ? "Win" : "Lose"}
                    </span>
                    <span className="day-info__tag day-info__tag--skip">Skipped</span>
                  </div>
                </div>
                <div className="day-info__item-actions">
                  <button type="button" onClick={() => setSkippedDraft(record)}>
                    Details
                  </button>
                  <button type="button" onClick={() => onDeleteSkipped(record.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {isTradeModalOpen && (
        <div className="entry-modal" role="dialog" aria-modal="true" aria-label="Add trade">
          <button type="button" className="entry-modal__backdrop" aria-label="Close dialog" onClick={() => setIsTradeModalOpen(false)} />
          <div className="entry-modal__content">
            <TradeForm
              onAddTrade={(trade) => {
                onAddTrade(trade);
                setIsTradeModalOpen(false);
              }}
              onAddAttachments={onAddAttachments}
            />
          </div>
        </div>
      )}

      {isSkippedModalOpen && (
        <div className="entry-modal" role="dialog" aria-modal="true" aria-label="Add skipped trade">
          <button
            type="button"
            className="entry-modal__backdrop"
            aria-label="Close dialog"
            onClick={() => setIsSkippedModalOpen(false)}
          />
          <div className="entry-modal__content">
            <SkipForm
              onAddSkipped={(record) => {
                onAddSkipped(record);
                setIsSkippedModalOpen(false);
              }}
              onAddAttachments={onAddAttachments}
            />
          </div>
        </div>
      )}

      {tradeDraft && (
        <div className="entry-modal" role="dialog" aria-modal="true" aria-label="Edit trade">
          <button type="button" className="entry-modal__backdrop" aria-label="Close dialog" onClick={() => setTradeDraft(null)} />
          <div className="entry-modal__content">
            <article className="edit-panel">
              <h3>Edit Trade</h3>
              <div className="edit-panel__grid">
                <input
                  value={tradeDraft.asset}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      asset: event.target.value,
                    })
                  }
                  placeholder="Asset"
                />
                <select
                  value={tradeDraft.positionType}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      positionType: event.target.value as PositionType,
                    })
                  }
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
                <select
                  value={tradeDraft.result}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      result: event.target.value as TradeResult,
                    })
                  }
                >
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={tradeDraft.rr}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      rr: Number(event.target.value),
                    })
                  }
                />
                <select
                  value={tradeDraft.byPlan ? "by-plan" : "off-plan"}
                  onChange={(event) =>
                    setTradeDraft({
                      ...tradeDraft,
                      byPlan: event.target.value === "by-plan",
                      violationTag: event.target.value === "by-plan" ? undefined : (tradeDraft.violationTag ?? "fomo"),
                    })
                  }
                >
                  <option value="by-plan">By Plan</option>
                  <option value="off-plan">Off Plan</option>
                </select>
                {!tradeDraft.byPlan && (
                  <select
                    value={tradeDraft.violationTag ?? "fomo"}
                    onChange={(event) =>
                      setTradeDraft({
                        ...tradeDraft,
                        violationTag: event.target.value as ViolationTag,
                      })
                    }
                  >
                    {violationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="edit-panel__actions">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateTrade(tradeDraft);
                    setTradeDraft(null);
                  }}
                >
                  Save
                </button>
                <button type="button" onClick={() => setTradeDraft(null)}>
                  Cancel
                </button>
              </div>
            </article>
          </div>
        </div>
      )}

      {skippedDraft && (
        <div className="entry-modal" role="dialog" aria-modal="true" aria-label="Edit skipped trade">
          <button type="button" className="entry-modal__backdrop" aria-label="Close dialog" onClick={() => setSkippedDraft(null)} />
          <div className="entry-modal__content">
            <article className="edit-panel">
              <h3>Edit Skipped Trade</h3>
              <div className="edit-panel__grid">
                <input
                  value={skippedDraft.asset}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      asset: event.target.value,
                    })
                  }
                  placeholder="Asset"
                />
                <input
                  value={skippedDraft.reason}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      reason: event.target.value,
                    })
                  }
                  placeholder="Reason"
                />
                <select
                  value={skippedDraft.hypotheticalResult}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      hypotheticalResult: event.target.value as TradeResult,
                    })
                  }
                >
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={skippedDraft.hypotheticalRr}
                  onChange={(event) =>
                    setSkippedDraft({
                      ...skippedDraft,
                      hypotheticalRr: Number(event.target.value),
                    })
                  }
                />
              </div>
              <div className="edit-panel__actions">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSkipped(skippedDraft);
                    setSkippedDraft(null);
                  }}
                >
                  Save
                </button>
                <button type="button" onClick={() => setSkippedDraft(null)}>
                  Cancel
                </button>
              </div>
            </article>
          </div>
        </div>
      )}
    </section>
  );
};
