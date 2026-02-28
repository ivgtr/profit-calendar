import { useState, useEffect, useCallback, memo } from 'react';
import { useMonthlyStats } from '../../../hooks/useMonthlyStats';

import { formatCurrency, formatMonthYear } from '../../../utils/formatUtils';
import { BasicMetricsSection } from './MonthlyReport/BasicMetricsSection';
import { RiskAnalysisSection } from './MonthlyReport/RiskAnalysisSection';
import { StockAnalysisSection } from './MonthlyReport/StockAnalysisSection';
import { TrendAnalysisSection } from './MonthlyReport/TrendAnalysisSection';
import { AIAnalysisSection } from './MonthlyReport/AIAnalysisSection';
import { Tooltip } from '../../ui/feedback/Tooltip';
import { Button } from '../../ui/base/Button';
import './MonthlyReport.css';

interface MonthlyReportProps {
  currentMonth: Date;
  refreshTrigger: number;
  isDbReady: boolean;
}

const MonthlyReport = memo(function MonthlyReport({ currentMonth, refreshTrigger, isDbReady }: MonthlyReportProps) {
  const [reportMonth, setReportMonth] = useState<Date>(currentMonth);
  const { stats, isLoading, error } = useMonthlyStats(reportMonth, refreshTrigger, isDbReady);

  // 初期表示時に現在の月を設定
  useEffect(() => {
    setReportMonth(currentMonth);
  }, [currentMonth]);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const handlePrevMonth = useCallback(() => {
    setReportMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setReportMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    setReportMonth(currentMonth);
  }, [currentMonth]);

  if (isLoading) {
    return (
      <div className="monthly-report loading">
        <p>統計データを計算中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monthly-report error">
        <p>エラー: {error}</p>
        <Button onClick={() => window.location.reload()} variant="primary" size="medium">
          再試行
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="monthly-report">
        <div className="report-header">
          <div className="month-navigation">
            <Button
              className="month-nav-button prev"
              onClick={handlePrevMonth}
              aria-label="前の月"
              variant="secondary"
              size="small"
              icon="←"
              iconOnly
            />
            <h2 className="report-title">
              {formatMonthYear(reportMonth)}の取引レポート
            </h2>
            <Button
              className="month-nav-button next"
              onClick={handleNextMonth}
              aria-label="次の月"
              variant="secondary"
              size="small"
              icon="→"
              iconOnly
            />
          </div>
          {reportMonth.getTime() !== currentMonth.getTime() && (
            <Button onClick={resetToCurrentMonth} className="current-month-button" variant="outline" size="small">
              現在の月に戻る
            </Button>
          )}
        </div>
        
        <div className="no-data">
          <p>{formatMonthYear(reportMonth)}の取引データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-report">
      <div className="report-header">
        <div className="month-navigation">
          <Button
            className="month-nav-button prev"
            onClick={handlePrevMonth}
            aria-label="前の月"
            variant="secondary"
            size="small"
            icon="←"
            iconOnly
          />
          <h2 className="report-title">
            {formatMonthYear(reportMonth)}の取引レポート
          </h2>
          <Button
            className="month-nav-button next"
            onClick={handleNextMonth}
            aria-label="次の月"
            variant="secondary"
            size="small"
            icon="→"
            iconOnly
          />
        </div>
        {reportMonth.getTime() !== currentMonth.getTime() && (
          <Button onClick={resetToCurrentMonth} className="current-month-button" variant="outline" size="small">
            現在の月に戻る
          </Button>
        )}
      </div>

      {/* 概要統計 */}
      <div className="stats-section">
        <h3>概要</h3>
        <div className="stats-grid">
          <Tooltip content="すべての取引の総合的な損益を表します。プラスの場合は利益、マイナスの場合は損失を意味します。">
            <div className="stat-card highlight">
              <div className="stat-label">純損益</div>
              <div className={`stat-value ${stats.netProfit >= 0 ? 'stat-profit' : 'stat-loss'}`}>
                {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}円
              </div>
            </div>
          </Tooltip>
          <Tooltip content="利益が出た取引の合計金額です。損失は含まれません。">
            <div className="stat-card">
              <div className="stat-label">総利益</div>
              <div className="stat-value stat-profit">+{formatCurrency(stats.totalProfit)}円</div>
            </div>
          </Tooltip>
          <Tooltip content="損失が出た取引の合計金額です。利益は含まれません。">
            <div className="stat-card">
              <div className="stat-label">総損失</div>
              <div className="stat-value stat-loss">-{formatCurrency(stats.totalLoss)}円</div>
            </div>
          </Tooltip>
          <Tooltip content="この月に行われた全ての取引の回数です。">
            <div className="stat-card">
              <div className="stat-label">総取引数</div>
              <div className="stat-value">{stats.trades.length}回</div>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="report-content">
        <BasicMetricsSection
          profitFactor={stats.advancedMetrics.profitFactor}
          winRate={stats.advancedMetrics.winRate}
          avgWin={stats.advancedMetrics.avgWin}
          avgLoss={stats.advancedMetrics.avgLoss}
          maxWin={stats.advancedMetrics.maxWin}
          maxLoss={stats.advancedMetrics.maxLoss}
          winCount={stats.trades.filter(t => t.realizedProfitLoss > 0).length}
          lossCount={stats.trades.filter(t => t.realizedProfitLoss < 0).length}
        />

        <RiskAnalysisSection
          riskAnalysis={stats.riskAnalysis}
        />

        <StockAnalysisSection
          stockAnalysis={stats.stockAnalysis}
        />

        <TrendAnalysisSection
          trendAnalysis={stats.trendAnalysis}
        />

        {/* 連勝・連敗分析 */}
        <div className="stats-section">
          <h3>🔥 ストリーク分析</h3>
          <div className="stats-grid">
            <Tooltip content="現在進行中の連勝または連敗の日数です。最新の取引日から遡って計算されます。">
              <div className="stat-card highlight">
                <div className="stat-label">現在のストリーク</div>
                <div className={`stat-value ${stats.streakAnalysis.currentStreakType === 'win' ? 'stat-profit' : stats.streakAnalysis.currentStreakType === 'loss' ? 'stat-loss' : ''}`}>
                  {stats.streakAnalysis.currentStreak > 0 ? 
                    `${stats.streakAnalysis.currentStreakType === 'win' ? '連勝' : '連敗'} ${stats.streakAnalysis.currentStreak}日` : 
                    'なし'
                  }
                </div>
              </div>
            </Tooltip>
            <Tooltip content="この月で最も長く続いた連勝の日数です。">
              <div className="stat-card">
                <div className="stat-label">最長連勝</div>
                <div className="stat-value stat-profit">{stats.streakAnalysis.longestWinStreak}日</div>
              </div>
            </Tooltip>
            <Tooltip content="この月で最も長く続いた連敗の日数です。">
              <div className="stat-card">
                <div className="stat-label">最長連敗</div>
                <div className="stat-value stat-loss">{stats.streakAnalysis.longestLossStreak}日</div>
              </div>
            </Tooltip>
            <Tooltip content="連勝期間の平均日数です。安定した勝ちパターンの指標となります。">
              <div className="stat-card">
                <div className="stat-label">平均連勝</div>
                <div className="stat-value">{stats.streakAnalysis.avgWinStreak.toFixed(1)}日</div>
              </div>
            </Tooltip>
            <Tooltip content="連敗期間の平均日数です。リスク管理の参考指標となります。">
              <div className="stat-card">
                <div className="stat-label">平均連敗</div>
                <div className="stat-value">{stats.streakAnalysis.avgLossStreak.toFixed(1)}日</div>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* 日次統計 */}
        <div className="stats-section">
          <h3>📊 日次統計</h3>
          <div className="stats-grid">
            <Tooltip content="この月で最も収益が高かった日の損益金額です。">
              <div className="stat-card">
                <div className="stat-label">最高収益日</div>
                <div className="stat-value stat-profit">+{formatCurrency(stats.advancedMetrics.dailyStats.bestDay)}円</div>
              </div>
            </Tooltip>
            <Tooltip content="この月で最も損失が大きかった日の損益金額です。">
              <div className="stat-card">
                <div className="stat-label">最低収益日</div>
                <div className="stat-value stat-loss">{formatCurrency(stats.advancedMetrics.dailyStats.worstDay)}円</div>
              </div>
            </Tooltip>
            <Tooltip content="取引を行った日の平均的な損益です。日々のパフォーマンスの安定性を表します。">
              <div className="stat-card">
                <div className="stat-label">平均日次収益</div>
                <div className={`stat-value ${stats.advancedMetrics.dailyStats.avgDailyProfit >= 0 ? 'stat-profit' : 'stat-loss'}`}>
                  {formatCurrency(stats.advancedMetrics.dailyStats.avgDailyProfit)}円
                </div>
              </div>
            </Tooltip>
            <Tooltip content="1日あたりに行う取引の平均回数です。取引頻度の指標となります。">
              <div className="stat-card">
                <div className="stat-label">1日平均取引数</div>
                <div className="stat-value">{stats.advancedMetrics.avgTradesPerDay.toFixed(1)}回</div>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* 高度な指標 */}
        <div className="stats-section">
          <h3>🧮 高度な指標</h3>
          <div className="stats-grid">
            <Tooltip content="下振れリスク（負のリターン）に対する超過収益率を測る指標です。高いほど効率的にリスクを取っています。">
              <div className="stat-card">
                <div className="stat-label">ソルティノレシオ</div>
                <div className="stat-value">{stats.advancedMetrics.sortinoRatio.toFixed(3)}</div>
              </div>
            </Tooltip>
            <Tooltip content="連続して損失を出した取引の最大回数です。メンタル面での耐久力の指標となります。">
              <div className="stat-card">
                <div className="stat-label">最大連続損失</div>
                <div className="stat-value stat-loss">{stats.advancedMetrics.maxConsecutiveLosses}回</div>
              </div>
            </Tooltip>
            <Tooltip content="投資効率を示す指標です。1.0以上であれば投資が有効的であることを示します。">
              <div className="stat-card">
                <div className="stat-label">収益性指数</div>
                <div className="stat-value">{stats.advancedMetrics.profitabilityIndex.toFixed(2)}</div>
              </div>
            </Tooltip>
            <Tooltip content="取引成果の安定性を示します。100%に近いほど一貫した結果を出せています。">
              <div className="stat-card">
                <div className="stat-label">一貫性指標</div>
                <div className="stat-value">{formatPercentage(stats.advancedMetrics.consistencyIndex)}</div>
              </div>
            </Tooltip>
            <Tooltip content="取ったリスクに対してどれだけのリターンが得られたかを示します。高いほど効率的です。">
              <div className="stat-card">
                <div className="stat-label">リスクリターン比</div>
                <div className="stat-value">{stats.advancedMetrics.riskReturnRatio.toFixed(2)}</div>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* AI分析セクション */}
        <AIAnalysisSection stats={stats} reportMonth={reportMonth} />
      </div>
    </div>
  );
});

export { MonthlyReport };
