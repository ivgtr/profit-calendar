import { useState, useEffect } from 'react';
import { Trade, TradeType, AccountType } from '../types/Trade';
import { DataUpdateHandler, DataDeleteHandler } from '../types/Common';
import { v4 as uuidv4 } from 'uuid';
import '../styles/TradeForm.css';

interface TradeFormProps {
  trade?: Trade; // 編集時は既存データ、新規時はundefined
  onSave: DataUpdateHandler<Trade>;
  onCancel: () => void;
  onDelete?: DataDeleteHandler;
}

export function TradeForm({ trade, onSave, onCancel, onDelete }: TradeFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    accountType: 'NISA' as AccountType,
    stockName: '手動入力',
    stockCode: '',
    tradeType: '現物買' as TradeType,
    quantity: '1',
    unitPrice: '1',
    amount: '1',
    averageAcquisitionPrice: '1',
    realizedProfitLoss: '',
    memo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 編集時の初期データ設定
  useEffect(() => {
    if (trade) {
      // ローカルタイムゾーンで日付を取得
      const localDate = new Date(trade.date.getTime() - trade.date.getTimezoneOffset() * 60000);
      setFormData({
        date: localDate.toISOString().split('T')[0],
        accountType: trade.accountType,
        stockName: trade.stockName,
        stockCode: trade.stockCode || '',
        tradeType: trade.tradeType,
        quantity: trade.quantity.toString(),
        unitPrice: trade.unitPrice.toString(),
        amount: trade.amount.toString(),
        averageAcquisitionPrice: trade.averageAcquisitionPrice.toString(),
        realizedProfitLoss: trade.realizedProfitLoss.toString(),
        memo: trade.memo || '',
      });
    }
  }, [trade]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 必須項目：約定日、実現損益のみ
    if (!formData.date) newErrors.date = '約定日は必須です';
    if (!formData.realizedProfitLoss || isNaN(Number(formData.realizedProfitLoss))) {
      newErrors.realizedProfitLoss = '実現損益は必須です';
    }

    // 任意項目のバリデーション（入力がある場合のみ）
    if (formData.quantity && (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0)) {
      newErrors.quantity = '0以上の数値を入力してください';
    }
    if (formData.unitPrice && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      newErrors.unitPrice = '0以上の数値を入力してください';
    }
    if (formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = '数値を入力してください';
    }
    if (formData.averageAcquisitionPrice && isNaN(Number(formData.averageAcquisitionPrice))) {
      newErrors.averageAcquisitionPrice = '数値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const now = new Date();
    // ローカルタイムゾーンで日付を作成（YYYY-MM-DD形式の文字列から）
    const [year, month, day] = formData.date.split('-').map(Number);
    const tradeData: Trade = {
      id: trade?.id || uuidv4(),
      date: new Date(year, month - 1, day),
      accountType: formData.accountType,
      stockName: formData.stockName.trim(),
      stockCode: formData.stockCode.trim() || undefined,
      tradeType: formData.tradeType,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      amount: Number(formData.amount),
      averageAcquisitionPrice: Number(formData.averageAcquisitionPrice),
      realizedProfitLoss: Number(formData.realizedProfitLoss),
      memo: formData.memo.trim() || undefined,
      csvImported: trade?.csvImported || false,
      createdAt: trade?.createdAt || now,
      updatedAt: now,
    };

    onSave(tradeData);
  };

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