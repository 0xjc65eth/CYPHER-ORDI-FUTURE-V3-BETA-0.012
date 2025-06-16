interface PriceData {
  asset: string;
  price: number;
  timestamp: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
  asset: string;
  quantity: number;
  price: number;
  timestamp: number;
  fees?: number;
  txHash?: string;
}

interface Position {
  asset: string;
  assetType: 'Bitcoin' | 'Ordinals' | 'Runes' | 'BRC20' | 'RareSats';
  totalQuantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  transactions: Transaction[];
  firstPurchaseDate: number;
  lastTransactionDate: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  totalRealizedPnL: number;
  totalPnL: number;
  totalPnLPercent: number;
  bestPerformer: Position | null;
  worstPerformer: Position | null;
  dailyPnL: number;
  dailyPnLPercent: number;
  positions: Position[];
  assetAllocation: Record<string, number>;
}

class PortfolioPnLCalculator {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds

  /**
   * Calculate comprehensive portfolio metrics with P&L
   */
  calculatePortfolioMetrics(
    transactions: Transaction[], 
    currentPrices: Record<string, PriceData>
  ): PortfolioMetrics {
    const positions = this.calculatePositions(transactions, currentPrices);
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalCost = positions.reduce((sum, pos) => sum + pos.totalCost, 0);
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalRealizedPnL = positions.reduce((sum, pos) => sum + pos.realizedPnL, 0);
    const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
    
    const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    // Find best and worst performers
    const bestPerformer = positions.reduce((best, pos) => 
      (!best || pos.unrealizedPnLPercent > best.unrealizedPnLPercent) ? pos : best, 
      null as Position | null
    );
    
    const worstPerformer = positions.reduce((worst, pos) => 
      (!worst || pos.unrealizedPnLPercent < worst.unrealizedPnLPercent) ? pos : worst, 
      null as Position | null
    );

    // Calculate daily P&L (last 24 hours)
    const { dailyPnL, dailyPnLPercent } = this.calculateDailyPnL(transactions, currentPrices);

    // Calculate asset allocation
    const assetAllocation: Record<string, number> = {};
    positions.forEach(pos => {
      const allocation = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0;
      assetAllocation[pos.asset] = allocation;
    });

    return {
      totalValue,
      totalCost,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      totalRealizedPnL,
      totalPnL,
      totalPnLPercent,
      bestPerformer,
      worstPerformer,
      dailyPnL,
      dailyPnLPercent,
      positions,
      assetAllocation
    };
  }

  /**
   * Calculate individual positions with P&L
   */
  private calculatePositions(
    transactions: Transaction[], 
    currentPrices: Record<string, PriceData>
  ): Position[] {
    const positionMap = new Map<string, Position>();

    // Group transactions by asset
    const transactionsByAsset = this.groupTransactionsByAsset(transactions);

    for (const [asset, assetTransactions] of transactionsByAsset) {
      const position = this.calculateAssetPosition(asset, assetTransactions, currentPrices[asset]);
      if (position) {
        positionMap.set(asset, position);
      }
    }

    return Array.from(positionMap.values());
  }

