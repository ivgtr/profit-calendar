import { Trade } from '../types/Trade';

/**
 * 統計計算結果の型定義
 */
export interface RiskAnalysis {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  calmarRatio: number;
  valueAtRisk95: number;
  expectedShortfall: number;
  volatility: number;
  recoveryFactor: number;
}

export interface StreakAnalysis {
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  longestWinStreak: number;
  longestLossStreak: number;
  avgWinStreak: number;
  avgLossStreak: number;
}

export interface StockAnalysisItem {
  symbol: string;
  profit: number;
  trades: number;
  winRate: number;
}

export interface StockAnalysis {
  topPerformers: StockAnalysisItem[];
  worstPerformers: StockAnalysisItem[];
  mostTraded: StockAnalysisItem[];
}

export interface WeeklyTrendItem {
  week: number;
  profit: number;
  trades: number;
}

export interface DayPerformanceItem {
  day: string;
  profit: number;
  trades: number;
  winRate: number;
}

export interface TrendAnalysis {
  weeklyTrend: WeeklyTrendItem[];
  performanceByDay: DayPerformanceItem[];
  momentumIndicator: number;
}

export interface AdvancedMetrics {
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  maxWin: number;
  maxLoss: number;
  winRate: number;
  lossRate: number;
  avgTradesPerDay: number;
  tradingDays: number;
  dailyStats: {
    bestDay: number;
    worstDay: number;
    avgDailyProfit: number;
  };
  sortinoRatio: number;
  maxConsecutiveLosses: number;
  profitabilityIndex: number;
  consistencyIndex: number;
  riskReturnRatio: number;
}

/**
 * リスク分析を計算
 * @param dailyProfits 日別損益の配列
 * @returns リスク分析結果
 */
export const calculateRiskAnalysis = (dailyProfits: number[]): RiskAnalysis => {
  // ドローダウン計算
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let peak = 0;
  let cumulativeProfit = 0;
  
  dailyProfits.forEach(profit => {
    cumulativeProfit += profit;
    if (cumulativeProfit > peak) {
      peak = cumulativeProfit;
    }
    const drawdown = peak - cumulativeProfit;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    }
  });

  // ボラティリティ（日次利益の標準偏差）
  const avgDaily = dailyProfits.reduce((sum, p) => sum + p, 0) / dailyProfits.length;
  const variance = dailyProfits.reduce((sum, p) => sum + Math.pow(p - avgDaily, 2), 0) / dailyProfits.length;
  const volatility = Math.sqrt(variance);

  // シャープレシオ（リスクフリーレート0と仮定）
  const sharpeRatio = volatility > 0 ? avgDaily / volatility : 0;

  // カルマーレシオ
  const calmarRatio = maxDrawdown > 0 ? (avgDaily * 252) / maxDrawdown : 0;

  // VaR（95%信頼区間）
  const sortedProfits = [...dailyProfits].sort((a, b) => a - b);
  const varIndex = Math.floor(0.05 * sortedProfits.length);
  const valueAtRisk95 = sortedProfits[varIndex] || 0;

  // Expected Shortfall（CVaR）
  const worstProfits = sortedProfits.slice(0, varIndex + 1);
  const expectedShortfall = worstProfits.length > 0 ? 
    worstProfits.reduce((sum, p) => sum + p, 0) / worstProfits.length : 0;

  // リカバリーファクター
  const totalReturn = dailyProfits.reduce((sum, p) => sum + p, 0);
  const recoveryFactor = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

  return {
    maxDrawdown,
    maxDrawdownPercent,
    sharpeRatio,
    calmarRatio,
    valueAtRisk95,
    expectedShortfall,
    volatility,
    recoveryFactor
  };
};

/**
 * ストリーク分析を計算
 * @param trades 取引データの配列
 * @returns ストリーク分析結果
 */
