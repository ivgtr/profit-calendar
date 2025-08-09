export function DataManagementSection() {
  return (
    <section className="guide-section">
      <h3>🗂️ データ管理</h3>
      
      <div className="info-box warning">
        <h4>⚠️ 重要な注意事項</h4>
        <ul>
          <li>データはブラウザのローカルストレージに保存されます</li>
          <li>ブラウザのデータを削除すると、すべての取引データが失われます</li>
          <li>定期的なデータのバックアップを推奨します</li>
          <li>サーバーにはデータは送信されません（プライバシー保護）</li>
        </ul>
      </div>
      
      <div className="feature-item">
        <h4>🗑️ 一括削除機能</h4>
        <p>メニューの「取引の一括削除」から、全期間または指定した期間の取引を一括で削除できます。</p>
      </div>
    </section>
  );
}