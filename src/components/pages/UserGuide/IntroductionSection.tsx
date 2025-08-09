export function IntroductionSection() {
  return (
    <section className="guide-section">
      <h3>🏁 はじめに</h3>
      <p>
        利益カレンダーは、デイトレーダー向けの取引記録・管理ツールです。
        日々の取引を記録し、カレンダー形式で収益を可視化できます。
      </p>
      <div className="feature-box">
        <h4>主な機能</h4>
        <ul>
          <li>📁 SBI証券などのCSVファイルの自動インポート</li>
          <li>✏️ 手動での取引入力・編集</li>
          <li>📊 月間・日別収益の可視化</li>
          <li>💾 ブラウザローカルでのデータ保存</li>
        </ul>
      </div>
    </section>
  );
}