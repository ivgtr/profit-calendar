import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { DailySummary } from '../types/Trade';

export function useMonthlyTrades(currentMonth: Date, dataVersion: number, isDbReady: boolean) {
  const [monthlyTrades, setMonthlyTrades] = useState<Map<string, DailySummary>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // 月の初日と最終日を取得
  const getMonthRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // 月間の取引データを読み込み
  const loadMonthlyTrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const { firstDay, lastDay } = getMonthRange(currentMonth);
      const trades = await db.getTradesByDateRange(firstDay, lastDay);
      
      // 日別に集計
      const dailySummaryMap = new Map<string, DailySummary>();
      
      trades.forEach(trade => {
        // 損益確定する取引のみを処理（現物売却、信用返済）
        const isProfitRealized = trade.tradeType === '売却' || 
                                 trade.tradeType === '現物売' ||
                                 trade.tradeType === '返済買' || 
                                 trade.tradeType === '返済売';
        
        if (!isProfitRealized) return;
        
        const dateKey = trade.date.toISOString().split('T')[0];
        
        if (!dailySummaryMap.has(dateKey)) {
          dailySummaryMap.set(dateKey, {
            date: new Date(trade.date),
            totalProfit: 0,
            totalLoss: 0,
            netProfit: 0,
            tradeCount: 0,
            winCount: 0,
            lossCount: 0,
            winRate: 0,
          });
        }
        
        const summary = dailySummaryMap.get(dateKey)!;
        summary.tradeCount++;
        
        // 損益を累積
        summary.netProfit += trade.realizedProfitLoss;
        
        if (trade.realizedProfitLoss > 0) {
          summary.totalProfit += trade.realizedProfitLoss;
          summary.winCount++;
        } else if (trade.realizedProfitLoss < 0) {
          summary.totalLoss += Math.abs(trade.realizedProfitLoss);
          summary.lossCount++;
        }
        
        summary.winRate = summary.tradeCount > 0 
          ? (summary.winCount / summary.tradeCount) * 100 
          : 0;
      });
      
      setMonthlyTrades(dailySummaryMap);
    } catch (error) {
      console.error('月間取引データの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, dataVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // 月が変更された時またはデータが変更された時に読み込み（データベース初期化後のみ）
  useEffect(() => {
    if (isDbReady) {
      loadMonthlyTrades();
    }
  }, [isDbReady, loadMonthlyTrades]);

  return { monthlyTrades, isLoading, loadMonthlyTrades };
}