export const calculateStreakAnalysis = (trades: Trade[]): StreakAnalysis => {
  // 日別で損益を集約
  const dailyProfits = new Map<string, number>();
  
  trades.forEach(trade => {
    const dateKey = trade.date.toISOString().split('T')[0];
    const currentProfit = dailyProfits.get(dateKey) || 0;
    dailyProfits.set(dateKey, currentProfit + trade.realizedProfitLoss);
  });

  // 日付順でソート
  const sortedDays = Array.from(dailyProfits.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, profit]) => ({ date, profit }));

  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  sortedDays.forEach((day, index) => {
    const isWin = day.profit > 0;
    
    if (isWin) {
      tempWinStreak++;
      if (tempLossStreak > 0) {
        lossStreaks.push(tempLossStreak);
        tempLossStreak = 0;
      }
    } else if (day.profit < 0) {
      tempLossStreak++;
      if (tempWinStreak > 0) {
        winStreaks.push(tempWinStreak);
        tempWinStreak = 0;
      }
    } else {
      // ブレイクイーブンの場合はストリークをリセット
      if (tempWinStreak > 0) {
        winStreaks.push(tempWinStreak);
        tempWinStreak = 0;
      }
      if (tempLossStreak > 0) {
        lossStreaks.push(tempLossStreak);
        tempLossStreak = 0;
      }
    }

    longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    longestLossStreak = Math.max(longestLossStreak, tempLossStreak);

    // 現在のストリーク（最新の日から）
    if (index === sortedDays.length - 1) {
      if (tempWinStreak > 0) {
        currentStreak = tempWinStreak;
        currentStreakType = 'win';
      } else if (tempLossStreak > 0) {
        currentStreak = tempLossStreak;
        currentStreakType = 'loss';
      }
    }
  });

  // 最後のストリークも配列に追加
  if (tempWinStreak > 0 && !winStreaks.includes(tempWinStreak)) {
    winStreaks.push(tempWinStreak);
  }
  if (tempLossStreak > 0 && !lossStreaks.includes(tempLossStreak)) {
    lossStreaks.push(tempLossStreak);
  }

  const avgWinStreak = winStreaks.length > 0 ? 
    winStreaks.reduce((sum, s) => sum + s, 0) / winStreaks.length : 0;
  const avgLossStreak = lossStreaks.length > 0 ? 
    lossStreaks.reduce((sum, s) => sum + s, 0) / lossStreaks.length : 0;

  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    avgWinStreak: Math.round(avgWinStreak * 10) / 10,
    avgLossStreak: Math.round(avgLossStreak * 10) / 10
  };
};

/**
 * 銘柄別分析を計算
 * @param trades 取引データの配列
 * @returns 銘柄別分析結果
 */
export const calculateStockAnalysis = (trades: Trade[]): StockAnalysis => {
  const stockStats = new Map<string, { profit: number; trades: number; wins: number }>();
  
  trades.forEach(trade => {
    const symbol = trade.stockName || '不明';
    const current = stockStats.get(symbol) || { profit: 0, trades: 0, wins: 0 };
    
    stockStats.set(symbol, {
      profit: current.profit + trade.realizedProfitLoss,
      trades: current.trades + 1,
      wins: current.wins + (trade.realizedProfitLoss > 0 ? 1 : 0)
    });
  });

  const stockArray = Array.from(stockStats.entries()).map(([symbol, stats]) => ({
    symbol,
    profit: stats.profit,
    trades: stats.trades,
    winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
  }));

  return {
    topPerformers: stockArray.sort((a, b) => b.profit - a.profit).slice(0, 5),
    worstPerformers: stockArray.sort((a, b) => a.profit - b.profit).slice(0, 5),
    mostTraded: stockArray.sort((a, b) => b.trades - a.trades).slice(0, 5)
  };
};

/**
 * トレンド分析を計算
 * @param trades 取引データの配列
 * @param dailyProfits 日別損益のマップ
 * @returns トレンド分析結果
 */
