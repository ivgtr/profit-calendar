# 推奨コマンド

## 開発コマンド

### 開発サーバー起動
```bash
npm run dev
```
- Vite開発サーバーを起動
- ホットリロード対応
- 通常は http://localhost:5173 で起動

### ビルド
```bash
npm run build
```
- TypeScriptコンパイル（`tsc -b`）
- Viteビルド実行
- `dist/`ディレクトリに出力

### プレビュー
```bash
npm run preview
```
- ビルド済みアプリケーションのプレビュー
- プロダクション環境の動作確認用

### リンティング
```bash
npm run lint
```
- ESLintによるコード品質チェック
- TypeScript + React の推奨ルール適用

## デプロイメント

### 手動デプロイ
```bash
npm run deploy
```
- ビルド実行後、GitHub Pagesにデプロイ
- `gh-pages`パッケージ使用

## 開発用システムコマンド（macOS）

### ファイル操作
```bash
ls -la          # ディレクトリ内容表示（詳細）
find . -name    # ファイル検索
grep -r         # 文字列検索
```

### Git操作
```bash
git status      # ステータス確認
git add .       # ステージング
git commit -m   # コミット
git push        # プッシュ
```

## タスク完了時の確認コマンド

### 必須チェック
1. **リンティング**: `npm run lint`
2. **ビルド**: `npm run build`
3. **プレビュー**: `npm run preview`（必要に応じて）

### オプション
- **開発サーバー**: `npm run dev`（動作確認）

## データベース・ファイル
- **データベース**: ブラウザのIndexedDBに保存
- **設定ファイル**: ローカルストレージ
- **バックアップ**: JSONファイルエクスポート/インポート

## パッケージ管理
```bash
npm install             # 依存関係インストール
npm install --save      # 本番依存関係追加
npm install --save-dev  # 開発依存関係追加
npm outdated           # 依存関係の更新確認
```