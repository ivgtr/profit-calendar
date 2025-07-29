import { useState } from 'react';
import { db } from '../services/database';
import '../styles/BulkDeleteTrades.css';

interface BulkDeleteTradesProps {
  onComplete: () => void;
}

type DeleteMode = 'all' | 'dates';

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

      <div className="action-buttons">
        <button
          type="button"
          onClick={mode === 'all' ? handleDeleteAll : handleDeleteByDates}
          disabled={isDeleting}
          className="delete-button"
        >
          {isDeleting ? '削除中...' : '削除実行'}
        </button>
      </div>
    </div>
  );
}