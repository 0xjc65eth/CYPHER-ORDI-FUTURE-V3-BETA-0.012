/**
 * 📊 CYPHER ORDI FUTURE v3.0.0 - Technical Indicators
 * Sistema completo de indicadores técnicos para análise de trading
 */

// Types
export interface IndicatorResult {
  value: number;
  timestamp: number;
  signal?: 'buy' | 'sell' | 'neutral';
}

export interface MAResult extends IndicatorResult {
  period: number;
}

export interface RSIResult extends IndicatorResult {
  period: number;
  overbought: boolean;
  oversold: boolean;
}

export interface MACDResult {
  timestamp: number;
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface BollingerBandsResult {
  timestamp: number;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number; // Fixed: changed from %b to percentB
}

export interface VolumeProfileResult {
  price: number;
  volume: number;
  percentage: number;
  poc: boolean; // Point of Control
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}

export interface StochasticResult {
  timestamp: number;
  percentK: number; // Fixed: changed from %K to percentK
  percentD: number; // Fixed: changed from %D to percentD
  signal: 'buy' | 'sell' | 'neutral';
}

export interface ATRResult extends IndicatorResult {
  period: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface CandlePattern {
  timestamp: number;
  pattern: string;
  reliability: number;
  direction: 'bullish' | 'bearish';
}

// Utility Functions
export function sma(data: number[], period: number): MAResult[] {
  const results: MAResult[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    const value = sum / period;
    
    results.push({
      value,
      timestamp: Date.now() - (data.length - i - 1) * 60000,
      period,
      signal: i > 0 ? (value > results[results.length - 1]?.value ? 'buy' : 'sell') : 'neutral'
    });
  }
  
  return results;
}

export function ema(data: number[], period: number): MAResult[] {
  const results: MAResult[] = [];
  const multiplier = 2 / (period + 1);
  
  let ema = data[0]; // Start with first value
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema = data[i];
    } else {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    results.push({
      value: ema,
      timestamp: Date.now() - (data.length - i - 1) * 60000,
      period,
      signal: i > 0 ? (ema > results[i - 1].value ? 'buy' : 'sell') : 'neutral'
    });
  }
  
  return results;
}

export function rsi(data: number[], period: number = 14): RSIResult[] {
  const results: RSIResult[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate RSI
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    results.push({
      value: rsi,
      timestamp: Date.now() - (gains.length - i - 1) * 60000,
      period,
      overbought: rsi > 70,
      oversold: rsi < 30,
      signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'neutral'
    });
  }
  
  return results;
}

export function macd(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACDResult[] {
  const results: MACDResult[] = [];
  
  const fastEMA = ema(data, fastPeriod);
  const slowEMA = ema(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine: number[] = [];
  const startIndex = Math.max(fastPeriod, slowPeriod) - 1;
  
  for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    macdLine.push(fastEMA[i].value - slowEMA[i].value);
  }
  
  // Calculate signal line
  const signalLine = ema(macdLine, signalPeriod);
  
  // Calculate histogram and trend
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine[i + signalPeriod - 1];
    const signalValue = signalLine[i].value;
    const histogram = macdValue - signalValue;
    
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (macdValue > signalValue && histogram > 0) trend = 'bullish';
    else if (macdValue < signalValue && histogram < 0) trend = 'bearish';
    
    results.push({
      timestamp: Date.now() - (signalLine.length - i - 1) * 60000,
      macd: macdValue,
      signal: signalValue,
      histogram,
      trend
    });
  }
  
  return results;
}

export function bollingerBands(data: number[], period: number = 20, stdDev: number = 2): BollingerBandsResult[] {
  const results: BollingerBandsResult[] = [];
  const smaData = sma(data, period);
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const middle = smaData[i - period + 1].value;
    
    // Calculate standard deviation
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
    const stdDeviation = Math.sqrt(variance);
    
    const upper = middle + (stdDev * stdDeviation);
    const lower = middle - (stdDev * stdDeviation);
    const bandwidth = (upper - lower) / middle;
    const percentB = (data[i] - lower) / (upper - lower);
    
    results.push({
      timestamp: Date.now() - (data.length - i - 1) * 60000,
      upper,
      middle,
      lower,
      bandwidth,
      percentB
    });
  }
  
  return results;
}

