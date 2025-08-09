import { formatCurrency } from '../../../../utils/formatUtils';

interface ProfitSummaryHeaderProps {
  title: string;
  totalProfit: number;
  tradeCount: number;
  hasBreakdown: boolean;
  isExpanded: boolean;
  summaryClassName?: string;
}

export function ProfitSummaryHeader({ 
  title, 
  totalProfit, 
  tradeCount, 
  hasBreakdown, 
  isExpanded,
  summaryClassName = 'daily-summary'
}: ProfitSummaryHeaderProps) {
  return (
    <div className={summaryClassName}>
      <div className="summary-header">
        <h3>{title}</h3>
        {hasBreakdown && (
          <div className="mobile-toggle">
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          </div>
        )}
      </div>
      <div className="profit-amount">
        <span className={`profit-value ${totalProfit >= 0 ? 'profit' : 'loss'}`}>
          {totalProfit >= 0 ? '+' : ''}
          {formatCurrency(totalProfit)}円
        </span>
        <span className="trade-count">({tradeCount}件)</span>
      </div>
    </div>
  );
}