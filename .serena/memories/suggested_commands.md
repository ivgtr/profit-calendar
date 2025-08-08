# Profit Calendar - 開発コマンド集

## 基本開発コマンド

### 開発環境
```bash
# 開発サーバー起動（http://localhost:5173）
npm run dev

# 開発サーバー停止
Ctrl+C
```

### ビルド・デプロイ
```bash
# プロダクションビルド（TypeScript型チェック込み）
npm run build

# ビルド成果物プレビュー
npm run preview

# GitHub Pagesへ手動デプロイ
npm run deploy
```

### コード品質管理
```bash
# ESLintによる静的解析
npm run lint

# ESLint自動修正（可能な範囲で）
npm run lint -- --fix
```

## パッケージ管理
```bash
# 依存関係インストール
npm install

# 新しいパッケージ追加
npm install <package-name>

# 開発用依存関係追加
npm install --save-dev <package-name>

# パッケージ更新確認
npm outdated

# パッケージ更新実行
npm update
```

## Gitコマンド（Darwinシステム）
```bash
# 変更状況確認
git status

# 変更差分表示
git diff

# ファイルをステージング
git add <file>

# コミット実行
git commit -m "feat: 新機能追加"

# リモートプッシュ（自動デプロイ実行）
git push origin main

# コミット履歴確認
git log --oneline -10
```

## ファイル・ディレクトリ操作（Darwin）
```bash
# ディレクトリ一覧
ls -la

# ディレクトリ移動
cd <directory>

# ファイル内容表示
cat <file>

# ファイル検索
find . -name "*.tsx" -type f

# 文字列検索（ripgrep推奨）
rg "useEffect" --type tsx

# ディスク容量確認
du -sh node_modules/
```

## プロジェクト特有のコマンド

### データベース操作
```bash
# IndexedDBクリア（ブラウザ開発者ツール）
# Application > Storage > IndexedDB > profit-calendar-db > Delete
```

### CSS変数確認
```bash
# CSS変数定義検索
rg "--[a-z-]+:" src/styles/

# CSS設計システム確認
cat CSS_DESIGN_SYSTEM.md
```

### TypeScript型チェック
```bash
# 型チェックのみ実行
npx tsc --noEmit

# 特定ファイルの型チェック
npx tsc --noEmit src/components/TradeForm.tsx
```

## トラブルシューティング
```bash
# node_modules再構築
rm -rf node_modules package-lock.json
npm install

# Viteキャッシュクリア
rm -rf dist .vite

# Git履歴確認
git reflog

# ファイルサイズ確認
ls -lh dist/
```

## 注意事項
- **開発サーバー**: 勝手に起動しない（CLAUDE.md記載）
- **プッシュ**: 自動デプロイが実行されるため慎重に
- **型エラー**: ビルド時に厳格チェックされるため事前確認必須
- **CSS**: !important使用禁止（設計システム準拠）