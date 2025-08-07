# コードベース構造

## ルートディレクトリ構成
```
profit-calendar/
├── public/                    # 静的ファイル
├── src/                      # ソースコード
├── .github/                  # GitHub Actions設定
├── package.json              # プロジェクト設定・依存関係
├── vite.config.ts           # Vite設定
├── tsconfig.json            # TypeScript設定（参照型）
├── tsconfig.app.json        # アプリ用TypeScript設定
├── tsconfig.node.json       # Node.js用TypeScript設定
├── eslint.config.js         # ESLint設定
├── CLAUDE.md               # プロジェクトガイドライン
└── README.md               # プロジェクト説明
```

## src/ ディレクトリ構成
```
src/
├── main.tsx                 # アプリケーションエントリーポイント
├── App.tsx                  # メインコンポーネント
├── vite-env.d.ts           # Vite型定義
├── components/             # UIコンポーネント
│   ├── Calendar.tsx        # カレンダー表示
│   ├── Header.tsx          # ヘッダーナビゲーション
│   ├── TradeForm.tsx       # 取引フォーム
│   ├── CSVImporter.tsx     # CSV取込機能
│   ├── MonthlyReport.tsx   # 月次レポート
│   ├── MonthlyProfit.tsx   # 月次収益
│   ├── YearlyChart.tsx     # 年次チャート
│   ├── ThemeSettings.tsx   # テーマ設定
│   ├── BackupRestore.tsx   # バックアップ・復元
│   ├── ImportHistoryList.tsx # インポート履歴
│   ├── BulkDeleteTrades.tsx # 一括削除
│   ├── UserGuide.tsx       # ユーザーガイド
│   ├── Modal.tsx           # 汎用モーダル
│   ├── Tooltip.tsx         # ツールチップ
│   ├── TermsOfService.tsx  # 利用規約
│   ├── PrivacyPolicy.tsx   # プライバシーポリシー
│   ├── Disclaimer.tsx      # 免責事項
│   └── ChartExport/        # チャートエクスポート機能（DDD構成）
├── hooks/                  # カスタムHooks
│   └── useMonthlyTrades.ts # 月次取引データフック
├── services/               # サービス層
│   ├── database.ts         # IndexedDB操作
│   └── backup.ts          # バックアップサービス
├── types/                  # TypeScript型定義
│   ├── Trade.ts           # 取引関連型
│   ├── Theme.ts           # テーマ関連型
│   └── ImportHistory.ts   # インポート履歴型
├── contexts/               # React Context
│   └── ThemeContext.tsx   # テーマコンテキスト
├── constants/              # 定数
│   └── tooltips.ts        # ツールチップ定数
├── utils/                  # ユーティリティ
│   └── csvParser.ts       # CSV解析
├── styles/                 # スタイルシート
│   ├── index.css          # グローバルスタイル
│   ├── theme.css          # テーマシステム
│   ├── App.css            # アプリメインスタイル
│   └── [各コンポーネント].css # コンポーネント別スタイル
└── assets/                # 静的リソース
```

## 設計パターン
- **メインアプリケーション**: App.tsx - モノリシックな状態管理
- **コンポーネント分離**: 機能別にコンポーネントを分離
- **DDD採用部分**: ChartExport機能でDomain Driven Design適用
- **Hooks活用**: カスタムHooksでロジック再利用
- **Context API**: テーマ管理でグローバル状態管理
- **TypeScript厳格モード**: strict設定でタイプセーフティ確保