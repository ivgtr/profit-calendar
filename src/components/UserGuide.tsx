import '../styles/UserGuide.css';

export function UserGuide() {
  return (
    <div className="user-guide">
      <h2>使い方ガイド</h2>
      
      <section className="guide-section">
        <h3>🏁 はじめに</h3>
        <p>
          利益カレンダーは、デイトレーダー向けの取引記録・管理ツールです。
          日々の取引を記録し、カレンダー形式で収益を可視化できます。
        </p>
        <div className="feature-box">
          <h4>主な機能</h4>
          <ul>
            <li>📁 SBI証券CSVファイルの自動インポート</li>
            <li>✏️ 手動での取引入力・編集</li>
            <li>📊 月間・日別収益の可視化</li>
            <li>💾 ブラウザローカルでのデータ保存</li>
          </ul>
        </div>
      </section>

      <section className="guide-section">
        <h3>📁 CSVインポート機能</h3>
        
        <div className="step-guide">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>SBI証券からCSVをダウンロード</h4>
              <p>SBI証券の「取引履歴」→「国内株式」から取引履歴CSVファイルをダウンロードします。</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>CSVインポートを開く</h4>
              <p>メニューから「CSVインポート」を選択するか、ヘッダーのメニューボタン（☰）から開きます。</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>ファイルをドラッグ&ドロップ</h4>
              <p>ダウンロードしたCSVファイルを指定エリアにドラッグ&ドロップするか、「ファイルを選択」ボタンでアップロードします。</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>プレビューで確認</h4>
              <p>インポート内容をプレビューで確認し、問題なければ「インポート実行」をクリックします。</p>
            </div>
          </div>
        </div>
        
        <div className="info-box">
          <h4>📝 インポート履歴の管理</h4>
          <p>
            インポートしたCSVは履歴として保存されます。
            「インポート履歴」から過去のインポートを確認・削除できます。
            インポートを削除すると、関連する取引データもすべて削除されます。
          </p>
        </div>
      </section>

      <section className="guide-section">
        <h3>✏️ 手動での取引入力</h3>
        
        <div className="step-guide">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>新規取引入力</h4>
              <p>メニューから「新規取引入力」を選択するか、カレンダーで日付を選択後「取引を追加」ボタンをクリックします。</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>取引情報を入力</h4>
              <p>取引日、口座種別（NISA/特定/一般）、銘柄名、取引種別、数量、金額などを入力します。</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>保存・編集・削除</h4>
              <p>「保存」で取引を記録。既存の取引は✏️ボタンで編集、🗑️ボタンで削除できます。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <h3>📊 カレンダー機能</h3>
        
        <div className="feature-list">
          <div className="feature-item">
            <h4>📅 月間表示</h4>
            <p>各日の損益が色分けで表示されます（緑：利益、赤：損失、グレー：取引なし）。</p>
          </div>
          
          <div className="feature-item">
            <h4>🎯 日別詳細</h4>
            <p>日付をクリックすると、その日の取引一覧と損益内訳が表示されます。</p>
          </div>
          
          <div className="feature-item">
            <h4>📈 月間収益</h4>
            <p>画面上部で月間の総収益と現物・信用取引の内訳を確認できます。</p>
          </div>
        </div>
      </section>

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

      <section className="guide-section">
        <h3>💡 利用のコツ</h3>
        
        <div className="tips-grid">
          <div className="tip-card">
            <h4>📊 効果的な分析</h4>
            <p>月間収益の内訳で現物・信用取引の成績を分析し、取引戦略の改善に活用しましょう。</p>
          </div>
          
          <div className="tip-card">
            <h4>📝 メモ機能</h4>
            <p>取引入力時にメモ欄を活用して、取引の根拠や反省点を記録しておきましょう。</p>
          </div>
          
          <div className="tip-card">
            <h4>🔄 定期的な整理</h4>
            <p>不要になった古いインポート履歴は定期的に削除して、データを整理しましょう。</p>
          </div>
          
          <div className="tip-card">
            <h4>📱 モバイル対応</h4>
            <p>スマートフォンからもアクセス可能です。外出先での取引記録にも便利です。</p>
          </div>
        </div>
      </section>

      <section className="guide-section">
        <h3>❓ よくある質問</h3>
        
        <div className="faq-list">
          <div className="faq-item">
            <h4>Q: SBI証券以外の証券会社のCSVも使えますか？</h4>
            <p>A: 現在はSBI証券のCSV形式のみに対応しています。他社対応は今後の検討課題です。</p>
          </div>
          
          <div className="faq-item">
            <h4>Q: データが消えてしまいました</h4>
            <p>A: ブラウザのキャッシュクリアやプライベートモードが原因の可能性があります。定期的なバックアップを推奨します。</p>
          </div>
          
          <div className="faq-item">
            <h4>Q: 損益計算が証券会社の記録と違います</h4>
            <p>A: 本アプリは簡易計算のため、正確な損益は証券会社の記録で確認してください。</p>
          </div>
          
          <div className="faq-item">
            <h4>Q: 複数のブラウザで同じデータを見られますか？</h4>
            <p>A: データはブラウザ固有のため、他のブラウザでは見られません。同期機能は現在ありません。</p>
          </div>
        </div>
      </section>

      <div className="guide-footer">
        <p>その他ご不明な点がございましたら、各種法的文書もご確認ください。</p>
        <p className="last-updated">最終更新日: 2025年7月29日</p>
      </div>
    </div>
  );
}