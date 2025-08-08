import { useState, useCallback } from 'react';
import { HeaderAction } from '../types/HeaderActions';
import { ModalType } from './useModalManager';

interface UseTradeHandlersProps {
  selectedDate: Date | null;
  loadDailyTrades: (date: Date) => void;
  setDataVersion: (fn: (prev: number) => number) => void;
  setSelectedDate: (date: Date | null) => void;
  setCurrentMonth: (date: Date) => void;
  closeModal: () => void;
  openModal: (modalId: ModalType) => void;
  handleOpenTradeForm: () => void;
}

export function useTradeHandlers({
  selectedDate,
  loadDailyTrades,
  setDataVersion,
  setSelectedDate,
  setCurrentMonth,
  closeModal,
  openModal,
  handleOpenTradeForm
}: UseTradeHandlersProps) {
  // 日別内訳の表示/非表示状態管理
  const [isDailyBreakdownExpanded, setIsDailyBreakdownExpanded] = useState(false);

  // 日付選択ハンドラー
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    loadDailyTrades(date);
  }, [setSelectedDate, loadDailyTrades]);

  // 月変更ハンドラー
  const handleMonthChange = useCallback((date: Date) => {
    setCurrentMonth(date);
  }, [setCurrentMonth]);

  // データ更新の共通処理
  const handleDataUpdate = useCallback(() => {
    // データが変更されたことを通知
    setDataVersion(prev => prev + 1);
    // カレンダーをリフレッシュ
    if (selectedDate) {
      loadDailyTrades(selectedDate);
    }
    // モーダルを閉じる
    closeModal();
  }, [selectedDate, loadDailyTrades, setDataVersion, closeModal]);

  // インポート完了ハンドラー
  const handleImportComplete = useCallback(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  // 履歴更新ハンドラー
  const handleHistoryUpdate = useCallback(() => {
    // データが変更されたことを通知
    setDataVersion(prev => prev + 1);
    // カレンダーをリフレッシュ
    if (selectedDate) {
      loadDailyTrades(selectedDate);
    }
  }, [selectedDate, loadDailyTrades, setDataVersion]);

  // 一括削除完了ハンドラー
  const handleBulkDeleteComplete = useCallback(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);


  // Header アクションハンドラー
  const handleHeaderAction = useCallback((action: HeaderAction) => {
    switch (action.type) {
      case 'OPEN_IMPORT_MODAL':
        openModal('import');
        break;
      case 'OPEN_HISTORY_MODAL':
        openModal('history');
        break;
      case 'OPEN_TRADE_FORM_MODAL':
        handleOpenTradeForm();
        break;
      case 'OPEN_BULK_DELETE_MODAL':
        openModal('bulkDelete');
        break;
      case 'OPEN_MONTHLY_REPORT_MODAL':
        openModal('monthlyReport');
        break;
      case 'OPEN_YEARLY_CHART_MODAL':
        openModal('yearlyChart');
        break;
      case 'OPEN_THEME_SETTINGS_MODAL':
        openModal('themeSettings');
        break;
      case 'OPEN_USER_GUIDE_MODAL':
        openModal('userGuide');
        break;
      case 'OPEN_BACKUP_RESTORE_MODAL':
        openModal('backupRestore');
        break;
      case 'OPEN_TERMS_MODAL':
        openModal('terms');
        break;
      case 'OPEN_PRIVACY_MODAL':
        openModal('privacy');
        break;
      case 'OPEN_DISCLAIMER_MODAL':
        openModal('disclaimer');
        break;
      default:
        console.warn('Unknown header action:', action.type);
    }
  }, [openModal, handleOpenTradeForm]);

  // 日別内訳トグル
  const toggleDailyBreakdown = useCallback(() => {
    setIsDailyBreakdownExpanded(prev => !prev);
  }, []);

  return {
    isDailyBreakdownExpanded,
    handleDateSelect,
    handleMonthChange,
    handleImportComplete,
    handleHistoryUpdate,
    handleBulkDeleteComplete,
    handleHeaderAction,
    toggleDailyBreakdown
  };
}