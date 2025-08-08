/**
 * 銘柄名から銘柄コードと純粋な銘柄名を分離する
 * @param stockName 「銘柄名 銘柄コード」または「銘柄名」形式の文字列
 * @returns 銘柄名と銘柄コード
 */
export function parseStockInfo(stockName: string | null): { name: string; code?: string } {
  if (!stockName) {
    return { name: '不明' };
  }
  // 日本株のティッカーコードパターン:
  // - 標準: 4桁数字 (1234, 7203)
  // - 優先株: 4桁数字+アルファベット1文字 (1234A, 5678B)
  // - 特殊銘柄: 3桁数字+アルファベット1文字 (123A, 456B)
  // - 一部のETF/REIT等: その他の英数字組み合わせ
  
  // 末尾の証券コードを抽出
  const match = stockName.match(/^(.+?)\s+([0-9]{3,4}[A-Z]?|[0-9A-Z]{3,5})$/);
  
  if (match) {
    const code = match[2];
    // 有効な証券コードパターンかチェック
    if (/^(\d{4}[A-Z]?|\d{3}[A-Z]|[0-9A-Z]{3,5})$/.test(code)) {
      return {
        name: match[1].trim(),
        code: code
      };
    }
  }
  
  return { name: stockName.trim() };
}

/**
 * 銘柄情報を「銘柄コード 銘柄名」形式で表示用に整形する
 * @param stockName データベースに保存されている銘柄名（銘柄コードを含む可能性がある）
 * @param stockCode データベースに保存されている銘柄コード（undefinedの可能性がある）
 * @returns 表示用の文字列
 */
export function formatStockDisplay(stockName: string | null, stockCode?: string): string {
  const parsed = parseStockInfo(stockName);
  
  // stockCodeが明示的に渡されている場合はそれを使用
  const code = stockCode || parsed.code;
  
  // 名前が空の場合は「不明」を使用
  const displayName = parsed.name || '不明';
  
  if (code) {
    return `${code} ${displayName}`;
  }
  
  return displayName;
}