# プロジェクト構造詳細

## ルートディレクトリ
```
profit-calendar/
├── dist/                  # ビルド出力ディレクトリ
├── 計画/                   # プロジェクト計画・ドキュメント
├── node_modules/          # npm依存関係
├── public/               # 静的公開ファイル
├── src/                  # ソースコード
├── .gitignore           # Git無視ファイル設定
├── CLAUDE.md            # Claude AI用プロジェクトガイド
├── CSS_DESIGN_SYSTEM.md # CSS設計システムドキュメント
├── README.md            # プロジェクト説明
├── eslint.config.js     # ESLint設定
├── index.html           # HTMLエントリーポイント
├── package.json         # npmパッケージ設定
├── package-lock.json    # npm依存関係ロックファイル
├── tsconfig.json        # TypeScript設定（メイン）
├── tsconfig.app.json    # TypeScript設定（アプリケーション）
├── tsconfig.node.json   # TypeScript設定（Node.js）
└── vite.config.ts       # Vite設定

## src/ディレクトリ構造
```
src/
├── main.tsx             # アプリケーションエントリーポイント
├── App.tsx              # ルートコンポーネント
├── vite-env.d.ts        # Vite環境型定義
├── assets/              # 静的リソース（画像、フォント等）
├── components/          # Reactコンポーネント
│   ├── ui/             # 汎用UIコンポーネント
│   │   ├── Modal/
│   │   ├── Toast/
│   │   └── ConfirmDialog/
│   └── MonthlyReport/   # 月次レポート関連
├── contexts/            # React Context定義
│   ├── UIContext       # UI状態管理
│   └── ThemeContext    # テーマ管理
├── constants/           # アプリケーション定数
├── hooks/              # カスタムReact Hooks
├── services/           # ビジネスロジック・サービス層
│   ├── database/       # IndexedDB関連
│   └── backup/         # バックアップ・復元機能
├── styles/             # グローバルCSS・スタイル
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
    ├── date/           # 日付関連
    ├── format/         # フォーマット関連
    └── csv/            # CSVパース関連

## 主要ファイルの役割

### エントリーポイント
- `main.tsx`: ReactDOM.createRootでアプリケーションをマウント
- `App.tsx`: ルーティング、グローバル状態、レイアウトを管理

### 設定ファイル
- `vite.config.ts`: Viteビルド設定、プラグイン設定
- `tsconfig.json`: TypeScriptコンパイラオプション
- `eslint.config.js`: コード品質ルール定義

### ドキュメント
- `CLAUDE.md`: AI開発支援用のプロジェクト仕様
- `CSS_DESIGN_SYSTEM.md`: スタイリングガイドライン
- `README.md`: プロジェクト概要とセットアップ手順

## データフロー
1. CSVファイル → encoding-japanese → パース処理
2. パースデータ → IndexedDB保存
3. IndexedDB → React State → UIレンダリング
4. ユーザー操作 → Context更新 → 再レンダリング