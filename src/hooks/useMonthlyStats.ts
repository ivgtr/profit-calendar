import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { Trade } from '../types/Trade';
import { 
  calculateRiskAnalysis,
  calculateStreakAnalysis, 
  calculateStockAnalysis,
  calculateTrendAnalysis,
  calculateAdvancedMetrics,
  type RiskAnalysis,
  type StreakAnalysis,
  type StockAnalysis,
  type TrendAnalysis,
  type AdvancedMetrics
} from '../utils/statisticsUtils';

/**
 * 月次統計データの型定義
 */
export interface MonthlyStatsData {
  // 基本データ
  trades: Trade[];
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  
  // 詳細統計
  advancedMetrics: AdvancedMetrics;
  riskAnalysis: RiskAnalysis;
  streakAnalysis: StreakAnalysis;
  stockAnalysis: StockAnalysis;
  trendAnalysis: TrendAnalysis;
}

/**
 * 月次統計データ管理のカスタムフック
 * MonthlyReportコンポーネント用の統計データを一元管理
 */
export const useMonthlyStats = (
  reportMonth: Date,
  refreshTrigger: number,
  isDbReady: boolean
) => {
  const [stats, setStats] = useState<MonthlyStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 統計データを計算
   */
  const calculateStats = useCallback(async () => {
    if (!isDbReady) return;

    setIsLoading(true);
    setError(null);

    try {
      // 指定月の取引データを取得
      const startDate = new Date(reportMonth.getFullYear(), reportMonth.getMonth(), 1);
      const endDate = new Date(reportMonth.getFullYear(), reportMonth.getMonth() + 1, 0);
      
      const trades = await db.getTradesByDateRange(startDate, endDate);
      
      if (trades.length === 0) {
        setStats(null);
        return;
      }

      // 基本計算
      const totalProfit = trades
        .filter(trade => trade.realizedProfitLoss > 0)
        .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0);

      const totalLoss = Math.abs(trades
        .filter(trade => trade.realizedProfitLoss < 0)
        .reduce((sum, trade) => sum + trade.realizedProfitLoss, 0));

      const netProfit = totalProfit - totalLoss;

      // 日別損益マップを作成
      const dailyProfitMap = new Map<string, number>();
      trades.forEach(trade => {
        const dateKey = trade.date.toISOString().split('T')[0];
        const currentProfit = dailyProfitMap.get(dateKey) || 0;
        dailyProfitMap.set(dateKey, currentProfit + trade.realizedProfitLoss);
      });

      const dailyProfits = Array.from(dailyProfitMap.values());

      // 各種統計を計算
      const advancedMetrics = calculateAdvancedMetrics(trades, dailyProfits);
      const riskAnalysis = calculateRiskAnalysis(dailyProfits);
      const streakAnalysis = calculateStreakAnalysis(trades);
      const stockAnalysis = calculateStockAnalysis(trades);
      const trendAnalysis = calculateTrendAnalysis(trades, dailyProfitMap);

      const statsData: MonthlyStatsData = {
        trades,
        totalProfit,
        totalLoss,
        netProfit,
        advancedMetrics,
        riskAnalysis,
        streakAnalysis,
        stockAnalysis,
        trendAnalysis
      };

      setStats(statsData);

    } catch (err) {
      console.error('統計計算エラー:', err);
      setError('統計データの計算に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [reportMonth, isDbReady]);

  // データ更新の監視
  useEffect(() => {
    calculateStats();
  }, [calculateStats, refreshTrigger]);

  /**
   * 統計データの再計算を手動でトリガー
   */
  const refreshStats = useCallback(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
};