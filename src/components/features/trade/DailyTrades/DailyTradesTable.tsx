import { Trade } from '../../../../types/Trade';
import { formatCurrency } from '../../../../utils/formatUtils';

interface DailyTradesTableProps {
  trades: Trade[];
  onEditTrade: (trade: Trade) => void;
}

export function DailyTradesTable({ trades, onEditTrade }: DailyTradesTableProps) {
  if (trades.length === 0) {
    return <p className="no-trades">この日の取引はありません</p>;
  }

  return (
    <table className="trades-table">
      <thead>
        <tr>
          <th>銘柄コード</th>
          <th>銘柄名</th>
          <th>取引</th>
          <th>数量</th>
          <th>平均取得価額</th>
          <th>単価</th>
          <th>損益</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(trade => (
          <tr 
            key={trade.id} 
            className="trade-row clickable"
            onClick={() => onEditTrade(trade)}
            title="クリックして編集"
          >
            <td data-label="銘柄コード">{trade.stockCode || '不明'}</td>
            <td data-label="銘柄名">{trade.stockName || '不明'}</td>
            <td data-label="取引">{trade.tradeType || '未入力'}</td>
            <td data-label="数量">{trade.quantity?.toLocaleString() || '未入力'}</td>
            <td data-label="平均取得価額">
              {trade.averageAcquisitionPrice ? formatCurrency(trade.averageAcquisitionPrice) + '円' : '未入力'}
            </td>
            <td data-label="単価">
              {trade.unitPrice ? formatCurrency(trade.unitPrice) + '円' : '未入力'}
            </td>
            <td data-label="損益" className={trade.realizedProfitLoss >= 0 ? 'profit' : 'loss'}>
              {trade.realizedProfitLoss >= 0 ? '+' : ''}
              {formatCurrency(trade.realizedProfitLoss)}円
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}