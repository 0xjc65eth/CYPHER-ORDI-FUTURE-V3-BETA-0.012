import { 
  Transaction, 
  AssetHolding, 
  PortfolioMetrics, 
  PerformanceHistory,
  Portfolio 
} from '@/types/portfolio';

// Extended types for advanced calculations
export interface CostBasisLot {
  id: string;
  transactionId: string;
  asset: string;
  quantity: number;
  price: number;
  totalCost: number;
  date: Date;
  remaining: number;
  isPartiallyRealized: boolean;
}

export interface TradeAnalysis {
  transactionId: string;
  asset: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: Date;
  realizedPNL: number;
  holdingPeriod: number;
  isWin: boolean;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDate: Date;
  currentDrawdown: number;
  beta: number;
  alpha: number;
  volatility: number;
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional Value at Risk 95%
  calmarRatio: number;
  informationRatio: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  timeWeightedReturn: number;
  winRate: number;
  profitFactor: number;
  avgWinAmount: number;
  avgLossAmount: number;
  avgWinPercentage: number;
  avgLossPercentage: number;
  largestWin: number;
  largestLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  avgHoldingPeriod: number;
  turnoverRate: number;
}

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'WAC';

export class PortfolioCalculator {
  private costBasisLots: Map<string, CostBasisLot[]> = new Map();
  private tradeHistory: TradeAnalysis[] = [];
  private priceHistory: Map<string, Array<{ date: Date; price: number }>> = new Map();
  
  constructor(
    private costBasisMethod: CostBasisMethod = 'FIFO',
    private baseCurrency: string = 'USD'
  ) {}

  /**
   * Calculate portfolio metrics with advanced analytics
   */
  public calculatePortfolioMetrics(
    holdings: AssetHolding[],
    transactions: Transaction[],
    currentPrices: Record<string, number>,
    benchmarkReturns?: number[]
  ): PortfolioMetrics {
    // Initialize cost basis tracking
    this.initializeCostBasisLots(transactions);
    
    // Calculate realized PNL from completed trades
    const realizedPNL = this.calculateRealizedPNL(transactions);
    
    // Calculate unrealized PNL from current holdings
    const unrealizedPNL = this.calculateUnrealizedPNL(holdings, currentPrices);
    
    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(transactions);
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(transactions, benchmarkReturns);
    
    // Calculate time-weighted returns
    const timeWeightedReturn = this.calculateTimeWeightedReturn(transactions, currentPrices);
    
    // Calculate total portfolio value and cost
    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalCost = holdings.reduce((sum, holding) => sum + holding.totalCost, 0);
    
    return {
      // Overview
      totalValue,
      totalCost,
      totalPNL: realizedPNL.total + unrealizedPNL.total,
      totalPNLPercentage: totalCost > 0 ? ((realizedPNL.total + unrealizedPNL.total) / totalCost) * 100 : 0,
      
      // Breakdown
      unrealizedPNL: unrealizedPNL.total,
      unrealizedPNLPercentage: unrealizedPNL.percentage,
      realizedPNL: realizedPNL.total,
      realizedPNLPercentage: realizedPNL.percentage,
      
      // Performance
      dayReturn: this.calculatePeriodReturn(transactions, 1),
      dayReturnPercentage: this.calculatePeriodReturnPercentage(transactions, 1),
      weekReturn: this.calculatePeriodReturn(transactions, 7),
      weekReturnPercentage: this.calculatePeriodReturnPercentage(transactions, 7),
      monthReturn: this.calculatePeriodReturn(transactions, 30),
      monthReturnPercentage: this.calculatePeriodReturnPercentage(transactions, 30),
      yearReturn: this.calculatePeriodReturn(transactions, 365),
      yearReturnPercentage: this.calculatePeriodReturnPercentage(transactions, 365),
      allTimeReturn: realizedPNL.total + unrealizedPNL.total,
      allTimeReturnPercentage: totalCost > 0 ? ((realizedPNL.total + unrealizedPNL.total) / totalCost) * 100 : 0,
      
      // Risk Metrics
      volatility: riskMetrics.volatility,
      sharpeRatio: riskMetrics.sharpeRatio,
      sortinoRatio: riskMetrics.sortinoRatio,
      maxDrawdown: riskMetrics.maxDrawdown,
      maxDrawdownDate: riskMetrics.maxDrawdownDate ? riskMetrics.maxDrawdownDate.toISOString() : new Date().toISOString(),
      currentDrawdown: riskMetrics.currentDrawdown,
      beta: riskMetrics.beta,
      alpha: riskMetrics.alpha,
      calmarRatio: riskMetrics.calmarRatio,
      
      // Analytics
      winRate: performanceMetrics.winRate,
      avgWinAmount: performanceMetrics.avgWinAmount,
      avgLossAmount: performanceMetrics.avgLossAmount,
      profitFactor: performanceMetrics.profitFactor,
      bestTrade: this.getBestTrade(transactions),
      worstTrade: this.getWorstTrade(transactions),
      longestWinStreak: performanceMetrics.longestWinStreak,
      longestLossStreak: performanceMetrics.longestLossStreak,
      
      // Activity
      totalTransactions: transactions.length,
      totalBuys: transactions.filter(t => t.type === 'buy').length,
      totalSells: transactions.filter(t => t.type === 'sell').length,
      totalFees: transactions.reduce((sum, t) => sum + t.feeUSD, 0),
      avgHoldingPeriod: performanceMetrics.avgHoldingPeriod,
      turnoverRate: performanceMetrics.turnoverRate
    };
  }

