import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Database } from '../services/database';
import { StockTop3 } from './StockTop3';
import '../styles/YearlyChart.css';

// Chart.jsのコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearlyChartProps {
  databaseService: Database;
  isDbReady: boolean;
}

type PeriodType = '7days' | '30days' | '12months';

interface ChartDataItem {
  label: string;
  totalProfit: number;
  spotProfit: number;
  marginProfit: number;
  tradeCount: number;
}

export function YearlyChart({ databaseService, isDbReady }: YearlyChartProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [chartDataItems, setChartDataItems] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('12months');

  // データを読み込み
  const loadData = async () => {
    if (!isDbReady) return;
    
    setIsLoading(true);
    try {
      if (periodType === '12months') {
        // 月別データ
        const monthlyData = await databaseService.getYearlyMonthlyProfits(currentYear);
        const items: ChartDataItem[] = monthlyData.map((d: any) => ({
          label: `${d.month}月`,
          totalProfit: d.totalProfit,
          spotProfit: d.spotProfit,
          marginProfit: d.marginProfit,
          tradeCount: d.tradeCount
        }));
        setChartDataItems(items);
      } else {
        // 日別データ
        const days = periodType === '7days' ? 7 : 30;
        const dailyData = await databaseService.getDailyProfits(days);
        const items: ChartDataItem[] = dailyData.map((d: any) => ({
          label: `${d.date.getMonth() + 1}/${d.date.getDate()}`,
          totalProfit: d.totalProfit,
          spotProfit: d.spotProfit,
          marginProfit: d.marginProfit,
          tradeCount: d.tradeCount
        }));
        setChartDataItems(items);
      }
    } catch (error) {
      console.error('データの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentYear, periodType, isDbReady, databaseService]);

  // グラフデータを生成
  const chartData = useMemo(() => {
    return {
      labels: chartDataItems.map(item => item.label),
      datasets: [{
        data: chartDataItems.map(item => item.totalProfit),
        backgroundColor: chartDataItems.map(item => 
          item.totalProfit >= 0 ? 'rgba(52, 144, 220, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: chartDataItems.map(item => 
          item.totalProfit >= 0 ? 'rgb(52, 144, 220)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 0,
        borderRadius: 4,
      }],
    };
  }, [chartDataItems]);

  // グラフオプション
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            const value = context.parsed.y;
            const formatted = value.toLocaleString('ja-JP');
            return `${value >= 0 ? '+' : ''}${formatted}円`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        border: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#999',
          font: {
            size: 11,
          },
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  // 合計投資額と合計回収額を計算
  const totalInvestment = chartDataItems.reduce((sum, item) => {
    return sum + (item.totalProfit < 0 ? Math.abs(item.totalProfit) : 0);
  }, 0);

  const totalReturn = chartDataItems.reduce((sum, item) => {
    return sum + (item.totalProfit > 0 ? item.totalProfit : 0);
  }, 0);

  const netProfit = chartDataItems.reduce((sum, item) => sum + item.totalProfit, 0);

  const getPeriodLabel = () => {
    switch (periodType) {
      case '7days':
        return '過去7日間';
      case '30days':
        return '過去30日間';
      case '12months':
        return `${currentYear}年`;
      default:
        return '';
    }
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
  };

  return (
    <div className="yearly-chart-container">
      <div className="chart-header-section">
        <div className="chart-title">
          <h2>チャート</h2>
          <span className="period-label">{getPeriodLabel()}</span>
        </div>

        <div className="period-selector">
          <button
            className={`period-button ${periodType === '7days' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('7days')}
          >
            過去7日間
          </button>
          <button
            className={`period-button ${periodType === '30days' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('30days')}
          >
            過去30日間
          </button>
          <button
            className={`period-button ${periodType === '12months' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('12months')}
          >
            過去12か月間
          </button>
        </div>
      </div>

      <div className="chart-content">
        <div className="profit-summary">
          <div className="profit-label">収支</div>
          <div className={`profit-amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('ja-JP')}
          </div>
        </div>

        <div className="chart-wrapper">
          {isLoading ? (
            <div className="loading">読み込み中...</div>
          ) : chartDataItems.length === 0 ? (
            <div className="no-data">データがありません</div>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>

        <div className="investment-summary">
          <div className="summary-row">
            <span className="summary-label">合計投資</span>
            <span className="summary-value negative">¥{totalInvestment.toLocaleString('ja-JP')}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">合計回収</span>
            <span className="summary-value positive">¥{totalReturn.toLocaleString('ja-JP')}</span>
          </div>
          
          <div className="summary-bars">
            <div className="bar-wrapper">
              <div 
                className="bar investment-bar" 
                style={{ width: '100%' }}
              />
            </div>
            <div className="bar-wrapper">
              <div 
                className="bar return-bar" 
                style={{ width: totalInvestment > 0 ? `${(totalReturn / totalInvestment) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <StockTop3 
        databaseService={databaseService}
        isDbReady={isDbReady}
        periodType={periodType}
        currentYear={currentYear}
      />

      {periodType === '12months' && (
        <div className="year-navigation">
          <button onClick={() => setCurrentYear(prev => prev - 1)} className="year-nav-button">
            ← {currentYear - 1}年
          </button>
          <button onClick={() => setCurrentYear(prev => prev + 1)} className="year-nav-button">
            {currentYear + 1}年 →
          </button>
        </div>
      )}
    </div>
  );
}