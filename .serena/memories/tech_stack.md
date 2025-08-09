# Profit Calendar - 技術スタック（最新版）

## フロントエンド技術（2025年8月最新）
- **React 19**: UIフレームワーク（最新安定版）
- **TypeScript 5.7**: 型システム（厳格モード、any型撲滅）
- **Vite 6.3.5**: 超高速ビルドツール（SWC使用）
- **@vitejs/plugin-react-swc**: React高速コンパイル

## アーキテクチャパターン
- **コンポーネントコロケーション**: CSS/TSXファイル同階層配置
- **機能別分離**: features/, ui/, pages/ディレクトリ構造
- **統合モーダル管理**: ModalManager.tsx（12+モーダル一元管理）
- **Context + Custom Hooks**: 状態管理パターン

## スタイリング・UI（デザインシステム準拠）
- **CSS + CSS変数**: デザイントークン管理
- **レスポンシブデザイン**: モバイルファースト（768px基準）
- **モダンUIシステム**: Modal, Toast, ConfirmDialog統合
- **テーマシステム**: ライト・ダーク・カスタム（CSS変数切り替え）
- **コンポーネント分類**:
  - `base/`: Button, Icon, Input, Select
  - `layout/`: Header, Card, Section
  - `feedback/`: Modal, Toast, Tooltip, ConfirmDialog
  - `data-display/`: Table, Chart, Summary

## データ・チャート・エンコーディング
- **IndexedDB**: ローカルデータベース（Trade CRUD）
- **Chart.js 4 + react-chartjs-2**: 年次チャート・月次分析
- **encoding-japanese**: SBI証券CSV（Shift-JIS）対応
- **UUID v4**: 取引ID生成（@types/uuid付き）

## 状態管理・データフロー
- **React Context**: UIContext（Toast/Confirm）, ThemeContext
- **Custom Hooks**: 20+個（useModal, useTrade, useCSV等）
- **データ永続化**: IndexedDB（database.ts抽象化）
- **型安全性**: 全体的にany型撲滅、具体的型定義

## 開発・品質管理（現代的設定）
- **ESLint 9.22**: 最新コード品質管理
- **typescript-eslint**: TypeScript専用ルール
- **eslint-plugin-react-hooks**: Hooks最適化
- **eslint-plugin-react-refresh**: HMR最適化
- **TypeScript設定**: 厳格モード、noImplicitAny有効

## パフォーマンス最適化
- **React.memo**: MonthlyReport等重要コンポーネント
- **useMemo/useCallback**: 頻繁再計算防止
- **動的インポート**: Chart.js等大型ライブラリ
- **バンドル分析**: build時の最適化警告対応

## デプロイ・CI/CD
- **GitHub Actions**: 自動ビルド・デプロイ
- **GitHub Pages**: 静的サイトホスティング
- **gh-pages**: 手動デプロイコマンド対応
- **Vite**: 最適化されたプロダクションビルド

## 開発環境要件
- **Node.js 18+**: ES2020+ features使用
- **npm 9+**: package-lock.json v3対応
- **Modern IDE**: VS Code推奨（TypeScript IntelliSense）

## ブラウザ・デバイス対応
- **モダンブラウザ**: Chrome 90+, Firefox 88+, Safari 14+
- **ES2020機能**: Optional Chaining, Nullish Coalescing使用
- **IndexedDB**: 必須（データ永続化の中核）
- **レスポンシブ**: デスクトップ・タブレット・モバイル対応

## セキュリティ・品質
- **型安全性**: TypeScript厳格設定、any型撲滅
- **CSP対応**: インラインスタイル最小化
- **データ検証**: 入力値型チェック（実行時）
- **エラーハンドリング**: UI Context統合エラー表示

## 特殊機能・ライブラリ
- **SBI証券対応**: 専用CSV解析ロジック（csvParser.ts）
- **日本語対応**: 通貨フォーマット、日付表示
- **統計計算**: 勝率、リスク指標、トレンド分析
- **バックアップ**: JSON形式データエクスポート・インポート

## 2025年8月アーキテクチャ更新点
1. **コンポーネント分離**: 機能別ディレクトリ構造
2. **CSSコロケーション**: 16ファイル移動完了
3. **ModalManager統合**: App.tsx132行削減
4. **型安全性向上**: any型撲滅、Database型具体化
5. **import最適化**: 相対パス簡潔化（91%短縮）