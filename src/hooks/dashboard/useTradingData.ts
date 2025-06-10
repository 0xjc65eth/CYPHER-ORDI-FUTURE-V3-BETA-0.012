import { useState, useEffect, useCallback } from 'react';

interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: 'strong' | 'medium' | 'weak';
  indicator: string;
  price: number;
  timestamp: Date;
}

interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  ema: {
    ema12: number;
    ema26: number;
    ema50: number;
    ema200: number;
  };
  volume: {
    current: number;
    average: number;
  };
}

interface TradingData {
  candles: OHLCV[];
  indicators: TechnicalIndicators;
  signals: TradingSignal[];
  supportLevels: number[];
  resistanceLevels: number[];
}

export function useTradingData(symbol = 'BTCUSDT', timeframe = '1h') {
  const [data, setData] = useState<TradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateCandles = useCallback((count: number): OHLCV[] => {
    const candles: OHLCV[] = [];
    const now = Date.now();
    const interval = timeframe === '1m' ? 60000 : 
                     timeframe === '5m' ? 300000 :
                     timeframe === '15m' ? 900000 :
                     timeframe === '1h' ? 3600000 :
                     timeframe === '4h' ? 14400000 :
                     timeframe === '1d' ? 86400000 : 3600000;

    let currentPrice = 65000;

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const volatility = 0.002; // 0.2% volatility
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const high = open * (1 + Math.abs(change) + Math.random() * volatility);
      const low = open * (1 - Math.abs(change) - Math.random() * volatility);
      const close = open * (1 + change);
      const volume = 100 + Math.random() * 1000;

      currentPrice = close;

      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
    }

    return candles;
  }, [timeframe]);

  const calculateIndicators = useCallback((candles: OHLCV[]): TechnicalIndicators => {
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    // Simple RSI calculation
    const rsi = 50 + (Math.random() - 0.5) * 40;

    // MACD placeholder
    const macd = {
      value: (Math.random() - 0.5) * 100,
      signal: (Math.random() - 0.5) * 100,
      histogram: (Math.random() - 0.5) * 50
    };

    // Bollinger Bands
    const bollingerBands = {
      upper: currentPrice * 1.02,
      middle: currentPrice,
      lower: currentPrice * 0.98
    };

    // EMAs
    const ema = {
      ema12: currentPrice * (1 + (Math.random() - 0.5) * 0.01),
      ema26: currentPrice * (1 + (Math.random() - 0.5) * 0.015),
      ema50: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
      ema200: currentPrice * (1 + (Math.random() - 0.5) * 0.03)
    };

    // Volume
    const volumes = candles.map(c => c.volume);
    const volume = {
      current: volumes[volumes.length - 1],
      average: volumes.reduce((a, b) => a + b, 0) / volumes.length
    };

    return { rsi, macd, bollingerBands, ema, volume };
  }, []);

  const generateSignals = useCallback((indicators: TechnicalIndicators, currentPrice: number): TradingSignal[] => {
    const signals: TradingSignal[] = [];

    // RSI signals
    if (indicators.rsi < 30) {
      signals.push({
        type: 'buy',
        strength: indicators.rsi < 20 ? 'strong' : 'medium',
        indicator: 'RSI Oversold',
        price: currentPrice,
        timestamp: new Date()
      });
    } else if (indicators.rsi > 70) {
      signals.push({
        type: 'sell',
        strength: indicators.rsi > 80 ? 'strong' : 'medium',
        indicator: 'RSI Overbought',
        price: currentPrice,
        timestamp: new Date()
      });
    }

    // MACD signals
    if (indicators.macd.histogram > 0 && indicators.macd.value > indicators.macd.signal) {
      signals.push({
        type: 'buy',
        strength: 'medium',
        indicator: 'MACD Bullish Cross',
        price: currentPrice,
        timestamp: new Date()
      });
    }

    // Bollinger Bands signals
    if (currentPrice < indicators.bollingerBands.lower) {
      signals.push({
        type: 'buy',
        strength: 'weak',
        indicator: 'Below Lower BB',
        price: currentPrice,
        timestamp: new Date()
      });
    }

    return signals;
  }, []);

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        setLoading(true);
        
        // Generate mock data
        const candles = generateCandles(100);
        const indicators = calculateIndicators(candles);
        const currentPrice = candles[candles.length - 1].close;
        const signals = generateSignals(indicators, currentPrice);

        // Calculate support and resistance levels
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        const supportLevels = [
          Math.min(...lows),
          currentPrice * 0.98,
          currentPrice * 0.95
        ].sort((a, b) => b - a);
        const resistanceLevels = [
          Math.max(...highs),
          currentPrice * 1.02,
          currentPrice * 1.05
        ].sort((a, b) => a - b);

        setData({
          candles,
          indicators,
          signals,
          supportLevels,
          resistanceLevels
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trading data');
        setLoading(false);
      }
    };

    fetchTradingData();

    // Update every second with new candle
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return null;

        const newCandles = [...prev.candles];
        const lastCandle = newCandles[newCandles.length - 1];
        
        // Update last candle
        lastCandle.close = lastCandle.close * (1 + (Math.random() - 0.5) * 0.001);
        lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
        lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
        lastCandle.volume += Math.random() * 10;

        const newIndicators = calculateIndicators(newCandles);
        const newSignals = generateSignals(newIndicators, lastCandle.close);

        return {
          ...prev,
          candles: newCandles,
          indicators: newIndicators,
          signals: [...newSignals, ...prev.signals].slice(0, 10)
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [symbol, timeframe, generateCandles, calculateIndicators, generateSignals]);

  return { data, loading, error };
}