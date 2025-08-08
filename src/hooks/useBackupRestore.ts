import { useState, useCallback } from 'react';
import { BackupService } from '../services/backup';

export type TabType = 'backup' | 'restore';
export type MessageType = { type: 'success' | 'error'; text: string };

export function useBackupRestore() {
  const [activeTab, setActiveTab] = useState<TabType>('backup');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [restoreUrl, setRestoreUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    tradesCount: number;
    importHistoryCount: number;
    exportDate: Date | null;
    version: string;
  } | null>(null);
  
  // BackupServiceは静的メソッドベース

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    // 5秒後に自動でメッセージを消す
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const handleExportBackup = useCallback(async () => {
    setIsLoading(true);
    clearMessage();
    
    try {
      await BackupService.exportBackup();
      showMessage('success', 'バックアップファイルのダウンロードを開始しました');
    } catch (error) {
      console.error('Backup export failed:', error);
      showMessage('error', 'バックアップの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [clearMessage, showMessage]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    clearMessage();
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // データの検証
      const validation = await BackupService.validateBackupFile(data);
      if (!validation.isValid) {
        showMessage('error', `無効なバックアップファイル: ${validation.error}`);
        setFilePreview(null);
        return;
      }
      
      setFilePreview({
        tradesCount: data.trades?.length || 0,
        importHistoryCount: data.importHistory?.length || 0,
        exportDate: data.metadata?.exportDate ? new Date(data.metadata.exportDate) : null,
        version: data.metadata?.version || 'unknown',
      });
      
    } catch (error) {
      console.error('File preview failed:', error);
      showMessage('error', 'ファイルの読み込みに失敗しました');
      setFilePreview(null);
    }
  }, [clearMessage, showMessage]);

  const handleRestoreFromFile = useCallback(async () => {
    if (!selectedFile) {
      showMessage('error', 'ファイルが選択されていません');
      return;
    }

    const confirmed = confirm('現在のデータはすべて削除され、バックアップファイルのデータで置き換えられます。この操作は取り消せません。続行しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    clearMessage();
    
    try {
      await BackupService.importFromFile(selectedFile);
      
      showMessage('success', 'バックアップからの復元が完了しました');
      setSelectedFile(null);
      setFilePreview(null);
      
      // ファイル入力をリセット
      const fileInput = document.getElementById('backup-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Restore failed:', error);
      showMessage('error', 'データの復元に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, clearMessage, showMessage]);

  const handleRestoreFromUrl = useCallback(async () => {
    if (!restoreUrl.trim()) {
      showMessage('error', 'URLを入力してください');
      return;
    }

    const confirmed = confirm('現在のデータはすべて削除され、指定されたURLのデータで置き換えられます。この操作は取り消せません。続行しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    clearMessage();
    
    try {
      await BackupService.importFromUrl(restoreUrl);
      
      showMessage('success', 'URLからの復元が完了しました');
      setRestoreUrl('');
      
    } catch (error) {
      console.error('URL restore failed:', error);
      showMessage('error', error instanceof Error ? error.message : 'URLからの復元に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [restoreUrl, clearMessage, showMessage]);

  return {
    // State
    activeTab,
    isLoading,
    message,
    restoreUrl,
    selectedFile,
    filePreview,
    
    // Actions
    setActiveTab,
    setRestoreUrl,
    handleExportBackup,
    handleFileSelect,
    handleRestoreFromFile,
    handleRestoreFromUrl,
    clearMessage,
  };
}