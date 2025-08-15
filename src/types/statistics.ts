export interface ExportMetadata {
  exportDate: string;
  dataRange: {
    start: string;
    end: string;
  };
  version: string;
  totalRecords: number;
  analysisScope: string; // 分析対象の説明
}

// パフォーマンス概要 - 基本的な収益指標
export interface PerformanceOverview {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  maxProfit: number;
  maxLoss: number;
  profitPerTrade: number;
  returnOnCapital?: number; // 資本収益率（推定）
}

// 高度な分析指標 - 月次レポートの詳細メトリクス
export interface AdvancedMetrics {
  riskAnalysis: {
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    calmarRatio: number;
    volatility: number;
    valueAtRisk95: number;
    valueAtRisk99: number;
  };
  streakAnalysis: {
    maxWinStreak: number;
    maxLossStreak: number;
    currentStreak: number;
    streakType: 'win' | 'loss' | 'none';
    averageWinStreak: number;
    averageLossStreak: number;
  };
  distributionAnalysis: {
    profitDistribution: {
      range: string;
      count: number;
      percentage: number;
      totalAmount: number;
    }[];
    lossDistribution: {
      range: string;
      count: number;
      percentage: number;
      totalAmount: number;
    }[];
  };
}

// 銘柄パフォーマンス分析 - 詳細な銘柄別データ
export interface StockPerformanceAnalysis {
  topPerformers: StockPerformanceDetail[];
  worstPerformers: StockPerformanceDetail[];
  mostTradedStocks: StockPerformanceDetail[];
  highestWinRateStocks: StockPerformanceDetail[];
  diversificationMetrics: {
    totalStocks: number;
    concentrationRisk: number; // 上位5銘柄の利益集中度
    sectorDiversification?: string[]; // セクター情報（推定）
  };
}

export interface StockPerformanceDetail {
  symbol: string;
  name: string;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  averageProfit: number;
  averageLoss: number;
  maxProfit: number;
  maxLoss: number;
  profitContribution: number; // 全体利益に対する貢献度（%）
  riskContribution: number; // 全体リスクに対する貢献度（%）
  bestTrade: {
    date: string;
    profit: number;
  };
  worstTrade: {
    date: string;
    loss: number;
  };
}

// トレンド・リスク分析 - 時系列・パターン分析
export interface TrendAndRiskAnalysis {
  weeklyTrend: {
    week: number;
    profit: number;
    trades: number;
    winRate: number;
  }[];
  dailyOfWeekPerformance: {
    day: string;
    profit: number;
    trades: number;
    winRate: number;
    avgProfitPerTrade: number;
  }[];
  monthlyMomentum: {
    indicator: number; // モメンタム指標
    trend: 'improving' | 'stable' | 'declining';
    description: string;
  };
  seasonalPatterns: {
    quarter: string;
    avgProfit: number;
    winRate: number;
    trades: number;
  }[];
  performanceConsistency: {
    profitStandardDeviation: number;
    winRateConsistency: number;
    tradingFrequencyVariance: number;
  };
}

// 月次内訳 - 詳細な月次データ
export interface MonthlyBreakdown {
  month: string;
  basicMetrics: {
    profit: number;
    loss: number;
    netProfit: number;
    trades: number;
    winRate: number;
    profitFactor: number;
  };
  bestPerformingDay: {
    date: string;
    profit: number;
    trades: number;
  };
  worstPerformingDay: {
    date: string;
    loss: number;
    trades: number;
  };
  topStocks: {
    symbol: string;
    profit: number;
    trades: number;
  }[];
  riskMetrics: {
    maxDailyLoss: number;
    volatility: number;
    consistency: number;
  };
}

// 新しい統計エクスポート構造
export interface StatisticsExport {
  metadata: ExportMetadata;
  performanceOverview: PerformanceOverview;
  advancedMetrics: AdvancedMetrics;
  stockPerformanceAnalysis: StockPerformanceAnalysis;
  trendAndRiskAnalysis: TrendAndRiskAnalysis;
  monthlyBreakdown: MonthlyBreakdown[];
}

// エクスポートオプション - 簡素化
export interface ExportOptions {
  dateRange: 'all' | 'year' | 'quarter' | 'month' | 'custom';
  customRange?: {
    start: Date;
    end: Date;
  };
  includeAdvancedMetrics: boolean;
  includeStockAnalysis: boolean;
  includeTrendAnalysis: boolean;
  includeMonthlyBreakdown: boolean;
  stockAnalysisDepth: 'top5' | 'top10' | 'all'; // 銘柄分析の深度
  maskStockNames: boolean;
  useRelativeValues: boolean;
}

export type AIPromptTemplate = 'basic' | 'detailed' | 'stock' | 'score';

export interface AIPromptConfig {
  template: AIPromptTemplate;
  customPrompt?: string;
}

// 旧インターフェースとの互換性のために残す（廃止予定）
export interface SummaryStatistics extends PerformanceOverview {}
export interface MonthlyStatistics extends MonthlyBreakdown {
  bestDay: { date: string; profit: number; };
  worstDay: { date: string; loss: number; };
}
export interface StockAnalysis extends StockPerformanceDetail {
  estimatedAverageHoldingDays: number;
  mostProfitableTrade: { date: string; profit: number; };
  worstTrade: { date: string; loss: number; };
}