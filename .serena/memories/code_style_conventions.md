# コードスタイルとコンベンション

## TypeScript/React コーディング規約

### 型定義
- **型安全性重視**: TypeScript型アサーション（`as`）の使用を極力避ける
- **型ガード関数**: 実行時型チェックを採用
- **明示的な型定義**: 可能な限り型を明示的に定義
- **インターフェース優先**: typeよりinterfaceを優先使用

### React ベストプラクティス
- **関数コンポーネント**: クラスコンポーネントより関数コンポーネントを使用
- **React Hooks**: useCallback/useMemoによるパフォーマンス最適化
- **カスタムフック**: 再利用可能なロジックは`/hooks`ディレクトリに配置
- **Context API**: グローバル状態管理にはReact Contextを使用

### ディレクトリ構造
```
/src
  /components      - 再利用可能なUIコンポーネント
    /ui           - 汎用UIコンポーネント
    /MonthlyReport - 機能別コンポーネント
  /contexts       - React Context
  /hooks          - カスタムフック
  /utils          - ユーティリティ関数
  /types          - TypeScript型定義
  /styles         - CSSファイル
  /services       - ビジネスロジック・外部サービス
  /constants      - 定数定義
  /assets         - 静的リソース
```

### 命名規則
- **コンポーネント**: PascalCase（例: `TradeForm.tsx`）
- **フック**: camelCase、`use`プレフィックス（例: `useTradeData.ts`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **型/インターフェース**: PascalCase（例: `Trade`, `UserSettings`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_TRADES_PER_PAGE`）

## CSS設計原則

### CSS変数システム
- **デザイントークン**: CSS変数による統一管理
- **!important禁止**: カスケード最適化による制御
- **BEM記法**: `.block__element--modifier`形式

### レスポンシブデザイン
- **モバイルファースト**: 768px以下をモバイル基準
- **統一ブレークポイント**: メディアクエリの一貫性

### Z-Index管理
```css
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-popover: 60;
--z-tooltip: 70;
--z-toast: 80;
```

## ESLint設定
- React Hooks ルール適用
- React Refresh ルール適用
- TypeScript推奨ルール適用

## null値処理
- UI表示時は「未入力」「不明」などの適切な表現を使用
- null/undefinedチェックを確実に実施