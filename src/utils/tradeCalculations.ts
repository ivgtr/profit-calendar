import { Trade } from '../types/Trade';

/**
 * 取引関連の計算結果の型定義
 */
export interface TradeBreakdown {
  spotProfit: number;
  marginProfit: number;
}

export interface TradeSummary {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
}

/**
 * 取引の現物・信用別損益を計算
 * @param trades 取引データの配列
 * @returns 現物・信用別の損益
 */
export const calculateTradeBreakdown = (trades: Trade[]): TradeBreakdown => {
  let spotProfit = 0;
  let marginProfit = 0;
  
  trades.forEach(trade => {
    const normalizedTradeType = trade.tradeType.trim();
    
    if (normalizedTradeType === '売却' || normalizedTradeType === '現物売') {
      spotProfit += trade.realizedProfitLoss;
    } else if (normalizedTradeType === '返済買' || normalizedTradeType === '返済売') {
      marginProfit += trade.realizedProfitLoss;
    }
  });
  
  return { spotProfit, marginProfit };
};

/**
 * 取引の合計損益を計算
 * @param trades 取引データの配列
 * @returns 合計損益
 */
export const calculateTotalProfit = (trades: Trade[]): number => {
  return trades.reduce((sum, trade) => sum + trade.realizedProfitLoss, 0);
};

/**
 * 取引のサマリー情報を計算
 * @param trades 取引データの配列
 * @returns 取引サマリー
 */
export const calculateTradeSummary = (trades: Trade[]): TradeSummary => {
  const totalProfit = trades
    .filter(trade => trade.realizedProfitLoss > 0)
    .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0);

  const totalLoss = Math.abs(trades
    .filter(trade => trade.realizedProfitLoss < 0)
    .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0));

  const netProfit = totalProfit - totalLoss;
  const tradeCount = trades.length;
  const winCount = trades.filter(trade => trade.realizedProfitLoss > 0).length;
  const lossCount = trades.filter(trade => trade.realizedProfitLoss < 0).length;
  const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

  return {
    totalProfit,
    totalLoss,
    netProfit,
    tradeCount,
    winCount,
    lossCount,
    winRate,
  };
};

/**
 * 期間内の取引を日付でグループ化
 * @param trades 取引データの配列
 * @returns 日付をキーとした取引のマップ
 */
export const groupTradesByDate = (trades: Trade[]): Map<string, Trade[]> => {
  const grouped = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const dateKey = trade.date.toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(trade);
  });
  
  return grouped;
};

/**
 * 銘柄別の損益を集計
 * @param trades 取引データの配列
 * @returns 銘柄別損益のマップ
 */
export const calculateProfitByStock = (trades: Trade[]): Map<string, number> => {
  const profitByStock = new Map<string, number>();
  
  trades.forEach(trade => {
    const stockKey = `${trade.stockCode || trade.stockName}`;
    const currentProfit = profitByStock.get(stockKey) || 0;
    profitByStock.set(stockKey, currentProfit + trade.realizedProfitLoss);
  });
  
  return profitByStock;
};

/**
 * 月間取引統計の計算
 * @param trades 取引データの配列
 * @returns 月間統計サマリー
 */
export const calculateMonthlyStats = (trades: Trade[]) => {
  const summary = calculateTradeSummary(trades);
  const breakdown = calculateTradeBreakdown(trades);
  const profitByStock = calculateProfitByStock(trades);
  
  // 最も利益の大きい銘柄トップ3
  const topProfitStocks = Array.from(profitByStock.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // 最も損失の大きい銘柄トップ3
  const topLossStocks = Array.from(profitByStock.entries())
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);
  
  return {
    ...summary,
    ...breakdown,
    topProfitStocks,
    topLossStocks,
    avgProfitPerTrade: summary.tradeCount > 0 ? summary.netProfit / summary.tradeCount : 0,
  };
};