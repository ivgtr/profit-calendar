import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { Trade } from '../types/Trade';
import { Tooltip } from './Tooltip';
import { TOOLTIPS } from '../constants/tooltips';
import '../styles/MonthlyReport.css';

interface MonthlyReportProps {
  currentMonth: Date;
  refreshTrigger: number;
  isDbReady: boolean;
}

interface MonthlyStats {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winCount: number;
  lossCount: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  maxWin: number;
  maxLoss: number;
  profitFactor: number;
  spotStats: {
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    tradeCount: number;
    winCount: number;
    lossCount: number;
  };
  marginStats: {
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    tradeCount: number;
    winCount: number;
    lossCount: number;
  };
  dailyStats: {
    profitableDays: number;
    lossDays: number;
    breakEvenDays: number;
    bestDay: number;
    worstDay: number;
    avgDailyProfit: number;
  };
  // 高度な分析機能
  riskAnalysis: {
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    calmarRatio: number;
    valueAtRisk95: number;
    expectedShortfall: number;
    volatility: number;
    recoveryFactor: number;
  };
  streakAnalysis: {
    currentStreak: number;
    currentStreakType: 'win' | 'loss' | 'none';
    longestWinStreak: number;
    longestLossStreak: number;
    avgWinStreak: number;
    avgLossStreak: number;
  };
  stockAnalysis: {
    topPerformers: Array<{ symbol: string; profit: number; trades: number; winRate: number }>;
    worstPerformers: Array<{ symbol: string; profit: number; trades: number; winRate: number }>;
    mostTraded: Array<{ symbol: string; trades: number; profit: number; winRate: number }>;
  };
  trendAnalysis: {
    weeklyTrend: Array<{ week: number; profit: number; trades: number }>;
    performanceByDay: Array<{ day: string; profit: number; trades: number; winRate: number }>;
    momentumIndicator: number;
  };
  advancedMetrics: {
    sortinoRatio: number;
    informationRatio: number;
    treynorRatio: number;
    maxConsecutiveLosses: number;
    profitabilityIndex: number;
    riskReturnRatio: number;
    consistencyIndex: number;
  };
}

