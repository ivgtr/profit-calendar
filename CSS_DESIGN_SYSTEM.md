# Profit Calendar CSS設計システム

## 概要
このドキュメントは、Profit Calendarプロジェクトにおける統一されたCSS設計原則とガイドラインを定義します。

## CSS変数システム

### カラーパレット
```css
/* プライマリ色 */
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #e9ecef;
--text-primary: #333333;
--text-secondary: #666666;
--text-tertiary: #999999;

/* アクセント色 */
--accent-primary: #667eea;
--accent-secondary: #764ba2;

/* ステータス色 */
--status-profit: #28a745;
--status-loss: #dc3545;
--status-warning: #ffc107;
--status-info: #17a2b8;
```

### スペーシングシステム
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### タイポグラフィシステム
```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
```

### Z-Index管理
```css
--z-base: 1;           /* 通常の要素 */
--z-dropdown: 10;      /* ドロップダウンメニュー */
--z-sticky: 20;        /* スティッキー要素 */
--z-fixed: 30;         /* 固定要素（Header等） */
--z-modal-backdrop: 40;/* モーダル背景 */
--z-modal: 50;         /* モーダルコンテンツ */
--z-popover: 60;       /* ポップオーバー */
--z-tooltip: 70;       /* ツールチップ */
--z-toast: 80;         /* トーストメッセージ */
```

## 設計原則

### 1. カスケード最適化
- `!important`の使用禁止
- 適切な詳細度（Specificity）による制御
- 親要素セレクタを活用した競合回避

**良い例:**
```css
.user-guide .last-updated {
  color: var(--text-tertiary);
}
```

**悪い例:**
```css
.last-updated {
  color: var(--text-tertiary) !important;
}
```

### 2. レスポンシブデザイン
- モバイルファースト設計
- 統一されたブレークポイント使用
- 768px以下をモバイル対応の基準とする

**統一されたメディアクエリ:**
```css
/* レスポンシブ: モバイル (--breakpoint-md以下) */
@media (max-width: 768px) {
  /* モバイル専用スタイル */
}
```

### 3. 命名規則
- BEM記法の採用推奨
- `.block__element--modifier`形式
- 意味のある、説明的なクラス名

**例:**
```css
.trade-form__input--required
.modal__close-button
.calendar__day--selected
```

### 4. スペーシング統一
- CSS変数による一貫したスペーシング
- ハードコード値の削減
- レイアウトの統一性向上

## コンポーネント設計ガイドライン

### モーダル
- z-index: `var(--z-modal)`
- border-radius: `var(--border-radius-xl)`
- padding: `var(--spacing-lg)`

### ツールチップ
- z-index: `var(--z-tooltip)`
- font-size: `var(--font-size-sm)`

### ボタン
- padding: `var(--spacing-sm) var(--spacing-md)`
- border-radius: `var(--border-radius-md)`

## 新規コンポーネント開発時のチェックリスト

- [ ] CSS変数を使用している
- [ ] !importantを使用していない
- [ ] 適切なz-indexレイヤーを使用している
- [ ] レスポンシブデザインに対応している
- [ ] BEM記法に従っている
- [ ] 既存のデザイントークンと一貫性がある

## メンテナンス

### リファクタリング済み項目
- ✅ !important削除（UserGuide.css, Header.css）
- ✅ z-index管理システム導入
- ✅ CSS変数システム拡張
- ✅ レスポンシブガイドライン統一

### 今後の改善項目
- より多くのコンポーネントでのCSS変数活用
- スペーシング値の完全統一
- タイポグラフィシステムの全面適用
- アニメーション・トランジション変数の追加

## パフォーマンス考慮事項

- CSS変数による実行時計算の最適化
- 不要なスタイル継承の回避
- セレクタ詳細度の適切な管理
- メディアクエリの効率的な使用