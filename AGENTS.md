# AGENTS.md

This playbook aligns GPT-based agents with the expectations for the Profit Calendar repository. Skim it before taking actions and keep it open while you work.

## 前提 / Non-Negotiables
- 勝手に開発サーバーを起動しないでください。`npm run dev` は指示または合意がある場合のみ。
- 勝手にリモートへ push しないこと。ローカル変更のみで完結させる。
- 危険な破壊的コマンド（`git reset --hard` など）はリクエストが無い限り実行禁止。
- リポジトリ外へのデータ流出、外部API追加、リモート永続化は禁止。IndexedDB (`ProfitCalendarDB`) 内で完結させる。

## プロジェクト概要
- React + TypeScript + Vite で構築された利益カレンダーアプリ。
- 高速開発環境: Vite + @vitejs/plugin-react-swc。
- 主要スタック: React 19, TypeScript 5.7, Chart.js + react-chartjs-2, encoding-japanese (Shift-JIS 対応)。
- データは IndexedDB に保存。CSV は Shift-JIS に対応。

## すぐ使えるチェックリスト
- 作業範囲は `src/` 配下。既存の feature/UI/state/hooks/services 構成を尊重し、新規ファイルは適切なディレクトリに配置。
- 新規コンポーネントやhooksは既存の抽象を拡張する形で実装。必要なら `src/components/index.ts` で再エクスポート。
- 変更内容に応じて必要なコマンドのみを実行（下記コマンドリファレンス参照）。
- 作業着手時に lint と手動QA計画を確認し、CSVインポート、カレンダー操作、IndexedDB保存の動作確認項目を記載。
- 機微データは扱わない。サンプルCSVは必ず匿名化。

## アーキテクチャ & 構造
- エントリーポイント: `src/main.tsx` → `src/App.tsx`。
- 機能別: `src/components/features/*`（画面・ドメイン機能）。
- UI共通部品: `src/components/ui/*`（Modal, Toast, ConfirmDialog 等）。
- 状態管理: `src/contexts/*`。
- 副作用・カスタムフック: `src/hooks/*`（useCallback/useMemo を活用）。
- ユーティリティ/定数: `src/utils/*`, `src/constants/*`。
- IndexedDB・バックアップ: `src/services/database.ts`（必ずここを経由）。
- 型定義: `src/types/*`。コンテキスト値やサービスは既存型を再利用。
- スタイル: `src/styles` + CSS 変数設計。`!important` は禁止。
- アセット: `public/`。ビルド成果物: `dist/`（コミットしない）。

## コマンドリファレンス
| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server を手動確認用に起動（必要時のみ）。 |
| `npm run build` | `tsc -b` を含む本番ビルド。型チェックも実行。 |
| `npm run preview` | 最新ビルドをローカルで確認。 |
| `npm run lint` | ESLint 実行。PR前に必須。 |
| `npm run deploy` | GitHub Pages へデプロイ（認証が必要）。 |

## コーディング規約
- インデント2スペース、セミコロンあり、シングルクォートを使用。
- コンポーネント: PascalCase、hooks: `useCamelCase`、ユーティリティ: `camelCase`。
- 型安全最優先。`as` に頼らず型ガードを検討。`src/types/*` の型を参照。
- 大規模ロジックには短いコメントで意図を共有。冗長な説明は避ける。
- CSS は CSS_DESIGN_SYSTEM.md の原則（BEM 推奨、レスポンシブ、z-index 管理）を順守。

## テスト & QA
- テストスイート未整備。Vitest + React Testing Library 導入が望ましい。
- テストを追加する場合は `ComponentName.test.tsx` を隣接配置、または `src/__tests__/` に格納。`npm run test` スクリプトを用意し README/PR で周知。
- 自動テストが無い変更でも手動QAを実施し、CSV import/export、カレンダー遷移、IndexedDB 永続化を最低限確認。
- QA結果・再現手順を PR 本文に記載。

## コラボレーションフロー
- コミットは Conventional Commits（`feat:`, `fix:`, `refactor:` etc）。短くても意図が伝わるメッセージにする。日本語可。
- PR: 目的、関連Issue、UI変更の before/after、実行コマンド（`npm run lint`, `npm run preview` 等）を明記。
- 最新 `main` をリベースしてからPR作成。`dist/` や個人データをコミットしない。

## データ & セキュリティ
- ユーザーデータは IndexedDB (`ProfitCalendarDB`) のみで管理。外部送信を追加しない。
- CSV やサンプルデータは機密情報を含めないようサニタイズ。
- 環境変数やクライアントキーは `.env` 等の ignore 済ファイルで管理し、リポジトリに含めない。

## ヒント
- 不明点は既存コード・ドキュメント（`CLAUDE.md`, `CSS_DESIGN_SYSTEM.md` 等）を先に参照。
- 小さく検証しながら進め、必要に応じて `apply_patch` で最小差分を作成。
- 作業終わりには変更点を読み返し、lint/ビルド/QA実施の有無を報告。

Happy shipping! Stay within these rails and the team will love your PRs.
