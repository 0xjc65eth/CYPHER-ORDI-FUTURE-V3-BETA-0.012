'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface RuneMarketData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  priceHistory: { time: string; price: number }[];
}

interface AggregatedMarketData {
  unisat: RuneMarketData | null;
  okx: RuneMarketData | null;
  magiceden: RuneMarketData | null;
  aggregated: RuneMarketData | null;
}

// Mock API endpoints for different marketplaces
const MARKETPLACE_APIS = {
  unisat: 'https://open-api.unisat.io/v1/indexer/brc20',
  okx: 'https://www.okx.com/api/v5/market',
  magiceden: 'https://api-mainnet.magiceden.io/v2/ord/btc/runes',
  ordiscan: 'https://api.ordiscan.com/v1/runes'
};

export function useRunesMarket(runeName: string = 'all') {
  const [realtimeData, setRealtimeData] = useState<AggregatedMarketData | null>(null);

  const fetchMarketData = async () => {
    // Mock implementation - in production, fetch from real APIs
    const mockData: RuneMarketData = {
      name: runeName === 'all' ? 'All Runes' : runeName,
      symbol: runeName === 'all' ? 'RUNES' : runeName.split('•')[0],
      price: 0.0123 + Math.random() * 0.002,
      change24h: (Math.random() - 0.5) * 30,
      volume24h: 2000000 + Math.random() * 500000,
      marketCap: 10000000 + Math.random() * 5000000,
      holders: Math.floor(3000 + Math.random() * 2000),
      transactions24h: Math.floor(5000 + Math.random() * 2000),
      highPrice24h: 0.0145,
      lowPrice24h: 0.0098,
      priceHistory: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        price: 0.0123 + Math.sin(i / 4) * 0.002 + Math.random() * 0.001
      }))
    };

    // Simulate aggregated data from multiple sources
    return {
      unisat: { ...mockData, volume24h: mockData.volume24h * 0.4 },
      okx: { ...mockData, volume24h: mockData.volume24h * 0.35 },
      magiceden: { ...mockData, volume24h: mockData.volume24h * 0.25 },
      aggregated: mockData
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['runesMarket', runeName],
    queryFn: fetchMarketData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const newData = { ...data };
        if (newData.aggregated) {
          // Simulate price fluctuations
          const priceChange = (Math.random() - 0.5) * 0.0002;
          newData.aggregated.price += priceChange;
          newData.aggregated.change24h += (Math.random() - 0.5) * 0.1;
          newData.aggregated.volume24h += Math.random() * 10000;
          
          // Update individual marketplaces
          if (newData.unisat) newData.unisat.price = newData.aggregated.price * (1 + (Math.random() - 0.5) * 0.001);
          if (newData.okx) newData.okx.price = newData.aggregated.price * (1 + (Math.random() - 0.5) * 0.001);
          if (newData.magiceden) newData.magiceden.price = newData.aggregated.price * (1 + (Math.random() - 0.5) * 0.001);
        }
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  return {
    data: realtimeData || data,
    isLoading,
    error,
    refetch
  };
}