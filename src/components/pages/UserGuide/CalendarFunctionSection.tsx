export function CalendarFunctionSection() {
  return (
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
  );
}