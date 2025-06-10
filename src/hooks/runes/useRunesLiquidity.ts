'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
  orders: number;
}

interface LiquidityData {
  runeName: string;
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
  midPrice: number;
  depth: {
    bid2Percent: number;
    bid5Percent: number;
    bid10Percent: number;
    ask2Percent: number;
    ask5Percent: number;
    ask10Percent: number;
  };
  marketplaces: {
    name: string;
    bidLiquidity: number;
    askLiquidity: number;
    spread: number;
    lastUpdate: Date;
  }[];
  imbalance: number; // positive = more bids, negative = more asks
  liquidityScore: number; // 0-100
}

export function useRunesLiquidity(runeName: string) {
  const [realtimeData, setRealtimeData] = useState<LiquidityData | null>(null);

  const generateOrderBook = (basePrice: number, isBid: boolean) => {
    const levels: OrderBookLevel[] = [];
    let total = 0;
    
    for (let i = 0; i < 20; i++) {
      const priceOffset = (i + 1) * 0.0001;
      const price = isBid ? basePrice - priceOffset : basePrice + priceOffset;
      const amount = Math.floor(5000 + Math.random() * 20000 - i * 500);
      total += amount;
      
      levels.push({
        price,
        amount,
        total,
        orders: Math.floor(1 + Math.random() * 10)
      });
    }
    
    return levels;
  };

  const calculateDepth = (orderBook: OrderBookLevel[], basePrice: number, isBid: boolean) => {
    const depth2 = orderBook.filter(level => 
      isBid ? level.price >= basePrice * 0.98 : level.price <= basePrice * 1.02
    ).reduce((sum, level) => sum + level.amount, 0);
    
    const depth5 = orderBook.filter(level => 
      isBid ? level.price >= basePrice * 0.95 : level.price <= basePrice * 1.05
    ).reduce((sum, level) => sum + level.amount, 0);
    
    const depth10 = orderBook.filter(level => 
      isBid ? level.price >= basePrice * 0.90 : level.price <= basePrice * 1.10
    ).reduce((sum, level) => sum + level.amount, 0);
    
    return { depth2, depth5, depth10 };
  };

  const fetchLiquidityData = async () => {
    const basePrice = 0.0123;
    const bids = generateOrderBook(basePrice, true);
    const asks = generateOrderBook(basePrice, false);
    
    const bestBid = bids[0].price;
    const bestAsk = asks[0].price;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;
    
    const bidDepth = calculateDepth(bids, basePrice, true);
    const askDepth = calculateDepth(asks, basePrice, false);
    
    const totalBidLiquidity = bids.reduce((sum, level) => sum + level.amount * level.price, 0);
    const totalAskLiquidity = asks.reduce((sum, level) => sum + level.amount * level.price, 0);
    
    const mockData: LiquidityData = {
      runeName,
      symbol: runeName.split('•')[0],
      bids,
      asks,
      spread,
      spreadPercent: (spread / midPrice) * 100,
      midPrice,
      depth: {
        bid2Percent: bidDepth.depth2,
        bid5Percent: bidDepth.depth5,
        bid10Percent: bidDepth.depth10,
        ask2Percent: askDepth.depth2,
        ask5Percent: askDepth.depth5,
        ask10Percent: askDepth.depth10
      },
      marketplaces: [
        {
          name: 'Unisat',
          bidLiquidity: totalBidLiquidity * 0.4,
          askLiquidity: totalAskLiquidity * 0.4,
          spread: spread * (1 + Math.random() * 0.2),
          lastUpdate: new Date()
        },
        {
          name: 'OKX',
          bidLiquidity: totalBidLiquidity * 0.35,
          askLiquidity: totalAskLiquidity * 0.35,
          spread: spread * (1 + Math.random() * 0.3),
          lastUpdate: new Date()
        },
        {
          name: 'MagicEden',
          bidLiquidity: totalBidLiquidity * 0.25,
          askLiquidity: totalAskLiquidity * 0.25,
          spread: spread * (1 + Math.random() * 0.4),
          lastUpdate: new Date()
        }
      ],
      imbalance: ((totalBidLiquidity - totalAskLiquidity) / (totalBidLiquidity + totalAskLiquidity)) * 100,
      liquidityScore: Math.min(100, (totalBidLiquidity + totalAskLiquidity) / 10000)
    };

    return mockData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['runesLiquidity', runeName],
    queryFn: fetchLiquidityData,
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 2000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Simulate real-time order book updates
  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const newData = { ...data };
        
        // Simulate order book changes
        newData.bids = newData.bids.map(level => ({
          ...level,
          amount: Math.max(0, level.amount + (Math.random() - 0.5) * 1000),
          price: level.price + (Math.random() - 0.5) * 0.00001
        }));
        
        newData.asks = newData.asks.map(level => ({
          ...level,
          amount: Math.max(0, level.amount + (Math.random() - 0.5) * 1000),
          price: level.price + (Math.random() - 0.5) * 0.00001
        }));
        
        // Recalculate spread
        const bestBid = newData.bids[0].price;
        const bestAsk = newData.asks[0].price;
        newData.spread = bestAsk - bestBid;
        newData.midPrice = (bestBid + bestAsk) / 2;
        newData.spreadPercent = (newData.spread / newData.midPrice) * 100;
        
        return newData;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [data]);

  return {
    data: realtimeData || data,
    isLoading,
    error,
    refetch
  };
}