import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { ImportHistory } from '../types/ImportHistory';
import { formatCurrency } from '../utils/formatUtils';
import '../styles/ImportHistoryList.css';

interface ImportHistoryListProps {
  onHistoryUpdate?: () => void;
}

export function ImportHistoryList({ onHistoryUpdate }: ImportHistoryListProps) {
  const [histories, setHistories] = useState<ImportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistories = async () => {
    setIsLoading(true);
    try {
      const allHistories = await db.getAllImportHistory();
      setHistories(allHistories);
    } catch (error) {
      console.error('インポート履歴の読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistories();
  }, []);

  const handleReject = async (history: ImportHistory) => {
    if (!confirm(`「${history.fileName}」のインポートを取り消しますか？\n関連する${history.importedRecords}件の取引データが削除されます。`)) {
      return;
    }

    try {
      // 関連する取引データを削除
      await db.deleteTradesByImportId(history.id);
      
      // インポート履歴のステータスを更新
      const updatedHistory: ImportHistory = {
        ...history,
        status: 'rejected',
        updatedAt: new Date(),
      };
      
      await db.updateImportHistory(updatedHistory);
      
      // 履歴を再読み込み
      await loadHistories();
      
      // 親コンポーネントに更新を通知
      onHistoryUpdate?.();
      
      alert('インポートを取り消しました');
    } catch (error) {
      console.error('インポート取り消しエラー:', error);
      alert('インポートの取り消しに失敗しました');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="loading">インポート履歴を読み込み中...</div>;
  }

  if (histories.length === 0) {
    return (
      <div className="empty-state">
        <p>インポート履歴はありません</p>
      </div>
    );
  }

  return (
    <div className="import-history-list">
      {histories.map(history => (
        <div key={history.id} className={`history-item ${history.status}`}>
          <div className="history-header" onClick={() => toggleExpand(history.id)}>
            <div className="history-main-info">
              <div className="file-info">
                <span className="file-name">{history.fileName}</span>
                <span className={`status-badge ${history.status}`}>
                  {history.status === 'active' ? '有効' : '取り消し済み'}
                </span>
              </div>
              <div className="import-summary">
                <span className="import-date">{formatDate(history.importDate)}</span>
                <span className="record-count">{history.importedRecords}件のデータ</span>
                <span className={`net-profit ${history.summary.netProfit >= 0 ? 'profit' : 'loss'}`}>
                  {history.summary.netProfit >= 0 ? '+' : ''}
                  {formatCurrency(history.summary.netProfit)}円
                </span>
              </div>
            </div>
            <div className="expand-icon">
              {expandedId === history.id ? '▲' : '▼'}
            </div>
          </div>

          {expandedId === history.id && (
            <div className="history-details">
              <div className="details-grid">
                <div className="detail-section">
                  <h4>インポート結果</h4>
                  <div className="detail-row">
                    <span>総レコード数:</span>
                    <span>{history.totalRecords}</span>
                  </div>
                  <div className="detail-row">
                    <span>成功:</span>
                    <span>{history.importedRecords}</span>
                  </div>
                  <div className="detail-row">
                    <span>失敗:</span>
                    <span>{history.rejectedRecords}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>取引期間</h4>
                  <div className="detail-row">
                    <span>開始日:</span>
                    <span>{new Date(history.dateRange.startDate).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="detail-row">
                    <span>終了日:</span>
                    <span>{new Date(history.dateRange.endDate).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>損益サマリー</h4>
                  <div className="detail-row">
                    <span>利益:</span>
                    <span className="profit">+{formatCurrency(history.summary.totalProfit)}円</span>
                  </div>
                  <div className="detail-row">
                    <span>損失:</span>
                    <span className="loss">-{formatCurrency(history.summary.totalLoss)}円</span>
                  </div>
                  <div className="detail-row">
                    <span>純損益:</span>
                    <span className={history.summary.netProfit >= 0 ? 'profit' : 'loss'}>
                      {history.summary.netProfit >= 0 ? '+' : ''}
                      {formatCurrency(history.summary.netProfit)}円
                    </span>
                  </div>
                </div>
              </div>

              {history.csvSummary && (
                <div className="csv-summary">
                  <h4>CSVサマリー</h4>
                  <div className="detail-row">
                    <span>約定日:</span>
                    <span>{history.csvSummary.約定日}</span>
                  </div>
                  <div className="detail-row">
                    <span>種類:</span>
                    <span>{history.csvSummary.種類}</span>
                  </div>
                  <div className="detail-row">
                    <span>口座:</span>
                    <span>{history.csvSummary.口座}</span>
                  </div>
                </div>
              )}

              {history.errors.length > 0 && (
                <div className="errors-section">
                  <h4>エラー</h4>
                  <div className="errors-list">
                    {history.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="error-item">{error}</div>
                    ))}
                    {history.errors.length > 3 && (
                      <div className="error-item">他 {history.errors.length - 3} 件のエラー</div>
                    )}
                  </div>
                </div>
              )}

              {history.status === 'active' && (
                <div className="actions">
                  <button 
                    onClick={() => handleReject(history)}
                    className="reject-button"
                  >
                    このインポートを取り消す
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}