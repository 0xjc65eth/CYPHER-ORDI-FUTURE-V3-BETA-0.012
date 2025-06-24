import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { 
  RunesPriceData, 
  RunesVolumeData, 
  MarketDepthData, 
  HoldersDistributionData,
  ZoomState,
  TechnicalIndicators 
} from './types';

// Custom hook for price chart data with real-time updates
export const useRunesPriceData = (runeId: string, interval: string = '1h') => {
  const [zoom, setZoom] = useState<ZoomState>({ startIndex: 0, endIndex: 100, scale: 1 });
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    ma20: true,
    ma50: true,
    vwap: false,
    bollinger: false,
    rsi: false,
    macd: false,
  });

  const fetcher = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch price data');
    const data = await response.json();
    
    // Add technical indicators
    return data.map((item: any, index: number, array: any[]) => {
      const ma20 = calculateMA(array, index, 20);
      const ma50 = calculateMA(array, index, 50);
      const vwap = calculateVWAP(array, index);
      
      return {
        ...item,
        timestamp: new Date(item.timestamp).getTime(),
        ma20: indicators.ma20 ? ma20 : undefined,
        ma50: indicators.ma50 ? ma50 : undefined,
        vwap: indicators.vwap ? vwap : undefined,
      };
    });
  }, [indicators]);

  const { data, error, isLoading, mutate } = useSWR<RunesPriceData[]>(
    `/api/runes/${runeId}/price?interval=${interval}`,
    fetcher,
    {
      refreshInterval: 5000, // 5 seconds for real-time updates
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const handleZoom = useCallback((newZoom: ZoomState) => {
    setZoom(newZoom);
  }, []);

  const toggleIndicator = useCallback((indicator: keyof TechnicalIndicators) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator],
    }));
  }, []);

  return {
    data: data?.slice(zoom.startIndex, zoom.endIndex) || [],
    error,
    isLoading,
    zoom,
    indicators,
    onZoom: handleZoom,
    toggleIndicator,
    refresh: mutate,
  };
};

// Custom hook for volume chart data
export const useRunesVolumeData = (runeId: string, period: string = '1d') => {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch volume data');
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<RunesVolumeData[]>(
    `/api/runes/${runeId}/volume?period=${period}`,
    fetcher,
    {
      refreshInterval: 10000, // 10 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    refresh: mutate,
  };
};

// Custom hook for market depth data
export const useMarketDepthData = (runeId: string) => {
  const [maxDepth, setMaxDepth] = useState(50);
  
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch market depth');
    const data = await response.json();
    
    // Process order book data into depth chart format
    return processOrderBookToDepth(data, maxDepth);
  };

  const { data, error, isLoading, mutate } = useSWR<MarketDepthData[]>(
    `/api/runes/${runeId}/orderbook?depth=${maxDepth}`,
    fetcher,
    {
      refreshInterval: 2000, // 2 seconds for order book
      revalidateOnFocus: true,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    maxDepth,
    setMaxDepth,
    refresh: mutate,
  };
};

// Custom hook for holders distribution data
export const useHoldersDistributionData = (runeId: string) => {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch holders distribution');
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<HoldersDistributionData[]>(
    `/api/runes/${runeId}/holders`,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    refresh: mutate,
  };
};

// Custom hook for chart responsiveness
export const useChartDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const height = Math.max(300, width * 0.5); // Maintain aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return { dimensions, containerRef };
};

// Utility functions for technical indicators
const calculateMA = (data: any[], currentIndex: number, period: number): number | undefined => {
  if (currentIndex < period - 1) return undefined;
  
  const sum = data
    .slice(currentIndex - period + 1, currentIndex + 1)
    .reduce((acc, item) => acc + item.close, 0);
  
  return sum / period;
};

const calculateVWAP = (data: any[], currentIndex: number): number | undefined => {
  if (currentIndex === 0) return data[0].close;
  
  const relevantData = data.slice(0, currentIndex + 1);
  const totalVolume = relevantData.reduce((sum, item) => sum + item.volume, 0);
  const totalVolumePrice = relevantData.reduce(
    (sum, item) => sum + (item.close * item.volume), 
    0
  );
  
  return totalVolume > 0 ? totalVolumePrice / totalVolume : undefined;
};

const processOrderBookToDepth = (orderBook: any, maxDepth: number): MarketDepthData[] => {
  const { bids, asks } = orderBook;
  const result: MarketDepthData[] = [];
  
  let bidVolume = 0;
  let askVolume = 0;
  
  // Process bids (buy orders)
  for (let i = 0; i < Math.min(bids.length, maxDepth); i++) {
    bidVolume += bids[i].size;
    result.push({
      price: bids[i].price,
      bidSize: bids[i].size,
      askSize: 0,
      bidVolume,
      askVolume: 0,
      spread: 0,
    });
  }
  
  // Process asks (sell orders)
  for (let i = 0; i < Math.min(asks.length, maxDepth); i++) {
    askVolume += asks[i].size;
    const existingIndex = result.findIndex(item => item.price === asks[i].price);
    
    if (existingIndex !== -1) {
      result[existingIndex].askSize = asks[i].size;
      result[existingIndex].askVolume = askVolume;
    } else {
      result.push({
        price: asks[i].price,
        bidSize: 0,
        askSize: asks[i].size,
        bidVolume: 0,
        askVolume,
        spread: 0,
      });
    }
  }
  
  // Calculate spread
  const bestBid = Math.max(...bids.map((b: any) => b.price));
  const bestAsk = Math.min(...asks.map((a: any) => a.price));
  const spread = bestAsk - bestBid;
  
  return result.map(item => ({ ...item, spread })).sort((a, b) => a.price - b.price);
};