export const calculateTrendAnalysis = (trades: Trade[], dailyProfits: Map<string, number>): TrendAnalysis => {
  // 週別トレンド
  const weeklyStats = new Map<number, { profit: number; trades: number }>();
  
  dailyProfits.forEach((profit, dateStr) => {
    const date = new Date(dateStr);
    const week = Math.ceil(date.getDate() / 7);
    const current = weeklyStats.get(week) || { profit: 0, trades: 0 };
    
    const dayTrades = trades.filter(t => 
      t.date.toISOString().split('T')[0] === dateStr
    ).length;
    
    weeklyStats.set(week, {
      profit: current.profit + profit,
      trades: current.trades + dayTrades
    });
  });

  const weeklyTrend = Array.from(weeklyStats.entries()).map(([week, stats]) => ({
    week,
    profit: stats.profit,
    trades: stats.trades
  })).sort((a, b) => a.week - b.week);

  // 曜日別パフォーマンス
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayStats = new Map<string, { profit: number; trades: number; wins: number }>();
  
  dailyProfits.forEach((profit, dateStr) => {
    const date = new Date(dateStr);
    const dayName = dayNames[date.getDay()];
    const current = dayStats.get(dayName) || { profit: 0, trades: 0, wins: 0 };
    
    const dayTrades = trades.filter(t => 
      t.date.toISOString().split('T')[0] === dateStr
    );
    
    dayStats.set(dayName, {
      profit: current.profit + profit,
      trades: current.trades + dayTrades.length,
      wins: current.wins + dayTrades.filter(t => t.realizedProfitLoss > 0).length
    });
  });

  const performanceByDay = Array.from(dayStats.entries()).map(([day, stats]) => ({
    day,
    profit: stats.profit,
    trades: stats.trades,
    winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
  }));

  // モメンタム指標（直近の週の傾向）
  const recentWeeks = weeklyTrend.slice(-2);
  const momentumIndicator = recentWeeks.length === 2 ? 
    recentWeeks[1].profit - recentWeeks[0].profit : 0;

  return {
    weeklyTrend,
    performanceByDay,
    momentumIndicator
  };
};

/**
 * 高度な指標を計算
 * @param trades 取引データの配列
 * @param dailyProfits 日別損益の配列
 * @returns 高度な指標結果
 */
export const calculateAdvancedMetrics = (trades: Trade[], dailyProfits: number[]): AdvancedMetrics => {
  const winningTrades = trades.filter(t => t.realizedProfitLoss > 0);
  const losingTrades = trades.filter(t => t.realizedProfitLoss < 0);
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0));
  
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const maxWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.realizedProfitLoss)) : 0;
  const maxLoss = losingTrades.length > 0 ? Math.abs(Math.min(...losingTrades.map(t => t.realizedProfitLoss))) : 0;
  
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) : 0;
  const lossRate = 1 - winRate;
  
  // 取引日数を計算
  const tradingDays = new Set(trades.map(t => t.date.toISOString().split('T')[0])).size;
  const avgTradesPerDay = tradingDays > 0 ? trades.length / tradingDays : 0;
  
  // 日別統計
  const bestDay = dailyProfits.length > 0 ? Math.max(...dailyProfits) : 0;
  const worstDay = dailyProfits.length > 0 ? Math.min(...dailyProfits) : 0;
  const avgDailyProfit = dailyProfits.length > 0 ? 
    dailyProfits.reduce((sum, p) => sum + p, 0) / dailyProfits.length : 0;

  // 高度な指標の計算
  const negativeDailyProfits = dailyProfits.filter(p => p < 0);
  const downSideDeviation = negativeDailyProfits.length > 0 ? 
    Math.sqrt(negativeDailyProfits.reduce((sum, p) => sum + Math.pow(p, 2), 0) / negativeDailyProfits.length) : 0;
  const sortinoRatio = downSideDeviation > 0 ? avgDailyProfit / downSideDeviation : 0;

  // 最大連続損失
  let maxConsecutiveLosses = 0;
  let currentConsecutiveLosses = 0;
  for (const trade of trades) {
    if (trade.realizedProfitLoss < 0) {
      currentConsecutiveLosses++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
    } else {
      currentConsecutiveLosses = 0;
    }
  }

  // 収益性指数 (利益 / 損失の比率)
  const profitabilityIndex = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 10 : 0;

  // 一貫性指標 (勝率と平均利益のバランス)
  const consistencyIndex = winRate * 0.6 + (avgWin / (avgWin + avgLoss || 1)) * 0.4;

  // リスクリターン比
  const volatility = dailyProfits.length > 0 ? 
    Math.sqrt(dailyProfits.reduce((sum, p) => sum + Math.pow(p - avgDailyProfit, 2), 0) / dailyProfits.length) : 0;
  const riskReturnRatio = volatility > 0 ? avgDailyProfit / volatility : 0;

  return {
    profitFactor,
    avgWin,
    avgLoss,
    maxWin,
    maxLoss,
    winRate,
    lossRate,
    avgTradesPerDay: Math.round(avgTradesPerDay * 10) / 10,
    tradingDays,
    dailyStats: {
      bestDay,
      worstDay,
      avgDailyProfit: Math.round(avgDailyProfit)
    },
    sortinoRatio,
    maxConsecutiveLosses,
    profitabilityIndex,
    consistencyIndex,
    riskReturnRatio
  };
};;