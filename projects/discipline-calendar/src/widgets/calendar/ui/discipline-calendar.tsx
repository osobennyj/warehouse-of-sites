import { DayCell } from "@/entities/day/ui/day-cell";
import { formatDateKey, getMonthGridDates, getMonthLabel, getWeekdayLabels, isSameMonth } from "@/shared/lib/date";
import type { TradingJournal } from "@/shared/types/trading";

interface DisciplineCalendarProps {
  monthDate: Date;
  selectedDateKey: string;
  journal: TradingJournal;
  onSelectDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const DisciplineCalendar = ({
  monthDate,
  selectedDateKey,
  journal,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
}: DisciplineCalendarProps) => {
  const dates = getMonthGridDates(monthDate);
  const weekdays = getWeekdayLabels();

  return (
    <section className="calendar">
      <header className="calendar__header">
        <button type="button" onClick={onPreviousMonth}>
          {"<"}
        </button>
        <h2>{getMonthLabel(monthDate)}</h2>
        <button type="button" onClick={onNextMonth}>
          {">"}
        </button>
      </header>

      <div className="calendar__weekdays">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {dates.map((date) => {
          const dateKey = formatDateKey(date);
          return (
            <DayCell
              key={dateKey}
              date={date}
              dayRecord={journal[dateKey]}
              isCurrentMonth={isSameMonth(date, monthDate)}
              isSelected={selectedDateKey === dateKey}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
      <p className="calendar__legend">Format below each date: trades / skips</p>
    </section>
  );
};
