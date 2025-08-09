export function ManualTradeInputSection() {
  return (
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
  );
}