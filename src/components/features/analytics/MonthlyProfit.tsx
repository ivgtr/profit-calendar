import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../services/database';
import { formatMonthYear } from '../../../utils/formatUtils';
import { TradeListModal } from '../trade/TradeListModal';
import { useTradeListModal } from '../../../hooks/useTradeListModal';
import { useProfitBreakdown } from '../../../hooks/useProfitBreakdown';
import { TradeBreakdown } from '../trade/TradeBreakdown/TradeBreakdown';
import { ProfitSummaryHeader } from '../trade/TradeBreakdown/ProfitSummaryHeader';
import './MonthlyProfit.css';

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

  // 共通フックでbreakdown項目を管理
  const { breakdownItems, hasBreakdown } = useProfitBreakdown(
    monthlyData ? {
      spotProfit: monthlyData.spotProfit,
      marginProfit: monthlyData.marginProfit,
      unknownProfit: monthlyData.unknownProfit
    } : {
      spotProfit: 0,
      marginProfit: 0,
      unknownProfit: 0
    }
  );

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
          <ProfitSummaryHeader
            title={`${formatMonthYear(currentMonth)}の収益`}
            totalProfit={0}
            tradeCount={0}
            hasBreakdown={false}
            isExpanded={false}
            summaryClassName="monthly-summary"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="monthly-profit">
        <div className="profit-container" onClick={hasBreakdown ? toggleMobileExpanded : undefined}>
          <ProfitSummaryHeader
            title={`${formatMonthYear(currentMonth)}の収益`}
            totalProfit={monthlyData.totalProfit}
            tradeCount={monthlyData.tradeCount}
            hasBreakdown={hasBreakdown}
            isExpanded={isMobileExpanded}
            summaryClassName="monthly-summary"
          />
          
          <TradeBreakdown
            breakdownItems={breakdownItems}
            onTradeTypeClick={handleTradeTypeClick}
            isDesktop={true}
          />
        </div>
        
        <TradeBreakdown
          breakdownItems={breakdownItems}
          onTradeTypeClick={handleTradeTypeClick}
          isDesktop={false}
          showMobileBreakdown={hasBreakdown && isMobileExpanded}
        />
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