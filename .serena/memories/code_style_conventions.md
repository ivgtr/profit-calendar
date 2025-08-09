# Profit Calendar - コードスタイル・規約（2025年8月最新版）

## TypeScript規約（厳格化強化）
- **型システム**: TypeScript 5.7厳格モード（noImplicitAny, strictNullChecks有効）
- **any型撲滅**: **絶対禁止** → `Record<string, unknown>`、ジェネリクス、具体的型使用
- **型定義**: 明示的な型注釈推奨、推論可能な場合は省略可
- **インターフェース**: 複雑なオブジェクト型は`interface`で定義
- **ユニオン型**: string literal型活用（例: `TradeType`, `ModalType`）
- **型ガード**: 実行時型チェック重視、型アサーション（`as`）最小化

## React規約（Modern Patterns）
- **関数コンポーネント**: アロー関数形式基本、`function`宣言も許可
- **Custom Hooks**: `use`プレフィックス必須、型安全な状態管理
- **Props型**: コンポーネント固有interface定義、ジェネリクス活用
- **状態管理**: Context API + Custom Hooks パターン
- **パフォーマンス**: `React.memo`, `useMemo`, `useCallback`積極活用
- **副作用**: useEffect依存配列厳密管理、cleanup関数必須

## 命名規則（一貫性強化）
### ファイル・ディレクトリ
- **コンポーネント**: PascalCase（例: `TradeForm.tsx`, `ModalManager.tsx`）
- **Custom Hooks**: camelCase + `use`（例: `useModalManager.ts`）
- **ユーティリティ**: camelCase（例: `formatUtils.ts`, `csvParser.ts`）
- **型定義**: PascalCase（例: `Trade.ts`, `Common.ts`）
- **CSS**: コンポーネント名.css（例: `TradeForm.css`）
- **ディレクトリ**: kebab-case（例: `data-management`, `monthly-report`）

### 変数・関数
- **変数**: camelCase（例: `selectedDate`, `monthlyTrades`）
- **関数**: camelCase + 動詞開始（例: `formatCurrency`, `calculateProfit`）
- **定数**: UPPER_SNAKE_CASE（例: `DEFAULT_THEME_MODE`）
- **コンポーネント**: PascalCase（例: `ModalManager`, `TradeForm`）
- **イベントハンドラ**: `handle + 動作`（例: `handleOpenModal`, `handleSaveTrade`）

## CSS設計システム（コンポーネントコロケーション適用）
### 設計原則（2025年強化版）
- **`!important`絶対禁止**: 詳細度による制御、設計の明確化
- **CSS変数必須**: デザイントークン100%活用
- **BEM記法推奨**: `.block__element--modifier` または シンプルクラス名
- **コンポーネントコロケーション**: CSSとTSXファイル同階層必須
- **レスポンシブ**: モバイルファースト（768px基準）

### ファイル配置原則
```
src/components/features/trade/
├── TradeForm.tsx         # コンポーネント
└── TradeForm.css         # 専用スタイル（同階層）

src/styles/               # グローバルのみ
├── App.css              # アプリ全体レイアウト
├── index.css            # リセット・基本スタイル
└── theme.css            # CSS変数定義
```

### CSS変数システム（デザイントークン）
```css
/* カラーシステム */
--bg-primary, --bg-secondary, --text-primary, --text-secondary
--accent-primary, --status-profit, --status-loss

/* スペーシングシステム */
--spacing-xs: 0.25rem (4px)    --spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)      --spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)      --spacing-2xl: 3rem (48px)

/* タイポグラフィ */
--font-size-xs: 0.75rem    --font-size-sm: 0.875rem
--font-size-base: 1rem     --font-size-lg: 1.125rem
--font-size-xl: 1.25rem    --font-size-2xl: 1.5rem

/* Z-Index管理 */
--z-base: 1, --z-dropdown: 40, --z-modal: 50, --z-tooltip: 70, --z-toast: 80
```

## ディレクトリ規約（機能別分離）
### アーキテクチャパターン
```
src/components/
├── ui/                   # 汎用UIコンポーネント
│   ├── base/            # Button, Icon, Input等
│   ├── layout/          # Header, Card, Section等
│   ├── feedback/        # Modal, Toast, Tooltip等
│   └── data-display/    # Table, Chart, Summary等
├── features/            # 機能固有コンポーネント
│   ├── trade/          # 取引関連
│   ├── analytics/      # 分析レポート関連
│   ├── calendar/       # カレンダー機能
│   ├── data-management/ # データ管理
│   └── settings/       # 設定機能
├── pages/              # ページコンポーネント
└── ModalManager.tsx    # 統合モーダル管理
```

## ESLint設定（2025年最新）
- **ベース**: @eslint/js 9.22 + typescript-eslint
- **React**: eslint-plugin-react-hooks, react-refresh
- **厳格レベル**: `recommended`設定 + カスタムルール
- **自動修正**: `--fix`でフォーマット統一
- **CI/CD**: プッシュ時自動チェック

## パフォーマンス・最適化規約
- **React.memo**: 重要コンポーネント（MonthlyReport, Calendar等）に適用
- **useMemo**: 計算コスト高い処理（統計計算、データ変換）
- **useCallback**: イベントハンドラ、依存関数の安定化
- **動的インポート**: Chart.js等大型ライブラリは必要時読み込み
- **バンドル最適化**: 不要import削除、tree-shaking活用

## アクセシビリティ・品質
- **セマンティックHTML**: 適切なHTMLタグ使用
- **ARIA属性**: モーダル、ボタン等に適切な属性設定
- **キーボードナビ**: Tab, Enter, Escキー対応
- **エラーハンドリング**: ユーザーフレンドリーなエラー表示
- **型安全性**: 実行時型チェック、バリデーション徹底

## Git・コミット規約（統一化）
### コミットメッセージ形式
```
type: subject

- feat: 新機能追加
- refactor: リファクタリング  
- fix: バグ修正
- improve: 改善・最適化
- docs: ドキュメント更新
```

### コミット例（実際のプロジェクト）
```
feat: ModalManagerコンポーネントを追加
refactor: CSSファイルをコンポーネントコロケーション方式に整理
improve: Common.ts型定義の改善（any型撲滅）
```

## 開発・保守のベストプラクティス
- **コンポーネント検索**: 機能名 → features/[機能名]/ → 対象ファイル
- **CSS編集**: TSXと同階層CSSファイル同時編集
- **モーダル追加**: ModalManager.tsx + useModalManager.ts 両方更新
- **型定義追加**: types/配下適切ファイル、export忘れ防止
- **import最適化**: 相対パス最短化（`./`, `../`）、絶対パス回避

## 2025年8月の重要変更点
1. **any型完全禁止**: 型安全性最優先
2. **コンポーネントコロケーション**: CSS/TSX同階層必須
3. **機能別分離**: features/, ui/, pages/明確分類
4. **ModalManager統合**: 個別モーダル管理廃止
5. **import最適化**: 相対パス簡潔化（91%短縮達成）