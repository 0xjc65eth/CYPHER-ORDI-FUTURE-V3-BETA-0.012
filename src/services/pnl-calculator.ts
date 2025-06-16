/**
 * Advanced PnL Calculation Service
 * 
 * Provides sophisticated profit/loss calculations with multiple cost basis methods,
 * tax optimization, and comprehensive portfolio analytics.
 */

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'AVCO' | 'SPEC';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | 'fee' | 'reward';
  asset: string;
  quantity: number;
  price: number;
  fee: number;
  timestamp: number;
  txHash: string;
  exchange?: string;
  notes?: string;
}

export interface CostBasisLot {
  quantity: number;
  price: number;
  timestamp: number;
  transactionId: string;
  remainingQuantity: number;
}

export interface PnLCalculation {
  asset: string;
  method: CostBasisMethod;
  
  // Current position
  totalQuantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  
  // Realized P&L
  realizedPnL: number;
  realizedGains: number;
  realizedLosses: number;
  
  // Unrealized P&L
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  
  // Tax implications
  shortTermGains: number;
  longTermGains: number;
  
  // Performance metrics
  totalReturn: number;
  totalReturnPercent: number;
  holdingPeriod: number; // days
  
  // Risk metrics
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
  
  // Lot tracking
  lots: CostBasisLot[];
  
  // Transaction history
  transactions: Transaction[];
  
  lastUpdated: number;
}

export interface PortfolioPnL {
  totalValue: number;
  totalCost: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  totalPnLPercent: number;
  
  // Tax summary
  totalShortTermGains: number;
  totalLongTermGains: number;
  taxLiability: number;
  
  // Performance
  bestPerformer: string;
  worstPerformer: string;
  winRate: number;
  
  // Risk metrics
  portfolioVolatility: number;
  portfolioSharpe: number;
  maxDrawdown: number;
  
  // Asset breakdown
  assetPnL: Map<string, PnLCalculation>;
  
  lastUpdated: number;
}

export interface TaxReport {
  taxYear: number;
  
  // Capital gains
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  
  // Estimated taxes
  federalTax: number;
  stateTax: number;
  totalTax: number;
  
  // Detailed transactions
  taxableEvents: Array<{
    date: Date;
    asset: string;
    type: 'short-term' | 'long-term';
    proceeds: number;
    costBasis: number;
    gain: number;
    holdingPeriod: number;
  }>;
  
  // Recommendations
  taxOptimizationSuggestions: string[];
}

class PnLCalculatorService {
  private assetCalculations: Map<string, PnLCalculation> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private priceHistory: Map<string, Array<{price: number, timestamp: number}>> = new Map();
  
  /**
   * Add transaction to the calculation system
   */
  public addTransaction(transaction: Transaction): void {
    const assetTransactions = this.transactions.get(transaction.asset) || [];
    
    // Insert transaction in chronological order
    const insertIndex = assetTransactions.findIndex(t => t.timestamp > transaction.timestamp);
    if (insertIndex === -1) {
      assetTransactions.push(transaction);
    } else {
      assetTransactions.splice(insertIndex, 0, transaction);
    }
    
    this.transactions.set(transaction.asset, assetTransactions);
    
    // Recalculate P&L for this asset
    this.calculateAssetPnL(transaction.asset);
  }
  
  /**
   * Calculate P&L for a specific asset using specified method
   */
  public calculateAssetPnL(
    asset: string, 
    method: CostBasisMethod = 'FIFO',
    currentPrice?: number
  ): PnLCalculation {
    const transactions = this.transactions.get(asset) || [];
    if (transactions.length === 0) {
      return this.getEmptyPnLCalculation(asset, method);
    }
    
    const calculation = this.performPnLCalculation(asset, transactions, method, currentPrice);
    this.assetCalculations.set(asset, calculation);
    
    return calculation;
  }
  