  /**
   * Calculate position for a specific asset using FIFO method
   */
  private calculateAssetPosition(
    asset: string, 
    transactions: Transaction[], 
    currentPriceData?: PriceData
  ): Position | null {
    if (transactions.length === 0) return null;

    // Sort transactions by timestamp
    const sortedTransactions = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    
    let totalQuantity = 0;
    let totalCost = 0;
    let realizedPnL = 0;
    const holdings: { quantity: number; price: number; timestamp: number }[] = [];

    // Process each transaction using FIFO
    for (const tx of sortedTransactions) {
      if (tx.type === 'buy' || tx.type === 'transfer_in') {
        totalQuantity += tx.quantity;
        totalCost += tx.quantity * tx.price + (tx.fees || 0);
        holdings.push({
          quantity: tx.quantity,
          price: tx.price,
          timestamp: tx.timestamp
        });
      } else if (tx.type === 'sell' || tx.type === 'transfer_out') {
        let remainingToSell = tx.quantity;
        totalQuantity -= tx.quantity;
        
        // Apply FIFO to calculate realized P&L
        while (remainingToSell > 0 && holdings.length > 0) {
          const holding = holdings[0];
          const soldFromHolding = Math.min(remainingToSell, holding.quantity);
          
          // Calculate realized P&L for this portion
          const costBasis = soldFromHolding * holding.price;
          const proceeds = soldFromHolding * tx.price - (tx.fees || 0) * (soldFromHolding / tx.quantity);
          realizedPnL += proceeds - costBasis;
          
          holding.quantity -= soldFromHolding;
          remainingToSell -= soldFromHolding;
          
          if (holding.quantity === 0) {
            holdings.shift();
          }
        }
      }
    }

    if (totalQuantity <= 0) return null;

    // Calculate average price from remaining holdings
    const remainingCost = holdings.reduce((sum, holding) => sum + holding.quantity * holding.price, 0);
    const averagePrice = totalQuantity > 0 ? remainingCost / totalQuantity : 0;

    const currentPrice = currentPriceData?.price || 0;
    const currentValue = totalQuantity * currentPrice;
    const unrealizedPnL = currentValue - remainingCost;
    const unrealizedPnLPercent = remainingCost > 0 ? (unrealizedPnL / remainingCost) * 100 : 0;

    const firstPurchaseDate = sortedTransactions.find(tx => tx.type === 'buy' || tx.type === 'transfer_in')?.timestamp || 0;
    const lastTransactionDate = sortedTransactions[sortedTransactions.length - 1]?.timestamp || 0;

    return {
      asset,
      assetType: this.determineAssetType(asset),
      totalQuantity,
      averagePrice,
      currentPrice,
      totalCost: remainingCost,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      realizedPnL,
      transactions: sortedTransactions,
      firstPurchaseDate,
      lastTransactionDate
    };
  }

  /**
   * Calculate daily P&L changes
   */
  private calculateDailyPnL(
    transactions: Transaction[], 
    currentPrices: Record<string, PriceData>
  ): { dailyPnL: number; dailyPnLPercent: number } {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Get positions as of 24 hours ago
    const pastTransactions = transactions.filter(tx => tx.timestamp <= oneDayAgo);
    const pastPositions = this.calculatePositions(pastTransactions, currentPrices);
    const pastValue = pastPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    
    // Get current positions
    const currentPositions = this.calculatePositions(transactions, currentPrices);
    const currentValue = currentPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    
    const dailyPnL = currentValue - pastValue;
    const dailyPnLPercent = pastValue > 0 ? (dailyPnL / pastValue) * 100 : 0;
    
    return { dailyPnL, dailyPnLPercent };
  }

  /**
   * Group transactions by asset
   */
  private groupTransactionsByAsset(transactions: Transaction[]): Map<string, Transaction[]> {
    const grouped = new Map<string, Transaction[]>();
    
    for (const tx of transactions) {
      if (!grouped.has(tx.asset)) {
        grouped.set(tx.asset, []);
      }
      grouped.get(tx.asset)!.push(tx);
    }
    
    return grouped;
  }

  /**
   * Determine asset type based on asset name/symbol
   */
  private determineAssetType(asset: string): 'Bitcoin' | 'Ordinals' | 'Runes' | 'BRC20' | 'RareSats' {
    const lowerAsset = asset.toLowerCase();
    
    if (lowerAsset === 'bitcoin' || lowerAsset === 'btc') return 'Bitcoin';
    if (lowerAsset.includes('ordinal') || lowerAsset.includes('#')) return 'Ordinals';
    if (lowerAsset.includes('rune') || lowerAsset.includes('•')) return 'Runes';
    if (lowerAsset.includes('brc20') || lowerAsset === 'ordi' || lowerAsset === 'sats') return 'BRC20';
    if (lowerAsset.includes('rare') || lowerAsset.includes('uncommon') || lowerAsset.includes('epic')) return 'RareSats';
    
    return 'Bitcoin'; // default
  }

