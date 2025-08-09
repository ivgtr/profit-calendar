import { Trade } from '../../../../types/Trade';
import { DailyTradesHeader } from './DailyTradesHeader';
import { DailyProfitSummary } from './DailyProfitSummary';
import { DailyTradesTable } from './DailyTradesTable';

interface DailyTradesSectionProps {
  selectedDate: Date | null;
  dailyTrades: Trade[];
  isDailyBreakdownExpanded: boolean;
  onToggleDailyBreakdown: () => void;
  onAddTrade: (date: Date) => void;
  onEditTrade: (trade: Trade) => void;
  onTradeTypeClick: (type: 'spot' | 'margin' | 'unknown', label: string) => void;
}

export function DailyTradesSection({
  selectedDate,
  dailyTrades,
  isDailyBreakdownExpanded,
  onToggleDailyBreakdown,
  onAddTrade,
  onEditTrade,
  onTradeTypeClick
}: DailyTradesSectionProps) {
  if (!selectedDate) {
    return null;
  }

  return (
    <section className="daily-trades-section">
      <DailyTradesHeader 
        selectedDate={selectedDate}
        onAddTrade={onAddTrade}
      />
      
      {dailyTrades.length > 0 ? (
        <>
          <DailyProfitSummary
            dailyTrades={dailyTrades}
            isExpanded={isDailyBreakdownExpanded}
            onToggleExpanded={onToggleDailyBreakdown}
            onTradeTypeClick={onTradeTypeClick}
          />
          <DailyTradesTable
            trades={dailyTrades}
            onEditTrade={onEditTrade}
          />
        </>
      ) : (
        <p className="no-trades">この日の取引はありません</p>
      )}
    </section>
  );
}