# 開発コマンド一覧

## 必須コマンド（タスク完了時に実行）
```bash
# Lintingチェック
npm run lint

# 型チェック（ビルドコマンドに含まれる）
npm run build
```

## 開発用コマンド
```bash
# 開発サーバー起動（ホットリロード付き）
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# GitHub Pagesへのデプロイ
npm run deploy
```

## パッケージ管理
```bash
# 依存関係のインストール
npm install

# パッケージの追加
npm install <package-name>

# 開発用パッケージの追加
npm install -D <package-name>
```

## Git操作（macOS/Darwin）
```bash
# ステータス確認
git status

# 変更の追加
git add .

# コミット
git commit -m "メッセージ"

# プッシュ（自動実行禁止）
git push origin <branch-name>
```

## システムコマンド（macOS/Darwin）
```bash
# ディレクトリ内容表示
ls -la

# ファイル検索
find . -name "*.tsx"

# テキスト検索（ripgrep推奨）
rg "pattern"

# ディレクトリ移動
cd <directory>

# ファイル内容表示
cat <file>
```

## 注意事項
- **開発サーバーの自動起動禁止**：`npm run dev`は明示的な指示があった場合のみ実行
- **自動プッシュ禁止**：`git push`は明示的な指示があった場合のみ実行
- **テストフレームワーク未設定**：現在テストコマンドは存在しない