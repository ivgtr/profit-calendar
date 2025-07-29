// 取引の種類
export type TradeType = '返済売' | '返済買' | '現物売' | '現物買' | '売却' | '購入' | '買付';

// 口座の種類
export type AccountType = '特定' | '一般' | 'NISA';

// 商品の種類
export type ProductType = '現物' | '信用';

// CSV取引データ
export interface CSVTradeData {
  約定日: string;
  口座: AccountType;
  銘柄名: string;
  取引: TradeType;
  数量: number;
  売却決済額: number; // 内部処理用（CSVでは "売却/決済額"）
  単価: number;
  平均取得価額: number;
  実現損益: number;
}

// 保存用の取引データ
export interface Trade {
  id: string;
  date: Date;
  accountType: AccountType;
  stockName: string;
  stockCode?: string;
  tradeType: TradeType;
  quantity: number;
  amount: number;
  unitPrice: number;
  averageAcquisitionPrice: number;
  realizedProfitLoss: number;
  memo?: string;
  csvImported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 日別集計データ
export interface DailySummary {
  date: Date;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
}

// CSVサマリデータ
export interface CSVSummary {
  検索件数: number;
  約定日: string;
  種類: string;
  口座: string;
  商品別損益: {
    商品: ProductType;
    実現損益: number;
    利益金額: number;
    損失金額: number;
  }[];
}

// インポート結果
export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  rejectedRecords: number;
  errors: string[];
}