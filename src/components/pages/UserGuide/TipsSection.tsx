export function TipsSection() {
  return (
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
  );
}