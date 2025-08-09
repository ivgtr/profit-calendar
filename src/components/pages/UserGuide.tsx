import './UserGuide.css';
import {
  IntroductionSection,
  CSVImportSection,
  ManualTradeInputSection,
  CalendarFunctionSection,
  DataManagementSection,
  TipsSection,
  FAQSection
} from './UserGuide/index';

export function UserGuide() {
  return (
    <div className="user-guide">
      <h2>使い方ガイド</h2>
      
      <IntroductionSection />
      <CSVImportSection />
      <ManualTradeInputSection />
      <CalendarFunctionSection />
      <DataManagementSection />
      <TipsSection />
      <FAQSection />

      <div className="guide-footer">
        <p>その他ご不明な点がございましたら、各種法的文書もご確認ください。</p>
        <p className="last-updated">最終更新日: 2025年7月29日</p>
      </div>
    </div>
  );
}