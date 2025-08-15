import { db } from './database';
import { Trade } from '../types/Trade';
import {
  StatisticsExport,
  ExportOptions,
  PerformanceOverview,
  AdvancedMetrics,
  StockPerformanceAnalysis,
  StockPerformanceDetail,
  TrendAndRiskAnalysis,
  MonthlyBreakdown
} from '../types/statistics';

export class StatisticsService {
  private static instance: StatisticsService;

  private constructor() {}

  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  async generateStatistics(options: ExportOptions): Promise<StatisticsExport> {
    const trades = await this.getTradesForRange(options);
    
    const metadata = {
      exportDate: new Date().toISOString(),
      dataRange: this.getDateRange(trades),
      version: '2.0.0',
      totalRecords: trades.length,
      analysisScope: this.getAnalysisScopeDescription(options)
    };

    const statistics: StatisticsExport = {
      metadata,
      performanceOverview: await this.calculatePerformanceOverview(trades),
      advancedMetrics: options.includeAdvancedMetrics 
        ? await this.calculateAdvancedMetrics(trades) 
        : {} as AdvancedMetrics,
      stockPerformanceAnalysis: options.includeStockAnalysis 
        ? await this.calculateStockPerformanceAnalysis(trades, options.stockAnalysisDepth) 
        : {} as StockPerformanceAnalysis,
      trendAndRiskAnalysis: options.includeTrendAnalysis 
        ? await this.calculateTrendAndRiskAnalysis(trades) 
        : {} as TrendAndRiskAnalysis,
      monthlyBreakdown: options.includeMonthlyBreakdown 
        ? await this.calculateMonthlyBreakdown(trades) 
        : []
    };

    if (options.useRelativeValues) {
      this.convertToRelativeValues(statistics);
    }

    if (options.maskStockNames) {
      this.maskStockNames(statistics);
    }

    return statistics;
  }

  private async getTradesForRange(options: ExportOptions): Promise<Trade[]> {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const now = new Date();
    
    switch (options.dateRange) {
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      }
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'custom':
        if (options.customRange) {
          startDate = options.customRange.start;
          endDate = options.customRange.end;
        }
        break;
      case 'all':
      default:
        // 全データを取得
        break;
    }

    const allTrades = await db.getAllTrades();
    
    if (startDate && endDate) {
      return allTrades.filter((trade: Trade) => 
        trade.date >= startDate && trade.date <= endDate
      );
    }
    
