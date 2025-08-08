import { DataUpdateHandler } from '../types/Common';
import { ImportResult } from '../types/Trade';
import { useCSVImporter } from '../hooks/useCSVImporter';
import { Modal } from './Modal';
import { formatStockDisplay } from '../utils/stockUtils';
import '../styles/CSVImporter.css';

interface CSVImporterProps {
  onImportComplete?: DataUpdateHandler<ImportResult>;
}

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const {
    isDragging,
    isImporting,
    importResult,
    previewTrades,
    showPreview,
    csvSummary,
    currentFileName,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleApproveImport,
    handleRejectImport,
  } = useCSVImporter({ onImportComplete });

  return (
    <div className="csv-importer">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
        title={`CSVインポートプレビュー - ${currentFileName}`}
        size="large"
      >
        <div className="import-preview">
          {csvSummary && (
            <div className="csv-summary">
              <h4>📊 インポート概要</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">約定日:</span>
                  <span className="value">{csvSummary.約定日}</span>
                </div>
                <div className="summary-item">
                  <span className="label">検索件数:</span>
                  <span className="value">{csvSummary.検索件数}件</span>
                </div>
                <div className="summary-item">
                  <span className="label">口座:</span>
                  <span className="value">{csvSummary.口座}</span>
                </div>
                <div className="summary-item">
                  <span className="label">種類:</span>
                  <span className="value">{csvSummary.種類}</span>
                </div>
              </div>
              {csvSummary.商品別損益.length > 0 && (
                <div className="product-summary">
                  <h5>商品別損益</h5>
                  {csvSummary.商品別損益.map((item, index) => (
                    <div key={index} className="product-item">
                      <span className="product-type">{item.商品}:</span>
                      <span className={`profit-loss ${item.実現損益 >= 0 ? 'profit' : 'loss'}`}>
                        {item.実現損益 >= 0 ? '+' : ''}{item.実現損益.toLocaleString()}円
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="preview-trades">
            <h4>📝 インポート対象取引 ({previewTrades.length}件)</h4>
            <div className="trades-table-container">
              <table className="trades-table">
                <thead>
                  <tr>
                    <th>約定日</th>
                    <th>銘柄</th>
                    <th>取引</th>
                    <th>数量</th>
                    <th>単価</th>
                    <th>取引金額</th>
                    <th>実現損益</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTrades.map((trade, index) => (
                    <tr key={index}>
                      <td>{trade.date.toLocaleDateString()}</td>
                      <td>{formatStockDisplay(trade.stockName, trade.stockCode)}</td>
                      <td>
                        <span className={`trade-type ${trade.tradeType}`}>
                          {trade.tradeType}
                        </span>
                      </td>
                      <td>{trade.quantity.toLocaleString()}</td>
                      <td>{trade.unitPrice.toLocaleString()}円</td>
                      <td>{trade.amount.toLocaleString()}円</td>
                      <td className={trade.realizedProfitLoss >= 0 ? 'profit' : 'loss'}>
                        {trade.realizedProfitLoss >= 0 ? '+' : ''}{trade.realizedProfitLoss.toLocaleString()}円
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="preview-actions">
            <button
              type="button"
              onClick={handleRejectImport}
              className="reject-button"
              disabled={isImporting}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleApproveImport}
              className="approve-button"
              disabled={isImporting}
            >
              {isImporting ? 'インポート中...' : `${previewTrades.length}件の取引をインポート`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}