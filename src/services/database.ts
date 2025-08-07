import { Trade } from '../types/Trade';
import { ImportHistory, ImportTradeRelation } from '../types/ImportHistory';

const DB_NAME = 'ProfitCalendarDB';
const DB_VERSION = 2;

export const STORES = {
  TRADES: 'trades',
  IMPORT_HISTORY: 'import_history',
  IMPORT_TRADE_RELATIONS: 'import_trade_relations',
} as const;

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('データベースを開けませんでした'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 取引データストアの作成
        if (!db.objectStoreNames.contains(STORES.TRADES)) {
          const tradesStore = db.createObjectStore(STORES.TRADES, { keyPath: 'id' });
          
          // インデックスの作成
          tradesStore.createIndex('date', 'date', { unique: false });
          tradesStore.createIndex('stockName', 'stockName', { unique: false });
          tradesStore.createIndex('stockCode', 'stockCode', { unique: false });
          tradesStore.createIndex('tradeType', 'tradeType', { unique: false });
          tradesStore.createIndex('csvImported', 'csvImported', { unique: false });
          
          // 複合インデックス（日付での検索を高速化）
          tradesStore.createIndex('year_month', ['date.year', 'date.month'], { unique: false });
        }

        // インポート履歴ストアの作成
        if (!db.objectStoreNames.contains(STORES.IMPORT_HISTORY)) {
          const importHistoryStore = db.createObjectStore(STORES.IMPORT_HISTORY, { keyPath: 'id' });
          
          importHistoryStore.createIndex('importDate', 'importDate', { unique: false });
          importHistoryStore.createIndex('status', 'status', { unique: false });
          importHistoryStore.createIndex('fileName', 'fileName', { unique: false });
        }

        // インポート-取引関連ストアの作成
        if (!db.objectStoreNames.contains(STORES.IMPORT_TRADE_RELATIONS)) {
          const relationsStore = db.createObjectStore(STORES.IMPORT_TRADE_RELATIONS, { keyPath: ['importId', 'tradeId'] });
          
          relationsStore.createIndex('importId', 'importId', { unique: false });
          relationsStore.createIndex('tradeId', 'tradeId', { unique: false });
        }
      };
    });
  }

  private getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('データベースが初期化されていません');
    }
    return this.db;
  }

  // 取引を追加
  async addTrade(trade: Trade): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('取引の追加に失敗しました'));
    });
  }

  // 複数の取引を一括追加
  async addTrades(trades: Trade[]): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    const promises = trades.map(trade => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(trade);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`取引の追加に失敗しました: ${trade.stockName}`));
      });
    });

    await Promise.all(promises);
  }

  // 取引を更新
  async updateTrade(trade: Trade): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(trade);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('取引の更新に失敗しました'));
    });
  }

  // 指定期間での銘柄別損益を取得
  async getStockProfitsByPeriod(startDate: Date, endDate: Date): Promise<Array<{stockCode?: string, stockName: string, totalProfit: number, tradeCount: number}>> {
    if (!this.db) {
      return [];
    }
    const trades = await this.getTradesByDateRange(startDate, endDate);
    
    const stockProfits = new Map<string, {stockCode?: string, totalProfit: number, tradeCount: number}>();
    
    trades.forEach(trade => {
      const existing = stockProfits.get(trade.stockName) || {stockCode: trade.stockCode, totalProfit: 0, tradeCount: 0};
      stockProfits.set(trade.stockName, {
        stockCode: trade.stockCode || existing.stockCode,
        totalProfit: existing.totalProfit + trade.realizedProfitLoss,
        tradeCount: existing.tradeCount + 1
      });
    });
    
    return Array.from(stockProfits.entries())
      .map(([stockName, data]) => ({
        stockCode: data.stockCode,
        stockName,
        totalProfit: data.totalProfit,
        tradeCount: data.tradeCount
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }

  // 取引を削除
  async deleteTrade(id: string): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('取引の削除に失敗しました'));
    });
  }

  // IDで取引を取得
  async getTradeById(id: string): Promise<Trade | null> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readonly');
    const store = transaction.objectStore(STORES.TRADES);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('取引の取得に失敗しました'));
    });
  }

  // 日付範囲で取引を取得
  async getTradesByDateRange(startDate: Date, endDate: Date): Promise<Trade[]> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readonly');
    const store = transaction.objectStore(STORES.TRADES);
    const index = store.index('date');
    
    const range = IDBKeyRange.bound(startDate, endDate);
    
    return new Promise((resolve, reject) => {
      const trades: Trade[] = [];
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          trades.push(cursor.value);
          cursor.continue();
        } else {
          resolve(trades);
        }
      };
      
      request.onerror = () => reject(new Error('取引の取得に失敗しました'));
    });
  }

  // 特定の日の取引を取得
  async getTradesByDate(date: Date): Promise<Trade[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getTradesByDateRange(startOfDay, endOfDay);
  }

  // 年間の月別収益データを取得
  async getYearlyMonthlyProfits(year: number): Promise<{
    month: number;
    totalProfit: number;
    spotProfit: number;
    marginProfit: number;
    tradeCount: number;
  }[]> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません');
    }

    const results: {
      month: number;
      totalProfit: number;
      spotProfit: number;
      marginProfit: number;
      tradeCount: number;
    }[] = [];

    // 1月から12月まで順番に処理
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const transaction = this.db.transaction(['trades'], 'readonly');
      const store = transaction.objectStore('trades');
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);

      const trades = await new Promise<Trade[]>((resolve, reject) => {
        const trades: Trade[] = [];
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            trades.push(cursor.value);
            cursor.continue();
          } else {
            resolve(trades);
          }
        };

        request.onerror = () => reject(new Error('取引の取得に失敗しました'));
      });

      // 月別収益を計算
      let spotProfit = 0;
      let marginProfit = 0;
      let tradeCount = 0;

      trades.forEach(trade => {
        if (['売却', '現物売'].includes(trade.tradeType)) {
          spotProfit += trade.realizedProfitLoss;
          tradeCount++;
        } else if (['返済売', '返済買'].includes(trade.tradeType)) {
          marginProfit += trade.realizedProfitLoss;
          tradeCount++;
        }
      });

      results.push({
        month,
        totalProfit: spotProfit + marginProfit,
        spotProfit,
        marginProfit,
        tradeCount
      });
    }

    return results;
  }

  // 日別収益データを取得
  async getDailyProfits(days: number): Promise<{
    date: Date;
    totalProfit: number;
    spotProfit: number;
    marginProfit: number;
    tradeCount: number;
  }[]> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません');
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const trades = await this.getTradesByDateRange(startDate, endDate);
    
    // 日付ごとに集計
    const dailyMap = new Map<string, {
      date: Date;
      totalProfit: number;
      spotProfit: number;
      marginProfit: number;
      tradeCount: number;
    }>();

    // 全ての日付を初期化
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, {
        date: new Date(d),
        totalProfit: 0,
        spotProfit: 0,
        marginProfit: 0,
        tradeCount: 0
      });
    }

    // 取引データを集計
    trades.forEach(trade => {
      const dateKey = trade.date.toISOString().split('T')[0];
      const dayData = dailyMap.get(dateKey);
      
      if (dayData) {
        if (['売却', '現物売'].includes(trade.tradeType)) {
          dayData.spotProfit += trade.realizedProfitLoss;
          dayData.totalProfit += trade.realizedProfitLoss;
          dayData.tradeCount++;
        } else if (['返済売', '返済買'].includes(trade.tradeType)) {
          dayData.marginProfit += trade.realizedProfitLoss;
          dayData.totalProfit += trade.realizedProfitLoss;
          dayData.tradeCount++;
        }
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // 全ての取引を取得
  async getAllTrades(): Promise<Trade[]> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readonly');
    const store = transaction.objectStore(STORES.TRADES);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('取引の取得に失敗しました'));
    });
  }

  // 銘柄名で取引を検索
  async getTradesByStockName(stockName: string): Promise<Trade[]> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readonly');
    const store = transaction.objectStore(STORES.TRADES);
    const index = store.index('stockName');
    
    return new Promise((resolve, reject) => {
      const trades: Trade[] = [];
      const request = index.openCursor(IDBKeyRange.only(stockName));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          trades.push(cursor.value);
          cursor.continue();
        } else {
          resolve(trades);
        }
      };
      
      request.onerror = () => reject(new Error('取引の検索に失敗しました'));
    });
  }

  // データベースをクリア（開発用）
  async clearAllTrades(): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('データのクリアに失敗しました'));
    });
  }

  // 指定日付の取引を削除
  async deleteTradesByDates(dates: Date[]): Promise<number> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    const index = store.index('date');
    
    let deletedCount = 0;
    
    for (const date of dates) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const range = IDBKeyRange.bound(startOfDay, endOfDay);
      
      await new Promise<void>((resolve, reject) => {
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(new Error('取引の削除に失敗しました'));
      });
    }
    
    return deletedCount;
  }

  // 全ての取引を削除
  async deleteAllTrades(): Promise<number> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readwrite');
    const store = transaction.objectStore(STORES.TRADES);
    
    // 削除前に件数を取得
    const count = await new Promise<number>((resolve, reject) => {
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(new Error('取引数の取得に失敗しました'));
    });
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('全取引の削除に失敗しました'));
    });
    
    return count;
  }

  // 全データと設定を削除して完全初期化
  async resetAll(): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES, STORES.IMPORT_HISTORY, STORES.IMPORT_TRADE_RELATIONS], 'readwrite');
    const tradesStore = transaction.objectStore(STORES.TRADES);
    const importHistoryStore = transaction.objectStore(STORES.IMPORT_HISTORY);
    const relationsStore = transaction.objectStore(STORES.IMPORT_TRADE_RELATIONS);
    
    // 全ての IndexedDB データを削除
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = tradesStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('取引データの削除に失敗しました'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = importHistoryStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('インポート履歴の削除に失敗しました'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = relationsStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('インポート関連データの削除に失敗しました'));
      })
    ]);
    
    // LocalStorage の設定データも削除
    this.clearLocalStorageSettings();
  }

  // LocalStorage の設定データを削除
  private clearLocalStorageSettings(): void {
    const keysToRemove = [
      'profit-calendar-theme',
      'profit-calendar-settings',
      'profit-calendar-user-preferences',
      'profit-calendar-last-backup',
      'claude-theme', // テーマ設定
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`LocalStorage key "${key}" の削除に失敗:`, error);
      }
    });
    
    // テーマ関連のCSS変数もリセット
    const root = document.documentElement;
    const cssVariables = [
      '--bg-primary', '--bg-secondary', '--bg-tertiary', '--bg-modal',
      '--text-primary', '--text-secondary', '--text-tertiary', '--text-inverse',
      '--accent-primary', '--accent-primaryHover', '--accent-secondary', '--accent-secondaryHover',
      '--status-profit', '--status-loss', '--status-warning', '--status-info',
      '--border-primary', '--border-secondary',
      '--shadow-primary', '--shadow-secondary'
    ];
    
    cssVariables.forEach(variable => {
      root.style.removeProperty(variable);
    });
  }

  // 月間収益を取得
  async getMonthlyProfit(year: number, month: number): Promise<{
    totalProfit: number;
    tradeCount: number;
    spotProfit: number;
    marginProfit: number;
  }> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES], 'readonly');
    const store = transaction.objectStore(STORES.TRADES);
    const index = store.index('date');
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const range = IDBKeyRange.bound(startDate, endDate);
    
    return new Promise((resolve, reject) => {
      const trades: Trade[] = [];
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          trades.push(cursor.value);
          cursor.continue();
        } else {
          // 現物・信用別に集計
          let spotProfit = 0;
          let marginProfit = 0;
          
          trades.forEach(trade => {
            // 取引タイプの正規化（前後の空白除去、全角半角統一）
            const normalizedTradeType = trade.tradeType.trim();
            
            // 実際のデータに基づく分類
            if (normalizedTradeType === '売却' || normalizedTradeType === '現物売') {
              // 現物取引の売却（損益確定）
              spotProfit += trade.realizedProfitLoss;
            } 
            else if (normalizedTradeType === '購入' || normalizedTradeType === '買付' || normalizedTradeType === '現物買') {
              // 現物取引の購入（取得のみ、損益確定なし）
              // 何もしない
            }
            // 信用取引は返済時に損益確定
            else if (normalizedTradeType === '返済買' || normalizedTradeType === '返済売') {
              marginProfit += trade.realizedProfitLoss;
            }
          });
          
          
          const totalProfit = trades.reduce((sum, trade) => sum + trade.realizedProfitLoss, 0);
          
          resolve({
            totalProfit,
            tradeCount: trades.length,
            spotProfit,
            marginProfit,
          });
        }
      };
      
      request.onerror = () => reject(new Error('月間収益の取得に失敗しました'));
    });
  }

  // インポート履歴を追加
  async addImportHistory(history: ImportHistory): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.IMPORT_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORES.IMPORT_HISTORY);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(history);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('インポート履歴の追加に失敗しました'));
    });
  }

  // インポート-取引関連を追加
  async addImportTradeRelations(relations: ImportTradeRelation[]): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.IMPORT_TRADE_RELATIONS], 'readwrite');
    const store = transaction.objectStore(STORES.IMPORT_TRADE_RELATIONS);
    
    const promises = relations.map(relation => {
      return new Promise<void>((resolve, reject) => {
        const request = store.add(relation);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('関連データの追加に失敗しました'));
      });
    });

    await Promise.all(promises);
  }

  // すべてのインポート履歴を取得
  async getAllImportHistory(): Promise<ImportHistory[]> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.IMPORT_HISTORY], 'readonly');
    const store = transaction.objectStore(STORES.IMPORT_HISTORY);
    const index = store.index('importDate');
    
    return new Promise((resolve, reject) => {
      const histories: ImportHistory[] = [];
      // 新しい順で取得
      const request = index.openCursor(null, 'prev');
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          histories.push(cursor.value);
          cursor.continue();
        } else {
          resolve(histories);
        }
      };
      
      request.onerror = () => reject(new Error('インポート履歴の取得に失敗しました'));
    });
  }

  // インポート履歴を更新
  async updateImportHistory(history: ImportHistory): Promise<void> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.IMPORT_HISTORY], 'readwrite');
    const store = transaction.objectStore(STORES.IMPORT_HISTORY);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(history);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('インポート履歴の更新に失敗しました'));
    });
  }

  // インポートIDに関連する取引IDを取得
  async getTradeIdsByImportId(importId: string): Promise<string[]> {
    const db = this.getDB();
    const transaction = db.transaction([STORES.IMPORT_TRADE_RELATIONS], 'readonly');
    const store = transaction.objectStore(STORES.IMPORT_TRADE_RELATIONS);
    const index = store.index('importId');
    
    return new Promise((resolve, reject) => {
      const tradeIds: string[] = [];
      const request = index.openCursor(IDBKeyRange.only(importId));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          tradeIds.push(cursor.value.tradeId);
          cursor.continue();
        } else {
          resolve(tradeIds);
        }
      };
      
      request.onerror = () => reject(new Error('関連取引IDの取得に失敗しました'));
    });
  }

  // インポートIDに関連する取引を削除
  async deleteTradesByImportId(importId: string): Promise<void> {
    const tradeIds = await this.getTradeIdsByImportId(importId);
    
    const db = this.getDB();
    const transaction = db.transaction([STORES.TRADES, STORES.IMPORT_TRADE_RELATIONS], 'readwrite');
    const tradesStore = transaction.objectStore(STORES.TRADES);
    const relationsStore = transaction.objectStore(STORES.IMPORT_TRADE_RELATIONS);
    
    // 取引を削除
    const deleteTradePromises = tradeIds.map(tradeId => {
      return new Promise<void>((resolve, reject) => {
        const request = tradesStore.delete(tradeId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`取引 ${tradeId} の削除に失敗しました`));
      });
    });

    // 関連データを削除
    const deleteRelationPromises = tradeIds.map(tradeId => {
      return new Promise<void>((resolve, reject) => {
        const request = relationsStore.delete([importId, tradeId]);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`関連データの削除に失敗しました`));
      });
    });

    await Promise.all([...deleteTradePromises, ...deleteRelationPromises]);
  }
}

// シングルトンインスタンス
export const db = new Database();

// Database クラスもエクスポート
export { Database };