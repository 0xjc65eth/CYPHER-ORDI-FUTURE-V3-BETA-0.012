import { SWRConfiguration } from 'swr';

// Default fetcher function for SWR
export const defaultFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// SWR Configuration for Runes Charts
export const runesChartsSWRConfig: SWRConfiguration = {
  fetcher: defaultFetcher,
  
  // Real-time data refresh intervals
  refreshInterval: 5000, // 5 seconds for price data
  
  // Revalidate on window focus for live trading
  revalidateOnFocus: true,
  
  // Revalidate when connection is restored
  revalidateOnReconnect: true,
  
  // Keep data fresh
  revalidateIfStale: true,
  
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  
  // Cache data for 30 seconds
  focusThrottleInterval: 30000,
  
  // Error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  
  // Loading timeout
  loadingTimeout: 10000,
  
  // On error callback
  onError: (error, key) => {
    console.error(`[SWR] Error fetching ${key}:`, error);
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // logToMonitoring('swr_error', { key, error: error.message });
    }
  },
  
  // On success callback for debugging
  onSuccess: (data, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SWR] Successfully fetched ${key}:`, data);
    }
  },
  
  // Compare function for data equality
  compare: (a, b) => {
    // Deep comparison for arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => 
        JSON.stringify(item) === JSON.stringify(b[index])
      );
    }
    
    // Shallow comparison for objects
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

// Chart-specific SWR configurations
export const chartSpecificConfigs = {
  price: {
    ...runesChartsSWRConfig,
    refreshInterval: 5000, // 5 seconds for price data
    dedupingInterval: 2000,
  },
  
  volume: {
    ...runesChartsSWRConfig,
    refreshInterval: 10000, // 10 seconds for volume data
    dedupingInterval: 5000,
  },
  
  orderbook: {
    ...runesChartsSWRConfig,
    refreshInterval: 2000, // 2 seconds for order book
    dedupingInterval: 1000,
  },
  
  holders: {
    ...runesChartsSWRConfig,
    refreshInterval: 30000, // 30 seconds for holders data
    dedupingInterval: 10000,
  },
};

// Utility function to generate cache keys
export const generateCacheKey = (
  endpoint: string, 
  runeId: string, 
  params?: Record<string, any>
) => {
  const baseKey = `/api/runes/${runeId}/${endpoint}`;
  
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return `${baseKey}?${searchParams.toString()}`;
};

// Mock data generators for development/demo
export const generateMockPriceData = (count: number = 100) => {
  const now = Date.now();
  const data = [];
  let price = 0.00001234;
  
  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000); // Hourly data
    const variation = (Math.random() - 0.5) * 0.0000001;
    
    const open = price;
    const change = variation * 4;
    const high = Math.max(open, open + Math.abs(change) * 1.5);
    const low = Math.min(open, open - Math.abs(change) * 1.5);
    const close = open + change;
    
    price = close;
    
    data.push({
      timestamp,
      date: new Date(timestamp).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 2000000) + 500000,
    });
  }
  
  return data;
};

export const generateMockVolumeData = (count: number = 30) => {
  const now = Date.now();
  const data = [];
  
  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000); // Daily data
    const volume = Math.floor(Math.random() * 3000000) + 1000000;
    
    data.push({
      timestamp,
      date: new Date(timestamp).toISOString(),
      volume,
      volumeUSD: volume * 0.0125, // Assuming 0.0125 USD per token
      trades: Math.floor(volume / 5000) + Math.floor(Math.random() * 100),
      period: '1d',
    });
  }
  
  return data;
};

export const generateMockDepthData = () => {
  const basePrice = 0.00001234;
  const data = [];
  
  // Generate bid data (lower prices)
  let cumulativeBidVolume = 0;
  for (let i = 0; i < 25; i++) {
    const price = basePrice * (1 - (i + 1) * 0.001);
    const size = Math.floor(Math.random() * 500000) + 100000;
    cumulativeBidVolume += size;
    
    data.push({
      price,
      bidSize: size,
      askSize: 0,
      bidVolume: cumulativeBidVolume,
      askVolume: 0,
      spread: 0,
    });
  }
  
  // Generate ask data (higher prices)
  let cumulativeAskVolume = 0;
  for (let i = 0; i < 25; i++) {
    const price = basePrice * (1 + (i + 1) * 0.001);
    const size = Math.floor(Math.random() * 500000) + 100000;
    cumulativeAskVolume += size;
    
    data.push({
      price,
      bidSize: 0,
      askSize: size,
      bidVolume: 0,
      askVolume: cumulativeAskVolume,
      spread: 0,
    });
  }
  
  return data.sort((a, b) => a.price - b.price);
};

export const generateMockHoldersData = () => [
  { range: '1-100', holders: 15420, percentage: 65.2, amount: 1250000, value: 15625 },
  { range: '101-1,000', holders: 4580, percentage: 19.4, amount: 2100000, value: 26250 },
  { range: '1,001-10,000', holders: 2340, percentage: 9.9, amount: 3500000, value: 43750 },
  { range: '10,001-100,000', holders: 890, percentage: 3.8, amount: 4800000, value: 60000 },
  { range: '100,001-1,000,000', holders: 120, percentage: 0.5, amount: 6200000, value: 77500 },
  { range: '1,000,000+', holders: 50, percentage: 0.2, amount: 8350000, value: 104375 },
];