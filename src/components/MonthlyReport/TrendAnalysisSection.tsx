import React from 'react';
import { formatCurrency } from '../../utils/formatUtils';
import { TrendAnalysis } from '../../utils/statisticsUtils';
import { Tooltip } from '../Tooltip';

interface TrendAnalysisSectionProps {
  trendAnalysis: TrendAnalysis;
}

export const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  trendAnalysis
}) => {
  return (
    <div className="stats-section">
      <h3>📊 トレンド分析</h3>
      <div className="trade-type-stats">
        <div className="trade-type-card">
          <h4>週別パフォーマンス</h4>
          {trendAnalysis.weeklyTrend.map((week, index) => (
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
          {trendAnalysis.performanceByDay.map((day, index) => (
            <div key={index} className="stat-item">
              <span className="label">{day.day}曜日</span>
              <span className={`value ${day.profit >= 0 ? 'profit' : 'loss'}`}>
                {day.profit >= 0 ? '+' : ''}{formatCurrency(day.profit)}円 (勝率{(day.winRate * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="stats-grid">
        <Tooltip content="最近の取引傾向を示す指標です。上昇は改善傾向、下降は悪化傾向を意味します。">
          <div className="stat-card">
            <div className="stat-label">モメンタム指標</div>
            <div className={`stat-value ${trendAnalysis.momentumIndicator >= 0 ? 'stat-profit' : 'stat-loss'}`}>
              {trendAnalysis.momentumIndicator >= 0 ? '↗️ 上昇' : '↘️ 下降'} 
              ({formatCurrency(Math.abs(trendAnalysis.momentumIndicator))}円)
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};