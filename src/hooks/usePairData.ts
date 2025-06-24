import useSWR from 'swr';
import { useState, useEffect, useMemo } from 'react';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Types
interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OrderBookData {
  bids: Array<{ price: number; amount: number; total: number }>;
  asks: Array<{ price: number; amount: number; total: number }>;
  spread: number;
  midPrice: number;
}

interface PairStats {
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  tvl: number;
  holders: number;
}

interface TechnicalIndicators {
  rsi: number[];
  macd: { line: number[]; signal: number[]; histogram: number[] };
  bollinger: { upper: number[]; middle: number[]; lower: number[] };
  vwap: number[];
  volumeProfile: Array<{ price: number; volume: number }>;
}

// Main hook for pair data
export function usePairData(base: string, quote: string) {
  const pair = `${base}-${quote}`;
  
  // Candlestick data with multiple timeframes
  const { data: candles1m } = useSWR(`/api/pair/${pair}/candles?timeframe=1m`, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true
  });
  
  const { data: candles5m } = useSWR(`/api/pair/${pair}/candles?timeframe=5m`, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true
  });
  
  const { data: candles1h } = useSWR(`/api/pair/${pair}/candles?timeframe=1h`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false
  });
  
  const { data: candles1d } = useSWR(`/api/pair/${pair}/candles?timeframe=1d`, fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false
  });

  // Real-time stats
  const { data: stats, error: statsError } = useSWR(`/api/pair/${pair}/stats`, fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
    dedupingInterval: 1000
  });

  // Order book depth
  const { data: depth, error: depthError } = useSWR(`/api/pair/${pair}/depth`, fetcher, {
    refreshInterval: 1000,
    revalidateOnFocus: true,
    dedupingInterval: 500
  });

  // Technical indicators
  const { data: indicators } = useSWR(`/api/pair/${pair}/indicators`, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false
  });

  // Recent trades
  const { data: trades } = useSWR(`/api/pair/${pair}/trades?limit=50`, fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true
  });

  return {
    pair,
    candles: {
      '1m': candles1m?.data || [],
      '5m': candles5m?.data || [],
      '1h': candles1h?.data || [],
      '1d': candles1d?.data || []
    },
    stats: stats?.data as PairStats | null,
    depth: depth?.data as OrderBookData | null,
    indicators: indicators?.data as TechnicalIndicators | null,
    trades: trades?.data || [],
    isLoading: !stats && !statsError,
    hasError: statsError || depthError
  };
}

// Hook for real-time price updates
export function useRealTimePrice(base: string, quote: string) {
  const [price, setPrice] = useState<number>(0);
  const [change, setChange] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const { data } = useSWR(`/api/pair/${base}-${quote}/ticker`, fetcher, {
    refreshInterval: 1000, // Ultra fast updates for price
    revalidateOnFocus: true,
    dedupingInterval: 500
  });

  useEffect(() => {
    if (data?.data) {
      setPrice(data.data.price);
      setChange(data.data.change24h);
      setVolume(data.data.volume24h);
    }
  }, [data]);

  return { price, change, volume, lastUpdate: data?.timestamp };
}

// Hook for technical analysis
export function useTechnicalAnalysis(base: string, quote: string, timeframe: string = '1h') {
  const pair = `${base}-${quote}`;
  
  const { data } = useSWR(`/api/pair/${pair}/technical?timeframe=${timeframe}`, fetcher, {
    refreshInterval: 60000, // Update every minute
    revalidateOnFocus: false
  });

  const analysis = useMemo(() => {
    if (!data?.data) return null;

    const { rsi, macd, bollinger, vwap } = data.data;
    
    // Calculate signals
    const rsiSignal = rsi[rsi.length - 1] > 70 ? 'SELL' : rsi[rsi.length - 1] < 30 ? 'BUY' : 'NEUTRAL';
    const macdSignal = macd.line[macd.line.length - 1] > macd.signal[macd.signal.length - 1] ? 'BUY' : 'SELL';
    const currentPrice = data.data.currentPrice || 0;
    const bollingerSignal = currentPrice > bollinger.upper[bollinger.upper.length - 1] ? 'SELL' : 
                           currentPrice < bollinger.lower[bollinger.lower.length - 1] ? 'BUY' : 'NEUTRAL';

    // Overall signal
    const signals = [rsiSignal, macdSignal, bollingerSignal];
    const buyCount = signals.filter(s => s === 'BUY').length;
    const sellCount = signals.filter(s => s === 'SELL').length;
    
    const overallSignal = buyCount > sellCount ? 'BUY' : 
                         sellCount > buyCount ? 'SELL' : 'NEUTRAL';

    return {
      rsi: {
        value: rsi[rsi.length - 1],
        signal: rsiSignal,
        strength: Math.abs(50 - rsi[rsi.length - 1]) / 50 * 100
      },
      macd: {
        value: macd.line[macd.line.length - 1],
        signal: macdSignal,
        histogram: macd.histogram[macd.histogram.length - 1]
      },
      bollinger: {
        position: currentPrice,
        upper: bollinger.upper[bollinger.upper.length - 1],
        lower: bollinger.lower[bollinger.lower.length - 1],
        signal: bollingerSignal
      },
      vwap: {
        value: vwap[vwap.length - 1],
        signal: currentPrice > vwap[vwap.length - 1] ? 'BULLISH' : 'BEARISH'
      },
      overall: {
        signal: overallSignal,
        confidence: Math.max(buyCount, sellCount) / signals.length * 100,
        signals: { buy: buyCount, sell: sellCount, neutral: signals.length - buyCount - sellCount }
      }
    };
  }, [data]);

  return {
    analysis,
    rawData: data?.data,
    isLoading: !data,
    lastUpdate: data?.timestamp
  };
}

