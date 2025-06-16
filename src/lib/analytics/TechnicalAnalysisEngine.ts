/**
 * 📊 AGENT_015: Technical Analysis Engine
 */

export interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ma20: number;
  ma50: number;
  bollinger: { upper: number; middle: number; lower: number };
}

export interface TradingSignal {
  indicator: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  confidence: number;
  reason: string;
}

export class TechnicalAnalysisEngine {
  
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    let gains = 0, losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  static calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static getAnalysis(prices: number[]): { indicators: TechnicalIndicators; signals: TradingSignal[] } {
    const latestPrice = prices[prices.length - 1];
    
    const indicators: TechnicalIndicators = {
      rsi: this.calculateRSI(prices),
      macd: { value: 0, signal: 0, histogram: 0 },
      ma20: this.calculateMA(prices, 20),
      ma50: this.calculateMA(prices, 50),
      bollinger: { 
        upper: latestPrice * 1.02, 
        middle: latestPrice, 
        lower: latestPrice * 0.98 
      }
    };

    const signals: TradingSignal[] = [];

    // RSI Signals
    if (indicators.rsi > 70) {
      signals.push({
        indicator: 'RSI',
        signal: 'SELL',
        strength: Math.min((indicators.rsi - 70) * 3.33, 100),
        confidence: 0.7,
        reason: 'Overbought condition'
      });
    } else if (indicators.rsi < 30) {
      signals.push({
        indicator: 'RSI',
        signal: 'BUY',
        strength: Math.min((30 - indicators.rsi) * 3.33, 100),
        confidence: 0.7,
        reason: 'Oversold condition'
      });
    }

    return { indicators, signals };
  }
}