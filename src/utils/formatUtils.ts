/**
 * 共通のフォーマット用ユーティリティ関数
 */

/**
 * 金額を日本円形式でフォーマット
 * @param amount 金額（数値）
 * @returns フォーマットされた金額文字列
 * @example
 * formatCurrency(1234567) // "1,234,567"
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ja-JP');
};

/**
 * パーセンテージをフォーマット
 * @param value パーセンテージ値（小数点形式: 0.5 = 50%）
 * @param decimals 小数点以下の桁数（デフォルト: 1）
 * @returns フォーマットされたパーセンテージ文字列
 * @example
 * formatPercentage(0.1234) // "12.3%"
 * formatPercentage(0.1234, 2) // "12.34%"
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 日付を年月日形式でフォーマット
 * @param date Date オブジェクト
 * @returns フォーマットされた日付文字列
 * @example
 * formatDate(new Date(2024, 0, 15)) // "2024年1月15日"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP');
};

/**
 * 年月を表示用にフォーマット
 * @param date Date オブジェクト
 * @returns フォーマットされた年月文字列
 * @example
 * formatMonthYear(new Date(2024, 0, 15)) // "2024年1月"
 */
export const formatMonthYear = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
};

/**
 * 数値を3桁区切りでフォーマット（単位なし）
 * @param value 数値
 * @returns フォーマットされた数値文字列
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('ja-JP');
};