  /**
   * Calculate cost basis using specified method
   */
  public calculateCostBasis(
    asset: string,
    sellQuantity: number,
    sellDate: Date
  ): { costBasis: number; realizedPNL: number; remainingLots: CostBasisLot[] } {
    const lots = this.costBasisLots.get(asset) || [];
    const availableLots = lots.filter(lot => lot.remaining > 0 && lot.date <= sellDate);
    
    if (availableLots.length === 0) {
      return { costBasis: 0, realizedPNL: 0, remainingLots: lots };
    }

    let remainingToSell = sellQuantity;
    let totalCostBasis = 0;
    const updatedLots = [...lots];

    // Sort lots based on cost basis method
    const sortedLots = this.sortLotsByCostBasisMethod(availableLots);

    for (const lot of sortedLots) {
      if (remainingToSell <= 0) break;

      const lotIndex = updatedLots.findIndex(l => l.id === lot.id);
      const quantityToUse = Math.min(remainingToSell, lot.remaining);
      const costBasisForQuantity = (quantityToUse / lot.quantity) * lot.totalCost;

      totalCostBasis += costBasisForQuantity;
      remainingToSell -= quantityToUse;

      // Update the lot
      updatedLots[lotIndex] = {
        ...lot,
        remaining: lot.remaining - quantityToUse,
        isPartiallyRealized: lot.remaining - quantityToUse > 0
      };
    }

    return {
      costBasis: totalCostBasis,
      realizedPNL: 0, // Will be calculated by caller
      remainingLots: updatedLots
    };
  }

  /**
   * Calculate Time-Weighted Return (TWR)
   */
  private calculateTimeWeightedReturn(
    transactions: Transaction[],
    currentPrices: Record<string, number>
  ): number {
    const cashFlows = this.getCashFlows(transactions);
    const portfolioValues = this.getPortfolioValues(transactions, currentPrices);
    
    if (portfolioValues.length < 2) return 0;

    let twr = 1;
    for (let i = 1; i < portfolioValues.length; i++) {
      const previousValue = portfolioValues[i - 1].value;
      const currentValue = portfolioValues[i].value;
      const cashFlow = cashFlows.find(cf => 
        cf.date.getTime() === portfolioValues[i].date.getTime()
      )?.amount || 0;

      if (previousValue > 0) {
        const periodReturn = (currentValue - cashFlow) / previousValue;
        twr *= (1 + periodReturn);
      }
    }

    return (twr - 1) * 100;
  }

  /**
   * Calculate portfolio volatility
   */
  public calculatePortfolioVolatility(
    returns: number[],
    annualized: boolean = true
  ): number {
    if (returns.length < 2) return 0;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const dailyVolatility = Math.sqrt(variance);

    return annualized ? dailyVolatility * Math.sqrt(365) : dailyVolatility;
  }

  /**
   * Calculate Sharpe Ratio
   */
  private calculateSharpeRatio(
    returns: number[],
    riskFreeRate: number = 0.02
  ): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculatePortfolioVolatility(returns, false);
    
    if (volatility === 0) return 0;
    
