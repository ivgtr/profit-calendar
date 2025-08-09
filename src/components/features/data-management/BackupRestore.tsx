import { useBackupRestore } from '../../../hooks/useBackupRestore';
import './BackupRestore.css';

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
    <div className="backup-restore-container">
      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
            disabled={isLoading}
          >
            📤 バックアップ
          </button>
          <button 
            className={`tab-button ${activeTab === 'restore' ? 'active' : ''}`}
            onClick={() => setActiveTab('restore')}
            disabled={isLoading}
          >
            📥 復元
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={clearMessage} className="message-close">×</button>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="tab-content">
          <div className="backup-section">
            <h3>📤 データバックアップ</h3>
            <div className="backup-info">
            <p>取引データとインポート履歴をJSONファイルとしてダウンロードできます。</p>
            <ul>
              <li>全取引データ</li>
              <li>インポート履歴</li>
              <li>設定情報</li>
            </ul>
          </div>
            <button 
              className="primary-button"
              onClick={handleExportBackup}
              disabled={isLoading}
            >
              {isLoading ? '作成中...' : 'バックアップファイルをダウンロード'}
            </button>

            <div className="security-warning">
              <h4>⚠️ 重要なセキュリティ警告</h4>
              <ul>
                <li><strong>バックアップファイルには機密情報が含まれています：</strong>銘柄名、取引日、取引金額、损益などの個人的な投資データがすべて含まれます</li>
                <li><strong>ファイルの公開は絶対に避けてください：</strong>GitHub、Google Drive、Dropboxなどのパブリックリンクで共有しないでください</li>
                <li><strong>安全な保存場所に保管してください：</strong>ローカルの暗号化されたフォルダやプライベートなクラウドストレージを使用してください</li>
                <li><strong>不要になったファイルは削除してください：</strong>復元後は速やかにバックアップファイルを削除することを推奨します</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'restore' && (
        <div className="tab-content">
          <div className="restore-section">
            <h3>📥 データ復元</h3>
            
            <h4>ファイルから復元</h4>
            <div className="file-input-container">
              <input
                type="file"
                id="backup-file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="file-input"
              />
              <label htmlFor="backup-file" className={`file-input-label ${isLoading ? 'disabled' : ''}`}>
                📁 バックアップファイルを選択
              </label>
            </div>

            {filePreview && (
              <div className="file-preview">
                <h4>📋 ファイル内容プレビュー</h4>
                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="preview-label">取引件数:</span>
                    <span>{filePreview.tradesCount}件</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">インポート履歴:</span>
                    <span>{filePreview.importHistoryCount}件</span>
                  </div>
                  {filePreview.exportDate && (
                    <div className="preview-item">
                      <span className="preview-label">作成日:</span>
                      <span>{filePreview.exportDate.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="preview-item">
                    <span className="preview-label">バージョン:</span>
                    <span>{filePreview.version}</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              className="primary-button"
              onClick={handleRestoreFromFile}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? '復元中...' : 'ファイルから復元'}
            </button>

            <h4>URLから復元</h4>
            <div className="url-input-container">
              <input
                type="url"
                placeholder="https://example.com/backup.json"
                value={restoreUrl}
                onChange={(e) => setRestoreUrl(e.target.value)}
                disabled={isLoading}
                className="url-input"
              />
            </div>
            <button 
              className="primary-button"
              onClick={handleRestoreFromUrl}
              disabled={!restoreUrl.trim() || isLoading}
            >
              {isLoading ? '復元中...' : 'URLから復元'}
            </button>

            <div className="privacy-warning">
              <h4>🚨 プライバシーに関する重要な注意</h4>
              <p><strong>この機能は細心の注意を払って使用してください：</strong></p>
              <ul>
                <li><strong>公開URLの使用は推奨されません：</strong>バックアップファイルには個人の投資データが含まれているため、インターネット上に公開すると第三者に閲覧される危険があります</li>
                <li><strong>安全な方法：</strong>プライベートなクラウドストレージ（認証が必要）のURLを使用するか、ファイル復元機能を使用してください</li>
                <li><strong>主な用途：</strong>この機能は主に開発者のテストや緊急時の復元用です</li>
              </ul>
            </div>

            <div className="security-warning">
              <h4>⚠️ 注意</h4>
              <p><strong>復元を実行すると、現在のすべてのデータが削除されます。この操作は取り消せません。</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}