import { useState, useEffect } from 'react';
import { Database } from '../services/database';
import { formatStockDisplay } from '../utils/stockUtils';
import '../styles/StockTop3.css';

interface StockTop3Props {
  databaseService: Database;
  isDbReady: boolean;
  periodType: '7days' | '30days' | '12months';
  currentYear: number;
}

interface StockProfitData {
  stockCode?: string;
  stockName: string;
  totalProfit: number;
  tradeCount: number;
}

export function StockTop3({ databaseService, isDbReady, periodType, currentYear }: StockTop3Props) {
  const [profitableStocks, setProfitableStocks] = useState<StockProfitData[]>([]);
  const [lossStocks, setLossStocks] = useState<StockProfitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStockData = async () => {
    if (!isDbReady) return;
    
    setIsLoading(true);
    try {
      let startDate: Date;
      let endDate = new Date();
      
      if (periodType === '7days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (periodType === '30days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      } else {
        // 12months - 指定年の全体
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
      }
      
      const stockProfits = await databaseService.getStockProfitsByPeriod(startDate, endDate);
      
      // 利益TOP3と損失TOP3に分ける
      const profitable = stockProfits.filter(stock => stock.totalProfit > 0).slice(0, 3);
      const losses = stockProfits
        .filter(stock => stock.totalProfit < 0)
        .sort((a, b) => a.totalProfit - b.totalProfit) // 損失が大きい順（マイナスが大きい順）
        .slice(0, 3);
      
      setProfitableStocks(profitable);
      setLossStocks(losses);
    } catch (error) {
      console.error('銘柄データの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, [periodType, currentYear, isDbReady, databaseService]);

  if (isLoading) {
    return <div className="stock-top3-loading">読み込み中...</div>;
  }

  if (profitableStocks.length === 0 && lossStocks.length === 0) {
    return <div className="stock-top3-no-data">データがありません</div>;
  }

  const renderStockList = (stocks: StockProfitData[], type: 'profit' | 'loss') => (
    <div className={`stock-list ${type}`}>
      <h4 className="stock-list-title">
        {type === 'profit' ? '🎉 得した銘柄 TOP3' : '💸 損した銘柄 TOP3'}
      </h4>
      {stocks.length === 0 ? (
        <div className="no-stocks">該当する銘柄がありません</div>
      ) : (
        <ul className="stock-items">
          {stocks.map((stock, index) => (
            <li key={stock.stockName} className="stock-item">
              <div className="rank-badge">{index + 1}</div>
              <div className="stock-info">
                <div className="stock-name">
                  {formatStockDisplay(stock.stockName, stock.stockCode)}
                </div>
                <div className="stock-details">
                  <span className={`profit ${type === 'profit' ? 'positive' : 'negative'}`}>
                    {stock.totalProfit >= 0 ? '+' : ''}{stock.totalProfit.toLocaleString('ja-JP')}円
                  </span>
                  <span className="trade-count">{stock.tradeCount}回</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="stock-top3-container">
      <h3 className="section-title">銘柄別ランキング</h3>
      <div className="stock-lists">
        {renderStockList(profitableStocks, 'profit')}
        {renderStockList(lossStocks, 'loss')}
      </div>
    </div>
  );
}