    return allTrades;
  }

  private getDateRange(trades: Trade[]): { start: string; end: string } {
    if (trades.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }

    const dates = trades.map(t => t.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0]
    };
  }

  private getAnalysisScopeDescription(options: ExportOptions): string {
    const scope = [];
    if (options.includeAdvancedMetrics) scope.push('高度分析指標');
    if (options.includeStockAnalysis) scope.push('銘柄別パフォーマンス');
    if (options.includeTrendAnalysis) scope.push('トレンド・リスク分析');
    if (options.includeMonthlyBreakdown) scope.push('月次詳細データ');
    
    return scope.length > 0 ? scope.join(', ') : '基本統計のみ';
  }

  private async calculatePerformanceOverview(trades: Trade[]): Promise<PerformanceOverview> {
    const profits = trades.filter(t => t.realizedProfitLoss > 0);
    const losses = trades.filter(t => t.realizedProfitLoss < 0);
    
    const totalProfit = profits.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
    const totalLoss = losses.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
    const netProfit = totalProfit + totalLoss;
    
    const winRate = trades.length > 0 ? profits.length / trades.length : 0;
    const averageProfit = profits.length > 0 ? totalProfit / profits.length : 0;
    const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;
    
    const maxProfit = profits.length > 0 ? Math.max(...profits.map(t => t.realizedProfitLoss)) : 0;
    const maxLoss = losses.length > 0 ? Math.min(...losses.map(t => t.realizedProfitLoss)) : 0;
    
    const profitFactor = Math.abs(totalLoss) > 0 ? totalProfit / Math.abs(totalLoss) : totalProfit > 0 ? Infinity : 0;
    const profitPerTrade = trades.length > 0 ? netProfit / trades.length : 0;

    return {
      totalProfit,
      totalLoss,
      netProfit,
      totalTrades: trades.length,
      winningTrades: profits.length,
      losingTrades: losses.length,
      winRate,
      profitFactor,
      averageProfit,
      averageLoss,
      maxProfit,
      maxLoss,
      profitPerTrade,
      returnOnCapital: undefined // 将来の拡張用
    };
  }

  private async calculateAdvancedMetrics(trades: Trade[]): Promise<AdvancedMetrics> {
    const riskAnalysis = this.calculateRiskAnalysis(trades);
    const streakAnalysis = this.calculateStreakAnalysis(trades);
    const distributionAnalysis = this.calculateDistributionAnalysis(trades);

    return {
      riskAnalysis,
      streakAnalysis,
      distributionAnalysis
    };
  }

  private calculateRiskAnalysis(trades: Trade[]) {
    // 累積損益の計算
    const sortedTrades = [...trades].sort((a, b) => a.date.getTime() - b.date.getTime());
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    sortedTrades.forEach(trade => {
      cumulative += trade.realizedProfitLoss;
      
      if (cumulative > peak) {
        peak = cumulative;
      }
      
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = peak > 0 ? drawdown / peak : 0;
      }
    });

    // シャープレシオの計算
    const returns = trades.map(t => t.realizedProfitLoss);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    // カルマーレシオ（年間収益率 / 最大ドローダウン）
    const annualReturn = avgReturn * 252; // 仮定：年252取引日
    const calmarRatio = maxDrawdown > 0 ? annualReturn / maxDrawdown : 0;

    // VaRの計算
    const sortedReturns = returns.sort((a, b) => a - b);
    const var95Index = Math.floor(returns.length * 0.05);
    const var99Index = Math.floor(returns.length * 0.01);

    return {
      maxDrawdown: -maxDrawdown,
      maxDrawdownPercent: -maxDrawdownPercent,
      sharpeRatio,
      calmarRatio,
      volatility: stdDev,
      valueAtRisk95: sortedReturns[var95Index] || 0,
      valueAtRisk99: sortedReturns[var99Index] || 0
    };
  }

  private calculateStreakAnalysis(trades: Trade[]) {
    const sortedTrades = [...trades].sort((a, b) => a.date.getTime() - b.date.getTime());
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let finalStreak = 0;
    let finalStreakType: 'win' | 'loss' | 'none' = 'none';
    const winStreaks: number[] = [];
    const lossStreaks: number[] = [];

    sortedTrades.forEach((trade, index) => {
      if (trade.realizedProfitLoss > 0) {
        currentWinStreak++;
        if (currentLossStreak > 0) {
          lossStreaks.push(currentLossStreak);
          currentLossStreak = 0;
        }
        if (index === sortedTrades.length - 1) {
          finalStreak = currentWinStreak;
          finalStreakType = 'win';
        }
      } else {
        currentLossStreak++;
        if (currentWinStreak > 0) {
          winStreaks.push(currentWinStreak);
          currentWinStreak = 0;
        }
        if (index === sortedTrades.length - 1) {
          finalStreak = currentLossStreak;
          finalStreakType = 'loss';
        }
      }
      
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    });

    if (currentWinStreak > 0) winStreaks.push(currentWinStreak);
    if (currentLossStreak > 0) lossStreaks.push(currentLossStreak);

    const averageWinStreak = winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0;
    const averageLossStreak = lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0;

    return {
      maxWinStreak,
      maxLossStreak,
      currentStreak: finalStreak,
      streakType: finalStreakType,
      averageWinStreak,
      averageLossStreak
    };
  }

  private calculateDistributionAnalysis(trades: Trade[]) {
    const profits = trades.filter(t => t.realizedProfitLoss > 0);
    const losses = trades.filter(t => t.realizedProfitLoss < 0);

    const profitRanges = [
      { min: 0, max: 1000, label: '0-1,000円' },
      { min: 1000, max: 5000, label: '1,000-5,000円' },
      { min: 5000, max: 10000, label: '5,000-10,000円' },
      { min: 10000, max: 50000, label: '10,000-50,000円' },
      { min: 50000, max: Infinity, label: '50,000円以上' }
    ];

    const lossRanges = [
      { min: -1000, max: 0, label: '0~-1,000円' },
      { min: -5000, max: -1000, label: '-1,000~-5,000円' },
      { min: -10000, max: -5000, label: '-5,000~-10,000円' },
      { min: -50000, max: -10000, label: '-10,000~-50,000円' },
      { min: -Infinity, max: -50000, label: '-50,000円以下' }
    ];

    const profitDistribution = profitRanges.map(range => {
      const tradesInRange = profits.filter(t => 
        t.realizedProfitLoss > range.min && t.realizedProfitLoss <= range.max
      );
      
      return {
        range: range.label,
        count: tradesInRange.length,
        percentage: profits.length > 0 ? (tradesInRange.length / profits.length) * 100 : 0,
        totalAmount: tradesInRange.reduce((sum, t) => sum + t.realizedProfitLoss, 0)
      };
    });

    const lossDistribution = lossRanges.map(range => {
      const tradesInRange = losses.filter(t => 
        t.realizedProfitLoss >= range.min && t.realizedProfitLoss < range.max
      );
      
      return {
        range: range.label,
        count: tradesInRange.length,
        percentage: losses.length > 0 ? (tradesInRange.length / losses.length) * 100 : 0,
        totalAmount: tradesInRange.reduce((sum, t) => sum + t.realizedProfitLoss, 0)
      };
    });

    return {
      profitDistribution,
      lossDistribution
    };
  }

  private async calculateStockPerformanceAnalysis(trades: Trade[], depth: 'top5' | 'top10' | 'all'): Promise<StockPerformanceAnalysis> {
    const stockData = new Map<string, Trade[]>();
    
    trades.forEach(trade => {
      const key = `${trade.stockCode || 'UNKNOWN'}_${trade.stockName || 'UNKNOWN'}`;
      if (!stockData.has(key)) {
        stockData.set(key, []);
      }
      stockData.get(key)!.push(trade);
    });

    const stockDetails: StockPerformanceDetail[] = [];
    const totalProfit = trades.reduce((sum, t) => sum + Math.max(0, t.realizedProfitLoss), 0);
    const totalRisk = trades.reduce((sum, t) => sum + Math.abs(t.realizedProfitLoss), 0);
    
    for (const [key, stockTrades] of stockData) {
      const [code, ...nameParts] = key.split('_');
      const name = nameParts.join('_');
      
      const profits = stockTrades.filter(t => t.realizedProfitLoss > 0);
      const losses = stockTrades.filter(t => t.realizedProfitLoss < 0);
      
      const stockTotalProfit = profits.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const stockTotalLoss = losses.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const netProfit = stockTotalProfit + stockTotalLoss;
      
      const mostProfitable = profits.length > 0 
        ? profits.reduce((max, t) => t.realizedProfitLoss > max.realizedProfitLoss ? t : max)
        : null;
      
      const worstTrade = losses.length > 0
        ? losses.reduce((min, t) => t.realizedProfitLoss < min.realizedProfitLoss ? t : min)
        : null;

      const stockRisk = stockTrades.reduce((sum, t) => sum + Math.abs(t.realizedProfitLoss), 0);

      stockDetails.push({
        symbol: code,
        name: name,
        totalProfit: stockTotalProfit,
        totalLoss: stockTotalLoss,
        netProfit,
        trades: stockTrades.length,
        winRate: stockTrades.length > 0 ? profits.length / stockTrades.length : 0,
        profitFactor: Math.abs(stockTotalLoss) > 0 ? stockTotalProfit / Math.abs(stockTotalLoss) : stockTotalProfit > 0 ? Infinity : 0,
        averageProfit: profits.length > 0 ? stockTotalProfit / profits.length : 0,
        averageLoss: losses.length > 0 ? stockTotalLoss / losses.length : 0,
        maxProfit: profits.length > 0 ? Math.max(...profits.map(t => t.realizedProfitLoss)) : 0,
        maxLoss: losses.length > 0 ? Math.min(...losses.map(t => t.realizedProfitLoss)) : 0,
        profitContribution: totalProfit > 0 ? (stockTotalProfit / totalProfit) * 100 : 0,
        riskContribution: totalRisk > 0 ? (stockRisk / totalRisk) * 100 : 0,
        bestTrade: mostProfitable 
          ? {
              date: mostProfitable.date.toISOString().split('T')[0],
              profit: mostProfitable.realizedProfitLoss
            }
          : { date: '', profit: 0 },
        worstTrade: worstTrade
          ? {
              date: worstTrade.date.toISOString().split('T')[0],
              loss: worstTrade.realizedProfitLoss
            }
          : { date: '', loss: 0 }
      });
    }

    const limit = depth === 'top5' ? 5 : depth === 'top10' ? 10 : stockDetails.length;

    const topPerformers = stockDetails
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, limit);

    const worstPerformers = stockDetails
      .sort((a, b) => a.netProfit - b.netProfit)
      .slice(0, limit);

    const mostTradedStocks = stockDetails
      .sort((a, b) => b.trades - a.trades)
      .slice(0, limit);

    const highestWinRateStocks = stockDetails
      .filter(s => s.trades >= 3) // 最低3回以上の取引
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, limit);

    // 集中リスク計算（上位5銘柄の利益貢献度）
    const top5Contribution = topPerformers
      .slice(0, 5)
      .reduce((sum, stock) => sum + stock.profitContribution, 0);

    return {
      topPerformers,
      worstPerformers,
      mostTradedStocks,
      highestWinRateStocks,
      diversificationMetrics: {
        totalStocks: stockDetails.length,
        concentrationRisk: top5Contribution,
        sectorDiversification: undefined // 将来の拡張用
      }
    };
  }

  private async calculateTrendAndRiskAnalysis(trades: Trade[]): Promise<TrendAndRiskAnalysis> {
    const weeklyTrend = this.calculateWeeklyTrend(trades);
    const dailyOfWeekPerformance = this.calculateDailyOfWeekPerformance(trades);
    const monthlyMomentum = this.calculateMonthlyMomentum(trades);
    const seasonalPatterns = this.calculateSeasonalPatterns(trades);
    const performanceConsistency = this.calculatePerformanceConsistency(trades);

    return {
      weeklyTrend,
      dailyOfWeekPerformance,
      monthlyMomentum,
      seasonalPatterns,
      performanceConsistency
    };
  }

  private calculateWeeklyTrend(trades: Trade[]) {
    const weeklyData = new Map<number, Trade[]>();
    
    trades.forEach(trade => {
      const week = this.getWeekOfMonth(trade.date);
      if (!weeklyData.has(week)) {
        weeklyData.set(week, []);
      }
      weeklyData.get(week)!.push(trade);
    });

    const weeklyTrend = [];
    for (let week = 1; week <= 5; week++) {
      const weekTrades = weeklyData.get(week) || [];
      const profit = weekTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const wins = weekTrades.filter(t => t.realizedProfitLoss > 0).length;
      
      weeklyTrend.push({
        week,
        profit,
        trades: weekTrades.length,
        winRate: weekTrades.length > 0 ? wins / weekTrades.length : 0
      });
    }

    return weeklyTrend;
  }

  private calculateDailyOfWeekPerformance(trades: Trade[]) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dailyData = new Map<string, Trade[]>();

    days.forEach(day => dailyData.set(day, []));

    trades.forEach(trade => {
      const day = days[trade.date.getDay()];
      dailyData.get(day)!.push(trade);
    });

    return days.map(day => {
      const dayTrades = dailyData.get(day)!;
      const profit = dayTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const wins = dayTrades.filter(t => t.realizedProfitLoss > 0).length;
      
      return {
        day,
        profit,
        trades: dayTrades.length,
        winRate: dayTrades.length > 0 ? wins / dayTrades.length : 0,
        avgProfitPerTrade: dayTrades.length > 0 ? profit / dayTrades.length : 0
      };
    });
  }

  private calculateMonthlyMomentum(trades: Trade[]) {
    const sortedTrades = [...trades].sort((a, b) => a.date.getTime() - b.date.getTime());
    const halfPoint = Math.floor(sortedTrades.length / 2);
    
    const firstHalf = sortedTrades.slice(0, halfPoint);
    const secondHalf = sortedTrades.slice(halfPoint);
    
    const firstHalfProfit = firstHalf.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
    const secondHalfProfit = secondHalf.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
    
    const indicator = secondHalfProfit - firstHalfProfit;
    const trend = indicator > 1000 ? 'improving' : indicator < -1000 ? 'declining' : 'stable';
    
    const description = trend === 'improving' 
      ? '取引パフォーマンスが改善傾向にあります'
      : trend === 'declining'
      ? '取引パフォーマンスが悪化傾向にあります'
      : '取引パフォーマンスは安定しています';

    return {
      indicator,
      trend: trend as 'improving' | 'stable' | 'declining',
      description
    };
  }

  private calculateSeasonalPatterns(trades: Trade[]) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarterData: { [key: string]: Trade[] } = { Q1: [], Q2: [], Q3: [], Q4: [] };
    
    trades.forEach(trade => {
      const month = trade.date.getMonth();
      const quarter = Math.floor(month / 3);
      quarterData[quarters[quarter]].push(trade);
    });

    return quarters.map(quarter => {
      const quarterTrades = quarterData[quarter];
      const profit = quarterTrades.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const wins = quarterTrades.filter(t => t.realizedProfitLoss > 0).length;
      
      return {
        quarter,
        avgProfit: quarterTrades.length > 0 ? profit / quarterTrades.length : 0,
        winRate: quarterTrades.length > 0 ? wins / quarterTrades.length : 0,
        trades: quarterTrades.length
      };
    });
  }

  private calculatePerformanceConsistency(trades: Trade[]) {
    const dailyProfits = this.calculateDailyReturns(trades);
    const winRates = this.calculateDailyWinRates(trades);
    const tradingFrequencies = this.calculateDailyTradingFrequencies(trades);

    const profitMean = dailyProfits.reduce((a, b) => a + b, 0) / dailyProfits.length;
    const profitStandardDeviation = Math.sqrt(
      dailyProfits.reduce((sum, profit) => sum + Math.pow(profit - profitMean, 2), 0) / dailyProfits.length
    );

    const winRateMean = winRates.reduce((a, b) => a + b, 0) / winRates.length;
    const winRateConsistency = 1 - Math.sqrt(
      winRates.reduce((sum, rate) => sum + Math.pow(rate - winRateMean, 2), 0) / winRates.length
    );

    const freqMean = tradingFrequencies.reduce((a, b) => a + b, 0) / tradingFrequencies.length;
    const tradingFrequencyVariance = tradingFrequencies.reduce(
      (sum, freq) => sum + Math.pow(freq - freqMean, 2), 0
    ) / tradingFrequencies.length;

    return {
      profitStandardDeviation,
      winRateConsistency: Math.max(0, winRateConsistency),
      tradingFrequencyVariance
    };
  }

  private async calculateMonthlyBreakdown(trades: Trade[]): Promise<MonthlyBreakdown[]> {
    const monthlyData = new Map<string, Trade[]>();
    
    trades.forEach(trade => {
      const monthKey = `${trade.date.getFullYear()}-${String(trade.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, []);
      }
      monthlyData.get(monthKey)!.push(trade);
    });

    const breakdown: MonthlyBreakdown[] = [];
    
    for (const [month, monthTrades] of monthlyData) {
      const profits = monthTrades.filter(t => t.realizedProfitLoss > 0);
      const losses = monthTrades.filter(t => t.realizedProfitLoss < 0);
      
      const totalProfit = profits.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      const totalLoss = losses.reduce((sum, t) => sum + t.realizedProfitLoss, 0);
      
      // 日次データの計算
      const dailyProfits = new Map<string, { profit: number; trades: number }>();
      monthTrades.forEach(trade => {
        const dateKey = trade.date.toISOString().split('T')[0];
        const current = dailyProfits.get(dateKey) || { profit: 0, trades: 0 };
        dailyProfits.set(dateKey, {
          profit: current.profit + trade.realizedProfitLoss,
          trades: current.trades + 1
        });
      });
      
      const dailyEntries = Array.from(dailyProfits.entries());
      const bestDay = dailyEntries.reduce((max, [date, data]) => 
        data.profit > max.profit ? { date, profit: data.profit, trades: data.trades } : max,
        { date: '', profit: -Infinity, trades: 0 }
      );
      
      const worstDay = dailyEntries.reduce((min, [date, data]) => 
        data.profit < min.loss ? { date, loss: data.profit, trades: data.trades } : min,
        { date: '', loss: Infinity, trades: 0 }
      );

      // 銘柄別トップ3
      const stockPerformance = new Map<string, { profit: number; trades: number }>();
      monthTrades.forEach(trade => {
        const symbol = trade.stockCode || 'UNKNOWN';
        const current = stockPerformance.get(symbol) || { profit: 0, trades: 0 };
        stockPerformance.set(symbol, {
          profit: current.profit + trade.realizedProfitLoss,
          trades: current.trades + 1
        });
      });

      const topStocks = Array.from(stockPerformance.entries())
        .map(([symbol, data]) => ({ symbol, ...data }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 3);

      // リスク指標
      const dailyProfitValues = Array.from(dailyProfits.values()).map(d => d.profit);
      const maxDailyLoss = Math.min(...dailyProfitValues, 0);
      const avgDaily = dailyProfitValues.reduce((a, b) => a + b, 0) / dailyProfitValues.length;
      const volatility = Math.sqrt(
        dailyProfitValues.reduce((sum, p) => sum + Math.pow(p - avgDaily, 2), 0) / dailyProfitValues.length
      );

      breakdown.push({
        month,
        basicMetrics: {
          profit: totalProfit,
          loss: totalLoss,
          netProfit: totalProfit + totalLoss,
          trades: monthTrades.length,
          winRate: monthTrades.length > 0 ? profits.length / monthTrades.length : 0,
          profitFactor: Math.abs(totalLoss) > 0 ? totalProfit / Math.abs(totalLoss) : totalProfit > 0 ? Infinity : 0
        },
        bestPerformingDay: bestDay.date ? bestDay : { date: month + '-01', profit: 0, trades: 0 },
        worstPerformingDay: worstDay.date ? { ...worstDay, loss: worstDay.loss } : { date: month + '-01', loss: 0, trades: 0 },
        topStocks,
        riskMetrics: {
          maxDailyLoss,
          volatility,
          consistency: volatility > 0 ? avgDaily / volatility : 0
        }
      });
    }

    return breakdown.sort((a, b) => a.month.localeCompare(b.month));
  }

  // ヘルパーメソッド
  private getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const weekOffset = firstDay.getDay();
    return Math.ceil((date.getDate() + weekOffset) / 7);
  }

  private calculateDailyReturns(trades: Trade[]): number[] {
    const dailyProfits = new Map<string, number>();
    
    trades.forEach(trade => {
      const dateKey = trade.date.toISOString().split('T')[0];
      dailyProfits.set(dateKey, (dailyProfits.get(dateKey) || 0) + trade.realizedProfitLoss);
    });

    return Array.from(dailyProfits.values());
  }

  private calculateDailyWinRates(trades: Trade[]): number[] {
    const dailyTrades = new Map<string, Trade[]>();
    
    trades.forEach(trade => {
      const dateKey = trade.date.toISOString().split('T')[0];
      if (!dailyTrades.has(dateKey)) {
        dailyTrades.set(dateKey, []);
      }
      dailyTrades.get(dateKey)!.push(trade);
    });

    return Array.from(dailyTrades.values()).map(dayTrades => {
      const wins = dayTrades.filter(t => t.realizedProfitLoss > 0).length;
      return dayTrades.length > 0 ? wins / dayTrades.length : 0;
    });
  }

  private calculateDailyTradingFrequencies(trades: Trade[]): number[] {
    const dailyTrades = new Map<string, number>();
    
    trades.forEach(trade => {
      const dateKey = trade.date.toISOString().split('T')[0];
      dailyTrades.set(dateKey, (dailyTrades.get(dateKey) || 0) + 1);
    });

    return Array.from(dailyTrades.values());
  }

  private convertToRelativeValues(stats: StatisticsExport): void {
    const maxValue = Math.max(
      Math.abs(stats.performanceOverview.totalProfit || 0),
      Math.abs(stats.performanceOverview.totalLoss || 0)
    );

    if (maxValue === 0) return;

    // パフォーマンス概要の相対化
    stats.performanceOverview.totalProfit = (stats.performanceOverview.totalProfit / maxValue) * 100;
    stats.performanceOverview.totalLoss = (stats.performanceOverview.totalLoss / maxValue) * 100;
    stats.performanceOverview.netProfit = (stats.performanceOverview.netProfit / maxValue) * 100;
    // 他の項目も同様に相対化
  }

  private maskStockNames(stats: StatisticsExport): void {
    // 銘柄名をマスク
    if (stats.stockPerformanceAnalysis?.topPerformers) {
      stats.stockPerformanceAnalysis.topPerformers.forEach((stock, index) => {
        stock.name = `銘柄${index + 1}`;
        stock.symbol = `CODE${index + 1}`;
      });
    }
    // 他の銘柄データも同様にマスク
  }

  async exportToJSON(options: ExportOptions): Promise<Blob> {
    const stats = await this.generateStatistics(options);
    const json = JSON.stringify(stats, null, 2);
    return new Blob([json], { type: 'application/json' });
  }
}