// DailyTrades components exports
export { DailyTradesSection } from './DailyTradesSection';
export { DailyTradesHeader } from './DailyTradesHeader';
export { DailyTradesTable } from './DailyTradesTable';
export { DailyProfitSummary } from './DailyProfitSummary';

// Re-export as DailyTrades namespace
import { DailyTradesSection } from './DailyTradesSection';
import { DailyTradesHeader } from './DailyTradesHeader'; 
import { DailyTradesTable } from './DailyTradesTable';
import { DailyProfitSummary } from './DailyProfitSummary';

export const DailyTrades = {
  Section: DailyTradesSection,
  Header: DailyTradesHeader,
  Table: DailyTradesTable,
  Summary: DailyProfitSummary
};