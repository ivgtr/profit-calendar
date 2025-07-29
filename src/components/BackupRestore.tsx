import { useState } from 'react';
import { BackupService } from '../services/backup';
import '../styles/BackupRestore.css';

interface BackupRestoreProps {
  onDataRestored: () => void;
}

type TabType = 'backup' | 'restore-file' | 'restore-url';

export function BackupRestore({ onDataRestored }: BackupRestoreProps) {
  const [activeTab, setActiveTab] = useState<TabType>('backup');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [restoreUrl, setRestoreUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<any>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExportBackup = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await BackupService.exportBackup();
      showMessage('success', 'バックアップファイルがダウンロードされました');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'バックアップの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const validation = await BackupService.validateBackupFile(file);
      if (validation.isValid) {
        setFilePreview({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          exportDate: validation.exportDate ? new Date(validation.exportDate).toLocaleString('ja-JP') : '不明',
          totalTrades: validation.metadata?.totalTrades || 0,
          dateRange: validation.metadata?.dateRange
        });
        setMessage(null);
      } else {
        setFilePreview(null);
        showMessage('error', validation.error || 'ファイルの検証に失敗しました');
      }
    } catch (error) {
      setFilePreview(null);
      showMessage('error', 'ファイルの検証中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromFile = async () => {
    if (!selectedFile) {
      showMessage('error', 'ファイルを選択してください');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await BackupService.importFromFile(selectedFile);
      showMessage('success', 'データの復元が完了しました');
      onDataRestored();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'データの復元に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromUrl = async () => {
    if (!restoreUrl.trim()) {
      showMessage('error', 'URLを入力してください');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await BackupService.importFromUrl(restoreUrl.trim());
      showMessage('success', 'データの復元が完了しました');
      onDataRestored();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'データの復元に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backup-restore-container">
      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            💾 バックアップ
          </button>
          <button
            className={`tab-button ${activeTab === 'restore-file' ? 'active' : ''}`}
            onClick={() => setActiveTab('restore-file')}
          >
            📁 ファイル復元
          </button>
          <button
            className={`tab-button ${activeTab === 'restore-url' ? 'active' : ''}`}
            onClick={() => setActiveTab('restore-url')}
          >
            🌐 URL復元
          </button>
        </div>

        <div className="tab-content">
              {activeTab === 'backup' && (
                <div className="backup-section">
                  <h3>データバックアップ</h3>
                  <p>
                    現在のすべての取引データとインポート履歴をJSONファイルとしてエクスポートします。
                    このファイルを使用して、後で同じデータを復元することができます。
                  </p>

                  {/* セキュリティ警告 */}
                  <div className="security-warning">
                    <h4>⚠️ 重要なセキュリティ警告</h4>
                    <ul>
                      <li><strong>バックアップファイルには機密情報が含まれています：</strong>銘柄名、取引日、取引金額、損益などの個人的な投資データがすべて含まれます</li>
                      <li><strong>ファイルの公開は絶対に避けてください：</strong>GitHub、Google Drive、Dropboxなどのパブリックリンクで共有しないでください</li>
                      <li><strong>安全な保存場所に保管してください：</strong>ローカルの暗号化されたフォルダやプライベートなクラウドストレージを使用してください</li>
                      <li><strong>不要になったファイルは削除してください：</strong>復元後は速やかにバックアップファイルを削除することを推奨します</li>
                    </ul>
                  </div>

                  <div className="backup-info">
                    <div className="info-item">
                      <span className="info-label">出力形式:</span>
                      <span>JSON (.json)</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">含まれるデータ:</span>
                      <span>全取引データ、インポート履歴、メタデータ</span>
                    </div>
                  </div>
                  <button
                    className="primary-button"
                    onClick={handleExportBackup}
                    disabled={isLoading}
                  >
                    {isLoading ? '作成中...' : '📦 バックアップを作成'}
                  </button>
                </div>
              )}

              {activeTab === 'restore-file' && (
                <div className="restore-section">
                  <h3>ファイルから復元</h3>
                  <p>
                    以前にエクスポートしたバックアップファイルを選択して、データを復元します。
                    <strong className="warning-text">※既存のデータは全て削除されます</strong>
                  </p>
                  
                  <div className="file-input-container">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="file-input"
                      id="backup-file-input"
                    />
                    <label htmlFor="backup-file-input" className="file-input-label">
                      📁 ファイルを選択
                    </label>
                  </div>

                  {filePreview && (
                    <div className="file-preview">
                      <h4>📋 ファイル情報</h4>
                      <div className="preview-grid">
                        <div className="preview-item">
                          <span className="preview-label">ファイル名:</span>
                          <span>{filePreview.fileName}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">ファイルサイズ:</span>
                          <span>{filePreview.fileSize}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">エクスポート日時:</span>
                          <span>{filePreview.exportDate}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">取引データ件数:</span>
                          <span>{filePreview.totalTrades}件</span>
                        </div>
                        {filePreview.dateRange && (
                          <div className="preview-item">
                            <span className="preview-label">データ期間:</span>
                            <span>
                              {new Date(filePreview.dateRange.start).toLocaleDateString('ja-JP')} 〜 
                              {new Date(filePreview.dateRange.end).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    className="primary-button"
                    onClick={handleRestoreFromFile}
                    disabled={isLoading || !selectedFile}
                  >
                    {isLoading ? '復元中...' : '🔄 データを復元'}
                  </button>
                </div>
              )}

              {activeTab === 'restore-url' && (
                <div className="restore-section">
                  <h3>URLから復元</h3>
                  <p>
                    バックアップファイルのURLを指定して、データを復元します。
                    <strong className="warning-text">※既存のデータは全て削除されます</strong>
                  </p>

                  {/* プライバシー警告 */}
                  <div className="privacy-warning">
                    <h4>🚨 プライバシーに関する重要な注意</h4>
                    <p><strong>この機能は細心の注意を払って使用してください：</strong></p>
                    <ul>
                      <li><strong>公開URLの使用は推奨されません：</strong>バックアップファイルには個人の投資データが含まれているため、インターネット上に公開すると第三者に閲覧される危険があります</li>
                      <li><strong>安全な方法：</strong>プライベートなクラウドストレージ（認証が必要）のURLを使用するか、ファイル復元機能を使用してください</li>
                      <li><strong>テスト目的でのみ使用：</strong>この機能は主に開発者のテストや緊急時の復元用です</li>
                    </ul>
                  </div>
                  
                  <div className="url-input-container">
                    <input
                      type="url"
                      placeholder="https://example.com/backup.json"
                      value={restoreUrl}
                      onChange={(e) => setRestoreUrl(e.target.value)}
                      className="url-input"
                    />
                  </div>

                  <div className="url-info">
                    <h4>💡 技術的な使用例（上級者向け）</h4>
                    <ul>
                      <li>プライベートなGitHub Gist のRaw URL（認証トークン付き）</li>
                      <li>認証が必要なクラウドストレージAPI</li>
                      <li>ローカルネットワーク内のプライベートサーバー</li>
                    </ul>
                    <p className="note">
                      ※URLは直接JSONファイルにアクセスできる必要があります（CORS対応必須）
                    </p>
                  </div>

                  <button
                    className="primary-button"
                    onClick={handleRestoreFromUrl}
                    disabled={isLoading || !restoreUrl.trim()}
                  >
                    {isLoading ? '復元中...' : '🌐 URLから復元'}
                  </button>
                </div>
              )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}
    </div>
  );
}