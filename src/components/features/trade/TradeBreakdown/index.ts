// TradeBreakdown components exports
export { TradeBreakdown } from './TradeBreakdown';
export { BreakdownItem } from './BreakdownItem';
export { ProfitSummaryHeader } from './ProfitSummaryHeader';

// Re-export as TradeBreakdown namespace
import { TradeBreakdown } from './TradeBreakdown';
import { BreakdownItem } from './BreakdownItem';
import { ProfitSummaryHeader } from './ProfitSummaryHeader';

export { TradeBreakdown as default };

export const Breakdown = {
  Main: TradeBreakdown,
  Item: BreakdownItem,
  SummaryHeader: ProfitSummaryHeader
};