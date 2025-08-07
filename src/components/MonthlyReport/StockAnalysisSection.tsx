import React from 'react';
import { formatCurrency } from '../../utils/formatUtils';
import { formatStockDisplay } from '../../utils/stockUtils';
import { StockAnalysis } from '../../utils/statisticsUtils';
import { Tooltip } from '../Tooltip';


interface StockAnalysisSectionProps {
  stockAnalysis: StockAnalysis;
}

export const StockAnalysisSection: React.FC<StockAnalysisSectionProps> = ({
  stockAnalysis
}) => {
  return (
    <div className="stats-section">
      <h3>📈 銘柄別分析</h3>
      <div className="trade-type-stats">
        <Tooltip content="この月で最も利益を上げた銘柄のランキングです。収益性の高い銘柄を確認できます。">
          <div className="trade-type-card">
            <h4>トップパフォーマー</h4>
            {stockAnalysis.topPerformers.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{formatStockDisplay(stock.symbol)}</span>
                <span className="value profit">+{formatCurrency(stock.profit)}円 ({stock.trades}回)</span>
              </div>
            ))}
          </div>
        </Tooltip>
        <Tooltip content="この月で最も損失を出した銘柄のランキングです。リスクの高い銘柄を確認できます。">
          <div className="trade-type-card">
            <h4>ワーストパフォーマー</h4>
            {stockAnalysis.worstPerformers.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{formatStockDisplay(stock.symbol)}</span>
                <span className="value loss">{formatCurrency(stock.profit)}円 ({stock.trades}回)</span>
              </div>
            ))}
          </div>
        </Tooltip>
        <Tooltip content="この月で最も取引回数が多かった銘柄のランキングです。よく取引している銘柄とその勝率を確認できます。">
          <div className="trade-type-card">
            <h4>最多取引銘柄</h4>
            {stockAnalysis.mostTraded.slice(0, 3).map((stock, index) => (
              <div key={index} className="stat-item">
                <span className="label">{formatStockDisplay(stock.symbol)}</span>
                <span className="value">{stock.trades}回 (勝率{(stock.winRate * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};