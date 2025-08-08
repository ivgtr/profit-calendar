import { useState, useCallback } from 'react';
import { parseCSV, readFileAsText } from '../utils/csvParser';
import { db } from '../services/database';
import { Trade, ImportResult, CSVSummary } from '../types/Trade';
import { ImportHistory, ImportTradeRelation } from '../types/ImportHistory';
import { v4 as uuidv4 } from 'uuid';

export interface UseCSVImporterProps {
  onImportComplete?: (result: ImportResult) => void;
}

export function useCSVImporter({ onImportComplete }: UseCSVImporterProps) {
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
    const files = e.target.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleApproveImport = useCallback(async () => {
    if (!previewTrades.length || !csvSummary || !importResult) return;

    setIsImporting(true);
    
    try {
      // IndexedDBに保存
      const importId = uuidv4();
      
      // 損益を計算
      const totalProfit = previewTrades.reduce((sum, trade) => 
        trade.realizedProfitLoss > 0 ? sum + trade.realizedProfitLoss : sum, 0);
      const totalLoss = previewTrades.reduce((sum, trade) => 
        trade.realizedProfitLoss < 0 ? sum + Math.abs(trade.realizedProfitLoss) : sum, 0);
      
      // 日付範囲を計算
      const dates = previewTrades.map(trade => trade.date);
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

      // インポート履歴を作成
      const importHistory: ImportHistory = {
        id: importId,
        fileName: currentFileName,
        importDate: new Date(),
        totalRecords: importResult.totalRecords,
        importedRecords: importResult.importedRecords,
        rejectedRecords: importResult.rejectedRecords,
        dateRange: { startDate, endDate },
        summary: {
          totalProfit,
          totalLoss,
          netProfit: totalProfit - totalLoss,
        },
        status: 'active' as const,
        csvSummary,
        errors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // インポート履歴を保存
      await db.addImportHistory(importHistory);

      // 各取引を一括保存
      await db.addTrades(previewTrades);

      // リレーションを作成・保存
      const relations: ImportTradeRelation[] = previewTrades.map(trade => ({
        importId,
        tradeId: trade.id,
      }));
      await db.addImportTradeRelations(relations);

      const finalResult: ImportResult = {
        ...importResult,
        success: true,
      };
      
      setShowPreview(false);
      setPreviewTrades([]);
      setCsvSummary(null);
      setImportResult(finalResult);
      onImportComplete?.(finalResult);
      
    } catch (error) {
      console.error('Import failed:', error);
      const errorResult: ImportResult = {
        ...importResult,
        success: false,
        errors: [error instanceof Error ? error.message : 'インポート処理エラー'],
      };
      setImportResult(errorResult);
      onImportComplete?.(errorResult);
    } finally {
      setIsImporting(false);
    }
  }, [previewTrades, csvSummary, importResult, currentFileName, onImportComplete]);

  const handleRejectImport = useCallback(() => {
    setShowPreview(false);
    setPreviewTrades([]);
    setCsvSummary(null);
    setImportResult(null);
    setCurrentFileName('');
  }, []);

  const resetImporter = useCallback(() => {
    setIsDragging(false);
    setIsImporting(false);
    setImportResult(null);
    setPreviewTrades([]);
    setShowPreview(false);
    setCsvSummary(null);
    setCurrentFileName('');
  }, []);

  return {
    // State
    isDragging,
    isImporting,
    importResult,
    previewTrades,
    showPreview,
    csvSummary,
    currentFileName,
    
    // Actions
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleApproveImport,
    handleRejectImport,
    resetImporter,
  };
}