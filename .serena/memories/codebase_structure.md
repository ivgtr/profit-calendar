# Profit Calendar - コードベース構造（最新版）

## プロジェクトルート
```
profit-calendar/
├── src/                    # ソースコード
├── public/                 # 静的ファイル
├── .github/                # GitHub Actions
├── package.json            # 依存関係・スクリプト
├── tsconfig.json           # TypeScript設定（参照用）
├── tsconfig.app.json       # アプリ用TypeScript設定
├── tsconfig.node.json      # Node.js用TypeScript設定
├── eslint.config.js        # ESLint設定
├── vite.config.ts          # Vite設定
├── CLAUDE.md               # AI開発ガイド
├── CSS_DESIGN_SYSTEM.md    # CSS設計システム
└── README.md               # プロジェクト説明
```

## src/ ディレクトリ構造（機能別分類）
```
src/
├── main.tsx                # アプリケーションエントリーポイント
├── App.tsx                 # メインアプリコンポーネント（ModalManager使用）
├── vite-env.d.ts          # Vite環境型定義
│
├── components/             # UIコンポーネント（機能別分類）
│   ├── ModalManager.tsx   # 統合モーダル管理コンポーネント
│   ├── index.ts           # コンポーネントexport
│   │
│   ├── ui/                # 汎用UIコンポーネント（コンポーネントコロケーション）
│   │   ├── base/          # 基本UIコンポーネント
│   │   │   ├── Button.tsx + Button.css
│   │   │   ├── Icon.tsx + Icon.css
│   │   │   ├── Input.tsx + Input.css
│   │   │   └── Select.tsx + Select.css
│   │   ├── layout/        # レイアウトコンポーネント
│   │   │   ├── Header.tsx + Header.css
│   │   │   ├── Card.tsx + Card.css
│   │   │   └── Section.tsx + Section.css
│   │   ├── feedback/      # フィードバック系
│   │   │   ├── Modal.tsx + Modal.css
│   │   │   ├── Toast.tsx + Toast.css
│   │   │   ├── ConfirmDialog.tsx + ConfirmDialog.css
│   │   │   └── Tooltip.tsx + Tooltip.css
│   │   ├── data-display/  # データ表示系
│   │   │   ├── Table.tsx + Table.css
│   │   │   ├── Chart.tsx + Chart.css
│   │   │   └── Summary.tsx + Summary.css
│   │   └── index.ts       # UI export
│   │
│   ├── features/          # 機能固有コンポーネント
│   │   ├── calendar/      # カレンダー機能
│   │   │   └── Calendar.tsx + Calendar.css
│   │   ├── trade/         # 取引機能
│   │   │   ├── TradeForm.tsx + TradeForm.css
│   │   │   ├── TradeListModal.tsx + TradeListModal.css
│   │   │   ├── DailyTrades/  # 日次取引表示
│   │   │   │   ├── DailyTradesSection.tsx
│   │   │   │   ├── DailyTradesTable.tsx
│   │   │   │   ├── DailyTradesHeader.tsx
│   │   │   │   └── DailyProfitSummary.tsx
│   │   │   └── TradeBreakdown/  # 損益breakdown表示
│   │   │       ├── TradeBreakdown.tsx
│   │   │       ├── BreakdownItem.tsx
│   │   │       └── ProfitSummaryHeader.tsx
│   │   ├── analytics/     # 分析・レポート機能
│   │   │   ├── MonthlyProfit.tsx + MonthlyProfit.css
│   │   │   ├── YearlyChart.tsx + YearlyChart.css
│   │   │   ├── StockTop3.tsx + StockTop3.css
│   │   │   ├── MonthlyReport.tsx + MonthlyReport.css
│   │   │   └── MonthlyReport/  # 月次レポート詳細
│   │   │       ├── BasicMetricsSection.tsx
│   │   │       ├── TrendAnalysisSection.tsx
│   │   │       ├── RiskAnalysisSection.tsx
│   │   │       └── StockAnalysisSection.tsx
│   │   ├── data-management/  # データ管理機能
│   │   │   ├── CSVImporter.tsx + CSVImporter.css
│   │   │   ├── ImportHistoryList.tsx + ImportHistoryList.css
│   │   │   ├── BackupRestore.tsx + BackupRestore.css
│   │   │   └── BulkDeleteTrades.tsx + BulkDeleteTrades.css
│   │   ├── settings/      # 設定機能
│   │   │   └── ThemeSettings.tsx + ThemeSettings.css
│   │   └── index.ts       # features export
│   │
│   └── pages/             # ページコンポーネント
│       ├── UserGuide.tsx + UserGuide.css
│       ├── PrivacyPolicy.tsx + LegalPages.css（共用）
│       ├── TermsOfService.tsx + LegalPages.css（共用）
│       ├── Disclaimer.tsx + LegalPages.css（共用）
│       └── UserGuide/     # ガイド詳細セクション
│           ├── IntroductionSection.tsx
│           ├── CSVImportSection.tsx
│           ├── ManualTradeInputSection.tsx
│           ├── CalendarFunctionSection.tsx
│           ├── DataManagementSection.tsx
│           ├── TipsSection.tsx
│           └── FAQSection.tsx
│
├── contexts/               # React Context
│   ├── UIContext.tsx      # UI状態管理（Toast, ConfirmDialog, Alert）
│   └── ThemeContext.tsx   # テーマ管理
│
├── hooks/                  # カスタムHooks
│   ├── useTradeHandlers.ts # 取引操作イベントハンドラー
│   ├── useMonthlyTrades.ts # 月間取引データ取得
│   ├── useCSVImporter.ts   # CSVインポート機能
│   ├── useTradeCRUD.ts     # 取引CRUD操作
│   ├── useTheme.ts         # テーマ切り替え
│   ├── useModalManager.ts  # モーダル管理（統一）
│   ├── useTradeListModal.ts # 取引一覧モーダル
│   ├── useMonthlyStats.ts  # 月次統計計算
│   ├── useProfitBreakdown.ts # 損益breakdown
│   ├── useTradeForm.ts     # 取引フォーム状態管理
│   └── useBackupRestore.ts # バックアップ・復元
│
├── services/               # データ・サービス層
│   ├── database.ts         # IndexedDB操作（Trade CRUD）
│   └── backup.ts           # バックアップ機能
│
├── utils/                  # ユーティリティ関数
│   ├── csvParser.ts        # CSV解析（SBI証券対応）
│   ├── formatUtils.ts      # フォーマット関数（通貨、日付等）
│   ├── statisticsUtils.ts  # 統計計算
│   ├── tradeCalculations.ts # 取引計算（損益、勝率等）
│   └── stockUtils.ts       # 株式関連ユーティリティ
│
├── types/                  # TypeScript型定義
│   ├── Trade.ts            # 取引関連型（中核）
│   ├── Theme.ts            # テーマ関連型
│   ├── Common.ts           # 共通型（DatabaseProps等）
│   ├── ImportHistory.ts    # インポート履歴型
│   └── HeaderActions.ts    # ヘッダー操作型
│
├── constants/              # 定数
│   ├── theme.ts            # テーマ定数
│   └── tooltips.ts         # ツールチップ定数
│
├── styles/                 # グローバルCSSのみ（コンポーネントコロケーション完全適用）
│   ├── index.css           # グローバルスタイル・リセット
│   ├── App.css             # アプリベーススタイル
│   └── theme.css           # CSS変数・テーマ定義
│
└── assets/                 # 静的リソース
```

