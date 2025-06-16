export interface PriceData {
  exchange: string;
  price: number;
  volume: number;
  spread: number;
  timestamp: number;
}

export interface PriceComparison {
  symbol: string;
  bestPrice: PriceData;
  worstPrice: PriceData;
  averagePrice: number;
  priceSpread: number;
  recommendedExchange: string;
  savings: number;
  savingsPercentage: number;
}

export class PriceComparisonEngine {
  private static exchanges = [
    'Binance',
    'Coinbase',
    'Kraken',
    'Bitstamp',
    'Gemini',
    'FTX'
  ];

  static async comparePrice(symbol: string): Promise<PriceComparison> {
    // Mock price data for demo
    const mockPrices: PriceData[] = this.exchanges.map(exchange => ({
      exchange,
      price: this.generateMockPrice(symbol),
      volume: Math.random() * 1000000,
      spread: Math.random() * 0.005,
      timestamp: Date.now()
    }));

    const sortedPrices = mockPrices.sort((a, b) => a.price - b.price);
    const bestPrice = sortedPrices[0];
    const worstPrice = sortedPrices[sortedPrices.length - 1];
    
    const averagePrice = mockPrices.reduce((sum, p) => sum + p.price, 0) / mockPrices.length;
    const priceSpread = worstPrice.price - bestPrice.price;
    const savings = worstPrice.price - bestPrice.price;
    const savingsPercentage = (savings / worstPrice.price) * 100;

    return {
      symbol,
      bestPrice,
      worstPrice,
      averagePrice,
      priceSpread,
      recommendedExchange: bestPrice.exchange,
      savings,
      savingsPercentage
    };
  }

  private static generateMockPrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'BTC': 42000,
      'ETH': 2500,
      'SOL': 100,
      'MATIC': 0.80,
      'AVAX': 35,
      'BNB': 300
    };

    const basePrice = basePrices[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return basePrice * (1 + variation);
  }

  static async getArbitrageOpportunities(): Promise<PriceComparison[]> {
    const symbols = ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX', 'BNB'];
    const comparisons: PriceComparison[] = [];

    for (const symbol of symbols) {
      const comparison = await this.comparePrice(symbol);
      if (comparison.savingsPercentage > 0.1) { // Only opportunities > 0.1%
        comparisons.push(comparison);
      }
    }

    return comparisons.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
  }
}

// Utility functions for UI formatting
export function formatPriceImpact(impact: number): string {
  return `${impact > 0 ? '+' : ''}${impact.toFixed(2)}%`;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-500';
  if (confidence >= 0.7) return 'text-yellow-500';
  return 'text-red-500';
}

export function formatExecutionTime(timeMs: number): string {
  if (timeMs < 1000) return `${timeMs}ms`;
  return `${(timeMs / 1000).toFixed(1)}s`;
}

export function formatSlippage(slippage: number): string {
  return `${slippage.toFixed(3)}%`;
}

export function getRiskColor(risk: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (risk) {
    case 'LOW': return 'text-green-500';
    case 'MEDIUM': return 'text-yellow-500';
    case 'HIGH': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export default PriceComparisonEngine;