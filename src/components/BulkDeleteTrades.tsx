import { useState } from 'react';
import { db } from '../services/database';
import '../styles/BulkDeleteTrades.css';

interface BulkDeleteTradesProps {
  onComplete: () => void;
}

type DeleteMode = 'all' | 'dates' | 'reset';

export function BulkDeleteTrades({ onComplete }: BulkDeleteTradesProps) {
  const [mode, setMode] = useState<DeleteMode>('dates');
  const [selectedDates, setSelectedDates] = useState<string[]>(['']);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddDate = () => {
    setSelectedDates([...selectedDates, '']);
  };

  const handleRemoveDate = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...selectedDates];
    newDates[index] = value;
    setSelectedDates(newDates);
  };

  const handleDeleteAll = async () => {
    if (!confirm('全ての取引データを削除します。この操作は元に戻せません。本当に実行しますか？')) {
      return;
    }

    setIsDeleting(true);
    try {
      const deletedCount = await db.deleteAllTrades();
      alert(`${deletedCount}件の取引を削除しました`);
      onComplete();
    } catch (error) {
      console.error('全削除エラー:', error);
      alert('取引の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteByDates = async () => {
    const validDates = selectedDates.filter(date => date.trim() !== '');
    
    if (validDates.length === 0) {
      alert('削除する日付を指定してください');
      return;
    }

    if (!confirm(`${validDates.length}個の日付の取引を削除します。この操作は元に戻せません。本当に実行しますか？`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const dates = validDates.map(dateStr => new Date(dateStr));
      const deletedCount = await db.deleteTradesByDates(dates);
      alert(`${deletedCount}件の取引を削除しました`);
      onComplete();
    } catch (error) {
      console.error('日付指定削除エラー:', error);
      alert('取引の削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('全ての取引データ、インポート履歴、設定を削除してアプリを初期状態に戻します。この操作は元に戻せません。本当に実行しますか？')) {
      return;
    }

    if (!confirm('最終確認：この操作により全てのデータと設定が失われます。本当に続行しますか？')) {
      return;
    }

    setIsDeleting(true);
    try {
      await db.resetAll();
      alert('アプリを初期状態にリセットしました。ページをリロードします。');
      // ページをリロードしてアプリを完全に初期化
      window.location.reload();
    } catch (error) {
      console.error('完全初期化エラー:', error);
      alert('初期化に失敗しました');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bulk-delete-trades">
      <div className="delete-mode-selector">
        <label className="mode-option">
          <input
            type="radio"
            name="deleteMode"
            value="dates"
            checked={mode === 'dates'}
            onChange={(e) => setMode(e.target.value as DeleteMode)}
          />
          指定した日付の取引を削除
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="deleteMode"
            value="all"
            checked={mode === 'all'}
            onChange={(e) => setMode(e.target.value as DeleteMode)}
          />
          全ての取引を削除
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="deleteMode"
            value="reset"
            checked={mode === 'reset'}
            onChange={(e) => setMode(e.target.value as DeleteMode)}
          />
          完全初期化（全データ・設定削除）
        </label>
      </div>

      {mode === 'dates' && (
        <div className="date-selector">
          <h4>削除する日付を指定</h4>
          {selectedDates.map((date, index) => (
            <div key={index} className="date-input-row">
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
                className="date-input"
              />
              {selectedDates.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDate(index)}
                  className="remove-date-button"
                  title="この日付を削除"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddDate}
            className="add-date-button"
          >
            + 日付を追加
          </button>
        </div>
      )}

      {mode === 'all' && (
        <div className="warning-message">
          <p>⚠️ 全ての取引データが削除されます</p>
          <p>この操作は元に戻すことができません</p>
        </div>
      )}

      {mode === 'reset' && (
        <div className="warning-message">
          <p>🚨 <strong>完全初期化</strong></p>
          <p>⚠️ 以下の全てが削除されます：</p>
          <ul style={{ marginLeft: '20px', textAlign: 'left' }}>
            <li>全ての取引データ</li>
            <li>全てのインポート履歴</li>
            <li>テーマ設定</li>
            <li>その他全ての設定</li>
          </ul>
          <p><strong>この操作は元に戻すことができません</strong></p>
        </div>
      )}

      <div className="action-buttons">
        <button
          type="button"
          onClick={
            mode === 'all' ? handleDeleteAll :
            mode === 'dates' ? handleDeleteByDates :
            handleResetAll
          }
          disabled={isDeleting}
          className="delete-button"
        >
          {isDeleting ? (
            mode === 'reset' ? '初期化中...' : '削除中...'
          ) : (
            mode === 'reset' ? '完全初期化実行' : '削除実行'
          )}
        </button>
      </div>
    </div>
  );
}