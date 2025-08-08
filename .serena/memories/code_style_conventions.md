# Profit Calendar - コードスタイル・規約

## TypeScript規約
- **型システム**: TypeScript 5.7の厳格モード
- **型定義**: 明示的な型注釈を推奨
- **インターフェース**: 複雑なオブジェクト型はinterfaceで定義
- **列挙型**: string enumを活用（例: TradeType, AccountType）
- **型ガード**: ユーザー定義型ガードの活用

## React規約
- **関数コンポーネント**: アロー関数形式を基本とする
- **Hooks**: カスタムHooksは`use`プレフィックス必須
- **Props型**: コンポーネント固有の型定義
- **状態管理**: Context API + useReducerパターン
- **副作用**: useEffectの依存配列を厳密に管理

## 命名規則
### ファイル・ディレクトリ
- **コンポーネント**: PascalCase（例: `TradeForm.tsx`）
- **Hooks**: camelCase with `use` prefix（例: `useTradeHandlers.ts`）
- **ユーティリティ**: camelCase（例: `formatUtils.ts`）
- **型定義**: PascalCase（例: `Trade.ts`）
- **CSS**: kebab-case（例: `monthly-profit.css`）

### 変数・関数
- **変数**: camelCase
- **関数**: camelCase（動詞から開始）
- **定数**: UPPER_SNAKE_CASE
- **コンポーネント関数**: PascalCase
- **イベントハンドラ**: `handle` + 動作（例: `handleSaveTrade`）

## CSS設計システム
### 設計原則
- **`!important`使用禁止**: 詳細度による制御
- **CSS変数必須**: デザイントークン活用
- **BEM記法推奨**: `.block__element--modifier`
- **レスポンシブ**: モバイルファースト（768px基準）

### CSS変数システム
```css
/* カラー */
--bg-primary, --text-primary, --status-profit, --status-loss

/* スペーシング */
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)  
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)

/* タイポグラフィ */
--font-size-xs: 0.75rem (12px)
--font-size-base: 1rem (16px)
--font-size-xl: 1.25rem (20px)

/* Z-Index管理 */
--z-modal: 50, --z-tooltip: 70, --z-toast: 80
```

## ESLint設定
- **ベース**: @eslint/js + typescript-eslint
- **React**: react-hooks, react-refresh プラグイン
- **厳格レベル**: recommended設定を採用
- **自動修正**: 可能な限りauto-fix対応

## ディレクトリ規約
- **機能別分割**: components, hooks, services, utils
- **共通要素**: types, constants 配下に集約
- **スタイル**: コンポーネントごとに分離
- **テスト**: 未実装（今後の拡張予定）

## コメント・ドキュメント
- **JSDoc**: 複雑な関数・型には必須
- **コンポーネント**: Props型にコメント記述
- **ビジネスロジック**: 計算式・アルゴリズムに説明追加
- **TODOコメント**: 改善点を明確に記述

## Git規約
- **コミットメッセージ**: Conventional Commits形式
- **ブランチ**: main単一ブランチ運用
- **自動デプロイ**: mainプッシュ時にGitHub Pages展開