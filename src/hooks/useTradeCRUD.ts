import { useState, useCallback } from 'react';
import { db } from '../services/database';
import { Trade } from '../types/Trade';
import { ModalType } from './useModalManager';
import { useUI } from '../contexts/UIContext';

interface UseTradeCRUDProps {
  selectedDate: Date | null;
  loadDailyTrades: (date: Date) => void;
  setDataVersion: (fn: (prev: number) => number) => void;
  closeModal: () => void;
  openModal: (modalId: ModalType) => void;
}

export function useTradeCRUD({
  selectedDate,
  loadDailyTrades,
  setDataVersion,
  closeModal,
  openModal
}: UseTradeCRUDProps) {
  const { showAlert, showConfirm, showToast } = useUI();
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);

  // 取引フォーム開く処理
  const handleOpenTradeForm = useCallback((trade?: Trade, defaultDate?: Date) => {
    setEditingTrade(trade);
    // 新規作成時にデフォルト日付を設定
    if (!trade && defaultDate) {
      setEditingTrade({
        id: '',
        date: defaultDate,
        accountType: 'NISA',
        stockName: '',
        tradeType: '現物買',
        quantity: 0,
        amount: 0,
        unitPrice: 0,
        averageAcquisitionPrice: 0,
        realizedProfitLoss: 0,
        csvImported: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Trade);
    }
    openModal('tradeForm');
  }, [openModal]);

  // 取引保存処理
  const handleSaveTrade = useCallback(async (trade: Trade) => {
    try {
      if (editingTrade && editingTrade.id) {
        // 編集
        await db.updateTrade(trade);
      } else {
        // 新規追加
        await db.addTrade(trade);
      }
      
      // データが変更されたことを通知
      setDataVersion(prev => prev + 1);
      // UIを更新
      if (selectedDate) {
        loadDailyTrades(selectedDate);
      }
            
      // モーダルを閉じる
      closeModal();
      setEditingTrade(undefined);
      showToast('取引を保存しました', 'success');
    } catch (error) {
      console.error('取引の保存エラー:', error);
      showAlert('取引の保存に失敗しました');
    }
  }, [editingTrade, selectedDate, loadDailyTrades, setDataVersion, closeModal, showToast, showAlert]);

  // 取引削除処理
  const handleDeleteTrade = useCallback(async (tradeId: string) => {
    const confirmed = await showConfirm({
      message: 'この取引を削除しますか？',
      confirmText: '削除',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    try {
      await db.deleteTrade(tradeId);
      
      // データが変更されたことを通知
      setDataVersion(prev => prev + 1);
      // UIを更新
      if (selectedDate) {
        loadDailyTrades(selectedDate);
      }
      
      // モーダルを閉じる
      closeModal();
      setEditingTrade(undefined);
      showToast('取引を削除しました', 'success');
    } catch (error) {
      console.error('取引の削除エラー:', error);
      showAlert('取引の削除に失敗しました');
    }
  }, [selectedDate, loadDailyTrades, setDataVersion, closeModal, showConfirm, showAlert, showToast]);

  // 取引フォームキャンセル処理
  const handleCancelTradeForm = useCallback(() => {
    closeModal();
    setEditingTrade(undefined);
  }, [closeModal]);

  return {
    editingTrade,
    handleOpenTradeForm,
    handleSaveTrade,
    handleDeleteTrade,
    handleCancelTradeForm
  };
}