// 高度な分析機能のヘルパー関数
const calculateRiskAnalysis = (dailyProfits: number[]) => {
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


const calculateStreakAnalysis = (trades: Trade[]) => {
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

const calculateStockAnalysis = (trades: Trade[]) => {
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

const calculateTrendAnalysis = (trades: Trade[], dailyProfits: Map<string, number>) => {
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

const calculateAdvancedMetrics = (trades: Trade[], dailyProfits: number[]) => {
  const avgDaily = dailyProfits.reduce((sum, p) => sum + p, 0) / dailyProfits.length;
  const downside = dailyProfits.filter(p => p < 0);
  const downsideVariance = downside.length > 0 ? 
    downside.reduce((sum, p) => sum + Math.pow(p, 2), 0) / downside.length : 0;
  const downsideDeviation = Math.sqrt(downsideVariance);

  // ソルティノレシオ
  const sortinoRatio = downsideDeviation > 0 ? avgDaily / downsideDeviation : 0;

  // 連続損失回数
  let maxConsecutiveLosses = 0;
  let currentConsecutiveLosses = 0;
  
  trades.forEach(trade => {
    if (trade.realizedProfitLoss < 0) {
      currentConsecutiveLosses++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutiveLosses);
    } else {
      currentConsecutiveLosses = 0;
    }
  });


  // 収益性指数
  const totalProfit = trades.filter(t => t.realizedProfitLoss > 0)
    .reduce((sum, t) => sum + t.realizedProfitLoss, 0);
  const totalLoss = Math.abs(trades.filter(t => t.realizedProfitLoss < 0)
    .reduce((sum, t) => sum + t.realizedProfitLoss, 0));
  const profitabilityIndex = totalLoss > 0 ? totalProfit / totalLoss : 0;

  // 一貫性指標（勝率と平均利益の組み合わせ）
  const winRate = trades.length > 0 ? 
    (trades.filter(t => t.realizedProfitLoss > 0).length / trades.length) : 0;
  const consistencyIndex = winRate * (totalProfit > totalLoss ? 1 : 0.5);

  return {
    sortinoRatio,
    informationRatio: 0, // ベンチマークが必要
    treynorRatio: 0, // ベータが必要
    maxConsecutiveLosses,
    profitabilityIndex,
    riskReturnRatio: totalLoss > 0 ? totalProfit / totalLoss : 0,
    consistencyIndex
  };
};

export function MonthlyReport({ currentMonth, refreshTrigger, isDbReady }: MonthlyReportProps) {
  const [reportMonth, setReportMonth] = useState<Date>(currentMonth);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = useCallback(async () => {
    if (!isDbReady) return;
    
    setIsLoading(true);
    try {
      const year = reportMonth.getFullYear();
      const month = reportMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const trades = await db.getTradesByDateRange(startDate, endDate);
      
      // 損益確定取引のみフィルタリング
      const profitTrades = trades.filter(trade => 
        trade.tradeType === '売却' || 
        trade.tradeType === '現物売' ||
        trade.tradeType === '返済買' || 
        trade.tradeType === '返済売'
      );

      if (profitTrades.length === 0) {
        setStats(null);
        return;
      }

      // 基本統計
      const profits = profitTrades.filter(t => t.realizedProfitLoss > 0);
      const losses = profitTrades.filter(t => t.realizedProfitLoss < 0);
      const totalProfit = profits.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.realizedProfitLoss, 0));
      const netProfit = totalProfit - totalLoss;
      
      // 現物・信用別統計
      const spotTrades = profitTrades.filter(t => t.tradeType === '売却' || t.tradeType === '現物売');
      const marginTrades = profitTrades.filter(t => t.tradeType === '返済買' || t.tradeType === '返済売');
      
      const spotProfits = spotTrades.filter(t => t.realizedProfitLoss > 0);
      const spotLosses = spotTrades.filter(t => t.realizedProfitLoss < 0);
      const marginProfits = marginTrades.filter(t => t.realizedProfitLoss > 0);
      const marginLosses = marginTrades.filter(t => t.realizedProfitLoss < 0);

      // 日別統計
      const dailyProfits = new Map<string, number>();
      profitTrades.forEach(trade => {
        const dateKey = trade.date.toISOString().split('T')[0];
        dailyProfits.set(dateKey, (dailyProfits.get(dateKey) || 0) + trade.realizedProfitLoss);
      });

      const dailyValues = Array.from(dailyProfits.values());
      const profitableDays = dailyValues.filter(p => p > 0).length;
      const lossDays = dailyValues.filter(p => p < 0).length;
      const breakEvenDays = dailyValues.filter(p => p === 0).length;

      const monthlyStats: MonthlyStats = {
        totalProfit,
        totalLoss,
        netProfit,
        winCount: profits.length,
        lossCount: losses.length,
        totalTrades: profitTrades.length,
        winRate: profitTrades.length > 0 ? (profits.length / profitTrades.length) * 100 : 0,
        avgWin: profits.length > 0 ? totalProfit / profits.length : 0,
        avgLoss: losses.length > 0 ? totalLoss / losses.length : 0,
        maxWin: profits.length > 0 ? Math.max(...profits.map(t => t.realizedProfitLoss)) : 0,
        maxLoss: losses.length > 0 ? Math.max(...losses.map(t => Math.abs(t.realizedProfitLoss))) : 0,
        profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
        spotStats: {
          totalProfit: spotProfits.reduce((sum, t) => sum + t.realizedProfitLoss, 0),
          totalLoss: Math.abs(spotLosses.reduce((sum, t) => sum + t.realizedProfitLoss, 0)),
          netProfit: spotTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0),
          tradeCount: spotTrades.length,
          winCount: spotProfits.length,
          lossCount: spotLosses.length,
        },
        marginStats: {
          totalProfit: marginProfits.reduce((sum, t) => sum + t.realizedProfitLoss, 0),
          totalLoss: Math.abs(marginLosses.reduce((sum, t) => sum + t.realizedProfitLoss, 0)),
          netProfit: marginTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0),
          tradeCount: marginTrades.length,
          winCount: marginProfits.length,
          lossCount: marginLosses.length,
        },
        dailyStats: {
          profitableDays,
          lossDays,
          breakEvenDays,
          bestDay: dailyValues.length > 0 ? Math.max(...dailyValues) : 0,
          worstDay: dailyValues.length > 0 ? Math.min(...dailyValues) : 0,
          avgDailyProfit: dailyValues.length > 0 ? dailyValues.reduce((sum, p) => sum + p, 0) / dailyValues.length : 0,
        },
        // 高度な分析機能
        riskAnalysis: calculateRiskAnalysis(dailyValues),
        streakAnalysis: calculateStreakAnalysis(profitTrades),
        stockAnalysis: calculateStockAnalysis(profitTrades),
        trendAnalysis: calculateTrendAnalysis(profitTrades, dailyProfits),
        advancedMetrics: calculateAdvancedMetrics(profitTrades, dailyValues)
      };

      setStats(monthlyStats);
    } catch (error) {
      console.error('月別統計の計算エラー:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [reportMonth, isDbReady]);

  useEffect(() => {
    calculateStats();
  }, [reportMonth, refreshTrigger, calculateStats]);

  // 初期表示時に現在の月を設定
  useEffect(() => {
    setReportMonth(currentMonth);
  }, [currentMonth]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ja-JP');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const goToPreviousMonth = () => {
    setReportMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setReportMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };


  if (isLoading) {
    return (
      <div className="monthly-report loading">
        <p>統計データを計算中...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="monthly-report">
        <div className="report-header">
          <div className="month-navigation">
            <button 
              className="nav-button prev"
              onClick={goToPreviousMonth}
              aria-label="前の月"
            >
              ←
            </button>
            <h2>{formatMonthYear(reportMonth)}の取引レポート</h2>
            <button 
              className="nav-button next"
              onClick={goToNextMonth}
              aria-label="次の月"
            >
              →
            </button>
          </div>
        </div>
        <div className="no-data">
          <p>この月の取引データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-report">
      <div className="report-header">
        <div className="month-navigation">
          <button 
            className="nav-button prev"
            onClick={goToPreviousMonth}
            aria-label="前の月"
          >
            ←
          </button>
          <h2>{formatMonthYear(reportMonth)}の取引レポート</h2>
          <button 
            className="nav-button next"
            onClick={goToNextMonth}
            aria-label="次の月"
          >
            →
          </button>
        </div>
      </div>

      {/* 概要統計 */}
      <div className="stats-section">
        <h3>概要</h3>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-label">純損益</div>
            <div className={`stat-value ${stats.netProfit >= 0 ? 'profit' : 'loss'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}円
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">総利益</div>
            <div className="stat-value profit">+{formatCurrency(stats.totalProfit)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">総損失</div>
            <div className="stat-value loss">-{formatCurrency(stats.totalLoss)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">総取引数</div>
            <div className="stat-value">{stats.totalTrades}回</div>
          </div>
        </div>
      </div>

      {/* 勝敗統計 */}
      <div className="stats-section">
        <h3>勝敗統計</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">勝率</div>
            <div className="stat-value">{formatPercentage(stats.winRate)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">勝ち取引</div>
            <div className="stat-value profit">{stats.winCount}回</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">負け取引</div>
            <div className="stat-value loss">{stats.lossCount}回</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">プロフィットファクター</div>
            <div className="stat-value">
              {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 平均値統計 */}
      <div className="stats-section">
        <h3>平均値</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">平均利益</div>
            <div className="stat-value profit">+{formatCurrency(stats.avgWin)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">平均損失</div>
            <div className="stat-value loss">-{formatCurrency(stats.avgLoss)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最大利益</div>
            <div className="stat-value profit">+{formatCurrency(stats.maxWin)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最大損失</div>
            <div className="stat-value loss">-{formatCurrency(stats.maxLoss)}円</div>
          </div>
        </div>
      </div>

      {/* 取引種別統計 */}
      <div className="stats-section">
        <h3>取引種別別統計</h3>
        <div className="trade-type-stats">
          <div className="trade-type-card">
            <h4>現物取引</h4>
            <div className="stats-grid small">
              <div className="stat-item">
                <span className="label">純損益</span>
                <span className={`value ${stats.spotStats.netProfit >= 0 ? 'profit' : 'loss'}`}>
                  {stats.spotStats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.spotStats.netProfit)}円
                </span>
              </div>
              <div className="stat-item">
                <span className="label">取引数</span>
                <span className="value">{stats.spotStats.tradeCount}回</span>
              </div>
              <div className="stat-item">
                <span className="label">勝率</span>
                <span className="value">
                  {stats.spotStats.tradeCount > 0 ? formatPercentage((stats.spotStats.winCount / stats.spotStats.tradeCount) * 100) : '0%'}
                </span>
              </div>
            </div>
          </div>
          <div className="trade-type-card">
            <h4>信用取引</h4>
            <div className="stats-grid small">
              <div className="stat-item">
                <span className="label">純損益</span>
                <span className={`value ${stats.marginStats.netProfit >= 0 ? 'profit' : 'loss'}`}>
                  {stats.marginStats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.marginStats.netProfit)}円
                </span>
              </div>
              <div className="stat-item">
                <span className="label">取引数</span>
                <span className="value">{stats.marginStats.tradeCount}回</span>
              </div>
              <div className="stat-item">
                <span className="label">勝率</span>
                <span className="value">
                  {stats.marginStats.tradeCount > 0 ? formatPercentage((stats.marginStats.winCount / stats.marginStats.tradeCount) * 100) : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日別統計 */}
      <div className="stats-section">
        <h3>日別統計</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">利益の日</div>
            <div className="stat-value profit">{stats.dailyStats.profitableDays}日</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">損失の日</div>
            <div className="stat-value loss">{stats.dailyStats.lossDays}日</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最高日</div>
            <div className="stat-value profit">+{formatCurrency(stats.dailyStats.bestDay)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最低日</div>
            <div className="stat-value loss">{formatCurrency(stats.dailyStats.worstDay)}円</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">日平均</div>
            <div className={`stat-value ${stats.dailyStats.avgDailyProfit >= 0 ? 'profit' : 'loss'}`}>
              {stats.dailyStats.avgDailyProfit >= 0 ? '+' : ''}{formatCurrency(stats.dailyStats.avgDailyProfit)}円
            </div>
          </div>
        </div>
      </div>

      {/* リスク分析 */}
      <div className="stats-section">
        <h3>🎯 リスク分析</h3>
        <div className="stats-grid">
          <Tooltip content={TOOLTIPS.maxDrawdown}>
            <div className="stat-card">
              <div className="stat-label">最大ドローダウン</div>
              <div className="stat-value loss">-{formatCurrency(stats.riskAnalysis.maxDrawdown)}円</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.maxDrawdownPercent}>
            <div className="stat-card">
              <div className="stat-label">DD率</div>
              <div className="stat-value loss">{stats.riskAnalysis.maxDrawdownPercent.toFixed(1)}%</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.sharpeRatio}>
            <div className="stat-card">
              <div className="stat-label">シャープレシオ</div>
              <div className="stat-value">{stats.riskAnalysis.sharpeRatio.toFixed(3)}</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.var95}>
            <div className="stat-card">
              <div className="stat-label">VaR(95%)</div>
              <div className="stat-value loss">{formatCurrency(stats.riskAnalysis.valueAtRisk95)}円</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.volatility}>
            <div className="stat-card">
              <div className="stat-label">ボラティリティ</div>
              <div className="stat-value">{formatCurrency(stats.riskAnalysis.volatility)}円</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.recoveryFactor}>
            <div className="stat-card">
              <div className="stat-label">リカバリーファクター</div>
              <div className="stat-value">{stats.riskAnalysis.recoveryFactor.toFixed(2)}</div>
            </div>
          </Tooltip>
        </div>
      </div>


      {/* 連勝・連敗分析 */}
      <div className="stats-section">
        <h3>🔥 ストリーク分析</h3>
        <div className="stats-grid">
          <Tooltip content={TOOLTIPS.currentStreak}>
            <div className="stat-card highlight">
              <div className="stat-label">現在のストリーク</div>
              <div className={`stat-value ${stats.streakAnalysis.currentStreakType === 'win' ? 'profit' : stats.streakAnalysis.currentStreakType === 'loss' ? 'loss' : ''}`}>
                {stats.streakAnalysis.currentStreak > 0 ? 
                  `${stats.streakAnalysis.currentStreakType === 'win' ? '連勝' : '連敗'} ${stats.streakAnalysis.currentStreak}日` : 
                  'なし'
                }
              </div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.longestWinStreak}>
            <div className="stat-card">
              <div className="stat-label">最長連勝</div>
              <div className="stat-value profit">{stats.streakAnalysis.longestWinStreak}日</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.longestLossStreak}>
            <div className="stat-card">
              <div className="stat-label">最長連敗</div>
              <div className="stat-value loss">{stats.streakAnalysis.longestLossStreak}日</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.avgWinStreak}>
            <div className="stat-card">
              <div className="stat-label">平均連勝</div>
              <div className="stat-value">{stats.streakAnalysis.avgWinStreak.toFixed(1)}日</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.avgLossStreak}>
            <div className="stat-card">
              <div className="stat-label">平均連敗</div>
              <div className="stat-value">{stats.streakAnalysis.avgLossStreak.toFixed(1)}日</div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 銘柄別分析 */}
      <div className="stats-section">
        <h3>📈 銘柄別分析</h3>
        <div className="trade-type-stats">
          <div className="trade-type-card">
            <h4>トップパフォーマー</h4>
            {stats.stockAnalysis.topPerformers.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{stock.symbol}</span>
                <span className="value profit">+{formatCurrency(stock.profit)}円 ({stock.trades}回)</span>
              </div>
            ))}
          </div>
          <div className="trade-type-card">
            <h4>ワーストパフォーマー</h4>
            {stats.stockAnalysis.worstPerformers.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{stock.symbol}</span>
                <span className="value loss">{formatCurrency(stock.profit)}円 ({stock.trades}回)</span>
              </div>
            ))}
          </div>
          <div className="trade-type-card">
            <h4>最多取引銘柄</h4>
            {stats.stockAnalysis.mostTraded.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{stock.symbol}</span>
                <span className="value">{stock.trades}回 (勝率{formatPercentage(stock.winRate)})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* トレンド分析 */}
      <div className="stats-section">
        <h3>📊 トレンド分析</h3>
        <div className="trade-type-stats">
          <div className="trade-type-card">
            <h4>週別パフォーマンス</h4>
            {stats.trendAnalysis.weeklyTrend.map((week, index) => (
              <div key={index} className="stat-item">
                <span className="label">第{week.week}週</span>
                <span className={`value ${week.profit >= 0 ? 'profit' : 'loss'}`}>
                  {week.profit >= 0 ? '+' : ''}{formatCurrency(week.profit)}円 ({week.trades}回)
                </span>
              </div>
            ))}
          </div>
          <div className="trade-type-card">
            <h4>曜日別パフォーマンス</h4>
            {stats.trendAnalysis.performanceByDay.map((day, index) => (
              <div key={index} className="stat-item">
                <span className="label">{day.day}曜日</span>
                <span className={`value ${day.profit >= 0 ? 'profit' : 'loss'}`}>
                  {day.profit >= 0 ? '+' : ''}{formatCurrency(day.profit)}円 (勝率{formatPercentage(day.winRate)})
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">モメンタム指標</div>
            <div className={`stat-value ${stats.trendAnalysis.momentumIndicator >= 0 ? 'profit' : 'loss'}`}>
              {stats.trendAnalysis.momentumIndicator >= 0 ? '↗️ 上昇' : '↘️ 下降'} 
              ({formatCurrency(Math.abs(stats.trendAnalysis.momentumIndicator))}円)
            </div>
          </div>
        </div>
      </div>

      {/* 高度な指標 */}
      <div className="stats-section">
        <h3>🧮 高度な指標</h3>
        <div className="stats-grid">
          <Tooltip content={TOOLTIPS.sortinoRatio}>
            <div className="stat-card">
              <div className="stat-label">ソルティノレシオ</div>
              <div className="stat-value">{stats.advancedMetrics.sortinoRatio.toFixed(3)}</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.maxConsecutiveLosses}>
            <div className="stat-card">
              <div className="stat-label">最大連続損失</div>
              <div className="stat-value loss">{stats.advancedMetrics.maxConsecutiveLosses}回</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.profitabilityIndex}>
            <div className="stat-card">
              <div className="stat-label">収益性指数</div>
              <div className="stat-value">{stats.advancedMetrics.profitabilityIndex.toFixed(2)}</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.consistencyIndex}>
            <div className="stat-card">
              <div className="stat-label">一貫性指標</div>
              <div className="stat-value">{formatPercentage(stats.advancedMetrics.consistencyIndex * 100)}</div>
            </div>
          </Tooltip>
          <Tooltip content={TOOLTIPS.riskReturnRatio}>
            <div className="stat-card">
              <div className="stat-label">リスクリターン比</div>
              <div className="stat-value">{stats.advancedMetrics.riskReturnRatio.toFixed(2)}</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}