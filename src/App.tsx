import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/ui/layout/Header';
import { ModalManager } from './components/ModalManager';
import { Calendar } from './components/features/calendar/Calendar';
import { MonthlyProfit } from './components/features/analytics/MonthlyProfit';
import { DailyTradesSection } from './components/features/trade/DailyTrades/DailyTradesSection';
import { useMonthlyTrades } from './hooks/useMonthlyTrades';
import { useTradeListModal } from './hooks/useTradeListModal';
import { db, Database } from './services/database';
import { Trade } from './types/Trade';
import { useModalManager } from './hooks/useModalManager';
import { useTradeCRUD } from './hooks/useTradeCRUD';
import { useTradeHandlers } from './hooks/useTradeHandlers';
import { UIProvider, useUI } from './contexts/UIContext';
import './styles/App.css';

function AppInner() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyTrades, setDailyTrades] = useState<Trade[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dataVersion, setDataVersion] = useState(0);
  
  // UIContext hooks
  const { showAlert } = useUI();
  
  // Database クラスのインスタンスを作成
  const [databaseService] = useState(() => new Database());
  
  // 月間取引データをフックで管理（データベース初期化後のみ）
  const { monthlyTrades, isLoading: isCalendarLoading } = useMonthlyTrades(
    currentMonth, 
    dataVersion, 
    isDbReady
  );
  
  // モーダル状態管理（統一化）
  const { openModal, closeModal, isModalOpen } = useModalManager();

  // データベースの初期化
  useEffect(() => {
    const initDb = async () => {
      try {
        await db.init();
        await databaseService.init();
        setIsDbReady(true);
      } catch (error) {
        console.error('データベース初期化エラー:', error);
        showAlert('データベースの初期化に失敗しました');
      }
    };
    initDb();
  }, [databaseService, showAlert]);

  // 選択された日付の取引を読み込み（メモ化）
  const loadDailyTrades = useCallback(async (date: Date) => {
    try {
      const trades = await db.getTradesByDate(date);
      setDailyTrades(trades);
    } catch (error) {
      console.error('取引データ読み込みエラー:', error);
    }
  }, []);

  // 取引フォーム操作ロジック
  const {
    editingTrade,
    handleOpenTradeForm,
    handleSaveTrade,
    handleDeleteTrade
  } = useTradeCRUD({
    selectedDate,
    loadDailyTrades,
    setDataVersion,
    closeModal,
    openModal
  });

  // 日次取引一覧モーダル管理
  const { showTradesForDate } = useTradeListModal();

  // 日次breakdown-itemクリック処理
  const handleDailyTradeTypeClick = useCallback(async (type: 'spot' | 'margin' | 'unknown', label: string) => {
    if (selectedDate) {
      await showTradesForDate(selectedDate, type, label);
    }
  }, [selectedDate, showTradesForDate]);

  // イベントハンドラー
  const {
    isDailyBreakdownExpanded,
    handleDateSelect,
    handleMonthChange,
    handleImportComplete,
    handleBulkDeleteComplete,
    handleHeaderAction,
    toggleDailyBreakdown
  } = useTradeHandlers({
    selectedDate,
    loadDailyTrades,
    setDataVersion,
    setSelectedDate,
    setCurrentMonth,
    closeModal,
    openModal,
    handleOpenTradeForm
  });

  if (!isDbReady) {
    return (
      <div className="loading">
        <p>データベースを初期化中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onAction={handleHeaderAction} />

      <main className="app-main">
        <MonthlyProfit currentMonth={currentMonth} refreshTrigger={dataVersion} isDbReady={isDbReady} />
        
        <section className="calendar-section">
          <h2>取引カレンダー</h2>
          <Calendar 
            onDateSelect={handleDateSelect} 
            onMonthChange={handleMonthChange}
            monthlyTrades={monthlyTrades}
            isLoading={isCalendarLoading}
          />
        </section>

        <DailyTradesSection
          selectedDate={selectedDate}
          dailyTrades={dailyTrades}
          isDailyBreakdownExpanded={isDailyBreakdownExpanded}
          onToggleDailyBreakdown={toggleDailyBreakdown}
          onAddTrade={(date) => handleOpenTradeForm(undefined, date)}
          onEditTrade={(trade) => handleOpenTradeForm(trade)}
          onTradeTypeClick={handleDailyTradeTypeClick}
        />
      </main>

      <ModalManager
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        editingTrade={editingTrade}
        currentMonth={currentMonth}
        refreshTrigger={dataVersion}
        isDbReady={isDbReady}
        databaseService={databaseService}
        onImportComplete={handleImportComplete}
        onTradeSave={handleSaveTrade}
        onTradeDelete={handleDeleteTrade}
        onBulkDeleteComplete={handleBulkDeleteComplete}
      />
    </div>
  );
}

function App() {
  return (
    <UIProvider>
      <AppInner />
    </UIProvider>
  );
}

export default App;