import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  url: string;
  category: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export function useBitcoinNews() {
  const [data, setData] = useState<{ news: NewsItem[]; loading: boolean }>({
    news: [],
    loading: true
  });

  useEffect(() => {
    const generateNews = () => {
      const news: NewsItem[] = [
        {
          id: '1',
          title: 'Bitcoin Surges Past $98,000 as Institutional Interest Grows',
          source: 'CoinDesk',
          timestamp: new Date(Date.now() - 3600000),
          url: '#',
          category: 'Market',
          sentiment: 'bullish'
        },
        {
          id: '2',
          title: 'Major Bank Announces Bitcoin Custody Service Launch',
          source: 'CoinTelegraph',
          timestamp: new Date(Date.now() - 7200000),
          url: '#',
          category: 'Institutional',
          sentiment: 'bullish'
        },
        {
          id: '3',
          title: 'Bitcoin Mining Difficulty Reaches New All-Time High',
          source: 'Bitcoin Magazine',
          timestamp: new Date(Date.now() - 10800000),
          url: '#',
          category: 'Mining',
          sentiment: 'neutral'
        },
        {
          id: '4',
          title: 'Ordinals Protocol Sees Record Trading Volume',
          source: 'The Block',
          timestamp: new Date(Date.now() - 14400000),
          url: '#',
          category: 'Ordinals',
          sentiment: 'bullish'
        },
        {
          id: '5',
          title: 'Regulatory Clarity Boosts Bitcoin ETF Inflows',
          source: 'Bloomberg Crypto',
          timestamp: new Date(Date.now() - 18000000),
          url: '#',
          category: 'Regulation',
          sentiment: 'bullish'
        }
      ];
      setData({ news, loading: false });
    };
    generateNews();
  }, []);

  return data;
}