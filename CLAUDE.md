# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 前提
- 勝手に開発サーバーを起動しないでください

## プロジェクト概要
- 利益カレンダー (profit-calendar) - React + TypeScript + Viteで構築されたWebアプリケーション
- SWCを使用した高速開発環境

## 開発コマンド

### 開発サーバー起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### プレビュー（ビルド後の確認）
```bash
npm run preview
```

### 型チェック
ビルドコマンドに含まれています（`tsc -b`）

## アーキテクチャ概要
- **フレームワーク**: React 19
- **ビルドツール**: Vite + @vitejs/plugin-react-swc
- **型システム**: TypeScript 5.7
- **エントリーポイント**: src/main.tsx → src/App.tsx
- **スタイリング**: CSS（App.css, index.css）

## プロジェクト構造
- `/src` - ソースコード
  - `main.tsx` - アプリケーションのエントリーポイント
  - `App.tsx` - メインコンポーネント
  - `/components` - 再利用可能なUIコンポーネント
  - `/pages` - ルーティングに対応するページコンポーネント
  - `/hooks` - カスタムReact Hooks
  - `/utils` - 汎用的なユーティリティ関数
  - `/types` - TypeScriptの型定義
  - `/styles` - グローバルスタイルとテーマ
  - `/services` - API通信とデータ処理
  - `/constants` - アプリケーション定数
  - `/assets` - 静的リソース（画像、CSVファイル等）
- `/public` - 公開ディレクトリ

## アプリケーション仕様
- **目的**: 取引収益記録カレンダーアプリ
- **主要機能**:
  - SBI証券などのCSVファイルをD&Dでインポート（プレビュー・承認機能付き）
  - 月間カレンダー表示（日別損益・取引件数表示）
  - 日付選択による詳細取引履歴表示
  - IndexedDBによるローカルデータ保存

## 技術仕様
- **データベース**: IndexedDB
- **CSVフォーマット**: Shift-JIS エンコーディング対応
- **対応取引種別**: 現物売買・信用取引（返済売・返済買）
- **必須パッケージ**: uuid, @types/uuid

## 注意事項
- Reactベストプラクティスに従ったディレクトリ構造を採用
- テストフレームワークは未設定
- CSVインポート機能はShift-JISエンコーディングを前提
- グローバルスタイルは`src/styles/index.css`に統一