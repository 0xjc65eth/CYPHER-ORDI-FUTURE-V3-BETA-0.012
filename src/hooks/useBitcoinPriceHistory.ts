import { useState, useEffect } from 'react';

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

interface BitcoinPriceHistoryData {
  data: PricePoint[];
  loading: boolean;
  error: string | null;
}

export function useBitcoinPriceHistory(timeframe: string = '24h') {
  const [data, setData] = useState<BitcoinPriceHistoryData>({
    data: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const generateHistoricalData = () => {
      const now = Date.now();
      const points: PricePoint[] = [];
      let dataPoints = 24;
      let interval = 3600000; // 1 hour in ms
      
      switch (timeframe) {
        case '24h':
          dataPoints = 24;
          interval = 3600000;
          break;
        case '7d':
          dataPoints = 7 * 24;
          interval = 3600000;
          break;
        case '30d':
          dataPoints = 30;
          interval = 86400000; // 1 day
          break;
        case '1y':
          dataPoints = 52;
          interval = 604800000; // 1 week
          break;
      }

      const basePrice = 98000;
      let currentPrice = basePrice;

      for (let i = dataPoints; i >= 0; i--) {
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 2000;
        currentPrice = Math.max(90000, Math.min(105000, currentPrice + change));
        
        points.push({
          timestamp: now - (i * interval),
          price: currentPrice,
          volume: 10000000000 + Math.random() * 5000000000
        });
      }

      setData({
        data: points,
        loading: false,
        error: null
      });
    };

    generateHistoricalData();
  }, [timeframe]);

  return data;
}