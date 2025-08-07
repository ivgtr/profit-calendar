import React from 'react';
import { formatCurrency } from '../../utils/formatUtils';
import { Tooltip } from '../Tooltip';

interface BasicMetricsSectionProps {
  profitFactor: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  maxWin: number;
  maxLoss: number;
  winCount: number;
  lossCount: number;
}

export const BasicMetricsSection: React.FC<BasicMetricsSectionProps> = ({
  profitFactor,
  winRate,
  avgWin,
  avgLoss,
  maxWin,
  maxLoss,
  winCount,
  lossCount
}) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <>
      {/* 勝敗統計 */}
      <div className="stats-section">
        <h3>勝敗統計</h3>
        <div className="stats-grid">
          <Tooltip content="利益が出た取引の割合です。高いほど勝ちやすい手法であることを示します。">
            <div className="stat-card">
              <div className="stat-label">勝率</div>
              <div className="stat-value">{formatPercentage(winRate)}</div>
            </div>
          </Tooltip>
          <Tooltip content="利益が出た取引の回数です。">
            <div className="stat-card">
              <div className="stat-label">勝ち取引</div>
              <div className="stat-value stat-profit">{winCount}回</div>
            </div>
          </Tooltip>
          <Tooltip content="損失が出た取引の回数です。">
            <div className="stat-card">
              <div className="stat-label">負け取引</div>
              <div className="stat-value stat-loss">{lossCount}回</div>
            </div>
          </Tooltip>
          <Tooltip content="総利益を総損失で割った値です。1.0以上であれば利益が出ています。">
            <div className="stat-card">
              <div className="stat-label">プロフィットファクター</div>
              <div className="stat-value">
                {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 平均値 */}
      <div className="stats-section">
        <h3>平均値</h3>
        <div className="stats-grid">
          <Tooltip content="勝った取引の平均利益額です。取引スタイルの効率性を表します。">
            <div className="stat-card">
              <div className="stat-label">平均利益</div>
              <div className="stat-value stat-profit">+{formatCurrency(avgWin)}円</div>
            </div>
          </Tooltip>
          <Tooltip content="負けた取引の平均損失額です。リスク管理の目安となります。">
            <div className="stat-card">
              <div className="stat-label">平均損失</div>
              <div className="stat-value stat-loss">-{formatCurrency(Math.abs(avgLoss))}円</div>
            </div>
          </Tooltip>
          <Tooltip content="この月で最も大きかった利益の金額です。">
            <div className="stat-card">
              <div className="stat-label">最大利益</div>
              <div className="stat-value stat-profit">+{formatCurrency(maxWin)}円</div>
            </div>
          </Tooltip>
          <Tooltip content="この月で最も大きかった損失の金額です。リスク管理の参考になります。">
            <div className="stat-card">
              <div className="stat-label">最大損失</div>
              <div className="stat-value stat-loss">-{formatCurrency(Math.abs(maxLoss))}円</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </>
  );
};