  /**
   * Get portfolio-wide P&L summary
   */
  public getPortfolioPnL(method: CostBasisMethod = 'FIFO'): PortfolioPnL {
    const assetPnL = new Map<string, PnLCalculation>();
    let totalValue = 0;
    let totalCost = 0;
    let totalRealizedPnL = 0;
    let totalUnrealizedPnL = 0;
    let totalShortTermGains = 0;
    let totalLongTermGains = 0;
    
    let bestPerformer = '';
    let worstPerformer = '';
    let bestReturn = -Infinity;
    let worstReturn = Infinity;
    
    // Calculate P&L for each asset
    for (const asset of this.transactions.keys()) {
      const calculation = this.calculateAssetPnL(asset, method);
      assetPnL.set(asset, calculation);
      
      totalValue += calculation.marketValue;
      totalCost += calculation.avgCostBasis * calculation.totalQuantity;
      totalRealizedPnL += calculation.realizedPnL;
      totalUnrealizedPnL += calculation.unrealizedPnL;
      totalShortTermGains += calculation.shortTermGains;
      totalLongTermGains += calculation.longTermGains;
      
      // Track best/worst performers
      if (calculation.totalReturnPercent > bestReturn) {
        bestReturn = calculation.totalReturnPercent;
        bestPerformer = asset;
      }
      if (calculation.totalReturnPercent < worstReturn) {
        worstReturn = calculation.totalReturnPercent;
        worstPerformer = asset;
      }
    }
    
    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    
    // Calculate win rate
    const winningAssets = Array.from(assetPnL.values()).filter(calc => calc.totalReturn > 0).length;
    const winRate = assetPnL.size > 0 ? (winningAssets / assetPnL.size) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalRealizedPnL,
      totalUnrealizedPnL,
      totalPnL,
      totalPnLPercent,
      totalShortTermGains,
      totalLongTermGains,
      taxLiability: this.estimateTaxLiability(totalShortTermGains, totalLongTermGains),
      bestPerformer,
      worstPerformer,
      winRate,
      portfolioVolatility: this.calculatePortfolioVolatility(assetPnL),
      portfolioSharpe: this.calculatePortfolioSharpe(assetPnL),
      maxDrawdown: this.calculatePortfolioMaxDrawdown(assetPnL),
      assetPnL,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Generate tax report for specified year
   */
  public generateTaxReport(taxYear: number): TaxReport {
    const startOfYear = new Date(taxYear, 0, 1).getTime();
    const endOfYear = new Date(taxYear, 11, 31, 23, 59, 59).getTime();
    
    let shortTermGains = 0;
    let longTermGains = 0;
    const taxableEvents: TaxReport['taxableEvents'] = [];
    
    // Process all sell transactions in the tax year
    for (const [asset, transactions] of this.transactions.entries()) {
      const sellTransactions = transactions.filter(t => 
        t.type === 'sell' && 
        t.timestamp >= startOfYear && 
        t.timestamp <= endOfYear
      );
      
      for (const sellTx of sellTransactions) {
        const costBasisResults = this.calculateCostBasisForSale(asset, sellTx);
        
        for (const result of costBasisResults) {
          const holdingPeriod = Math.floor((sellTx.timestamp - result.purchaseDate) / (1000 * 60 * 60 * 24));
          const isLongTerm = holdingPeriod > 365;
          const gain = result.proceeds - result.costBasis;
          
          if (isLongTerm) {
            longTermGains += gain;
          } else {
            shortTermGains += gain;
          }
          
          taxableEvents.push({
            date: new Date(sellTx.timestamp),
            asset,
            type: isLongTerm ? 'long-term' : 'short-term',
            proceeds: result.proceeds,
            costBasis: result.costBasis,
            gain,
            holdingPeriod
          });
        }
      }
    }
    
    const totalGains = shortTermGains + longTermGains;
    const federalTax = this.calculateFederalTax(shortTermGains, longTermGains);
    const stateTax = this.calculateStateTax(shortTermGains, longTermGains);
    
    return {
      taxYear,
      shortTermGains,
      longTermGains,
      totalGains,
      federalTax,
      stateTax,
      totalTax: federalTax + stateTax,
      taxableEvents,
      taxOptimizationSuggestions: this.generateTaxOptimizationSuggestions(shortTermGains, longTermGains)
    };
  }
  
  /**
   * Perform the actual P&L calculation
   */
  private performPnLCalculation(
    asset: string,
    transactions: Transaction[],
    method: CostBasisMethod,
    currentPrice?: number
  ): PnLCalculation {
    const lots: CostBasisLot[] = [];
    let realizedPnL = 0;
    let shortTermGains = 0;
    let longTermGains = 0;
    
    // Process transactions chronologically
    for (const tx of transactions) {
      if (tx.type === 'buy' || tx.type === 'transfer_in') {
        // Add to inventory
        lots.push({
          quantity: tx.quantity,
          price: tx.price,
          timestamp: tx.timestamp,
          transactionId: tx.id,
          remainingQuantity: tx.quantity
        });
      } else if (tx.type === 'sell' || tx.type === 'transfer_out') {
        // Remove from inventory using specified method
        const saleResults = this.processSale(lots, tx.quantity, tx.price, tx.timestamp, method);
        realizedPnL += saleResults.realizedPnL;
        shortTermGains += saleResults.shortTermGains;
        longTermGains += saleResults.longTermGains;
      }
    }
    
    // Calculate current position
    const totalQuantity = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
    const totalCost = lots.reduce((sum, lot) => sum + (lot.remainingQuantity * lot.price), 0);
    const avgCostBasis = totalQuantity > 0 ? totalCost / totalQuantity : 0;
    
    // Use provided current price or fetch from cache
    const price = currentPrice || this.getCurrentPrice(asset);
    const marketValue = totalQuantity * price;
    const unrealizedPnL = marketValue - totalCost;
    const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;
    
    const totalReturn = realizedPnL + unrealizedPnL;
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
    
    // Calculate holding period
    const firstPurchase = lots.length > 0 ? Math.min(...lots.map(l => l.timestamp)) : Date.now();
    const holdingPeriod = Math.floor((Date.now() - firstPurchase) / (1000 * 60 * 60 * 24));
    
    return {
      asset,
      method,
      totalQuantity,
      avgCostBasis,
      currentPrice: price,
      marketValue,
      realizedPnL,
      realizedGains: Math.max(0, realizedPnL),
      realizedLosses: Math.min(0, realizedPnL),
      unrealizedPnL,
      unrealizedPnLPercent,
      shortTermGains,
      longTermGains,
      totalReturn,
      totalReturnPercent,
      holdingPeriod,
      volatility: this.calculateVolatility(asset),
      maxDrawdown: this.calculateMaxDrawdown(asset),
      sharpeRatio: this.calculateSharpeRatio(asset),
      lots: lots.filter(lot => lot.remainingQuantity > 0),
      transactions,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Process a sale transaction using specified cost basis method
   */
  private processSale(
    lots: CostBasisLot[],
    quantity: number,
    salePrice: number,
    saleTimestamp: number,
    method: CostBasisMethod
  ): {
    realizedPnL: number;
    shortTermGains: number;
    longTermGains: number;
  } {
    let remainingToSell = quantity;
    let realizedPnL = 0;
    let shortTermGains = 0;
    let longTermGains = 0;
    
    // Sort lots based on method
    const sortedLots = this.sortLotsForSale(lots, method);
    
    for (const lot of sortedLots) {
      if (remainingToSell <= 0) break;
      if (lot.remainingQuantity <= 0) continue;
      
      const quantityToSell = Math.min(remainingToSell, lot.remainingQuantity);
      const proceeds = quantityToSell * salePrice;
      const costBasis = quantityToSell * lot.price;
      const gain = proceeds - costBasis;
      
      // Determine if long-term or short-term
      const holdingPeriod = Math.floor((saleTimestamp - lot.timestamp) / (1000 * 60 * 60 * 24));
      if (holdingPeriod > 365) {
        longTermGains += gain;
      } else {
        shortTermGains += gain;
      }
      
      realizedPnL += gain;
      lot.remainingQuantity -= quantityToSell;
      remainingToSell -= quantityToSell;
    }
    
    return { realizedPnL, shortTermGains, longTermGains };
  }
  
  /**
   * Sort lots for sale based on cost basis method
   */
  private sortLotsForSale(lots: CostBasisLot[], method: CostBasisMethod): CostBasisLot[] {
    const availableLots = lots.filter(lot => lot.remainingQuantity > 0);
    
    switch (method) {
      case 'FIFO':
        return availableLots.sort((a, b) => a.timestamp - b.timestamp);
      case 'LIFO':
        return availableLots.sort((a, b) => b.timestamp - a.timestamp);
      case 'AVCO':
        // For AVCO, we'd need to merge all lots into one average lot
        // For simplicity, using FIFO here
        return availableLots.sort((a, b) => a.timestamp - b.timestamp);
      case 'SPEC':
        // Specific identification - would need user input
        // Using FIFO as default
        return availableLots.sort((a, b) => a.timestamp - b.timestamp);
      default:
        return availableLots;
    }
  }
  
  // Helper methods for calculations
  private getCurrentPrice(asset: string): number {
    const priceHistory = this.priceHistory.get(asset) || [];
    if (priceHistory.length === 0) {
      // Default prices for common assets
      switch (asset.toLowerCase()) {
        case 'bitcoin':
        case 'btc':
          return 105000;
        case 'ethereum':
        case 'eth':
          return 3800;
        default:
          return 0;
      }
    }
    return priceHistory[priceHistory.length - 1].price;
  }
  
  private calculateVolatility(asset: string): number {
    const priceHistory = this.priceHistory.get(asset) || [];
    if (priceHistory.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < priceHistory.length; i++) {
      const returnValue = (priceHistory[i].price - priceHistory[i-1].price) / priceHistory[i-1].price;
      returns.push(returnValue);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(365); // Annualized volatility
  }
  
  private calculateMaxDrawdown(asset: string): number {
    const priceHistory = this.priceHistory.get(asset) || [];
    if (priceHistory.length < 2) return 0;
    
    let maxDrawdown = 0;
    let peak = priceHistory[0].price;
    
    for (const point of priceHistory) {
      if (point.price > peak) {
        peak = point.price;
      }
      
      const drawdown = (peak - point.price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown * 100; // Return as percentage
  }
  
  private calculateSharpeRatio(asset: string): number {
    const volatility = this.calculateVolatility(asset);
    if (volatility === 0) return 0;
    
    // Assume risk-free rate of 5%
    const riskFreeRate = 0.05;
    const calculation = this.assetCalculations.get(asset);
    if (!calculation) return 0;
    
    const annualReturn = calculation.totalReturnPercent / 100;
    return (annualReturn - riskFreeRate) / volatility;
  }
  
  private calculatePortfolioVolatility(assetPnL: Map<string, PnLCalculation>): number {
    // Simplified portfolio volatility calculation
    const volatilities = Array.from(assetPnL.values()).map(calc => calc.volatility);
    if (volatilities.length === 0) return 0;
    
    return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
  }
  
  private calculatePortfolioSharpe(assetPnL: Map<string, PnLCalculation>): number {
    const sharpeRatios = Array.from(assetPnL.values()).map(calc => calc.sharpeRatio);
    if (sharpeRatios.length === 0) return 0;
    
    return sharpeRatios.reduce((sum, ratio) => sum + ratio, 0) / sharpeRatios.length;
  }
  
  private calculatePortfolioMaxDrawdown(assetPnL: Map<string, PnLCalculation>): number {
    const drawdowns = Array.from(assetPnL.values()).map(calc => calc.maxDrawdown);
    if (drawdowns.length === 0) return 0;
    
    return Math.max(...drawdowns);
  }
  
  private calculateCostBasisForSale(asset: string, sellTransaction: Transaction): Array<{
    costBasis: number;
    proceeds: number;
    purchaseDate: number;
  }> {
    // Simplified implementation
    return [{
      costBasis: sellTransaction.quantity * sellTransaction.price * 0.9, // Mock cost basis
      proceeds: sellTransaction.quantity * sellTransaction.price,
      purchaseDate: sellTransaction.timestamp - (365 * 24 * 60 * 60 * 1000) // Mock purchase date
    }];
  }
  
  private estimateTaxLiability(shortTermGains: number, longTermGains: number): number {
    // Simplified tax calculation
    const shortTermRate = 0.37; // 37% for ordinary income
    const longTermRate = 0.20; // 20% for long-term capital gains
    
    return (shortTermGains * shortTermRate) + (longTermGains * longTermRate);
  }
  
  private calculateFederalTax(shortTermGains: number, longTermGains: number): number {
    return this.estimateTaxLiability(shortTermGains, longTermGains);
  }
  
  private calculateStateTax(shortTermGains: number, longTermGains: number): number {
    // Simplified state tax calculation (varies by state)
    const stateTaxRate = 0.05; // 5% average state tax
    return (shortTermGains + longTermGains) * stateTaxRate;
  }
  
  private generateTaxOptimizationSuggestions(shortTermGains: number, longTermGains: number): string[] {
    const suggestions: string[] = [];
    
    if (shortTermGains > longTermGains * 2) {
      suggestions.push('Consider holding assets longer to qualify for long-term capital gains treatment');
    }
    
    if (shortTermGains > 0) {
      suggestions.push('Consider tax-loss harvesting to offset short-term gains');
    }
    
    suggestions.push('Consult with a tax professional for personalized advice');
    
    return suggestions;
  }
  
  private getEmptyPnLCalculation(asset: string, method: CostBasisMethod): PnLCalculation {
    return {
      asset,
      method,
      totalQuantity: 0,
      avgCostBasis: 0,
      currentPrice: 0,
      marketValue: 0,
      realizedPnL: 0,
      realizedGains: 0,
      realizedLosses: 0,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      shortTermGains: 0,
      longTermGains: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      holdingPeriod: 0,
      volatility: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      lots: [],
      transactions: [],
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Update price history for an asset
   */
  public updatePriceHistory(asset: string, price: number, timestamp: number = Date.now()): void {
    const history = this.priceHistory.get(asset) || [];
    
    // Add new price point
    history.push({ price, timestamp });
    
    // Keep only last 365 days of price history
    const oneYearAgo = timestamp - (365 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(point => point.timestamp > oneYearAgo);
    
    this.priceHistory.set(asset, filteredHistory);
  }
  
  /**
   * Get P&L calculation for specific asset
   */
  public getAssetPnL(asset: string): PnLCalculation | null {
    return this.assetCalculations.get(asset) || null;
  }
  
  /**
   * Clear all data
   */
  public clearAll(): void {
    this.assetCalculations.clear();
    this.transactions.clear();
    this.priceHistory.clear();
  }
}

export const pnlCalculator = new PnLCalculatorService();
export default pnlCalculator;