// Hook for market depth analysis
export function useMarketDepth(base: string, quote: string) {
  const { data } = useSWR(`/api/pair/${base}-${quote}/depth?levels=20`, fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true
  });

  const analysis = useMemo(() => {
    if (!data?.data) return null;

    const { bids, asks } = data.data;
    
    // Calculate depth metrics
    const totalBidVolume = bids.reduce((sum: number, bid: any) => sum + bid.amount, 0);
    const totalAskVolume = asks.reduce((sum: number, ask: any) => sum + ask.amount, 0);
    const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);
    
    // Support/Resistance levels
    const supportLevels = bids.slice(0, 5).map((bid: any) => ({
      price: bid.price,
      strength: bid.amount / totalBidVolume * 100
    }));
    
    const resistanceLevels = asks.slice(0, 5).map((ask: any) => ({
      price: ask.price,
      strength: ask.amount / totalAskVolume * 100
    }));

    return {
      imbalance,
      totalBidVolume,
      totalAskVolume,
      supportLevels,
      resistanceLevels,
      spread: data.data.spread,
      midPrice: data.data.midPrice
    };
  }, [data]);

  return {
    depth: data?.data,
    analysis,
    isLoading: !data,
    lastUpdate: data?.timestamp
  };
}

// Hook for volume profile
export function useVolumeProfile(base: string, quote: string, period: string = '24h') {
  const { data } = useSWR(`/api/pair/${base}-${quote}/volume-profile?period=${period}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false
  });

  const analysis = useMemo(() => {
    if (!data?.data?.profile) return null;

    const profile = data.data.profile;
    const maxVolume = Math.max(...profile.map((p: any) => p.volume));
    const pocLevel = profile.find((p: any) => p.volume === maxVolume); // Point of Control
    
    // Value Area (70% of volume)
    const sortedByVolume = [...profile].sort((a: any, b: any) => b.volume - a.volume);
    const totalVolume = profile.reduce((sum: number, p: any) => sum + p.volume, 0);
    const valueAreaVolume = totalVolume * 0.7;
    
    let accumulatedVolume = 0;
    const valueAreaLevels = [];
    
    for (const level of sortedByVolume) {
      if (accumulatedVolume < valueAreaVolume) {
        valueAreaLevels.push(level);
        accumulatedVolume += level.volume;
      } else {
        break;
      }
    }
    
    const valueAreaHigh = Math.max(...valueAreaLevels.map(l => l.price));
    const valueAreaLow = Math.min(...valueAreaLevels.map(l => l.price));

    return {
      poc: pocLevel,
      valueAreaHigh,
      valueAreaLow,
      totalVolume,
      profile: profile.map((p: any) => ({
        ...p,
        percentage: (p.volume / maxVolume) * 100
      }))
    };
  }, [data]);

  return {
    profile: data?.data?.profile || [],
    analysis,
    isLoading: !data,
    lastUpdate: data?.timestamp
  };
}

// Comprehensive dashboard hook
export function usePairDashboard(base: string, quote: string) {
  const pairData = usePairData(base, quote);
  const realTimePrice = useRealTimePrice(base, quote);
  const technicalAnalysis = useTechnicalAnalysis(base, quote);
  const marketDepth = useMarketDepth(base, quote);
  const volumeProfile = useVolumeProfile(base, quote);

  return {
    ...pairData,
    realTime: realTimePrice,
    technical: technicalAnalysis,
    depth: marketDepth,
    volume: volumeProfile,
    isFullyLoaded: !pairData.isLoading && !technicalAnalysis.isLoading && !marketDepth.isLoading
  };
}