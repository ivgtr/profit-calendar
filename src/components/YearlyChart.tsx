import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useYearlyChart, PeriodType } from '../hooks/useYearlyChart';
import '../styles/YearlyChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearlyChartProps {
  isDbReady: boolean;
}

export function YearlyChart({ isDbReady }: YearlyChartProps) {
  const {
    currentYear,
    isLoading,
    periodType,
    chartOptions,
    chartData,
    statistics,
    handleYearChange,
    handlePeriodChange,
  } = useYearlyChart({ isDbReady });

  if (!isDbReady) {
    return <div className="yearly-chart loading">データベースを準備中...</div>;
  }

  const currentYearInt = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYearInt - 4 + i);

  return (
    <div className="yearly-chart">
      <div className="chart-header">
        <h3>📊 年次損益チャート</h3>
        
        <div className="chart-controls">
          <div className="year-selector">
            <label htmlFor="year-select">年:</label>
            <select
              id="year-select"
              value={currentYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              disabled={isLoading}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          <div className="period-selector">
            <label htmlFor="period-select">期間:</label>
            <select
              id="period-select"
              value={periodType}
              onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
              disabled={isLoading}
            >
              <option value="12months">12ヶ月</option>
              <option value="6months">6ヶ月</option>
              <option value="3months">3ヶ月</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="chart-loading">
          <p>データを読み込み中...</p>
        </div>
      ) : (
        <>
          <div className="chart-statistics">
            <div className="stat-item">
              <span className="stat-label">総損益:</span>
              <span className={`stat-value ${statistics.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                {statistics.totalProfit >= 0 ? '+' : ''}¥{statistics.totalProfit.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">総取引数:</span>
              <span className="stat-value">{statistics.totalTrades}件</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">勝率:</span>
              <span className="stat-value">{statistics.winRate.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">平均損益:</span>
              <span className={`stat-value ${statistics.averageProfit >= 0 ? 'profit' : 'loss'}`}>
                {statistics.averageProfit >= 0 ? '+' : ''}¥{Math.round(statistics.averageProfit).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}