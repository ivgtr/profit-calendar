# Profit Calendar - タスク完了時のガイドライン

## コード変更後の必須チェック項目

### 1. コード品質チェック
```bash
# ESLint実行（必須）
npm run lint

# ESLint自動修正
npm run lint -- --fix
```

### 2. TypeScript型チェック
```bash
# ビルドによる型チェック（推奨）
npm run build

# 型チェックのみ
npx tsc --noEmit
```

### 3. 動作確認
```bash
# 開発サーバーでの動作確認
npm run dev
# → http://localhost:5173 で動作確認

# プロダクションビルド確認
npm run build
npm run preview
```

## CSS関連タスク完了時

### CSS設計システム準拠チェック
- [ ] `!important`を使用していない
- [ ] CSS変数（デザイントークン）を使用している
- [ ] 適切なz-indexレイヤーを使用している
- [ ] レスポンシブデザイン（768px以下）に対応している
- [ ] BEM記法に従っている
- [ ] 既存のデザイントークンと一貫性がある

### 確認コマンド
```bash
# CSS設計システム確認
cat CSS_DESIGN_SYSTEM.md

# !important使用チェック
rg "!important" src/styles/

# CSS変数使用確認
rg "var\(--" src/styles/
```

## React/TypeScript関連タスク

### コンポーネント作成時チェック
- [ ] 適切な型定義（Props, State）
- [ ] useEffectの依存配列が正しい
- [ ] メモリリーク防止（cleanup関数）
- [ ] エラーハンドリングの実装
- [ ] アクセシビリティ対応

### Hooks作成時チェック
- [ ] カスタムHooksは`use`プレフィックス
- [ ] 適切な依存関係の管理
- [ ] 型安全性の確保

## データベース関連タスク

### IndexedDB操作後確認
```bash
# ブラウザ開発者ツールで確認
# Application > Storage > IndexedDB > profit-calendar-db
```

- [ ] データの整合性確認
- [ ] マイグレーション処理の動作確認
- [ ] エラーハンドリングの動作確認

## Git・デプロイ関連

### コミット前チェック
```bash
# 変更状況確認
git status
git diff

# ステージング
git add <files>

# コミット（Conventional Commits形式）
git commit -m "feat: 新機能追加"
git commit -m "fix: バグ修正"  
git commit -m "style: CSSスタイル改善"
git commit -m "refactor: コードリファクタリング"
```

### プッシュ前最終確認
- [ ] ビルドエラーなし
- [ ] ESLintエラーなし
- [ ] 機能動作確認済み
- [ ] コミットメッセージが適切

**注意**: mainブランチへのプッシュで自動デプロイが実行されます

## パフォーマンス確認

### ビルドサイズチェック
```bash
npm run build
ls -lh dist/

# 主要ファイルサイズ確認
ls -lh dist/assets/
```

### 開発者ツールでの確認
- [ ] コンソールエラーなし
- [ ] ネットワークタブでリクエスト確認
- [ ] Lighthouseスコア確認（可能であれば）

## 特殊ケース対応

### CSV関連機能
- [ ] Shift-JISエンコーディング対応
- [ ] SBI証券フォーマット対応
- [ ] エラー時の適切なユーザーフィードバック

### テーマ機能
- [ ] ライト・ダークモード切り替え確認
- [ ] カスタムテーマ動作確認
- [ ] CSS変数の適切な継承

### レスポンシブ対応
- [ ] モバイル表示（768px以下）確認
- [ ] タッチ操作対応確認
- [ ] 横画面対応確認

## 緊急時の対処

### ビルド失敗時
```bash
# node_modules再構築
rm -rf node_modules package-lock.json
npm install

# Viteキャッシュクリア
rm -rf .vite dist
```

### 型エラー解決
```bash
# 特定ファイルの型チェック
npx tsc --noEmit src/path/to/file.tsx

# 型定義確認
rg "interface|type" src/types/
```