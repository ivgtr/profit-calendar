# コードスタイル・規約

## TypeScript設定
- **strict mode**: 有効（厳格な型チェック）
- **noUnusedLocals**: 未使用ローカル変数の検出
- **noUnusedParameters**: 未使用パラメータの検出
- **noFallthroughCasesInSwitch**: switch文のfallthrough防止
- **target**: ES2020
- **module**: ESNext
- **jsx**: react-jsx

## ESLint設定
- **ベース**: @eslint/js推奨設定 + typescript-eslint推奨設定
- **React Hooks**: eslint-plugin-react-hooks（推奨ルール適用）
- **React Refresh**: eslint-plugin-react-refresh
- **対象ファイル**: **/*.{ts,tsx}
- **除外**: dist/

## 命名規約
### コンポーネント
- **ファイル名**: PascalCase（例: `TradeForm.tsx`, `MonthlyReport.tsx`）
- **コンポーネント名**: PascalCase
- **Props型**: `ComponentNameProps`（例: `TradeFormProps`）

### フック
- **ファイル名**: camelCase（例: `useMonthlyTrades.ts`）
- **フック名**: `use`プレフィックス付きcamelCase

### 型定義
- **インターフェース**: PascalCase（例: `Trade`, `ImportHistory`）
- **型エイリアス**: PascalCase
- **enum**: PascalCase

### 変数・関数
- **変数**: camelCase
- **関数**: camelCase
- **定数**: SCREAMING_SNAKE_CASE（例: `DB_NAME`, `DB_VERSION`）

## ファイル構成規約
### インポート順序
1. React関連
2. 外部ライブラリ
3. 内部コンポーネント
4. 型定義
5. スタイル

### コンポーネント構造
```tsx
// インポート
import React from 'react';

// 型定義
interface ComponentProps {
  // props定義
}

// コンポーネント本体
export default function Component({ props }: ComponentProps) {
  // ステート
  // エフェクト
  // ハンドラー関数
  // レンダリング
}
```

## スタイリング規約
- **CSS Modules**: 使用しない（通常のCSSファイル使用）
- **ファイル命名**: コンポーネント名.css
- **グローバルスタイル**: `src/styles/index.css`に統一
- **テーマシステム**: CSS変数ベース（`theme.css`）

## React パターン
- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: 状態管理・副作用処理
- **Props**: 分割代入で受け取り
- **イベントハンドラー**: `handle`プレフィックス
- **ステートセッター**: `set`プレフィックス

## データ型規約
- **日付**: `Date`オブジェクト使用
- **ID**: uuid v4文字列
- **金額**: number型（整数）
- **フラグ**: boolean型明示