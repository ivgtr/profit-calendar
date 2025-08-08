import { useState, useCallback } from 'react';
import { Trade } from '../types/Trade';
import { db } from '../services/database';

export type TradeFilterType = 'spot' | 'margin' | 'unknown';

export interface UseTradeListModalReturn {
  modalTrades: Trade[];
  modalTitle: string;
  isModalOpen: boolean;
  modalFilterType?: TradeFilterType;
  showTradesForMonth: (month: Date, filterType: TradeFilterType, label: string) => Promise<void>;
  showTradesForDate: (date: Date, filterType: TradeFilterType, label: string) => Promise<void>;
  closeModal: () => void;
}

const getTradeCategory = (tradeType: string | null): TradeFilterType => {
  if (!tradeType) return 'unknown';
  
  if (tradeType === '現物売' || tradeType === '現物買' || 
      tradeType === '売却' || tradeType === '購入') {
    return 'spot';
  }
  
  if (tradeType === '返済売' || tradeType === '返済買' || tradeType === '買付') {
    return 'margin';
  }
  
  return 'unknown';
};

const filterTradesByType = (trades: Trade[], filterType: TradeFilterType): Trade[] => {
  return trades.filter(trade => {
    if (trade.realizedProfitLoss === 0) return false;
    
    const category = getTradeCategory(trade.tradeType);
    return category === filterType;
  });
};

export function useTradeListModal(): UseTradeListModalReturn {
  const [modalTrades, setModalTrades] = useState<Trade[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilterType, setModalFilterType] = useState<TradeFilterType | undefined>(undefined);

  const showTradesForMonth = useCallback(async (month: Date, filterType: TradeFilterType, label: string) => {
    try {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      
      const trades = await db.getTradesByDateRange(firstDay, lastDay);
      const filteredTrades = filterTradesByType(trades, filterType);
      
      setModalTrades(filteredTrades);
      setModalFilterType(filterType);
      setModalTitle(`${year}年${monthIndex + 1}月の${label}取引一覧`);
      setIsModalOpen(true);
    } catch (error) {
      console.error('取引データの読み込みエラー:', error);
      setModalTrades([]);
    }
  }, []);

  const showTradesForDate = useCallback(async (date: Date, filterType: TradeFilterType, label: string) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const trades = await db.getTradesByDateRange(startOfDay, endOfDay);
      const filteredTrades = filterTradesByType(trades, filterType);
      
      setModalTrades(filteredTrades);
      setModalFilterType(filterType);
      setModalTitle(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日の${label}取引一覧`);
      setIsModalOpen(true);
    } catch (error) {
      console.error('取引データの読み込みエラー:', error);
      setModalTrades([]);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalTrades([]);
    setModalTitle('');
    setModalFilterType(undefined);
  }, []);

  return {
    modalTrades,
    modalTitle,
    isModalOpen,
    modalFilterType,
    showTradesForMonth,
    showTradesForDate,
    closeModal
  };
}