export function atr(high: number[], low: number[], close: number[], period: number = 14): ATRResult[] {
  const results: ATRResult[] = [];
  const trueRanges: number[] = [];
  
  // Calculate True Range
  for (let i = 1; i < high.length; i++) {
    const tr1 = high[i] - low[i];
    const tr2 = Math.abs(high[i] - close[i - 1]);
    const tr3 = Math.abs(low[i] - close[i - 1]);
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate ATR
  for (let i = period - 1; i < trueRanges.length; i++) {
    const avgTR = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    let volatility: 'low' | 'medium' | 'high' = 'medium';
    const currentPrice = close[i + 1];
    const atrPercent = (avgTR / currentPrice) * 100;
    
    if (atrPercent < 1) volatility = 'low';
    else if (atrPercent > 3) volatility = 'high';
    
    results.push({
      value: avgTR,
      timestamp: Date.now() - (trueRanges.length - i - 1) * 60000,
      period,
      volatility,
      signal: 'neutral'
    });
  }
  
  return results;
}

export function stochastic(high: number[], low: number[], close: number[], kPeriod: number = 14, dPeriod: number = 3): StochasticResult[] {
  const results: StochasticResult[] = [];
  const kValues: number[] = [];
  
  // Calculate %K
  for (let i = kPeriod - 1; i < close.length; i++) {
    const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1));
    const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1));
    const kValue = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(kValue);
  }
  
  // Calculate %D (SMA of %K)
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    const dValue = kValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod;
    
    let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
    if (kValues[i] < 20 && dValue < 20) signal = 'buy';
    else if (kValues[i] > 80 && dValue > 80) signal = 'sell';
    
    results.push({
      timestamp: Date.now() - (kValues.length - i - 1) * 60000,
      percentK: kValues[i],
      percentD: dValue,
      signal
    });
  }
  
  return results;
}

// Enhanced pattern detection
export function detectCandlePatterns(open: number[], high: number[], low: number[], close: number[]): CandlePattern[] {
  const patterns: CandlePattern[] = [];
  
  for (let i = 2; i < open.length; i++) {
    const current = { open: open[i], high: high[i], low: low[i], close: close[i] };
    const prev = { open: open[i-1], high: high[i-1], low: low[i-1], close: close[i-1] };
    
    // Doji pattern
    if (Math.abs(current.open - current.close) < (current.high - current.low) * 0.1) {
      patterns.push({
        timestamp: Date.now() - (open.length - i - 1) * 60000,
        pattern: 'Doji',
        reliability: 0.7,
        direction: 'bearish'
      });
    }
    
    // Hammer pattern
    if (current.close > current.open && 
        (current.open - current.low) > 2 * (current.close - current.open) &&
        (current.high - current.close) < (current.close - current.open) * 0.1) {
      patterns.push({
        timestamp: Date.now() - (open.length - i - 1) * 60000,
        pattern: 'Hammer',
        reliability: 0.8,
        direction: 'bullish'
      });
    }
  }
  
  return patterns;
}

// Volume analysis
export function volumeProfile(prices: number[], volumes: number[], buckets: number = 20): VolumeProfileResult[] {
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const bucketSize = priceRange / buckets;
  
  const profile: VolumeProfileResult[] = [];
  
  for (let i = 0; i < buckets; i++) {
    const priceLevel = minPrice + (i * bucketSize);
    let volumeAtLevel = 0;
    
    for (let j = 0; j < prices.length; j++) {
      if (prices[j] >= priceLevel && prices[j] < priceLevel + bucketSize) {
        volumeAtLevel += volumes[j];
      }
    }
    
    profile.push({
      price: priceLevel + (bucketSize / 2),
      volume: volumeAtLevel,
      percentage: 0, // Will be calculated after total volume
      poc: false
    });
  }
  
  // Calculate percentages and POC
  const totalVolume = profile.reduce((sum, level) => sum + level.volume, 0);
  let maxVolume = 0;
  let pocIndex = 0;
  
  for (let i = 0; i < profile.length; i++) {
    profile[i].percentage = (profile[i].volume / totalVolume) * 100;
    if (profile[i].volume > maxVolume) {
      maxVolume = profile[i].volume;
      pocIndex = i;
    }
  }
  
  profile[pocIndex].poc = true;
  
  return profile;
}

// Fibonacci retracement levels
export function fibonacciRetracement(high: number, low: number): FibonacciLevel[] {
  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  const range = high - low;
  
  return levels.map(level => ({
    level,
    price: high - (range * level),
    label: `${(level * 100).toFixed(1)}%`
  }));
}

// Export all indicators as a collection
export const TechnicalIndicators = {
  sma,
  ema,
  rsi,
  macd,
  bollingerBands,
  atr,
  stochastic,
  detectCandlePatterns,
  volumeProfile,
  fibonacciRetracement
};

export default TechnicalIndicators;