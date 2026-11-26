import { getDayStatus } from "@/entities/day/model/day-status";
import { formatDateKey } from "@/shared/lib/date";
import type { DayRecord } from "@/shared/types/trading";

interface DayCellProps {
  date: Date;
  dayRecord?: DayRecord;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onSelect: (dateKey: string) => void;
}

export const DayCell = ({
  date,
  dayRecord,
  isCurrentMonth,
  isSelected,
  onSelect,
}: DayCellProps) => {
  const dateKey = formatDateKey(date);
  const status = getDayStatus(dayRecord);
  const hasActivity = Boolean(dayRecord && (dayRecord.trades.length > 0 || dayRecord.skippedTrades.length > 0));

  const baseClass = "day-cell";
  const monthClass = isCurrentMonth ? "" : "day-cell--faded";
  const selectedClass = isSelected ? "day-cell--selected" : "";
  const statusClass = status === "red" ? "day-cell--red" : "day-cell--green";
  const statusClassName = status === "gray" ? "day-cell--gray" : statusClass;

  return (
    <button
      type="button"
      className={[baseClass, monthClass, selectedClass, statusClassName].filter(Boolean).join(" ")}
      onClick={() => onSelect(dateKey)}
      aria-label={`Day ${date.getDate()}, status ${status}`}
    >
      <span className="day-cell__number">{date.getDate()}</span>
      {hasActivity && dayRecord && (
        <span className="day-cell__meta">
          {dayRecord.trades.length} / {dayRecord.skippedTrades.length}
        </span>
      )}
    </button>
  );
};
