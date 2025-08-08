# Profit Calendar - コードベース構造

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

## src/ ディレクトリ構造
```
src/
├── main.tsx                # アプリケーションエントリーポイント
├── App.tsx                 # メインアプリコンポーネント
├── vite-env.d.ts          # Vite環境型定義
│
├── components/             # UIコンポーネント
│   ├── ui/                # 汎用UIコンポーネント
│   │   ├── Modal.tsx      # モーダルコンポーネント
│   │   ├── Toast.tsx      # トーストメッセージ
│   │   └── ConfirmDialog.tsx # 確認ダイアログ
│   ├── MonthlyReport/     # 月次レポート関連
│   │   ├── BasicMetricsSection.tsx
│   │   ├── TrendAnalysisSection.tsx
│   │   ├── RiskAnalysisSection.tsx
│   │   └── StockAnalysisSection.tsx
│   ├── Calendar.tsx       # カレンダー表示
│   ├── Header.tsx         # ヘッダーナビゲーション
│   ├── CSVImporter.tsx    # CSVインポート機能
│   ├── TradeForm.tsx      # 取引入力フォーム
│   ├── MonthlyProfit.tsx  # 月間収益表示
│   ├── YearlyChart.tsx    # 年間チャート
│   ├── ThemeSettings.tsx  # テーマ設定
│   ├── BackupRestore.tsx  # データ管理
│   └── [その他コンポーネント]
│
├── contexts/               # React Context
│   ├── UIContext.tsx      # UI状態管理
│   └── ThemeContext.tsx   # テーマ管理
│
├── hooks/                  # カスタムHooks
│   ├── useTradeHandlers.ts # 取引操作
│   ├── useMonthlyTrades.ts # 月間取引データ
│   ├── useCSVImporter.ts   # CSVインポート
│   ├── useTradeCRUD.ts     # 取引CRUD操作
│   ├── useTheme.ts         # テーマ切り替え
│   ├── useModalManager.ts  # モーダル管理
│   └── [その他Hooks]
│
├── services/               # データ・サービス層
│   ├── database.ts         # IndexedDB操作
│   └── backup.ts           # バックアップ機能
│
├── utils/                  # ユーティリティ関数
│   ├── csvParser.ts        # CSV解析
│   ├── formatUtils.ts      # フォーマット関数
│   ├── statisticsUtils.ts  # 統計計算
│   ├── tradeCalculations.ts # 取引計算
│   └── stockUtils.ts       # 株式関連ユーティリティ
│
├── types/                  # TypeScript型定義
│   ├── Trade.ts            # 取引関連型
│   ├── Theme.ts            # テーマ関連型
│   ├── Common.ts           # 共通型
│   ├── ImportHistory.ts    # インポート履歴型
│   └── HeaderActions.ts    # ヘッダー操作型
│
├── constants/              # 定数
│   ├── theme.ts            # テーマ定数
│   └── tooltips.ts         # ツールチップ定数
│
├── styles/                 # CSSファイル
│   ├── index.css           # グローバルスタイル
│   ├── App.css             # アプリベーススタイル
│   ├── theme.css           # テーマ変数
│   └── [各コンポーネント].css
│
└── assets/                 # 静的リソース
```

## 主要ファイル説明
- **main.tsx**: React DOM レンダリング、アプリ初期化
- **App.tsx**: ルートコンポーネント、UIContext・ThemeContext統合
- **database.ts**: IndexedDB操作の抽象化
- **csvParser.ts**: SBI証券CSV解析ロジック
- **Trade.ts**: 取引データの型定義（中核型）