  /**
   * Calculate tax implications (for US users)
   */
  calculateTaxImplications(positions: Position[]): {
    shortTermGains: number;
    longTermGains: number;
    totalTaxableGains: number;
    estimatedTax: number;
  } {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    let shortTermGains = 0;
    let longTermGains = 0;
    
    positions.forEach(position => {
      if (position.realizedPnL > 0) {
        const holdingPeriod = now - position.firstPurchaseDate;
        
        if (holdingPeriod > oneYear) {
          longTermGains += position.realizedPnL;
        } else {
          shortTermGains += position.realizedPnL;
        }
      }
    });
    
    const totalTaxableGains = shortTermGains + longTermGains;
    
    // Simplified tax calculation (varies by income bracket)
    const shortTermTaxRate = 0.22; // 22% ordinary income rate
    const longTermTaxRate = 0.15;  // 15% capital gains rate
    
    const estimatedTax = (shortTermGains * shortTermTaxRate) + (longTermGains * longTermTaxRate);
    
    return {
      shortTermGains,
      longTermGains,
      totalTaxableGains,
      estimatedTax
    };
  }

  /**
   * Generate portfolio performance report
   */
  generatePerformanceReport(metrics: PortfolioMetrics): string {
    const report = [
      '=== PORTFOLIO PERFORMANCE REPORT ===',
      `Total Portfolio Value: $${metrics.totalValue.toLocaleString()}`,
      `Total Cost Basis: $${metrics.totalCost.toLocaleString()}`,
      `Total P&L: ${metrics.totalPnL >= 0 ? '+' : ''}$${metrics.totalPnL.toLocaleString()} (${metrics.totalPnLPercent.toFixed(2)}%)`,
      `Unrealized P&L: ${metrics.totalUnrealizedPnL >= 0 ? '+' : ''}$${metrics.totalUnrealizedPnL.toLocaleString()}`,
      `Realized P&L: ${metrics.totalRealizedPnL >= 0 ? '+' : ''}$${metrics.totalRealizedPnL.toLocaleString()}`,
      `Daily P&L: ${metrics.dailyPnL >= 0 ? '+' : ''}$${metrics.dailyPnL.toLocaleString()} (${metrics.dailyPnLPercent.toFixed(2)}%)`,
      '',
      '=== TOP PERFORMERS ===',
      `Best: ${metrics.bestPerformer?.asset} (+${metrics.bestPerformer?.unrealizedPnLPercent.toFixed(2)}%)`,
      `Worst: ${metrics.worstPerformer?.asset} (${metrics.worstPerformer?.unrealizedPnLPercent.toFixed(2)}%)`,
      '',
      '=== ASSET ALLOCATION ===',
      ...Object.entries(metrics.assetAllocation).map(([asset, allocation]) => 
        `${asset}: ${allocation.toFixed(1)}%`
      )
    ];
    
    return report.join('\n');
  }

  /**
   * Calculate risk metrics
   */
  calculateRiskMetrics(positions: Position[]): {
    portfolioVolatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    concentrationRisk: number;
  } {
    // Simplified risk calculations
    const returns = positions.map(pos => pos.unrealizedPnLPercent / 100);
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const portfolioVolatility = Math.sqrt(variance) * 100;
    
    const riskFreeRate = 0.02; // 2% risk-free rate
    const sharpeRatio = portfolioVolatility > 0 ? (meanReturn - riskFreeRate) / (portfolioVolatility / 100) : 0;
    
    const maxDrawdown = Math.min(...returns) * 100;
    
    // Concentration risk (Herfindahl Index)
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const weights = positions.map(pos => pos.currentValue / totalValue);
    const concentrationRisk = weights.reduce((sum, weight) => sum + weight * weight, 0);
    
    return {
      portfolioVolatility,
      sharpeRatio,
      maxDrawdown,
      concentrationRisk
    };
  }
}

export const portfolioPnLCalculator = new PortfolioPnLCalculator();
export default portfolioPnLCalculator;
export type { 
  Position, 
  PortfolioMetrics, 
  Transaction, 
  PriceData 
};