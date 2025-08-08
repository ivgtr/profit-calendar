import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { CSVImporter } from './components/CSVImporter';
import { Calendar } from './components/Calendar';
import { ImportHistoryList } from './components/ImportHistoryList';
import TradeForm from './components/TradeForm';
import { BulkDeleteTrades } from './components/BulkDeleteTrades';
import { MonthlyProfit } from './components/MonthlyProfit';
import { DailyTradesSection } from './components/DailyTradesSection';
import { MonthlyReport } from './components/MonthlyReport';
import { YearlyChart } from './components/YearlyChart';
import { ThemeSettings } from './components/ThemeSettings';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Disclaimer } from './components/Disclaimer';
import { UserGuide } from './components/UserGuide';
import { BackupRestore } from './components/BackupRestore';
import { useMonthlyTrades } from './hooks/useMonthlyTrades';
import { useTradeListModal } from './hooks/useTradeListModal';
import { TradeListModal } from './components/TradeListModal';
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

  // CRUD操作ロジック
  const {
    editingTrade,
    handleOpenTradeForm,
    handleSaveTrade,
    handleDeleteTrade,
    handleCancelTradeForm
  } = useTradeCRUD({
    selectedDate,
    loadDailyTrades,
    setDataVersion,
    closeModal,
    openModal
  });

  // 日次取引一覧モーダル管理
  const {
    modalTrades: dailyModalTrades,
    modalTitle: dailyModalTitle,
    isModalOpen: isDailyModalOpen,
    modalFilterType: dailyModalFilterType,
    showTradesForDate,
    closeModal: closeDailyModal
  } = useTradeListModal();

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
    handleHistoryUpdate,
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

      {/* CSVインポートモーダル */}
      <Modal
        isOpen={isModalOpen('import')}
        onClose={closeModal}
        title="CSVインポート"
        size="medium"
      >
        <CSVImporter onImportComplete={handleImportComplete} />
      </Modal>

      {/* インポート履歴モーダル */}
      <Modal
        isOpen={isModalOpen('history')}
        onClose={closeModal}
        title="CSVインポート履歴"
        size="large"
      >
        <ImportHistoryList onHistoryUpdate={handleHistoryUpdate} />
      </Modal>

      {/* 取引入力・編集モーダル */}
      <Modal
        isOpen={isModalOpen('tradeForm')}
        onClose={handleCancelTradeForm}
        title={editingTrade && editingTrade.id ? '取引を編集' : '取引を追加'}
        size="large"
      >
        <TradeForm
          trade={editingTrade}
          onSave={handleSaveTrade}
          onCancel={handleCancelTradeForm}
          onDelete={handleDeleteTrade}
        />
      </Modal>

      {/* 一括削除モーダル */}
      <Modal
        isOpen={isModalOpen('bulkDelete')}
        onClose={closeModal}
        title="取引の一括削除"
        size="medium"
      >
        <BulkDeleteTrades onComplete={handleBulkDeleteComplete} />
      </Modal>

      {/* 月別レポートモーダル */}
      <Modal
        isOpen={isModalOpen('monthlyReport')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <MonthlyReport 
          currentMonth={currentMonth} 
          refreshTrigger={dataVersion} 
          isDbReady={isDbReady} 
        />
      </Modal>

      {/* 年間推移グラフモーダル */}
      <Modal
        isOpen={isModalOpen('yearlyChart')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <YearlyChart 
          databaseService={databaseService}
          isDbReady={isDbReady} 
        />
      </Modal>

      {/* テーマ設定モーダル */}
      <Modal
        isOpen={isModalOpen('themeSettings')}
        onClose={closeModal}
        title=""
        size="medium"
      >
        <ThemeSettings />
      </Modal>

      {/* 使い方ガイドモーダル */}
      <Modal
        isOpen={isModalOpen('userGuide')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <UserGuide />
      </Modal>

      {/* 利用規約モーダル */}
      <Modal
        isOpen={isModalOpen('terms')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <TermsOfService />
      </Modal>

      {/* プライバシーポリシーモーダル */}
      <Modal
        isOpen={isModalOpen('privacy')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <PrivacyPolicy />
      </Modal>

      {/* 免責事項モーダル */}
      <Modal
        isOpen={isModalOpen('disclaimer')}
        onClose={closeModal}
        title=""
        size="large"
      >
        <Disclaimer />
      </Modal>

      {/* バックアップ・復元モーダル */}
      <Modal
        isOpen={isModalOpen('backupRestore')}
        onClose={closeModal}
        title="📦 データバックアップ・復元"
        size="large"
      >
        <BackupRestore />
      </Modal>

      {/* 日次取引一覧モーダル */}
      <TradeListModal
        trades={dailyModalTrades}
        isOpen={isDailyModalOpen}
        onClose={closeDailyModal}
        title={dailyModalTitle}
        filterType={dailyModalFilterType}
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