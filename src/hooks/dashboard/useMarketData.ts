import { useState, useEffect } from 'react';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface Trade {
  id: string;
  timestamp: Date;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

interface MarketData {
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
  recentTrades: Trade[];
  volume24h: number;
  high24h: number;
  low24h: number;
}

export function useMarketData() {
  const [data, setData] = useState<MarketData>({
    orderBook: {
      bids: [],
      asks: []
    },
    recentTrades: [],
    volume24h: 0,
    high24h: 0,
    low24h: 0
  });

  useEffect(() => {
    // Simulate WebSocket connection for real-time data
    const generateOrderBook = () => {
      const currentPrice = 65000 + Math.random() * 1000;
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];

      // Generate bids
      for (let i = 0; i < 10; i++) {
        const price = currentPrice - (i + 1) * 10;
        const amount = Math.random() * 5;
        bids.push({
          price,
          amount,
          total: price * amount
        });
      }

      // Generate asks
      for (let i = 0; i < 10; i++) {
        const price = currentPrice + (i + 1) * 10;
        const amount = Math.random() * 5;
        asks.push({
          price,
          amount,
          total: price * amount
        });
      }

      return { bids, asks };
    };

    const generateTrades = (): Trade[] => {
      const trades: Trade[] = [];
      const currentPrice = 65000 + Math.random() * 1000;

      for (let i = 0; i < 20; i++) {
        trades.push({
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(Date.now() - i * 1000 * 60),
          price: currentPrice + (Math.random() - 0.5) * 100,
          amount: Math.random() * 2,
          side: Math.random() > 0.5 ? 'buy' : 'sell'
        });
      }

      return trades;
    };

    // Initial data
    setData({
      orderBook: generateOrderBook(),
      recentTrades: generateTrades(),
      volume24h: 1234567890,
      high24h: 67890,
      low24h: 64320
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        orderBook: generateOrderBook(),
        recentTrades: [
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            price: 65000 + Math.random() * 1000,
            amount: Math.random() * 2,
            side: Math.random() > 0.5 ? 'buy' : 'sell'
          },
          ...prev.recentTrades.slice(0, 19)
        ]
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}