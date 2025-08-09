export function FAQSection() {
  return (
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
  );
}