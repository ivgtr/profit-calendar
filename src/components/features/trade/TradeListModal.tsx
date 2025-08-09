import { useState, useMemo } from 'react';
import { Modal } from '../../ui/feedback/Modal';
import { Trade, TradeType } from '../../../types/Trade';
import { formatCurrency, formatDate } from '../../../utils/formatUtils';
import './TradeListModal.css';

interface TradeListModalProps {
  trades: Trade[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filterType?: 'spot' | 'margin' | 'unknown';
}

type SortColumn = 'date' | 'stockName' | 'tradeType' | 'quantity' | 'amount' | 'profit';
type SortDirection = 'asc' | 'desc';

export function TradeListModal({
  trades,
  isOpen,
  onClose,
  title,
  filterType
}: TradeListModalProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatTradeType = (tradeType: TradeType | null): string => {
    if (!tradeType) return '不明';
    return tradeType;
  };

  const getTradeCategory = (tradeType: TradeType | null): 'spot' | 'margin' | 'unknown' => {
    if (!tradeType) return 'unknown';
    
    if (tradeType === '現物売' || tradeType === '現物買' || 
        tradeType === '売却' || tradeType === '購入') {
      return 'spot';
    }
    
    if (tradeType === '返済売' || tradeType === '返済買' || tradeType === '買付') {
      return 'margin';
    }
    
    return 'unknown';
  };

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = [...trades];
    
    // フィルタリング
    if (filterType) {
      filtered = filtered.filter(trade => {
        const category = getTradeCategory(trade.tradeType);
        return category === filterType;
      });
    }
    
    // ソート
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortColumn) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'stockName':
          aValue = a.stockName || '';
          bValue = b.stockName || '';
          break;
        case 'tradeType':
          aValue = a.tradeType || '';
          bValue = b.tradeType || '';
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'profit':
          aValue = a.realizedProfitLoss;
          bValue = b.realizedProfitLoss;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    return filtered;
  }, [trades, filterType, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="trade-list-modal"
    >
      <div className="trade-list-content">
        {filteredAndSortedTrades.length === 0 ? (
          <div className="empty-state">
            <p>該当する取引がありません</p>
          </div>
        ) : (
          <>
            {/* ヘッダー部分 */}
            <div className="trade-list-header">
              <div className="trade-count">
                <span>取引件数: {filteredAndSortedTrades.length}件</span>
              </div>
            </div>
            
            {/* スクロール可能なリスト部分 */}
            <div className="table-container">
              <table className="trade-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('date')} className="sortable">
                      日付 {getSortIcon('date')}
                    </th>
                    <th onClick={() => handleSort('stockName')} className="sortable">
                      銘柄名 {getSortIcon('stockName')}
                    </th>
                    <th className="stock-code">銘柄コード</th>
                    <th onClick={() => handleSort('tradeType')} className="sortable">
                      取引種別 {getSortIcon('tradeType')}
                    </th>
                    <th onClick={() => handleSort('quantity')} className="sortable numeric">
                      数量 {getSortIcon('quantity')}
                    </th>
                    <th onClick={() => handleSort('amount')} className="sortable numeric">
                      金額 {getSortIcon('amount')}
                    </th>
                    <th onClick={() => handleSort('profit')} className="sortable numeric">
                      損益 {getSortIcon('profit')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="date">{formatDate(trade.date)}</td>
                      <td className="stock-name">{trade.stockName || '不明'}</td>
                      <td className="stock-code">{trade.stockCode || '-'}</td>
                      <td className="trade-type">{formatTradeType(trade.tradeType)}</td>
                      <td className="numeric">{trade.quantity?.toLocaleString() || '-'}</td>
                      <td className="numeric">{trade.amount ? formatCurrency(trade.amount) : '-'}</td>
                      <td className={`numeric profit ${trade.realizedProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(trade.realizedProfitLoss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* フッター部分（固定） */}
            <div className="trade-list-footer">
              <div className="table-summary">
                <div className="summary-item">
                  <span>合計損益:</span>
                  <span className={`total-profit ${
                    filteredAndSortedTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0) >= 0 
                      ? 'positive' 
                      : 'negative'
                  }`}>
                    {formatCurrency(
                      filteredAndSortedTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}