import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { DailySummary } from '../types/Trade';
import { LoadingProps, DateHandler } from '../types/Common';
import { formatCurrency } from '../utils/formatUtils';
import '../styles/Calendar.css';

interface CalendarProps extends LoadingProps {
  onDateSelect?: DateHandler;
  onMonthChange?: DateHandler;
  monthlyTrades?: Map<string, DailySummary>;
}

const Calendar = memo(function Calendar({ onDateSelect, onMonthChange, monthlyTrades = new Map(), isLoading = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // 今日の日付をメモ化（毎回のnew Date()生成を防止）
  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => today.toDateString(), [today]);

  // 初期化時に今日の日付を選択
  useEffect(() => {
    onDateSelect?.(today);
  }, [onDateSelect, today]);

  // 月が変更された時の通知
  useEffect(() => {
    onMonthChange?.(currentDate);
  }, [currentDate, onMonthChange]);

  // カレンダーの日付を生成（メモ化）
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // カレンダー日付の配列をメモ化
  const calendarDays = useMemo(() => generateCalendarDays(), [generateCalendarDays]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onMonthChange?.(today);
    onDateSelect?.(today);
  };

  const days = calendarDays;
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">←</button>
        <h2>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h2>
        <button onClick={handleNextMonth} className="nav-button">→</button>
        <button onClick={handleToday} className="today-button">今日</button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const summary = monthlyTrades.get(dateKey);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === todayString;
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
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