export function CSVImportSection() {
  return (
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
            <p>メニューから「CSVインポート」を選択するか、ヘッダーのメニューボタン（≡）から開きます。</p>
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
  );
}