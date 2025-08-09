import { useState, useEffect } from 'react';
import { Trade, TradeType, AccountType } from '../../../types/Trade';
import { DataUpdateHandler, DataDeleteHandler } from '../../../types/Common';
import { useTradeForm } from '../../../hooks/useTradeForm';
import { useUI } from '../../../contexts/UIContext';
import '../../../styles/TradeForm.css';

interface TradeFormProps {
  trade?: Trade; // 編集時は既存データ、新規時はundefined
  onSave: DataUpdateHandler<Trade>;
  onCancel: () => void;
  onDelete?: DataDeleteHandler;
}

export default function TradeForm({ trade, onSave, onCancel, onDelete }: TradeFormProps) {
  const { showConfirm } = useUI();
  const {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
  } = useTradeForm({ trade, onSave });

  // 詳細項目のトグル状態管理
  const [showDetails, setShowDetails] = useState(false);
  
  // 詳細項目に値が入力されているかチェック
  const hasDetailValues = Boolean(
    (formData.stockName && formData.stockName.trim() !== '') ||
    (formData.stockCode && formData.stockCode.trim() !== '') ||
    (formData.quantity && formData.quantity.trim() !== '') ||
    (formData.unitPrice && formData.unitPrice.trim() !== '') ||
    (formData.amount && formData.amount.trim() !== '') ||
    (formData.averageAcquisitionPrice && formData.averageAcquisitionPrice.trim() !== '') ||
    (formData.memo && formData.memo.trim() !== '')
  );

  // 初期表示時のトグル設定（詳細項目に値があれば開く）
  useEffect(() => {
    if (hasDetailValues) {
      setShowDetails(true);
    }
  }, [hasDetailValues]);

  const handleDelete = async () => {
    if (trade && onDelete) {
      const confirmed = await showConfirm({
        message: 'この取引を削除しますか？この操作は取り消せません。',
        confirmText: '削除',
        variant: 'danger'
      });
      if (confirmed) {
        onDelete(trade.id);
      }
    }
  };

  const tradeTypes: TradeType[] = ['現物買', '現物売', '返済買', '返済売'];
  const accountTypes: AccountType[] = ['特定', '一般', 'NISA'];

  return (
    <div className="trade-form">
      <div className="trade-form-content">
        <form onSubmit={handleSubmit} className="trade-form-inner" id="trade-form-inner">
          {/* 必須項目セクション */}
          <div className="required-section">
            <div className="required-fields">
              <div className="form-group">
                <label htmlFor="date">約定日 *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="realizedProfitLoss">実現損益 *</label>
                <input
                  type="number"
                  id="realizedProfitLoss"
                  name="realizedProfitLoss"
                  value={formData.realizedProfitLoss}
                  onChange={handleInputChange}
                  placeholder="実現損益を入力"
                  required
                  className={errors.realizedProfitLoss ? 'error' : ''}
                />
                {errors.realizedProfitLoss && <span className="error-message">{errors.realizedProfitLoss}</span>}
              </div>
            </div>
          </div>

        {/* 詳細項目セクション */}
        <div className="details-section">
          <div className="details-header">
            <button 
              type="button" 
              className="details-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              <span>詳細入力</span>
              <span className={`chevron ${showDetails ? 'open' : ''}`}>▼</span>
            </button>
          </div>
          
          <div className={`details-content ${showDetails ? 'open' : ''}`}>
            <div className="form-grid">
              {/* 基本取引情報 */}
              <div className="form-group">
                <label htmlFor="accountType">口座</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                >
                  <option value="">未選択</option>
                  {accountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tradeType">取引種別</label>
                <select
                  id="tradeType"
                  name="tradeType"
                  value={formData.tradeType}
                  onChange={handleInputChange}
                >
                  <option value="">未選択</option>
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
                  placeholder="数量を入力"
                  min="0"
                  className={errors.quantity ? 'error' : ''}
                />
                {errors.quantity && <span className="error-message">{errors.quantity}</span>}
              </div>

              {/* 銘柄情報 */}
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
                <label htmlFor="unitPrice">単価</label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  placeholder="単価を入力"
                  min="0"
                  className={errors.unitPrice ? 'error' : ''}
                />
                {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
              </div>

              {/* 金額情報 */}
              <div className="form-group">
                <label htmlFor="amount">取引金額</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="取引金額を入力"
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
                  placeholder="平均取得価額を入力"
                  className={errors.averageAcquisitionPrice ? 'error' : ''}
                />
                {errors.averageAcquisitionPrice && <span className="error-message">{errors.averageAcquisitionPrice}</span>}
              </div>
            </div>

            {/* メモ */}
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
          </div>
        </div>
        </form>
      </div>
      
      <div className="form-actions">
        <div className="form-actions-left">
          {trade && trade.id && onDelete && (
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
          <button 
            type="submit" 
            form="trade-form-inner"
            className="save-button"
          >
            {trade && trade.id ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}