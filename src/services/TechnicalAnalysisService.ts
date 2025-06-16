/**
 * Technical Analysis Service
 * Provides real technical indicators and market analysis based on CoinMarketCap data
 */

import { logger } from '@/lib/logger';
import { coinMarketCapService } from './CoinMarketCapService';
import { priceCache } from '@/lib/cache/enhanced-api-cache';

export interface TechnicalIndicators {
  rsi: number;              // Relative Strength Index (0-100)
  macd: {                   // MACD Indicator
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {         // Moving Averages
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
  };
  bollinger: {              // Bollinger Bands
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {                 // Volume Analysis
    avgVolume: number;
    volumeRatio: number;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  };
  sentiment: {              // Market Sentiment
    score: number;          // -100 to 100
    signal: 'bullish' | 'bearish' | 'neutral';
    fearGreed: number;      // 0-100
  };
  support: number;          // Support level
  resistance: number;       // Resistance level
  trend: 'bullish' | 'bearish' | 'sideways';
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;       // 0-100
}

export interface MarketAnalysis {
  symbol: string;
  price: number;
  timestamp: string;
  indicators: TechnicalIndicators;
  insights: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priceTarget: {
    short: number;    // 1-7 days
    medium: number;   // 1-4 weeks
    long: number;     // 1-3 months
  };
}

class TechnicalAnalysisService {
  private priceHistory = new Map<string, number[]>();
  private volumeHistory = new Map<string, number[]>();
  private maxHistoryLength = 200; // Keep last 200 data points

  /**
   * Get comprehensive technical analysis for a symbol
   */
  async getAnalysis(symbol: string): Promise<MarketAnalysis> {
    try {
      // Get current and historical data
      const currentData = await coinMarketCapService.getCryptocurrencyQuotes({ symbol });
      const crypto = currentData[symbol];
      
      if (!crypto) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const price = crypto.quote.USD.price;
      const volume = crypto.quote.USD.volume_24h;

      // Update price and volume history
      this.updateHistory(symbol, price, volume);

      // Calculate technical indicators
      const indicators = this.calculateIndicators(symbol, price, volume);

      // Generate insights
      const insights = this.generateInsights(indicators, crypto);

      // Determine risk level
      const riskLevel = this.calculateRiskLevel(indicators, crypto);

      // Calculate price targets
      const priceTarget = this.calculatePriceTargets(price, indicators);

      return {
        symbol,
        price,
        timestamp: new Date().toISOString(),
        indicators,
        insights,
        riskLevel,
        priceTarget
      };

    } catch (error) {
      logger.error(`Technical analysis failed for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Update price and volume history for a symbol
   */
  private updateHistory(symbol: string, price: number, volume: number): void {
    // Update price history
    const prices = this.priceHistory.get(symbol) || [];
    prices.push(price);
    if (prices.length > this.maxHistoryLength) {
      prices.shift();
    }
    this.priceHistory.set(symbol, prices);

    // Update volume history
    const volumes = this.volumeHistory.get(symbol) || [];
    volumes.push(volume);
    if (volumes.length > this.maxHistoryLength) {
      volumes.shift();
    }
    this.volumeHistory.set(symbol, volumes);
  }

  /**
   * Calculate all technical indicators
   */
  private calculateIndicators(symbol: string, currentPrice: number, currentVolume: number): TechnicalIndicators {
    const prices = this.priceHistory.get(symbol) || [currentPrice];
    const volumes = this.volumeHistory.get(symbol) || [currentVolume];

    return {
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      movingAverages: this.calculateMovingAverages(prices),
      bollinger: this.calculateBollingerBands(prices),
      volume: this.calculateVolumeAnalysis(volumes),
      sentiment: this.calculateSentiment(prices, volumes),
      support: this.calculateSupport(prices),
      resistance: this.calculateResistance(prices),
      trend: this.determineTrend(prices),
      signal: this.generateSignal(prices, volumes),
      confidence: this.calculateConfidence(prices, volumes)
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) {
      return 50; // Neutral if not enough data
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // For simplicity, using a basic signal line calculation
    const signal = macd * 0.9; // Approximation
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * Calculate moving averages
   */
  private calculateMovingAverages(prices: number[]): {
    sma20: number;
    sma50: number;
    ema12: number;
    ema26: number;
  } {
    return {
      sma20: this.calculateSMA(prices, 20),
      sma50: this.calculateSMA(prices, 50),
      ema12: this.calculateEMA(prices, 12),
      ema26: this.calculateEMA(prices, 26)
    };
  }

  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      return prices[prices.length - 1] || 0;
    }

    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * Calculate Bollinger Bands
   */
  private calculateBollingerBands(prices: number[], period = 20, stdDev = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const sma = this.calculateSMA(prices, period);
    const variance = this.calculateVariance(prices.slice(-period), sma);
    const std = Math.sqrt(variance);

    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev)
    };
  }

  /**
   * Calculate variance
   */
  private calculateVariance(prices: number[], mean: number): number {
    if (prices.length === 0) return 0;
    
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  }

  /**
   * Calculate volume analysis
   */
  private calculateVolumeAnalysis(volumes: number[]): {
    avgVolume: number;
    volumeRatio: number;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (volumes.length === 0) {
      return { avgVolume: 0, volumeRatio: 1, volumeTrend: 'stable' };
    }

    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    // Determine trend based on recent volumes
    let volumeTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (volumes.length >= 3) {
      const recent = volumes.slice(-3);
      const isIncreasing = recent[0] < recent[1] && recent[1] < recent[2];
      const isDecreasing = recent[0] > recent[1] && recent[1] > recent[2];
      
      if (isIncreasing) volumeTrend = 'increasing';
      else if (isDecreasing) volumeTrend = 'decreasing';
    }

    return { avgVolume, volumeRatio, volumeTrend };
  }

  /**
   * Calculate market sentiment
   */
  private calculateSentiment(prices: number[], volumes: number[]): {
    score: number;
    signal: 'bullish' | 'bearish' | 'neutral';
    fearGreed: number;
  } {
    if (prices.length < 2) {
      return { score: 0, signal: 'neutral', fearGreed: 50 };
    }

    // Calculate price momentum
    const priceChange = (prices[prices.length - 1] - prices[0]) / prices[0] * 100;
    
    // Calculate volume momentum
    const volumeChange = volumes.length >= 2 ? 
      (volumes[volumes.length - 1] - volumes[0]) / volumes[0] * 100 : 0;

    // Combine factors for sentiment score
    let score = (priceChange * 0.7) + (volumeChange * 0.3);
    score = Math.max(-100, Math.min(100, score)); // Clamp to -100 to 100

    const signal = score > 10 ? 'bullish' : score < -10 ? 'bearish' : 'neutral';
    
    // Fear & Greed approximation (inverted from score)
    const fearGreed = Math.max(0, Math.min(100, 50 + score));

    return { score, signal, fearGreed };
  }

  /**
   * Calculate support level
   */
  private calculateSupport(prices: number[]): number {
    if (prices.length < 5) return prices[prices.length - 1] * 0.95;
    
    // Find recent lows
    const recentPrices = prices.slice(-20);
    const minPrice = Math.min(...recentPrices);
    return minPrice * 0.98; // Support slightly below recent low
  }

  /**
   * Calculate resistance level
   */
  private calculateResistance(prices: number[]): number {
    if (prices.length < 5) return prices[prices.length - 1] * 1.05;
    
    // Find recent highs
    const recentPrices = prices.slice(-20);
    const maxPrice = Math.max(...recentPrices);
    return maxPrice * 1.02; // Resistance slightly above recent high
  }

  /**
   * Determine overall trend
   */
  private determineTrend(prices: number[]): 'bullish' | 'bearish' | 'sideways' {
    if (prices.length < 10) return 'sideways';

    const recent = prices.slice(-10);
    const older = prices.slice(-20, -10);
    
    if (older.length === 0) return 'sideways';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg * 100;

    if (change > 2) return 'bullish';
    if (change < -2) return 'bearish';
    return 'sideways';
  }

  /**
   * Generate trading signal
   */
  private generateSignal(prices: number[], volumes: number[]): 'buy' | 'sell' | 'hold' {
    if (prices.length < 5) return 'hold';

    const rsi = this.calculateRSI(prices);
    const trend = this.determineTrend(prices);
    const sentiment = this.calculateSentiment(prices, volumes);

    // Buy conditions
    if (rsi < 30 && trend === 'bullish' && sentiment.signal === 'bullish') return 'buy';
    if (rsi < 40 && sentiment.signal === 'bullish' && sentiment.score > 20) return 'buy';

    // Sell conditions
    if (rsi > 70 && trend === 'bearish' && sentiment.signal === 'bearish') return 'sell';
    if (rsi > 60 && sentiment.signal === 'bearish' && sentiment.score < -20) return 'sell';

    return 'hold';
  }

  /**
   * Calculate confidence in the analysis
   */
  private calculateConfidence(prices: number[], volumes: number[]): number {
    let confidence = 50; // Base confidence

    // More data = higher confidence
    if (prices.length > 50) confidence += 20;
    else if (prices.length > 20) confidence += 10;

    // Volume consistency adds confidence
    if (volumes.length > 10) {
      const volumeStdDev = Math.sqrt(this.calculateVariance(volumes, volumes.reduce((a, b) => a + b) / volumes.length));
      const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
      const consistency = 1 - (volumeStdDev / avgVolume);
      confidence += consistency * 20;
    }

    // Price volatility affects confidence
    if (prices.length > 5) {
      const priceStdDev = Math.sqrt(this.calculateVariance(prices, prices.reduce((a, b) => a + b) / prices.length));
      const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
      const volatility = priceStdDev / avgPrice;
      
      if (volatility < 0.02) confidence += 10; // Low volatility = higher confidence
      else if (volatility > 0.1) confidence -= 10; // High volatility = lower confidence
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate insights based on indicators
   */
  private generateInsights(indicators: TechnicalIndicators, crypto: any): string[] {
    const insights: string[] = [];

    // RSI insights
    if (indicators.rsi > 70) {
      insights.push('RSI indicates overbought conditions - potential selling pressure');
    } else if (indicators.rsi < 30) {
      insights.push('RSI indicates oversold conditions - potential buying opportunity');
    }

    // Trend insights
    if (indicators.trend === 'bullish') {
      insights.push('Overall trend is bullish with upward momentum');
    } else if (indicators.trend === 'bearish') {
      insights.push('Overall trend is bearish with downward pressure');
    }

    // Volume insights
    if (indicators.volume.volumeRatio > 1.5) {
      insights.push('Above-average volume confirms current price movement');
    } else if (indicators.volume.volumeRatio < 0.5) {
      insights.push('Below-average volume suggests weak conviction in current move');
    }

    // MACD insights
    if (indicators.macd.macd > indicators.macd.signal) {
      insights.push('MACD shows bullish momentum building');
    } else {
      insights.push('MACD shows bearish momentum developing');
    }

    // Price level insights
    const currentPrice = crypto.quote.USD.price;
    if (currentPrice > indicators.bollinger.upper) {
      insights.push('Price is above upper Bollinger Band - potential reversal zone');
    } else if (currentPrice < indicators.bollinger.lower) {
      insights.push('Price is below lower Bollinger Band - potential bounce opportunity');
    }

    return insights;
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(indicators: TechnicalIndicators, crypto: any): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Volatility risk
    const change24h = Math.abs(crypto.quote.USD.percent_change_24h);
    if (change24h > 10) riskScore += 2;
    else if (change24h > 5) riskScore += 1;

    // RSI extremes add risk
    if (indicators.rsi > 80 || indicators.rsi < 20) riskScore += 1;

    // Volume inconsistency adds risk
    if (indicators.volume.volumeRatio > 3 || indicators.volume.volumeRatio < 0.3) riskScore += 1;

    // Low confidence adds risk
    if (indicators.confidence < 50) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate price targets
   */
  private calculatePriceTargets(currentPrice: number, indicators: TechnicalIndicators): {
    short: number;
    medium: number;
    long: number;
  } {
    const resistance = indicators.resistance;
    const support = indicators.support;
    
    let short = currentPrice;
    let medium = currentPrice;
    let long = currentPrice;

    if (indicators.signal === 'buy') {
      short = currentPrice * 1.05;  // 5% target
      medium = Math.min(resistance, currentPrice * 1.15); // 15% or resistance
      long = currentPrice * 1.30;   // 30% target
    } else if (indicators.signal === 'sell') {
      short = currentPrice * 0.95;  // 5% decline
      medium = Math.max(support, currentPrice * 0.85);    // 15% decline or support
      long = currentPrice * 0.70;   // 30% decline
    } else {
      // Hold signal - modest targets
      short = currentPrice * 1.02;
      medium = currentPrice * 1.05;
      long = currentPrice * 1.10;
    }

    return { short, medium, long };
  }

  /**
   * Get analysis for multiple symbols
   */
  async getMultipleAnalysis(symbols: string[]): Promise<MarketAnalysis[]> {
    const analyses = await Promise.allSettled(
      symbols.map(symbol => this.getAnalysis(symbol))
    );

    return analyses
      .filter((result): result is PromiseFulfilledResult<MarketAnalysis> => 
        result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Clear historical data
   */
  clearHistory(symbol?: string): void {
    if (symbol) {
      this.priceHistory.delete(symbol);
      this.volumeHistory.delete(symbol);
    } else {
      this.priceHistory.clear();
      this.volumeHistory.clear();
    }
  }
}

// Export singleton instance
export const technicalAnalysisService = new TechnicalAnalysisService();
export default technicalAnalysisService;