import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import { formatCurrency, formatMonthYear } from '../utils/formatUtils';
import { TradeListModal } from './TradeListModal';
import { useTradeListModal } from '../hooks/useTradeListModal';
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
  unknownProfit: number;
}

export function MonthlyProfit({ currentMonth, refreshTrigger, isDbReady }: MonthlyProfitProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // 共通フックを使用
  const {
    modalTrades,
    modalTitle,
    isModalOpen,
    modalFilterType,
    showTradesForMonth,
    closeModal
  } = useTradeListModal();

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

  const handleTradeTypeClick = useCallback(async (type: 'spot' | 'margin' | 'unknown', label: string) => {
    await showTradesForMonth(currentMonth, type, label);
  }, [currentMonth, showTradesForMonth]);

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
        <div className="profit-container">
          <div className="monthly-summary">
            <div className="summary-header">
              <h3>{formatMonthYear(currentMonth)}の収益</h3>
            </div>
            <div className="profit-amount">
              <span className="profit-value">データなし</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 表示する項目をフィルタリング
  const breakdownItems = [
    { 
      label: '現物', 
      mobileLabel: '現物取引', 
      profit: monthlyData.spotProfit,
      type: 'spot' as const
    },
    { 
      label: '信用', 
      mobileLabel: '信用取引', 
      profit: monthlyData.marginProfit,
      type: 'margin' as const
    },
    { 
      label: '不明', 
      mobileLabel: '不明取引', 
      profit: monthlyData.unknownProfit,
      type: 'unknown' as const
    }
  ].filter(item => item.profit !== 0);
  
  // 内訳が一つもない場合は内訳表示を非表示
  const hasBreakdown = breakdownItems.length > 0;

  return (
    <>
      <div className="monthly-profit">
        <div className="profit-container" onClick={hasBreakdown ? toggleMobileExpanded : undefined}>
          <div className="monthly-summary">
            <div className="summary-header">
              <h3>{formatMonthYear(currentMonth)}の収益</h3>
              {hasBreakdown && (
                <div className="mobile-toggle">
                  <span className="expand-icon">{isMobileExpanded ? '▼' : '▶'}</span>
                </div>
              )}
            </div>
            <div className="profit-amount">
              <span className={`profit-value ${monthlyData.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                {monthlyData.totalProfit >= 0 ? '+' : ''}
                {formatCurrency(monthlyData.totalProfit)}円
              </span>
              <span className="trade-count">({monthlyData.tradeCount}件)</span>
            </div>
          </div>
          
          {hasBreakdown && (
            <div className="trade-breakdown desktop-breakdown">
              <div className="breakdown-list">
                {breakdownItems.map(item => (
                  <div 
                    key={item.label} 
                    className="breakdown-item clickable"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTradeTypeClick(item.type, item.label);
                    }}
                    title={`${item.label}取引の詳細を表示`}
                  >
                    <div className="breakdown-label">{item.label}</div>
                    <div className={`breakdown-profit ${item.profit >= 0 ? 'profit' : 'loss'}`}>
                      {item.profit >= 0 ? '+' : ''}
                      {formatCurrency(item.profit)}円
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {hasBreakdown && isMobileExpanded && (
          <div className="trade-breakdown mobile-breakdown">
            <div className="breakdown-list">
              {breakdownItems.map(item => (
                <div 
                  key={item.mobileLabel} 
                  className="breakdown-item clickable"
                  onClick={() => handleTradeTypeClick(item.type, item.label)}
                  title={`${item.label}取引の詳細を表示`}
                >
                  <div className="breakdown-label">{item.mobileLabel}</div>
                  <div className={`breakdown-profit ${item.profit >= 0 ? 'profit' : 'loss'}`}>
                    {item.profit >= 0 ? '+' : ''}
                    {formatCurrency(item.profit)}円
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <TradeListModal
        trades={modalTrades}
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        filterType={modalFilterType}
      />
    </>
  );
}