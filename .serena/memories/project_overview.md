# プロジェクト概要

## プロジェクト名
**Profit Calendar (利益カレンダー)**

## 目的
取引収益記録カレンダーアプリケーション。株式取引の収益管理、分析、可視化を行うWebアプリケーション。

## 主要機能
- SBI証券などのCSVファイルをドラッグ&ドロップでインポート（プレビュー・承認機能付き）
- 月間カレンダー表示（日別損益・取引件数表示）
- 日付選択による詳細取引履歴表示
- IndexedDBによるローカルデータ保存
- 年間収益チャート表示（Chart.js使用）
- 月次レポート機能（基本指標・トレンド・リスク・銘柄分析）
- データバックアップ・復元機能
- テーマ設定（ライト・ダーク・カスタム）
- 取引履歴の一括削除機能

## 技術スタック
- **フレームワーク**: React 19
- **言語**: TypeScript 5.7
- **ビルドツール**: Vite + @vitejs/plugin-react-swc
- **スタイリング**: CSS + CSS変数によるデザインシステム
- **データベース**: IndexedDB（ローカルストレージ）
- **チャート**: Chart.js + react-chartjs-2
- **文字エンコーディング**: encoding-japanese（Shift-JIS対応）
- **その他の主要ライブラリ**: uuid（ID生成）

## デプロイ環境
- GitHub Pages
- リポジトリ: https://github.com/ivgtr/profit-calendar.git
- 公開URL: https://ivgtr.github.io/profit-calendar/

## 特記事項
- CSVインポート機能はShift-JISエンコーディングを前提
- 対応取引種別: 現物売買・信用取引（返済売・返済買）
- モダンUIシステム導入済み（ConfirmDialog, Toast, Modal）
- レスポンシブデザイン対応（768px以下をモバイル基準）