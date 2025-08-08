import { db } from './database';
import { Trade } from '../types/Trade';
import { ImportHistory } from '../types/ImportHistory';

export interface BackupData {
  version: string;
  exportDate: string;
  trades: Trade[];
  importHistory: ImportHistory[];
  metadata: {
    totalTrades: number;
    dateRange: {
      start: string;
      end: string;
    };
    exportedBy: string;
  };
}

export class BackupService {
  private static readonly VERSION = '1.0.0';
  private static readonly APP_NAME = '利益カレンダー';

  /**
   * 全データをバックアップファイルとしてエクスポート
   */
  static async exportBackup(): Promise<void> {
    try {
      // 全取引データを取得
      const trades = await db.getAllTrades();
      
      // インポート履歴を取得
      const importHistory = await db.getAllImportHistory();

      // メタデータを生成
      const sortedTrades = trades.sort((a, b) => a.date.getTime() - b.date.getTime());
      const dateRange = {
        start: sortedTrades.length > 0 ? sortedTrades[0].date.toISOString() : new Date().toISOString(),
        end: sortedTrades.length > 0 ? sortedTrades[sortedTrades.length - 1].date.toISOString() : new Date().toISOString()
      };

      const backupData: BackupData = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        trades,
        importHistory,
        metadata: {
          totalTrades: trades.length,
          dateRange,
          exportedBy: this.APP_NAME
        }
      };

      // JSONファイルとしてダウンロード
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const fileName = `profit-calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('バックアップのエクスポートに失敗しました:', error);
      throw new Error('バックアップのエクスポートに失敗しました');
    }
  }

  /**
   * ファイルからバックアップデータを復元
   */
  static async importFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      await this.validateAndRestore(backupData);
    } catch (error) {
      console.error('ファイルからの復元に失敗しました:', error);
      throw new Error('ファイルからの復元に失敗しました。ファイル形式を確認してください。');
    }
  }

  /**
   * URLからバックアップデータを復元
   */
  static async importFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const backupData: BackupData = await response.json();
      await this.validateAndRestore(backupData);
    } catch (error) {
      console.error('URLからの復元に失敗しました:', error);
      throw new Error('URLからの復元に失敗しました。URLまたはファイル形式を確認してください。');
    }
  }

  /**
   * バックアップデータの検証と復元
   */
  private static async validateAndRestore(backupData: BackupData): Promise<void> {
    // バックアップデータの検証
    if (!backupData.version || !backupData.trades || !Array.isArray(backupData.trades)) {
      throw new Error('無効なバックアップファイル形式です');
    }

    // 既存データの確認
    const existingTrades = await db.getAllTrades();
    if (existingTrades.length > 0) {
      const confirmed = window.confirm(
        `既存のデータ（${existingTrades.length}件の取引）が存在します。\n` +
        `復元を続行すると既存データは全て削除されます。\n\n` +
        `復元データ: ${backupData.metadata.totalTrades}件の取引\n` +
        `エクスポート日時: ${new Date(backupData.exportDate).toLocaleString('ja-JP')}\n\n` +
        '続行しますか？'
      );
      
      if (!confirmed) {
        throw new Error('復元がキャンセルされました');
      }
    }

    // 既存データを削除
    await db.clearAllTrades();

    // 取引データを復元
    for (const trade of backupData.trades) {
      // 日付文字列をDateオブジェクトに変換
      const restoredTrade: Trade = {
        ...trade,
        date: new Date(trade.date)
      };
      await db.addTrade(restoredTrade);
    }

    // インポート履歴がある場合は復元
    if (backupData.importHistory && Array.isArray(backupData.importHistory)) {
      for (const history of backupData.importHistory) {
        const restoredHistory: ImportHistory = {
          ...history,
          importDate: new Date(history.importDate)
        };
        await db.addImportHistory(restoredHistory);
      }
    }
  }

  /**
   * バックアップファイルの検証（復元前のプレビュー用）
   */
  static async validateBackupFile(file: File): Promise<{
    isValid: boolean;
    metadata?: BackupData['metadata'];
    exportDate?: string;
    error?: string;
  }> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      if (!backupData.version || !backupData.trades || !Array.isArray(backupData.trades)) {
        return { isValid: false, error: '無効なバックアップファイル形式です' };
      }

      return {
        isValid: true,
        metadata: backupData.metadata,
        exportDate: backupData.exportDate
      };
    } catch {
      return {
        isValid: false,
        error: 'ファイルの読み込みまたは解析に失敗しました'
      };
    }
  }
}