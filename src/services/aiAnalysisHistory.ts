import { AIPromptTemplate } from '../types/statistics';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'ProfitCalendarAIHistory';
const DB_VERSION = 1;
const STORE_NAME = 'ai_analysis_history';

export interface AIAnalysisRecord {
  id: string;
  month: string; // "YYYY-MM"
  promptType: AIPromptTemplate;
  result: string;
  createdAt: Date;
}

class AIAnalysisHistoryService {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('AI分析履歴DBを開けませんでした'));

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('month', 'month', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async save(record: Omit<AIAnalysisRecord, 'id'>): Promise<string> {
    const db = await this.getDB();
    const id = uuidv4();
    const fullRecord: AIAnalysisRecord = { ...record, id };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(fullRecord);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('AI分析履歴の保存に失敗しました'));
    });
  }

  async getAll(): Promise<AIAnalysisRecord[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const records: AIAnalysisRecord[] = [];
      const request = index.openCursor(null, 'prev');

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = () => reject(new Error('AI分析履歴の取得に失敗しました'));
    });
  }

  async getByMonth(month: string): Promise<AIAnalysisRecord[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('month');
      const records: AIAnalysisRecord[] = [];
      const request = index.openCursor(IDBKeyRange.only(month));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = () => reject(new Error('AI分析履歴の取得に失敗しました'));
    });
  }

  async deleteById(id: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('AI分析履歴の削除に失敗しました'));
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('AI分析履歴のクリアに失敗しました'));
    });
  }
}

export const aiAnalysisHistoryService = new AIAnalysisHistoryService();
