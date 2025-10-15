import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { DailySummary } from '../../../types/Trade';
import { LoadingProps, DateHandler } from '../../../types/Common';
import { formatCurrency } from '../../../utils/formatUtils';
import { Button } from '../../ui/base/Button';
import { formatDateKey } from '../../../utils/dateUtils';
import './Calendar.css';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const toMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const adjustDateByMonth = (date: Date, monthOffset: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + monthOffset, date.getDate());
  const maxDay = getDaysInMonth(target.getFullYear(), target.getMonth());
  target.setDate(Math.min(target.getDate(), maxDay));
  return target;
};

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

interface CalendarProps extends LoadingProps {
  onDateSelect?: DateHandler;
  onMonthChange?: DateHandler;
  monthlyTrades?: Map<string, DailySummary>;
  onAddTrade?: (date: Date) => void;
}

const Calendar = memo(function Calendar({ onDateSelect, onMonthChange, monthlyTrades = new Map(), onAddTrade, isLoading = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return toMonthStart(now);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => today.toDateString(), [today]);

  useEffect(() => {
    if (selectedDate) {
      setActiveDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const input = dateInputRef.current;
    if (!input) return;
    const targetDate = activeDate ?? currentDate;
    const formatted = formatDateKey(targetDate);
    if (input.value !== formatted) {
      input.value = formatted;
    }
  }, [activeDate, currentDate]);

  useEffect(() => {
    onDateSelect?.(today);
  }, [onDateSelect, today]);

  useEffect(() => {
    onMonthChange?.(currentDate);
  }, [currentDate, onMonthChange]);

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const cursor = new Date(startDate);

    while (cursor <= lastDay || cursor.getDay() !== 0) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const calendarDays = useMemo(() => generateCalendarDays(), [generateCalendarDays]);

  useEffect(() => {
    const index = calendarDays.findIndex(day => day.toDateString() === activeDate.toDateString());
    if (index >= 0) {
      requestAnimationFrame(() => {
        dayRefs.current[index]?.focus();
      });
    }
  }, [activeDate, calendarDays]);

  const applySelection = useCallback((date: Date) => {
    setSelectedDate(date);
    setActiveDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);

  const handleDateClick = useCallback((date: Date) => {
    const next = new Date(date);
    if (!isSameMonth(next, currentDate)) {
      setCurrentDate(toMonthStart(next));
    }
    applySelection(next);
  }, [applySelection, currentDate]);

  const handleDayKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    const moveFocus = (offset: number) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= calendarDays.length) {
        return;
      }
      const nextDate = new Date(calendarDays[nextIndex]);
      if (!isSameMonth(nextDate, currentDate)) {
        setCurrentDate(toMonthStart(nextDate));
      }
      applySelection(nextDate);
    };

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (event.shiftKey) {
          const target = adjustDateByMonth(calendarDays[index], 1);
          setCurrentDate(toMonthStart(target));
          applySelection(target);
        } else {
          moveFocus(1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (event.shiftKey) {
          const target = adjustDateByMonth(calendarDays[index], -1);
          setCurrentDate(toMonthStart(target));
          applySelection(target);
        } else {
          moveFocus(-1);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-7);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const target = new Date(calendarDays[index]);
        if (!isSameMonth(target, currentDate)) {
          setCurrentDate(toMonthStart(target));
        }
        applySelection(target);
        onAddTrade?.(target);
        break;
      }
      default:
        break;
    }
  }, [applySelection, calendarDays, currentDate, onAddTrade]);

  const handlePrevMonth = useCallback(() => {
    const target = adjustDateByMonth(currentDate, -1);
    if (!isSameMonth(target, currentDate)) {
      setCurrentDate(toMonthStart(target));
    }
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    const target = adjustDateByMonth(currentDate, 1);
    if (!isSameMonth(target, currentDate)) {
      setCurrentDate(toMonthStart(target));
    }
  }, [currentDate]);

  const handleToday = useCallback(() => {
    const todayDate = new Date();
    if (!isSameMonth(todayDate, currentDate)) {
      setCurrentDate(toMonthStart(todayDate));
    }
    applySelection(todayDate);
  }, [applySelection, currentDate]);

  const openDatePicker = useCallback(() => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      input.showPicker?.();
    } catch {
      // showPicker may throw if not supported
    }
    input.focus();
  }, []);

  const handleDatePickerChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!value) return;
    const nextDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(nextDate.getTime())) return;
    if (!isSameMonth(nextDate, currentDate)) {
      setCurrentDate(toMonthStart(nextDate));
    }
    applySelection(nextDate);
  }, [applySelection, currentDate]);

  const days = calendarDays;
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <Button
          onClick={handlePrevMonth}
          className="calendar-nav-button"
          variant="secondary"
          size="medium"
          icon="←"
          iconOnly
        />
        <button
          type="button"
          className="calendar-header__label"
          onClick={openDatePicker}
          aria-label="日付を変更"
        >
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="calendar__date-input"
          onChange={handleDatePickerChange}
          aria-label="日付を選択"
        />
        <Button
          onClick={handleNextMonth}
          className="calendar-nav-button"
          variant="secondary"
          size="medium"
          icon="→"
          iconOnly
        />
        <Button
          onClick={handleToday}
          className="today-button"
          variant="outline"
          size="medium"
        >
          今日
        </Button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const dateKey = formatDateKey(date);
          const summary = monthlyTrades.get(dateKey);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === todayString;
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isActive = activeDate.toDateString() === date.toDateString();

          return (
            <div
              key={dateKey + index}
              ref={element => { dayRefs.current[index] = element; }}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
              onKeyDown={event => handleDayKeyDown(event, index)}
              tabIndex={isActive ? 0 : -1}
              aria-pressed={isSelected}
            >
              <div className="day-number">{date.getDate()}</div>

              {summary && (
                <div className="day-summary">
                  <div className={`profit-loss ${summary.netProfit >= 0 ? 'profit' : 'loss'}`}>
                    {summary.netProfit >= 0 ? '+' : ''}
                    {formatCurrency(summary.netProfit)}
                  </div>
                  <div className="trade-count">{summary.tradeCount}件</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <p>読み込み中...</p>
        </div>
      )}
    </div>
  );
});

export { Calendar };
