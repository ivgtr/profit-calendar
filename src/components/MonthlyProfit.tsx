import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { formatCurrency, formatMonthYear } from '../utils/formatUtils';
import '../styles/MonthlyProfit.css';

interface MonthlyProfitProps {
  currentMonth: Date;
  refreshTrigger: number;
  isDbReady: boolean;
}

interface MonthlyData {
  totalProfit: number;
  tradeCount: number;
  spotProfit: number;
  marginProfit: number;
}

export function MonthlyProfit({ currentMonth, refreshTrigger, isDbReady }: MonthlyProfitProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const loadMonthlyData = useCallback(async () => {
    if (!isDbReady) return;
    
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await db.getMonthlyProfit(year, month);
      setMonthlyData(data);
    } catch (error) {
      console.error('月間収益の読み込みエラー:', error);
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, isDbReady]);

  useEffect(() => {
    loadMonthlyData();
  }, [currentMonth, refreshTrigger, loadMonthlyData]);


  const toggleMobileExpanded = () => {
    setIsMobileExpanded(!isMobileExpanded);
  };


  if (isLoading) {
    return (
      <div className="monthly-profit loading">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!monthlyData) {
    return (
      <div className="monthly-profit">
        <div className="profit-container" onClick={toggleMobileExpanded}>
          <div className="monthly-summary">
            <div className="summary-header">
              <h3>{formatMonthYear(currentMonth)}の収益</h3>
              <div className="mobile-toggle">
                <span className="expand-icon">{isMobileExpanded ? '▼' : '▶'}</span>
              </div>
            </div>
            <div className="profit-amount">
              <span className="profit-value">データなし</span>
            </div>
          </div>
          
          <div className="trade-breakdown desktop-breakdown">
            <div className="breakdown-list">
              <div className="breakdown-item">
                <div className="breakdown-label">現物</div>
                <div className="breakdown-profit">0円</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">信用</div>
                <div className="breakdown-profit">0円</div>
              </div>
            </div>
          </div>
        </div>
        
        {isMobileExpanded && (
          <div className="trade-breakdown mobile-breakdown">
            <div className="breakdown-list">
              <div className="breakdown-item">
                <div className="breakdown-label">現物取引</div>
                <div className="breakdown-profit">0円</div>
              </div>
              <div className="breakdown-item">
                <div className="breakdown-label">信用取引</div>
                <div className="breakdown-profit">0円</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="monthly-profit">
      <div className="profit-container" onClick={toggleMobileExpanded}>
        <div className="monthly-summary">
          <div className="summary-header">
            <h3>{formatMonthYear(currentMonth)}の収益</h3>
            <div className="mobile-toggle">
              <span className="expand-icon">{isMobileExpanded ? '▼' : '▶'}</span>
            </div>
          </div>
          <div className="profit-amount">
            <span className={`profit-value ${monthlyData.totalProfit >= 0 ? 'profit' : 'loss'}`}>
              {monthlyData.totalProfit >= 0 ? '+' : ''}
              {formatCurrency(monthlyData.totalProfit)}円
            </span>
            <span className="trade-count">({monthlyData.tradeCount}件)</span>
          </div>
        </div>
        
        <div className="trade-breakdown desktop-breakdown">
          <div className="breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-label">現物</div>
              <div className={`breakdown-profit ${monthlyData.spotProfit >= 0 ? 'profit' : 'loss'}`}>
                {monthlyData.spotProfit >= 0 ? '+' : ''}
                {formatCurrency(monthlyData.spotProfit)}円
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">信用</div>
              <div className={`breakdown-profit ${monthlyData.marginProfit >= 0 ? 'profit' : 'loss'}`}>
                {monthlyData.marginProfit >= 0 ? '+' : ''}
                {formatCurrency(monthlyData.marginProfit)}円
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isMobileExpanded && (
        <div className="trade-breakdown mobile-breakdown">
          <div className="breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-label">現物取引</div>
              <div className={`breakdown-profit ${monthlyData.spotProfit >= 0 ? 'profit' : 'loss'}`}>
                {monthlyData.spotProfit >= 0 ? '+' : ''}
                {formatCurrency(monthlyData.spotProfit)}円
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">信用取引</div>
              <div className={`breakdown-profit ${monthlyData.marginProfit >= 0 ? 'profit' : 'loss'}`}>
                {monthlyData.marginProfit >= 0 ? '+' : ''}
                {formatCurrency(monthlyData.marginProfit)}円
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}