    const annualizedReturn = avgReturn * 365;
    const annualizedVolatility = volatility * Math.sqrt(365);
    
    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  /**
   * Calculate Sortino Ratio
   */
  private calculateSortinoRatio(
    returns: number[],
    riskFreeRate: number = 0.02
  ): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) return Infinity;

    const downwardDeviation = Math.sqrt(
      negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
    );

    if (downwardDeviation === 0) return 0;

    const annualizedReturn = avgReturn * 365;
    const annualizedDownwardDeviation = downwardDeviation * Math.sqrt(365);

    return (annualizedReturn - riskFreeRate) / annualizedDownwardDeviation;
  }

  /**
   * Calculate Maximum Drawdown
   */
  private calculateMaxDrawdown(portfolioValues: Array<{ date: Date; value: number }>): {
    maxDrawdown: number;
    maxDrawdownDate: Date;
    currentDrawdown: number;
  } {
    if (portfolioValues.length === 0) {
      return { maxDrawdown: 0, maxDrawdownDate: new Date(), currentDrawdown: 0 };
    }

    let maxValue = portfolioValues[0].value;
    let maxDrawdown = 0;
    let maxDrawdownDate = portfolioValues[0].date;
    let currentDrawdown = 0;

    for (const point of portfolioValues) {
      if (point.value > maxValue) {
        maxValue = point.value;
      }

      const drawdown = (maxValue - point.value) / maxValue;
      
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownDate = point.date;
      }
    }

    // Calculate current drawdown
    const currentValue = portfolioValues[portfolioValues.length - 1].value;
    const peakValue = Math.max(...portfolioValues.map(p => p.value));
    currentDrawdown = (peakValue - currentValue) / peakValue;

    return {
      maxDrawdown: maxDrawdown * 100,
      maxDrawdownDate,
      currentDrawdown: currentDrawdown * 100
    };
  }

  /**
   * Calculate Beta (correlation with benchmark)
   */
  private calculateBeta(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): number {
    if (!benchmarkReturns || portfolioReturns.length !== benchmarkReturns.length) {
      return 1; // Default beta
    }

    const n = portfolioReturns.length;
    if (n < 2) return 1;

    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
    const benchmarkMean = benchmarkReturns.reduce((sum, r) => sum + r, 0) / n;

    let covariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < n; i++) {
      const portfolioDiff = portfolioReturns[i] - portfolioMean;
      const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
      
      covariance += portfolioDiff * benchmarkDiff;
      benchmarkVariance += benchmarkDiff * benchmarkDiff;
    }

    covariance /= (n - 1);
    benchmarkVariance /= (n - 1);

    return benchmarkVariance === 0 ? 1 : covariance / benchmarkVariance;
  }

  /**
   * Calculate Alpha (excess return over benchmark adjusted for beta)
   */
  private calculateAlpha(
    portfolioReturns: number[],
    benchmarkReturns: number[],
    beta: number,
    riskFreeRate: number = 0.02
  ): number {
    if (!benchmarkReturns || portfolioReturns.length === 0) return 0;

    const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length * 365;
    const benchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length * 365;

    return portfolioReturn - (riskFreeRate + beta * (benchmarkReturn - riskFreeRate));
  }

  // Helper methods
  private initializeCostBasisLots(transactions: Transaction[]): void {
    this.costBasisLots.clear();
    
    const buyTransactions = transactions
      .filter(t => t.type === 'buy')
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const transaction of buyTransactions) {
      if (!this.costBasisLots.has(transaction.asset)) {
        this.costBasisLots.set(transaction.asset, []);
      }

      const lot: CostBasisLot = {
        id: `${transaction.id}-lot`,
        transactionId: transaction.id,
        asset: transaction.asset,
        quantity: transaction.amount,
        price: transaction.price,
        totalCost: transaction.totalValue + transaction.feeUSD,
        date: new Date(transaction.timestamp),
        remaining: transaction.amount,
        isPartiallyRealized: false
      };

      this.costBasisLots.get(transaction.asset)!.push(lot);
    }
  }

  private sortLotsByCostBasisMethod(lots: CostBasisLot[]): CostBasisLot[] {
    switch (this.costBasisMethod) {
      case 'FIFO':
        return lots.sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'LIFO':
        return lots.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'HIFO':
        return lots.sort((a, b) => b.price - a.price);
      case 'WAC':
        // For WAC, we'll calculate weighted average and treat as single lot
        const totalQuantity = lots.reduce((sum, lot) => sum + lot.remaining, 0);
        const totalCost = lots.reduce((sum, lot) => sum + (lot.remaining / lot.quantity) * lot.totalCost, 0);
        const avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
        
        return [{
          ...lots[0],
          quantity: totalQuantity,
          price: avgPrice,
          totalCost: totalCost,
          remaining: totalQuantity
        }];
      default:
        return lots;
    }
  }

  private calculateRealizedPNL(transactions: Transaction[]): { total: number; percentage: number } {
    const sellTransactions = transactions.filter(t => t.type === 'sell');
    let totalRealizedPNL = 0;
    let totalCostBasis = 0;

    for (const sellTx of sellTransactions) {
      const { costBasis } = this.calculateCostBasis(
        sellTx.asset,
        sellTx.amount,
        new Date(sellTx.timestamp)
      );
      
      const realizedPNL = sellTx.totalValue - sellTx.feeUSD - costBasis;
      totalRealizedPNL += realizedPNL;
      totalCostBasis += costBasis;
    }

    return {
      total: totalRealizedPNL,
      percentage: totalCostBasis > 0 ? (totalRealizedPNL / totalCostBasis) * 100 : 0
    };
  }

  private calculateUnrealizedPNL(
    holdings: AssetHolding[],
    currentPrices: Record<string, number>
  ): { total: number; percentage: number } {
    let totalUnrealizedPNL = 0;
    let totalCostBasis = 0;

    for (const holding of holdings) {
      const currentPrice = currentPrices[holding.asset] || holding.currentPrice;
      const currentValue = holding.totalAmount * currentPrice;
      const unrealizedPNL = currentValue - holding.totalCost;
      
      totalUnrealizedPNL += unrealizedPNL;
      totalCostBasis += holding.totalCost;
    }

    return {
      total: totalUnrealizedPNL,
      percentage: totalCostBasis > 0 ? (totalUnrealizedPNL / totalCostBasis) * 100 : 0
    };
  }

  private calculatePerformanceMetrics(transactions: Transaction[]): PerformanceMetrics {
    const trades = this.analyzeCompletedTrades(transactions);
    const wins = trades.filter(t => t.isWin);
    const losses = trades.filter(t => !t.isWin);

    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const avgWinAmount = wins.length > 0 ? wins.reduce((sum, t) => sum + t.realizedPNL, 0) / wins.length : 0;
    const avgLossAmount = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(t.realizedPNL), 0) / losses.length : 0;
    
    const totalWins = wins.reduce((sum, t) => sum + t.realizedPNL, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.realizedPNL, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    const streaks = this.calculateStreaks(trades);
    const avgHoldingPeriod = trades.length > 0 
      ? trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / trades.length 
      : 0;

    const totalReturn = trades.reduce((sum, t) => sum + t.realizedPNL, 0);

    return {
      totalReturn,
      totalReturnPercentage: 0, // Will be calculated based on cost basis
      annualizedReturn: 0, // Will be calculated based on time period
      timeWeightedReturn: 0, // Calculated separately
      winRate,
      profitFactor,
      avgWinAmount,
      avgLossAmount,
      avgWinPercentage: 0,
      avgLossPercentage: 0,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.realizedPNL)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.realizedPNL)) : 0,
      longestWinStreak: streaks.longestWinStreak,
      longestLossStreak: streaks.longestLossStreak,
      currentStreak: streaks.currentStreak,
      currentStreakType: streaks.currentStreakType,
      avgHoldingPeriod,
      turnoverRate: 0 // Will be calculated based on portfolio turnover
    };
  }

  private calculateRiskMetrics(
    transactions: Transaction[],
    benchmarkReturns?: number[]
  ): RiskMetrics {
    const portfolioValues = this.getPortfolioValues(transactions, {});
    const returns = this.calculateDailyReturns(portfolioValues);
    
    const drawdownData = this.calculateMaxDrawdown(portfolioValues);
    const volatility = this.calculatePortfolioVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(returns);
    const sortinoRatio = this.calculateSortinoRatio(returns);
    const beta = this.calculateBeta(returns, benchmarkReturns || []);
    const alpha = this.calculateAlpha(returns, benchmarkReturns || [], beta);

    // Calculate VaR and CVaR
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(returns.length * 0.05);
    const var95 = sortedReturns[var95Index] || 0;
    const cvar95 = var95Index > 0 
      ? sortedReturns.slice(0, var95Index).reduce((sum, r) => sum + r, 0) / var95Index
      : 0;

    const calmarRatio = drawdownData.maxDrawdown > 0 
      ? (returns.reduce((sum, r) => sum + r, 0) / returns.length * 365) / (drawdownData.maxDrawdown / 100)
      : 0;

    return {
      sharpeRatio,
      sortinoRatio,
      maxDrawdown: drawdownData.maxDrawdown,
      maxDrawdownDate: drawdownData.maxDrawdownDate,
      currentDrawdown: drawdownData.currentDrawdown,
      beta,
      alpha,
      volatility,
      var95: var95 * 100,
      cvar95: cvar95 * 100,
      calmarRatio,
      informationRatio: 0 // Would need benchmark for proper calculation
    };
  }

  private analyzeCompletedTrades(transactions: Transaction[]): TradeAnalysis[] {
    // This is a simplified version - would need more complex logic for partial sells
    const trades: TradeAnalysis[] = [];
    const assetHoldings = new Map<string, { buyTx: Transaction; quantity: number }>();

    for (const tx of transactions.sort((a, b) => a.timestamp - b.timestamp)) {
      if (tx.type === 'buy') {
        assetHoldings.set(tx.asset, { buyTx: tx, quantity: tx.amount });
      } else if (tx.type === 'sell') {
        const holding = assetHoldings.get(tx.asset);
        if (holding) {
          const realizedPNL = (tx.price - holding.buyTx.price) * tx.amount - tx.feeUSD - holding.buyTx.feeUSD;
          const holdingPeriod = (tx.timestamp - holding.buyTx.timestamp) / (1000 * 60 * 60 * 24);
          
          trades.push({
            transactionId: tx.id,
            asset: tx.asset,
            type: 'sell',
            quantity: tx.amount,
            price: tx.price,
            date: new Date(tx.timestamp),
            realizedPNL,
            holdingPeriod,
            isWin: realizedPNL > 0
          });

          // Update or remove holding
          if (holding.quantity > tx.amount) {
            holding.quantity -= tx.amount;
          } else {
            assetHoldings.delete(tx.asset);
          }
        }
      }
    }

    return trades;
  }

  private calculateStreaks(trades: TradeAnalysis[]): {
    longestWinStreak: number;
    longestLossStreak: number;
    currentStreak: number;
    currentStreakType: 'win' | 'loss' | 'none';
  } {
    if (trades.length === 0) {
      return { longestWinStreak: 0, longestLossStreak: 0, currentStreak: 0, currentStreakType: 'none' };
    }

    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    for (const trade of trades) {
      if (trade.isWin) {
        currentWinStreak++;
        currentLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      }
    }

    const lastTrade = trades[trades.length - 1];
    const currentStreak = lastTrade.isWin ? currentWinStreak : currentLossStreak;
    const currentStreakType = lastTrade.isWin ? 'win' : 'loss';

    return { longestWinStreak, longestLossStreak, currentStreak, currentStreakType };
  }

  private getCashFlows(transactions: Transaction[]): Array<{ date: Date; amount: number }> {
    return transactions.map(tx => ({
      date: new Date(tx.timestamp),
      amount: tx.type === 'buy' ? tx.totalValue : -tx.totalValue
    }));
  }

  private getPortfolioValues(
    transactions: Transaction[],
    currentPrices: Record<string, number>
  ): Array<{ date: Date; value: number }> {
    // Simplified implementation - would need more complex logic for accurate portfolio values over time
    const values: Array<{ date: Date; value: number }> = [];
    let cumulativeValue = 0;

    for (const tx of transactions.sort((a, b) => a.timestamp - b.timestamp)) {
      if (tx.type === 'buy') {
        cumulativeValue += tx.totalValue;
      } else if (tx.type === 'sell') {
        cumulativeValue -= tx.totalValue;
      }

      values.push({
        date: new Date(tx.timestamp),
        value: cumulativeValue
      });
    }

    return values;
  }

  private calculateDailyReturns(portfolioValues: Array<{ date: Date; value: number }>): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < portfolioValues.length; i++) {
      const previousValue = portfolioValues[i - 1].value;
      const currentValue = portfolioValues[i].value;
      
      if (previousValue > 0) {
        returns.push((currentValue - previousValue) / previousValue);
      }
    }

    return returns;
  }

  private calculatePeriodReturn(transactions: Transaction[], days: number): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(tx => tx.timestamp >= cutoffDate.getTime());
    
    return recentTransactions
      .filter(tx => tx.type === 'sell')
      .reduce((sum, tx) => sum + (tx.realizedPNL || 0), 0);
  }

  private calculatePeriodReturnPercentage(transactions: Transaction[], days: number): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(tx => tx.timestamp >= cutoffDate.getTime());
    
    const totalReturn = this.calculatePeriodReturn(transactions, days);
    const totalCost = recentTransactions
      .filter(tx => tx.type === 'buy')
      .reduce((sum, tx) => sum + tx.totalValue, 0);

    return totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  }

  private getBestTrade(transactions: Transaction[]): Transaction | null {
    const sellTransactions = transactions.filter(tx => tx.type === 'sell' && tx.realizedPNL);
    if (sellTransactions.length === 0) return null;
    
    return sellTransactions.reduce((best, current) => 
      (current.realizedPNL || 0) > (best.realizedPNL || 0) ? current : best
    );
  }

  private getWorstTrade(transactions: Transaction[]): Transaction | null {
    const sellTransactions = transactions.filter(tx => tx.type === 'sell' && tx.realizedPNL);
    if (sellTransactions.length === 0) return null;
    
    return sellTransactions.reduce((worst, current) => 
      (current.realizedPNL || 0) < (worst.realizedPNL || 0) ? current : worst
    );
  }

  /**
   * Handle special transaction types
   */
  public handleInscription(
    transaction: Transaction,
    inscriptionValue: number
  ): { costBasis: number; adjustedValue: number } {
    // Inscriptions add value but also incur costs
    const inscriptionCost = transaction.fee + transaction.feeUSD;
    const adjustedValue = inscriptionValue - inscriptionCost;
    
    return {
      costBasis: inscriptionCost,
      adjustedValue: Math.max(0, adjustedValue)
    };
  }

  public handleTransfer(
    transaction: Transaction,
    networkFees: number
  ): { impactOnCostBasis: number; taxImplications: any } {
    // Transfers don't change cost basis but may have tax implications
    return {
      impactOnCostBasis: networkFees, // Only network fees affect cost basis
      taxImplications: {
        isTaxableEvent: false,
        feeDeductible: true,
        trackingRequired: true
      }
    };
  }

  /**
   * Calculate tax-optimized selling strategy
   */
  public optimizeTaxLoss(
    asset: string,
    targetSellAmount: number,
    currentPrice: number
  ): { 
    recommendedLots: CostBasisLot[]; 
    totalTaxImpact: number; 
    alternativeStrategies: any[] 
  } {
    const lots = this.costBasisLots.get(asset) || [];
    const availableLots = lots.filter(lot => lot.remaining > 0);
    
    // Calculate tax impact for different cost basis methods
    const strategies = ['FIFO', 'LIFO', 'HIFO'].map(method => {
      const sortedLots = this.sortLotsByCostBasisMethodForOptimization(availableLots, method as CostBasisMethod);
      const { costBasis, selectedLots } = this.selectLotsForSale(sortedLots, targetSellAmount);
      const saleValue = targetSellAmount * currentPrice;
      const taxImpact = saleValue - costBasis;
      
      return {
        method,
        costBasis,
        taxImpact,
        lots: selectedLots,
        isLoss: taxImpact < 0
      };
    });

    const bestStrategy = strategies.reduce((best, current) => 
      current.taxImpact < best.taxImpact ? current : best
    );

    return {
      recommendedLots: bestStrategy.lots,
      totalTaxImpact: bestStrategy.taxImpact,
      alternativeStrategies: strategies.filter(s => s.method !== bestStrategy.method)
    };
  }

  private sortLotsByCostBasisMethodForOptimization(lots: CostBasisLot[], method: CostBasisMethod): CostBasisLot[] {
    // Similar to sortLotsByCostBasisMethod but for optimization purposes
    return this.sortLotsByCostBasisMethod(lots);
  }

  private selectLotsForSale(lots: CostBasisLot[], targetAmount: number): {
    costBasis: number;
    selectedLots: CostBasisLot[];
  } {
    const selectedLots: CostBasisLot[] = [];
    let remainingAmount = targetAmount;
    let totalCostBasis = 0;

    for (const lot of lots) {
      if (remainingAmount <= 0) break;

      const amountFromLot = Math.min(remainingAmount, lot.remaining);
      const costBasisFromLot = (amountFromLot / lot.quantity) * lot.totalCost;

      selectedLots.push({
        ...lot,
        quantity: amountFromLot,
        remaining: amountFromLot,
        totalCost: costBasisFromLot
      });

      totalCostBasis += costBasisFromLot;
      remainingAmount -= amountFromLot;
    }

    return { costBasis: totalCostBasis, selectedLots };
  }
}

export default PortfolioCalculator;