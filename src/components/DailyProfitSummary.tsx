import { Trade } from '../types/Trade';
import { calculateTradeBreakdown, calculateTotalProfit } from '../utils/tradeCalculations';
import { useProfitBreakdown } from '../hooks/useProfitBreakdown';
import { TradeBreakdown } from './ui/TradeBreakdown';
import { ProfitSummaryHeader } from './ui/ProfitSummaryHeader';

interface DailyProfitSummaryProps {
  dailyTrades: Trade[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onTradeTypeClick: (type: 'spot' | 'margin' | 'unknown', label: string) => void;
}

export function DailyProfitSummary({ 
  dailyTrades, 
  isExpanded, 
  onToggleExpanded, 
  onTradeTypeClick 
}: DailyProfitSummaryProps) {
  const totalProfit = calculateTotalProfit(dailyTrades);
  const profitBreakdownData = calculateTradeBreakdown(dailyTrades);
  const { breakdownItems, hasBreakdown } = useProfitBreakdown(profitBreakdownData);

  return (
    <div className="daily-profit">
      <div className="profit-container" onClick={hasBreakdown ? onToggleExpanded : undefined}>
        <ProfitSummaryHeader
          title="この日の収益"
          totalProfit={totalProfit}
          tradeCount={dailyTrades.length}
          hasBreakdown={hasBreakdown}
          isExpanded={isExpanded}
          summaryClassName="daily-summary"
        />
        
        <TradeBreakdown
          breakdownItems={breakdownItems}
          onTradeTypeClick={onTradeTypeClick}
          isDesktop={true}
        />
      </div>
      
      <TradeBreakdown
        breakdownItems={breakdownItems}
        onTradeTypeClick={onTradeTypeClick}
        isDesktop={false}
        showMobileBreakdown={hasBreakdown && isExpanded}
      />
    </div>
  );
}