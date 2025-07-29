// CSVインポート履歴
export interface ImportHistory {
  id: string;
  fileName: string;
  importDate: Date;
  totalRecords: number;
  importedRecords: number;
  rejectedRecords: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
  };
  status: 'active' | 'rejected';
  csvSummary?: {
    検索件数: number;
    約定日: string;
    種類: string;
    口座: string;
  };
  errors: string[];
  createdAt: Date;
  updatedAt: Date;
}

// インポート履歴の作成パラメータ
export interface CreateImportHistoryParams {
  fileName: string;
  totalRecords: number;
  importedRecords: number;
  rejectedRecords: number;
  tradeIds: string[]; // このインポートで追加された取引のID一覧
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
  };
  csvSummary?: {
    検索件数: number;
    約定日: string;
    種類: string;
    口座: string;
  };
  errors: string[];
}

// インポート履歴とそれに関連する取引IDの関連付け
export interface ImportTradeRelation {
  importId: string;
  tradeId: string;
}