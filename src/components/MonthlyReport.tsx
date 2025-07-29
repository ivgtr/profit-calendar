import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
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
}

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
        }
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
    </div>
  );
}