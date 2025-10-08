import { useEffect } from 'react';
import { DataUpdateHandler } from '../../../types/Common';
import { ImportResult } from '../../../types/Trade';
import { useCSVImporter } from '../../../hooks/useCSVImporter';
import { Modal } from '../../ui/feedback/Modal';
import { Button } from '../../ui/base/Button';
import { formatStockDisplay } from '../../../utils/stockUtils';
import './CSVImporter.css';

interface CSVImporterProps {
  onImportComplete?: DataUpdateHandler<ImportResult>;
  initialFile?: File;
  onInitialFileHandled?: () => void;
}

export function CSVImporter({ onImportComplete, initialFile, onInitialFileHandled }: CSVImporterProps) {
  const {
    isDragging,
    isImporting,
    importResult,
    previewTrades,
    showPreview,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleApproveImport,
    handleRejectImport,
    handleProcessFile,
  } = useCSVImporter({ onImportComplete });

  useEffect(() => {
    if (!initialFile) {
      return;
    }

    let isMounted = true;

    const process = async () => {
      await handleProcessFile(initialFile);
      if (isMounted) {
        onInitialFileHandled?.();
      }
    };

    process().catch((error) => {
      console.error('Failed to process initial CSV file:', error);
      if (isMounted) {
        onInitialFileHandled?.();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialFile, handleProcessFile, onInitialFileHandled]);

  return (
    <div className="csv-importer">
      <div className="import-info">
        <h4>CSVインポートについて</h4>
        <p>現在、SBI証券からダウンロードした取引履歴CSVファイルのみに対応しています。</p>
        <p>SBI証券の「取引履歴」→「国内株式」からダウンロードしたCSVファイルをご利用ください。</p>
      </div>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isImporting && !showPreview && (
          <div className="drop-zone-loading">
            <div className="drop-zone-loading__spinner" />
            <p className="drop-zone-loading__text">CSVを解析しています...</p>
          </div>
        )}
        <div className="drop-zone-content">
          <div className="upload-icon">📊</div>
          <h3>CSVファイルをインポート</h3>
          <p>SBI証券のCSVファイルをここにドラッグ＆ドロップするか、ファイルを選択してください</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input"
            id="csv-file-input"
            disabled={isImporting}
          />
          <label htmlFor="csv-file-input" className={`file-select-button ${isImporting ? 'disabled' : ''}`}>
            {isImporting ? 'インポート中...' : 'ファイルを選択'}
          </label>
        </div>
      </div>

      {importResult && !showPreview && (
        <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
          <h4>{importResult.success ? '✅ インポート完了' : '❌ インポートエラー'}</h4>
          <div className="result-summary">
            <p>総レコード数: {importResult.totalRecords}</p>
            <p>インポート済み: {importResult.importedRecords}</p>
            <p>除外: {importResult.rejectedRecords}</p>
          </div>
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="error-list">
              <h5>エラー詳細:</h5>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showPreview}
        onClose={handleRejectImport}
        title="インポートプレビュー"
        size="large"
      >
        <div className="csv-import-preview">
          <div className="preview-summary">
            <p>{previewTrades.length}件の取引データが見つかりました</p>
          </div>
          
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>約定日</th>
                  <th>銘柄名</th>
                  <th>取引</th>
                  <th>数量</th>
                  <th>損益</th>
                </tr>
              </thead>
              <tbody>
                {previewTrades.slice(0, 10).map((trade, index) => (
                  <tr key={index}>
                    <td>{trade.date.toLocaleDateString('ja-JP')}</td>
                    <td>{formatStockDisplay(trade.stockName, trade.stockCode)}</td>
                    <td>{trade.tradeType}</td>
                    <td>{trade.quantity?.toLocaleString() || '未入力'}</td>
                    <td className={trade.realizedProfitLoss >= 0 ? 'profit' : 'loss'}>
                      {trade.realizedProfitLoss >= 0 ? '+' : ''}
                      {trade.realizedProfitLoss?.toLocaleString() || 0}円
                    </td>
                  </tr>
                ))}
                {previewTrades.length > 10 && (
                  <tr>
                    <td colSpan={5} className="more-rows">
                      他 {previewTrades.length - 10} 件
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="preview-actions">
            <Button
              onClick={handleRejectImport}
              disabled={isImporting}
              className="reject-button"
              variant="ghost"
              size="medium"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleApproveImport}
              disabled={isImporting}
              className="confirm-button"
              variant="primary"
              size="medium"
              loading={isImporting}
            >
              {isImporting ? 'インポート中...' : `${previewTrades.length}件の取引をインポート`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
