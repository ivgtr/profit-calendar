import { useBackupRestore } from '../../../hooks/useBackupRestore';
import '../../../styles/BackupRestore.css';

export function BackupRestore() {
  const {
    activeTab,
    isLoading,
    message,
    restoreUrl,
    selectedFile,
    filePreview,
    setActiveTab,
    setRestoreUrl,
    handleExportBackup,
    handleFileSelect,
    handleRestoreFromFile,
    handleRestoreFromUrl,
    clearMessage,
  } = useBackupRestore();

  return (
    <div className="backup-restore">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
          disabled={isLoading}
        >
          📤 バックアップ
        </button>
        <button 
          className={`tab ${activeTab === 'restore' ? 'active' : ''}`}
          onClick={() => setActiveTab('restore')}
          disabled={isLoading}
        >
          📥 復元
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={clearMessage} className="message-close">×</button>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="tab-content">
          <h3>📤 データバックアップ</h3>
          <div className="backup-info">
            <p>取引データとインポート履歴をJSONファイルとしてダウンロードできます。</p>
            <ul>
              <li>全取引データ</li>
              <li>インポート履歴</li>
              <li>設定情報</li>
            </ul>
          </div>
          <div className="backup-actions">
            <button 
              className="export-button primary"
              onClick={handleExportBackup}
              disabled={isLoading}
            >
              {isLoading ? '作成中...' : 'バックアップファイルをダウンロード'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'restore' && (
        <div className="tab-content">
          <h3>📥 データ復元</h3>
          
          <div className="restore-section">
            <h4>ファイルから復元</h4>
            <div className="file-upload">
              <input
                type="file"
                id="backup-file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
              <label htmlFor="backup-file" className={`file-label ${isLoading ? 'disabled' : ''}`}>
                📁 バックアップファイルを選択
              </label>
            </div>

            {filePreview && (
              <div className="file-preview">
                <h5>📋 ファイル内容プレビュー</h5>
                <div className="preview-info">
                  <div className="preview-item">
                    <span className="label">取引件数:</span>
                    <span className="value">{filePreview.tradesCount}件</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">インポート履歴:</span>
                    <span className="value">{filePreview.importHistoryCount}件</span>
                  </div>
                  {filePreview.exportDate && (
                    <div className="preview-item">
                      <span className="label">作成日:</span>
                      <span className="value">{filePreview.exportDate.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="preview-item">
                    <span className="label">バージョン:</span>
                    <span className="value">{filePreview.version}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="restore-actions">
              <button 
                className="restore-button"
                onClick={handleRestoreFromFile}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? '復元中...' : 'ファイルから復元'}
              </button>
            </div>
          </div>

          <div className="restore-section">
            <h4>URLから復元</h4>
            <div className="url-input">
              <input
                type="url"
                placeholder="https://example.com/backup.json"
                value={restoreUrl}
                onChange={(e) => setRestoreUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="restore-actions">
              <button 
                className="restore-button"
                onClick={handleRestoreFromUrl}
                disabled={!restoreUrl.trim() || isLoading}
              >
                {isLoading ? '復元中...' : 'URLから復元'}
              </button>
            </div>
          </div>

          <div className="warning">
            ⚠️ <strong>注意:</strong> 復元を実行すると、現在のすべてのデータが削除されます。この操作は取り消せません。
          </div>
        </div>
      )}
    </div>
  );
}