## 重要なアーキテクチャ変更点

### 1. コンポーネント分離（2025年8月）
- **旧**: src/components/ 直下に全コンポーネント配置
- **新**: 機能別ディレクトリに分類
  - `ui/`: 汎用UIコンポーネント（Button, Modal等）
  - `features/`: 機能固有（trade, analytics, calendar等）  
  - `pages/`: ページ・法的文書等

### 2. ModalManager統合（2025年8月）
- **src/components/ModalManager.tsx**: 全モーダルの一元管理
- **App.tsx**: 個別モーダル管理ロジック削除（132行削除）
- **統合対象**: CSVImporter, TradeForm, MonthlyReport, YearlyChart等

### 3. CSSコンポーネントコロケーション（2025年8月）
- **原則**: 各コンポーネントのCSSファイルを同階層配置
- **移動数**: 16ファイル（styles/ → components/各配下）
- **効果**: import文簡潔化（`../../../styles/` → `./`）、メンテナンス効率向上

### 4. 型安全性向上（2025年8月）
- **any型撲滅**: Common.ts、Table.tsx等でRecord<string, unknown>等に置換
- **Database型**: 具体的なTrade型を使用した型定義

## 主要ファイル詳細説明
- **main.tsx**: React DOM レンダリング、アプリ初期化
- **App.tsx**: ルートコンポーネント、ModalManager使用、UI/Theme Context統合
- **ModalManager.tsx**: 全モーダル統一管理（12+ モーダル）
- **database.ts**: IndexedDB操作の抽象化、Trade CRUD
- **csvParser.ts**: SBI証券CSV解析ロジック（Shift-JIS対応）
- **Trade.ts**: 取引データの型定義（アプリケーションの中核型）
- **useModalManager.ts**: モーダル状態管理（型安全）

## 開発・保守のベストプラクティス
- **コンポーネント検索**: 機能名でディレクトリ特定 → 対象ファイル
- **CSS編集**: TSXと同階層のCSSファイルを同時編集
- **モーダル追加**: ModalManager.tsx + useModalManager.ts更新
- **型定義**: any型使用禁止、具体的型または適切なジェネリクス使用