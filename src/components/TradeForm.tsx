import { Trade, TradeType, AccountType } from '../types/Trade';
import { DataUpdateHandler, DataDeleteHandler } from '../types/Common';
import { useTradeForm } from '../hooks/useTradeForm';

interface TradeFormProps {
  trade?: Trade; // 編集時は既存データ、新規時はundefined
  onSave: DataUpdateHandler<Trade>;
  onCancel: () => void;
  onDelete?: DataDeleteHandler;
}

export default function TradeForm({ trade, onSave, onCancel, onDelete }: TradeFormProps) {
  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
  } = useTradeForm({ trade, onSave });

  const handleDelete = () => {
    if (trade && onDelete) {
      if (confirm('この取引を削除しますか？この操作は取り消せません。')) {
        onDelete(trade.id);
      }
    }
  };

  const tradeTypes: TradeType[] = ['現物買', '現物売', '返済買', '返済売'];
  const accountTypes: AccountType[] = ['特定', '一般', 'NISA'];

  return (
    <div className="trade-form">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">約定日 *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="accountType">口座</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
            >
              {accountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="stockName">銘柄名</label>
            <input
              type="text"
              id="stockName"
              name="stockName"
              value={formData.stockName}
              onChange={handleInputChange}
              placeholder="例: トヨタ自動車"
              className={errors.stockName ? 'error' : ''}
            />
            {errors.stockName && <span className="error-message">{errors.stockName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="stockCode">銘柄コード</label>
            <input
              type="text"
              id="stockCode"
              name="stockCode"
              value={formData.stockCode}
              onChange={handleInputChange}
              placeholder="例: 7203"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tradeType">取引種別</label>
            <select
              id="tradeType"
              name="tradeType"
              value={formData.tradeType}
              onChange={handleInputChange}
            >
              {tradeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">数量</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={errors.quantity ? 'error' : ''}
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unitPrice">単価</label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={errors.unitPrice ? 'error' : ''}
            />
            {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">取引金額</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="1"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="averageAcquisitionPrice">平均取得価額</label>
            <input
              type="number"
              id="averageAcquisitionPrice"
              name="averageAcquisitionPrice"
              value={formData.averageAcquisitionPrice}
              onChange={handleInputChange}
              step="1"
              className={errors.averageAcquisitionPrice ? 'error' : ''}
            />
            {errors.averageAcquisitionPrice && <span className="error-message">{errors.averageAcquisitionPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="realizedProfitLoss">実現損益 *</label>
            <input
              type="number"
              id="realizedProfitLoss"
              name="realizedProfitLoss"
              value={formData.realizedProfitLoss}
              onChange={handleInputChange}
              step="1"
              className={errors.realizedProfitLoss ? 'error' : ''}
            />
            {errors.realizedProfitLoss && <span className="error-message">{errors.realizedProfitLoss}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="memo">メモ</label>
          <textarea
            id="memo"
            name="memo"
            value={formData.memo}
            onChange={handleInputChange}
            rows={3}
            placeholder="取引に関するメモを入力"
          />
        </div>

        <div className="form-actions">
          <div className="form-actions-left">
            {trade && onDelete && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
                title="この取引を削除"
              >
                削除
              </button>
            )}
          </div>
          <div className="form-actions-right">
            <button type="button" onClick={onCancel} className="cancel-button">
              キャンセル
            </button>
            <button type="submit" className="save-button">
              {trade ? '更新' : '保存'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}