import { useBackupRestore } from '../../../hooks/useBackupRestore';
import { Button } from '../../ui/base/Button';
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
          <Button
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
            disabled={isLoading}
            variant={activeTab === 'backup' ? 'primary' : 'secondary'}
            size="medium"
          >
            📤 バックアップ
          </Button>
          <Button
            className={`tab-button ${activeTab === 'restore' ? 'active' : ''}`}
            onClick={() => setActiveTab('restore')}
            disabled={isLoading}
            variant={activeTab === 'restore' ? 'primary' : 'secondary'}
            size="medium"
          >
            📥 復元
          </Button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <Button
            onClick={clearMessage}
            className="message-close"
            variant="ghost"
            size="small"
            icon="×"
            iconOnly
            aria-label="通知を閉じる"
          />
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
            <Button
              className="primary-button"
              onClick={handleExportBackup}
              disabled={isLoading}
              variant="primary"
              size="large"
              loading={isLoading}
            >
              バックアップファイルをダウンロード
            </Button>

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

            <Button
              className="primary-button"
              onClick={handleRestoreFromFile}
              disabled={!selectedFile || isLoading}
              variant="primary"
              size="large"
              loading={isLoading}
            >
              ファイルから復元
            </Button>

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
            <Button
              className="primary-button"
              onClick={handleRestoreFromUrl}
              disabled={!restoreUrl.trim() || isLoading}
              variant="primary"
              size="large"
              loading={isLoading}
            >
              URLから復元
            </Button>

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
