import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { CSVImporter } from './components/CSVImporter';
import { Calendar } from './components/Calendar';
import { ImportHistoryList } from './components/ImportHistoryList';
import { TradeForm } from './components/TradeForm';
import { BulkDeleteTrades } from './components/BulkDeleteTrades';
import { MonthlyProfit } from './components/MonthlyProfit';
import { MonthlyReport } from './components/MonthlyReport';
import { YearlyChart } from './components/YearlyChart';
import { ThemeSettings } from './components/ThemeSettings';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Disclaimer } from './components/Disclaimer';
import { UserGuide } from './components/UserGuide';
import { BackupRestore } from './components/BackupRestore';
import { useMonthlyTrades } from './hooks/useMonthlyTrades';
import { db } from './services/database';
import { Trade } from './types/Trade';
import { formatCurrency } from './utils/formatUtils';
import { calculateTradeBreakdown, calculateTotalProfit } from './utils/tradeCalculations';
import { useModalManager } from './hooks/useModalManager';
import { useTradeCRUD } from './hooks/useTradeCRUD';
import { useTradeHandlers } from './hooks/useTradeHandlers';
import './styles/App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyTrades, setDailyTrades] = useState<Trade[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dataVersion, setDataVersion] = useState(0);
  
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
        setIsDbReady(true);
      } catch (error) {
        console.error('データベース初期化エラー:', error);
        alert('データベースの初期化に失敗しました');
      }
    };
    initDb();
  }, []);

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

  // イベントハンドラー
  const {
    isDailyBreakdownExpanded,
    handleDateSelect,
    handleMonthChange,
    handleImportComplete,
    handleHistoryUpdate,
    handleBulkDeleteComplete,
    handleDataRestored,
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

        {selectedDate && (
          <section className="daily-trades-section">
            <div className="daily-trades-header">
              <h2>{selectedDate.toLocaleDateString('ja-JP')}の取引</h2>
              <button 
                className="add-daily-trade-button"
                onClick={() => handleOpenTradeForm(undefined, selectedDate)}
                title={`${selectedDate.toLocaleDateString('ja-JP')}の取引を追加`}
              >
                <span className="button-icon">+</span>
                取引を追加
              </button>
            </div>
            
            {dailyTrades.length > 0 ? (
              <>
                {(() => {
                  const totalProfit = calculateTotalProfit(dailyTrades);
                  const { spotProfit, marginProfit } = calculateTradeBreakdown(dailyTrades);
                  
                  return (
                    <div className="daily-profit">
                      <div className="profit-container" onClick={toggleDailyBreakdown}>
                        <div className="daily-summary">
                          <div className="summary-header">
                            <h3>この日の収益</h3>
                            <div className="mobile-toggle">
                              <span className="expand-icon">{isDailyBreakdownExpanded ? '▼' : '▶'}</span>
                            </div>
                          </div>
                          <div className="profit-amount">
                            <span className={`profit-value ${totalProfit >= 0 ? 'profit' : 'loss'}`}>
                              {totalProfit >= 0 ? '+' : ''}
                              {formatCurrency(totalProfit)}円
                            </span>
                            <span className="trade-count">({dailyTrades.length}件)</span>
                          </div>
                        </div>
                        
                        <div className="trade-breakdown desktop-breakdown">
                          <div className="breakdown-list">
                            <div className="breakdown-item">
                              <div className="breakdown-label">現物</div>
                              <div className={`breakdown-profit ${spotProfit >= 0 ? 'profit' : 'loss'}`}>
                                {spotProfit >= 0 ? '+' : ''}
                                {formatCurrency(spotProfit)}円
                              </div>
                            </div>
                            <div className="breakdown-item">
                              <div className="breakdown-label">信用</div>
                              <div className={`breakdown-profit ${marginProfit >= 0 ? 'profit' : 'loss'}`}>
                                {marginProfit >= 0 ? '+' : ''}
                                {formatCurrency(marginProfit)}円
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isDailyBreakdownExpanded && (
                        <div className="trade-breakdown mobile-breakdown">
                          <div className="breakdown-list">
                            <div className="breakdown-item">
                              <div className="breakdown-label">現物取引</div>
                              <div className={`breakdown-profit ${spotProfit >= 0 ? 'profit' : 'loss'}`}>
                                {spotProfit >= 0 ? '+' : ''}
                                {formatCurrency(spotProfit)}円
                              </div>
                            </div>
                            <div className="breakdown-item">
                              <div className="breakdown-label">信用取引</div>
                              <div className={`breakdown-profit ${marginProfit >= 0 ? 'profit' : 'loss'}`}>
                                {marginProfit >= 0 ? '+' : ''}
                                {formatCurrency(marginProfit)}円
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <table className="trades-table">
                  <thead>
                    <tr>
                      <th>銘柄コード</th>
                      <th>銘柄名</th>
                      <th>取引</th>
                      <th>数量</th>
                      <th>平均取得価額</th>
                      <th>単価</th>
                      <th>損益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyTrades.map(trade => (
                      <tr 
                        key={trade.id} 
                        className="trade-row clickable"
                        onClick={() => handleOpenTradeForm(trade)}
                        title="クリックして編集"
                      >
                        <td data-label="銘柄コード">{trade.stockCode || '-'}</td>
                        <td data-label="銘柄名">{trade.stockName}</td>
                        <td data-label="取引">{trade.tradeType}</td>
                        <td data-label="数量">{trade.quantity.toLocaleString()}</td>
                        <td data-label="平均取得価額">{formatCurrency(trade.averageAcquisitionPrice)}円</td>
                        <td data-label="単価">{formatCurrency(trade.unitPrice)}円</td>
                        <td data-label="損益" className={trade.realizedProfitLoss >= 0 ? 'profit' : 'loss'}>
                          {trade.realizedProfitLoss >= 0 ? '+' : ''}
                          {formatCurrency(trade.realizedProfitLoss)}円
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="no-trades">この日の取引はありません</p>
            )}
          </section>
        )}
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
        title={editingTrade ? '取引を編集' : '新規取引入力'}
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
          databaseService={db} 
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
        <BackupRestore onDataRestored={handleDataRestored} />
      </Modal>
    </div>
  );
}

export default App;