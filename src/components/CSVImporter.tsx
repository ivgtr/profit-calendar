import { useState, useCallback } from 'react';
import { parseCSV, readFileAsText } from '../utils/csvParser';
import { db } from '../services/database';
import { Trade, ImportResult, CSVSummary } from '../types/Trade';
import { ImportHistory, ImportTradeRelation } from '../types/ImportHistory';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';
import { formatStockDisplay } from '../utils/stockUtils';
import '../styles/CSVImporter.css';

interface CSVImporterProps {
  onImportComplete?: (result: ImportResult) => void;
}

export function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewTrades, setPreviewTrades] = useState<Trade[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [csvSummary, setCsvSummary] = useState<CSVSummary | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const processFile = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportResult(null);
    setCurrentFileName(file.name);
    
    try {
      const text = await readFileAsText(file);
      const { trades, summary, result } = await parseCSV(text);
      
      if (result.success && trades.length > 0) {
        // プレビュー表示
        setPreviewTrades(trades);
        setShowPreview(true);
        setImportResult(result);
        setCsvSummary(summary);
        
      } else {
        setImportResult(result);
        onImportComplete?.(result);
      }
    } catch (error) {
      const errorResult: ImportResult = {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        rejectedRecords: 0,
        errors: [error instanceof Error ? error.message : 'ファイル処理エラー'],
      };
      setImportResult(errorResult);
      onImportComplete?.(errorResult);
    } finally {
      setIsImporting(false);
    }
  }, [onImportComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));

    if (csvFile) {
      await processFile(csvFile);
    } else {
      alert('CSVファイルをドロップしてください');
    }
  }, [processFile]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  const handleConfirmImport = async () => {
    if (previewTrades.length === 0 || !importResult) return;
    
    setIsImporting(true);
    try {
      // 取引データを保存
      await db.addTrades(previewTrades);
      
      // 取引の日付範囲を計算
      const dates = previewTrades.map(trade => trade.date);
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      // 損益サマリーを計算
      const totalProfit = previewTrades
        .filter(trade => trade.realizedProfitLoss > 0)
        .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0);
      
      const totalLoss = Math.abs(previewTrades
        .filter(trade => trade.realizedProfitLoss < 0)
        .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0));
      
      const netProfit = totalProfit - totalLoss;
      
      // インポート履歴を作成
      const now = new Date();
      const importHistory: ImportHistory = {
        id: uuidv4(),
        fileName: currentFileName,
        importDate: now,
        totalRecords: importResult.totalRecords,
        importedRecords: importResult.importedRecords,
        rejectedRecords: importResult.rejectedRecords,
        dateRange: { startDate, endDate },
        summary: { totalProfit, totalLoss, netProfit },
        status: 'active',
        csvSummary: csvSummary ? {
          検索件数: csvSummary.検索件数,
          約定日: csvSummary.約定日,
          種類: csvSummary.種類,
          口座: csvSummary.口座,
        } : undefined,
        errors: importResult.errors,
        createdAt: now,
        updatedAt: now,
      };
      
      // インポート履歴を保存
      await db.addImportHistory(importHistory);
      
      // インポート-取引関連を保存
      const relations: ImportTradeRelation[] = previewTrades.map(trade => ({
        importId: importHistory.id,
        tradeId: trade.id,
      }));
      
      await db.addImportTradeRelations(relations);
      
      setShowPreview(false);
      setPreviewTrades([]);
      setCsvSummary(null);
      setCurrentFileName('');
      
      onImportComplete?.(importResult);
    } catch (error) {
      console.error('インポート保存エラー:', error);
      alert('データベースへの保存に失敗しました');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRejectImport = () => {
    setShowPreview(false);
    setPreviewTrades([]);
    setImportResult(null);
    setCsvSummary(null);
    setCurrentFileName('');
  };

  return (
    <div className="csv-importer">
      {!showPreview && (
        <div className="import-info">
          <h4>CSVインポートについて</h4>
          <p>現在、SBI証券からダウンロードした取引履歴CSVファイルのみに対応しています。</p>
          <p>SBI証券の「取引履歴」→「国内株式」からダウンロードしたCSVファイルをご利用ください。</p>
        </div>
      )}
      
      {!showPreview && (
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <p>CSVファイルをここにドラッグ＆ドロップ</p>
            <p>または</p>
            <label htmlFor="file-input" className="file-input-label">
              ファイルを選択
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isImporting}
            />
            <small style={{ display: 'block', marginTop: '10px', color: '#666' }}>
              対応形式: .csv (SBI証券の取引履歴)
            </small>
          </div>
        </div>
      )}

      {isImporting && (
        <div className="importing-status">
          <p>ファイルを処理中...</p>
        </div>
      )}

      {importResult && !showPreview && (
        <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
          <h3>インポート結果</h3>
          <p>総レコード数: {importResult.totalRecords}</p>
          <p>インポート成功: {importResult.importedRecords}</p>
          <p>インポート失敗: {importResult.rejectedRecords}</p>
          {importResult.errors.length > 0 && (
            <div className="errors">
              <h4>エラー:</h4>
              <ul>
                {importResult.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li>他 {importResult.errors.length - 5} 件のエラー</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showPreview && previewTrades.length > 0}
        onClose={handleRejectImport}
        title="インポートプレビュー"
        size="large"
      >
        <p>{previewTrades.length}件の取引データが見つかりました</p>
        
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
                  <td>{trade.quantity.toLocaleString()}</td>
                  <td className={trade.realizedProfitLoss >= 0 ? 'profit' : 'loss'}>
                    {trade.realizedProfitLoss >= 0 ? '+' : ''}
                    {trade.realizedProfitLoss.toLocaleString()}円
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
          <button 
            onClick={handleConfirmImport} 
            disabled={isImporting}
            className="confirm-button"
          >
            インポート実行
          </button>
          <button 
            onClick={handleRejectImport} 
            disabled={isImporting}
            className="reject-button"
          >
            キャンセル
          </button>
        </div>
      </Modal>
    </div>
  );
}