import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/database';

export type PeriodType = '12months' | '3months' | '6months';

export interface ChartDataItem {
  label: string;
  netProfit: number;
  color: string;
  trades: number;
}

export interface UseYearlyChartProps {
  isDbReady: boolean;
}

export function useYearlyChart({ isDbReady }: UseYearlyChartProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [chartDataItems, setChartDataItems] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('12months');

  // データ取得とチャート生成
  useEffect(() => {
    if (!isDbReady) return;

    const loadChartData = async () => {
      setIsLoading(true);
      
      try {
        const trades = await db.getAllTrades();
        
        // 期間に応じてデータをフィルタリング

        const startDate = new Date(currentYear, 0, 1); // 1月1日
        let endDate = new Date(currentYear + 1, 0, 1); // 翌年1月1日

        // 期間タイプに応じて終了日を調整
        if (periodType === '3months') {
          endDate = new Date(currentYear, 3, 1); // 4月1日
        } else if (periodType === '6months') {
          endDate = new Date(currentYear, 6, 1); // 7月1日
        }

        const filteredTrades = trades.filter(trade => 
          trade.date >= startDate && trade.date < endDate
        );

        // 月別にデータをグループ化
        const monthlyData = new Map<number, { profit: number; trades: number }>();
        
        filteredTrades.forEach(trade => {
          const month = trade.date.getMonth();
          const existing = monthlyData.get(month) || { profit: 0, trades: 0 };
          
          monthlyData.set(month, {
            profit: existing.profit + trade.realizedProfitLoss,
            trades: existing.trades + 1
          });
        });

        // チャートデータアイテムを生成
        const months = periodType === '3months' ? 3 : periodType === '6months' ? 6 : 12;
        const items: ChartDataItem[] = [];
        
        for (let i = 0; i < months; i++) {
          const data = monthlyData.get(i) || { profit: 0, trades: 0 };
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('ja-JP', { 
            month: 'short' 
          });
          
          items.push({
            label: monthName,
            netProfit: data.profit,
            color: data.profit >= 0 ? '#22c55e' : '#ef4444',
            trades: data.trades
          });
        }

        setChartDataItems(items);
        
      } catch (error) {
        console.error('Failed to load chart data:', error);
        setChartDataItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [isDbReady, currentYear, periodType]);

  // チャートオプション生成
  const chartOptions = useMemo(() => {
    const maxProfit = Math.max(...chartDataItems.map(item => item.netProfit), 0);
    const minProfit = Math.min(...chartDataItems.map(item => item.netProfit), 0);
    const range = maxProfit - minProfit;
    const padding = range * 0.1;

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: minProfit - padding,
          max: maxProfit + padding,
          ticks: {
            callback: (value: any) => {
              const numValue = typeof value === 'number' ? value : Number(value);
              return numValue >= 0 ? `+¥${numValue.toLocaleString()}` : `-¥${Math.abs(numValue).toLocaleString()}`;
            }
          },
          grid: {
            color: (context: any) => {
              return context.tick.value === 0 ? '#374151' : '#e5e7eb';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const profit = context.raw;
              const item = chartDataItems[context.dataIndex];
              return [
                `損益: ${profit >= 0 ? '+' : ''}¥${profit.toLocaleString()}`,
                `取引数: ${item.trades}件`
              ];
            }
          }
        }
      }
    };
  }, [chartDataItems]);

  // チャートデータ
  const chartData = useMemo(() => ({
    labels: chartDataItems.map(item => item.label),
    datasets: [{
      label: '月次損益',
      data: chartDataItems.map(item => item.netProfit),
      backgroundColor: chartDataItems.map(item => item.color),
      borderColor: chartDataItems.map(item => item.color),
      borderWidth: 1,
    }]
  }), [chartDataItems]);

  // 統計データ
  const statistics = useMemo(() => {
    const totalProfit = chartDataItems.reduce((sum, item) => sum + item.netProfit, 0);
    const totalTrades = chartDataItems.reduce((sum, item) => sum + item.trades, 0);
    const profitableMonths = chartDataItems.filter(item => item.netProfit > 0).length;
    const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

    return {
      totalProfit,
      totalTrades,
      profitableMonths,
      totalMonths: chartDataItems.length,
      averageProfit,
      winRate: chartDataItems.length > 0 ? (profitableMonths / chartDataItems.length) * 100 : 0
    };
  }, [chartDataItems]);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const handlePeriodChange = (period: PeriodType) => {
    setPeriodType(period);
  };

  return {
    // State
    currentYear,
    chartDataItems,
    isLoading,
    periodType,
    chartOptions,
    chartData,
    statistics,
    
    // Actions
    handleYearChange,
    handlePeriodChange,
  };
}