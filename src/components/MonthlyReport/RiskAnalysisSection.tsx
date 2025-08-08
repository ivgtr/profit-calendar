import React, { memo } from 'react';
import { formatCurrency } from '../../utils/formatUtils';
import { RiskAnalysis } from '../../utils/statisticsUtils';
import { Tooltip } from '../Tooltip';

interface RiskAnalysisSectionProps {
  riskAnalysis: RiskAnalysis;
}

const RiskAnalysisSection: React.FC<RiskAnalysisSectionProps> = memo(({
  riskAnalysis
}) => {
  return (
    <div className="stats-section">
      <h3>🎯 リスク分析</h3>
      <div className="stats-grid">
        <Tooltip content="資産価値の最大の落ち込み幅です。この期間で最も資産が減少した時の金額を示します。">
          <div className="stat-card">
            <div className="stat-label">最大ドローダウン</div>
            <div className="stat-value stat-loss">-{formatCurrency(riskAnalysis.maxDrawdown)}円</div>
          </div>
        </Tooltip>
        <Tooltip content="最大ドローダウンを初期資産に対する割合で表したものです。リスクの大きさを測る指標です。">
          <div className="stat-card">
            <div className="stat-label">DD率</div>
            <div className="stat-value stat-loss">{riskAnalysis.maxDrawdownPercent.toFixed(1)}%</div>
          </div>
        </Tooltip>
        <Tooltip content="リスク（標準偏差）に対する超過収益率の比率です。高いほどリスクに見合ったリターンが得られています。">
          <div className="stat-card">
            <div className="stat-label">シャープレシオ</div>
            <div className="stat-value">{riskAnalysis.sharpeRatio.toFixed(3)}</div>
          </div>
        </Tooltip>
        <Tooltip content="95%の確率で1日に発生しうる最大損失額です。リスク管理の目安となります。">
          <div className="stat-card">
            <div className="stat-label">VaR(95%)</div>
            <div className="stat-value stat-loss">{formatCurrency(riskAnalysis.valueAtRisk95)}円</div>
          </div>
        </Tooltip>
        <Tooltip content="年間収益率を最大ドローダウンで割った値です。効率的にリスクを取れているかの指標です。">
          <div className="stat-card">
            <div className="stat-label">カルマーレシオ</div>
            <div className="stat-value">{riskAnalysis.calmarRatio.toFixed(2)}</div>
          </div>
        </Tooltip>
        <Tooltip content="収益の変動の激しさを表します。高いほど不安定で、低いほど安定した取引を行っています。">
          <div className="stat-card">
            <div className="stat-label">ボラティリティ</div>
            <div className="stat-value">{formatCurrency(riskAnalysis.volatility)}円</div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
});

export { RiskAnalysisSection };