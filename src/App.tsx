import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { CSVImporter } from './components/CSVImporter';
import { Calendar } from './components/Calendar';
import { ImportHistoryList } from './components/ImportHistoryList';
import { TradeForm } from './components/TradeForm';
import { BulkDeleteTrades } from './components/BulkDeleteTrades';
import { MonthlyProfit } from './components/MonthlyProfit';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Disclaimer } from './components/Disclaimer';
import { UserGuide } from './components/UserGuide';
import { useMonthlyTrades } from './hooks/useMonthlyTrades';
import { db } from './services/database';
import { Trade } from './types/Trade';
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
  
  // モーダル状態管理
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTradeFormModalOpen, setIsTradeFormModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);

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

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    loadDailyTrades(date);
  }, [loadDailyTrades]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const handleImportComplete = useCallback(() => {
    // データが変更されたことを通知
    setDataVersion(prev => prev + 1);
    // カレンダーをリフレッシュするため、選択日付を再設定
    if (selectedDate) {
      loadDailyTrades(selectedDate);
    }
    // インポートモーダルを閉じる
    setIsImportModalOpen(false);
  }, [selectedDate, loadDailyTrades]);

  const handleHistoryUpdate = useCallback(() => {
    // データが変更されたことを通知
    setDataVersion(prev => prev + 1);
    // カレンダーをリフレッシュ
    if (selectedDate) {
      loadDailyTrades(selectedDate);
    }
  }, [selectedDate, loadDailyTrades]);

  const handleOpenTradeForm = (trade?: Trade, defaultDate?: Date) => {
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
    setIsTradeFormModalOpen(true);
  };

  const handleSaveTrade = async (trade: Trade) => {
    try {
      if (editingTrade) {
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
      setIsTradeFormModalOpen(false);
      setEditingTrade(undefined);
    } catch (error) {
      console.error('取引の保存エラー:', error);
      alert('取引の保存に失敗しました');
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm('この取引を削除しますか？')) return;
    
    try {
      await db.deleteTrade(tradeId);
      
      // データが変更されたことを通知
      setDataVersion(prev => prev + 1);
      // UIを更新
      if (selectedDate) {
        loadDailyTrades(selectedDate);
      }
      
      // モーダルを閉じる
      setIsTradeFormModalOpen(false);
      setEditingTrade(undefined);
    } catch (error) {
      console.error('取引の削除エラー:', error);
      alert('取引の削除に失敗しました');
    }
  };

  const handleCancelTradeForm = () => {
    setIsTradeFormModalOpen(false);
    setEditingTrade(undefined);
  };

  const handleBulkDeleteComplete = () => {
    // データが変更されたことを通知
    setDataVersion(prev => prev + 1);
    // カレンダーをリフレッシュ
    if (selectedDate) {
      loadDailyTrades(selectedDate);
    }
    // モーダルを閉じる
    setIsBulkDeleteModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ja-JP');
  };

  // 日別取引の現物・信用別損益を計算
  const calculateDailyBreakdown = (trades: Trade[]) => {
    let spotProfit = 0;
    let marginProfit = 0;
    
    trades.forEach(trade => {
      const normalizedTradeType = trade.tradeType.trim();
      
      if (normalizedTradeType === '売却' || normalizedTradeType === '現物売') {
        spotProfit += trade.realizedProfitLoss;
      } else if (normalizedTradeType === '返済買' || normalizedTradeType === '返済売') {
        marginProfit += trade.realizedProfitLoss;
      }
    });
    
    return { spotProfit, marginProfit };
  };

  // 日別内訳の表示/非表示状態管理
  const [isDailyBreakdownExpanded, setIsDailyBreakdownExpanded] = useState(false);

  const toggleDailyBreakdown = () => {
    setIsDailyBreakdownExpanded(!isDailyBreakdownExpanded);
  };

  if (!isDbReady) {
    return (
      <div className="loading">
        <p>データベースを初期化中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenTradeFormModal={() => handleOpenTradeForm()}
        onOpenBulkDeleteModal={() => setIsBulkDeleteModalOpen(true)}
        onOpenUserGuideModal={() => setIsUserGuideModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenDisclaimerModal={() => setIsDisclaimerModalOpen(true)}
      />

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
                  const totalProfit = dailyTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
                  const { spotProfit, marginProfit } = calculateDailyBreakdown(dailyTrades);
                  
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
                      <th>銘柄名</th>
                      <th>取引</th>
                      <th>数量</th>
                      <th>単価</th>
                      <th>金額</th>
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
                        <td data-label="銘柄名">{trade.stockName}</td>
                        <td data-label="取引">{trade.tradeType}</td>
                        <td data-label="数量">{trade.quantity.toLocaleString()}</td>
                        <td data-label="単価">{formatCurrency(trade.unitPrice)}円</td>
                        <td data-label="金額">{formatCurrency(trade.amount)}円</td>
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
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="CSVインポート"
        size="medium"
      >
        <CSVImporter onImportComplete={handleImportComplete} />
      </Modal>

      {/* インポート履歴モーダル */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="CSVインポート履歴"
        size="large"
      >
        <ImportHistoryList onHistoryUpdate={handleHistoryUpdate} />
      </Modal>

      {/* 取引入力・編集モーダル */}
      <Modal
        isOpen={isTradeFormModalOpen}
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
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="取引の一括削除"
        size="medium"
      >
        <BulkDeleteTrades onComplete={handleBulkDeleteComplete} />
      </Modal>

      {/* 使い方ガイドモーダル */}
      <Modal
        isOpen={isUserGuideModalOpen}
        onClose={() => setIsUserGuideModalOpen(false)}
        title=""
        size="large"
      >
        <UserGuide />
      </Modal>

      {/* 利用規約モーダル */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title=""
        size="large"
      >
        <TermsOfService />
      </Modal>

      {/* プライバシーポリシーモーダル */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title=""
        size="large"
      >
        <PrivacyPolicy />
      </Modal>

      {/* 免責事項モーダル */}
      <Modal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
        title=""
        size="large"
      >
        <Disclaimer />
      </Modal>
    </div>
  );
}

export default App;