import { useState, useEffect } from 'react';

export function useMarketSentiment() {
  const [data, setData] = useState<{ data: any[]; loading: boolean }>({
    data: [],
    loading: true
  });

  useEffect(() => {
    const generateData = () => {
      const sentiment: any[] = [];
      for (let i = 30; i >= 0; i--) {
        const bullish = 30 + Math.random() * 40;
        const bearish = 20 + Math.random() * 30;
        sentiment.push({
          timestamp: Date.now() - i * 86400000,
          bullish,
          bearish,
          neutral: 100 - bullish - bearish
        });
      }
      setData({ data: sentiment, loading: false });
    };
    generateData();
  }, []);

  return data;
}