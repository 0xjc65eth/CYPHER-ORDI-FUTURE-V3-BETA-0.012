/**
 * TechnicalAnalysisEngine - Advanced Technical Analysis for Trading Strategies
 * Implements RSI, MACD, Volume analysis, and trend following algorithms
 */

export class TechnicalAnalysisEngine {
  constructor() {
    this.indicators = new Map();
    this.priceData = new Map();
    this.signals = new Map();
    
    this.config = {
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      volumeMovingAverage: 20,
      trendConfirmationPeriod: 5,
      supportResistanceLookback: 50,
      volatilityPeriod: 20
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(prices, period = this.config.rsiPeriod) {
    if (prices.length < period + 1) {
      return { current: 50, values: [], signal: 'neutral' };
    }

    const gains = [];
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i].close - prices[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const rsiValues = [];
    
    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // Calculate RSI for each period
    for (let i = period; i < gains.length; i++) {
      // Smoothed moving averages
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
      const rsi = 100 - (100 / (1 + rs));
      
      rsiValues.push({
        timestamp: prices[i + 1].timestamp,
        value: rsi,
        avgGain,
        avgLoss
      });
    }

    const currentRSI = rsiValues[rsiValues.length - 1]?.value || 50;
    
    // Determine signal
    let signal = 'neutral';
    if (currentRSI > this.config.rsiOverbought) {
      signal = 'sell';
    } else if (currentRSI < this.config.rsiOversold) {
      signal = 'buy';
    }

    return {
      current: currentRSI,
      values: rsiValues,
      signal,
      strength: this.calculateSignalStrength(currentRSI, 'rsi')
    };
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(prices) {
    const { macdFast, macdSlow, macdSignal } = this.config;
    
    if (prices.length < macdSlow) {
      return { 
        current: 0, 
        signal: 0, 
        histogram: 0, 
        values: [], 
        crossover: 'none' 
      };
    }

    // Calculate EMAs
    const fastEMA = this.calculateEMA(prices.map(p => p.close), macdFast);
    const slowEMA = this.calculateEMA(prices.map(p => p.close), macdSlow);
    
    // Calculate MACD line
    const macdLine = [];
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    // Calculate Signal line (EMA of MACD)
    const signalLine = this.calculateEMA(macdLine, macdSignal);
    
    // Calculate Histogram
    const histogram = [];
    const macdValues = [];
    
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      const histValue = macdLine[i] - signalLine[i];
      histogram.push(histValue);
      
      if (i >= macdSlow - 1) {
        macdValues.push({
          timestamp: prices[i].timestamp,
          macd: macdLine[i],
          signal: signalLine[i],
          histogram: histValue
        });
      }
    }

    const current = macdLine[macdLine.length - 1] || 0;
    const currentSignal = signalLine[signalLine.length - 1] || 0;
    const currentHistogram = histogram[histogram.length - 1] || 0;
    
    // Detect crossovers
    let crossover = 'none';
    if (histogram.length >= 2) {
      const prevHistogram = histogram[histogram.length - 2];
      if (prevHistogram < 0 && currentHistogram > 0) {
        crossover = 'bullish';
      } else if (prevHistogram > 0 && currentHistogram < 0) {
        crossover = 'bearish';
      }
    }

    return {
      current,
      signal: currentSignal,
      histogram: currentHistogram,
      values: macdValues,
      crossover,
      strength: this.calculateSignalStrength(currentHistogram, 'macd')
    };
  }

  /**
   * Calculate Exponential Moving Average
   */
  calculateEMA(values, period) {
    if (values.length < period) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += values[i];
    }
    ema.push(sum / period);
    
    // Calculate EMA for remaining values
    for (let i = period; i < values.length; i++) {
      const emaValue = (values[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(emaValue);
    }
    
    return ema;
  }

  /**
   * Calculate Moving Average
   */
  calculateSMA(values, period) {
    if (values.length < period) return [];
    
    const sma = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  /**
   * Analyze volume patterns
   */
  analyzeVolume(prices) {
    if (prices.length < this.config.volumeMovingAverage) {
      return {
        current: 0,
        average: 0,
        ratio: 1,
        trend: 'neutral',
        signal: 'neutral'
      };
    }

    const volumes = prices.map(p => p.volume || 0);
    const currentVolume = volumes[volumes.length - 1];
    
    // Calculate volume moving average
    const volumeMA = this.calculateSMA(volumes, this.config.volumeMovingAverage);
    const currentVolumeMA = volumeMA[volumeMA.length - 1];
    
    const volumeRatio = currentVolume / currentVolumeMA;
    
    // Analyze volume trend
    const recentVolumes = volumes.slice(-5);
    const volumeTrend = this.calculateTrend(recentVolumes);
    
    // Generate volume signal
    let signal = 'neutral';
    if (volumeRatio > 2.0 && volumeTrend > 0) {
      signal = 'strong_bullish';
    } else if (volumeRatio > 1.5) {
      signal = 'bullish';
    } else if (volumeRatio < 0.5) {
      signal = 'bearish';
    }

    return {
      current: currentVolume,
      average: currentVolumeMA,
      ratio: volumeRatio,
      trend: volumeTrend > 0 ? 'increasing' : volumeTrend < 0 ? 'decreasing' : 'stable',
      signal,
      strength: Math.min(Math.abs(volumeRatio - 1), 2) / 2
    };
  }

  /**
   * Identify support and resistance levels
   */
  identifySupportResistance(prices) {
    const lookback = Math.min(prices.length, this.config.supportResistanceLookback);
    const recentPrices = prices.slice(-lookback);
    
    const highs = recentPrices.map(p => p.high);
    const lows = recentPrices.map(p => p.low);
    
    // Find local maxima and minima
    const resistance = this.findLocalMaxima(highs);
    const support = this.findLocalMinima(lows);
    
    const currentPrice = prices[prices.length - 1].close;
    
    // Find nearest levels
    const nearestResistance = resistance
      .filter(r => r > currentPrice)
      .sort((a, b) => a - b)[0];
      
    const nearestSupport = support
      .filter(s => s < currentPrice)
      .sort((a, b) => b - a)[0];

    return {
      resistance: resistance.slice(0, 3), // Top 3 resistance levels
      support: support.slice(0, 3), // Top 3 support levels
      nearestResistance,
      nearestSupport,
      distanceToResistance: nearestResistance ? (nearestResistance - currentPrice) / currentPrice : null,
      distanceToSupport: nearestSupport ? (currentPrice - nearestSupport) / currentPrice : null
    };
  }

  /**
   * Calculate price volatility
   */
  calculateVolatility(prices) {
    const period = Math.min(prices.length, this.config.volatilityPeriod);
    const recentPrices = prices.slice(-period);
    
    if (recentPrices.length < 2) {
      return { current: 0, average: 0, percentile: 50 };
    }

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < recentPrices.length; i++) {
      const dailyReturn = (recentPrices[i].close - recentPrices[i - 1].close) / recentPrices[i - 1].close;
      returns.push(dailyReturn);
    }

    // Calculate standard deviation
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Calculate volatility percentile over longer period
    const longerPeriod = Math.min(prices.length, 100);
    const historicalVolatilities = [];
    
    for (let i = period; i <= longerPeriod; i++) {
      const subset = prices.slice(-i, -i + period);
      if (subset.length >= period) {
        const subReturns = [];
        for (let j = 1; j < subset.length; j++) {
          subReturns.push((subset[j].close - subset[j - 1].close) / subset[j - 1].close);
        }
        const subMean = subReturns.reduce((a, b) => a + b, 0) / subReturns.length;
        const subVariance = subReturns.reduce((a, b) => a + Math.pow(b - subMean, 2), 0) / subReturns.length;
        historicalVolatilities.push(Math.sqrt(subVariance) * Math.sqrt(252));
      }
    }

    const percentile = historicalVolatilities.length > 0 
      ? (historicalVolatilities.filter(v => v < volatility).length / historicalVolatilities.length) * 100 
      : 50;

    return {
      current: volatility,
      average: historicalVolatilities.reduce((a, b) => a + b, 0) / historicalVolatilities.length || 0,
      percentile,
      regime: percentile > 80 ? 'high' : percentile < 20 ? 'low' : 'normal'
    };
  }

  /**
   * Comprehensive trend analysis
   */
  analyzeTrend(prices) {
    if (prices.length < 20) {
      return {
        direction: 'neutral',
        strength: 0,
        confidence: 0,
        signals: {}
      };
    }

    // Calculate various moving averages
    const closes = prices.map(p => p.close);
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);

    const currentPrice = closes[closes.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];

    // Calculate technical indicators
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const volume = this.analyzeVolume(prices);
    const volatility = this.calculateVolatility(prices);
    const supportResistance = this.identifySupportResistance(prices);

    // Determine trend direction
    let trendScore = 0;
    const signals = {};

    // Price vs Moving Averages
    if (currentPrice > currentSMA20) trendScore += 1;
    if (currentPrice > currentSMA50) trendScore += 1;
    if (currentSMA20 > currentSMA50) trendScore += 1;

    // MACD signals
    if (macd.crossover === 'bullish') trendScore += 2;
    if (macd.crossover === 'bearish') trendScore -= 2;
    if (macd.current > macd.signal) trendScore += 1;

    // RSI signals
    if (rsi.signal === 'buy') trendScore += 1;
    if (rsi.signal === 'sell') trendScore -= 1;

    // Volume confirmation
    if (volume.signal === 'bullish' || volume.signal === 'strong_bullish') {
      trendScore += volume.signal === 'strong_bullish' ? 2 : 1;
    }

    // Normalize trend score
    const maxScore = 8;
    const normalizedScore = trendScore / maxScore;

    // Determine trend direction and strength
    let direction = 'neutral';
    let strength = Math.abs(normalizedScore);

    if (normalizedScore > 0.3) {
      direction = 'bullish';
    } else if (normalizedScore < -0.3) {
      direction = 'bearish';
    }

    // Calculate confidence based on signal alignment
    const signalAlignment = this.calculateSignalAlignment([
      rsi.signal,
      macd.crossover === 'bullish' ? 'buy' : macd.crossover === 'bearish' ? 'sell' : 'neutral',
      volume.signal === 'bullish' ? 'buy' : volume.signal === 'bearish' ? 'sell' : 'neutral'
    ]);

    return {
      direction,
      strength,
      confidence: signalAlignment,
      trendScore: normalizedScore,
      signals: {
        rsi,
        macd,
        volume,
        volatility,
        supportResistance,
        movingAverages: {
          sma20: currentSMA20,
          sma50: currentSMA50,
          priceVsSMA20: (currentPrice - currentSMA20) / currentSMA20,
          priceVsSMA50: (currentPrice - currentSMA50) / currentSMA50
        }
      }
    };
  }

  /**
   * Generate trading signals based on technical analysis
   */
  generateTradingSignal(prices, strategy = 'comprehensive') {
    const analysis = this.analyzeTrend(prices);
    
    const signal = {
      action: 'hold',
      confidence: 0,
      strength: 0,
      reasons: [],
      analysis,
      timestamp: Date.now()
    };

    // Comprehensive strategy
    if (strategy === 'comprehensive') {
      if (analysis.direction === 'bullish' && analysis.confidence > 0.6) {
        signal.action = 'buy';
        signal.confidence = analysis.confidence;
        signal.strength = analysis.strength;
        signal.reasons.push('Strong bullish trend confirmed by multiple indicators');
      } else if (analysis.direction === 'bearish' && analysis.confidence > 0.6) {
        signal.action = 'sell';
        signal.confidence = analysis.confidence;
        signal.strength = analysis.strength;
        signal.reasons.push('Strong bearish trend confirmed by multiple indicators');
      }
    }

    // RSI strategy
    if (strategy === 'rsi') {
      const rsi = analysis.signals.rsi;
      if (rsi.signal === 'buy' && rsi.strength > 0.7) {
        signal.action = 'buy';
        signal.confidence = rsi.strength;
        signal.reasons.push(`RSI oversold at ${rsi.current.toFixed(2)}`);
      } else if (rsi.signal === 'sell' && rsi.strength > 0.7) {
        signal.action = 'sell';
        signal.confidence = rsi.strength;
        signal.reasons.push(`RSI overbought at ${rsi.current.toFixed(2)}`);
      }
    }

    // MACD strategy
    if (strategy === 'macd') {
      const macd = analysis.signals.macd;
      if (macd.crossover === 'bullish') {
        signal.action = 'buy';
        signal.confidence = 0.8;
        signal.reasons.push('MACD bullish crossover');
      } else if (macd.crossover === 'bearish') {
        signal.action = 'sell';
        signal.confidence = 0.8;
        signal.reasons.push('MACD bearish crossover');
      }
    }

    return signal;
  }

  /**
   * Helper methods
   */
  
  calculateSignalStrength(value, type) {
    if (type === 'rsi') {
      if (value > 70) return (value - 70) / 30;
      if (value < 30) return (30 - value) / 30;
      return 0;
    }
    
    if (type === 'macd') {
      return Math.min(Math.abs(value) / 0.01, 1); // Normalize to 0-1
    }
    
    return 0;
  }

  calculateSignalAlignment(signals) {
    const buySignals = signals.filter(s => s === 'buy' || s === 'bullish').length;
    const sellSignals = signals.filter(s => s === 'sell' || s === 'bearish').length;
    const totalSignals = signals.filter(s => s !== 'neutral').length;
    
    if (totalSignals === 0) return 0;
    
    const dominantSignals = Math.max(buySignals, sellSignals);
    return dominantSignals / signals.length;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    let upCount = 0;
    let downCount = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) upCount++;
      else if (values[i] < values[i - 1]) downCount++;
    }
    
    return (upCount - downCount) / (values.length - 1);
  }

  findLocalMaxima(values) {
    const maxima = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        maxima.push(values[i]);
      }
    }
    return maxima.sort((a, b) => b - a);
  }

  findLocalMinima(values) {
    const minima = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        minima.push(values[i]);
      }
    }
    return minima.sort((a, b) => a - b);
  }
}

export default TechnicalAnalysisEngine;