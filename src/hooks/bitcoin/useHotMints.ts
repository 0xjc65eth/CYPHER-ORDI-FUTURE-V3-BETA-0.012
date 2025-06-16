'use client';

import { useState, useEffect } from 'react';

interface HotMint {
  id: string;
  name: string;
  category: string;
  mintRate: number;
  uniqueMinters: number;
  mintPrice: number;
  supply: number;
  remaining: number;
  progress: number;
  estimatedCompletion: string;
}

interface TrendingMint {
  id: string;
  name: string;
  trendScore: number;
  startTime: string;
  mintPrice: number;
  mintRateIncrease: number;
}

interface RecentMint {
  id: string;
  name: string;
  launchTime: string;
  mintPrice: number;
  supply: number;
  earlyMinters: number;
}

interface HotMintsData {
  hotMints: HotMint[];
  trendingMints: TrendingMint[];
  recentMints: RecentMint[];
  loading: boolean;
}

export function useHotMints(): HotMintsData {
  const [data, setData] = useState<HotMintsData>({
    hotMints: [],
    trendingMints: [],
    recentMints: [],
    loading: true
  });

  useEffect(() => {
    const generateMockData = () => {
      const hotMints: HotMint[] = [
        {
          id: '1',
          name: 'Bitcoin Cats Revolution',
          category: 'PFP',
          mintRate: 85,
          uniqueMinters: 342,
          mintPrice: 500,
          supply: 10000,
          remaining: 2150,
          progress: 78.5,
          estimatedCompletion: '2h 15m'
        },
        {
          id: '2',
          name: 'Satoshi Prophecies',
          category: 'Art',
          mintRate: 67,
          uniqueMinters: 218,
          mintPrice: 750,
          supply: 5000,
          remaining: 890,
          progress: 82.2,
          estimatedCompletion: '1h 45m'
        },
        {
          id: '3',
          name: 'Ordinal Artifacts',
          category: 'Utility',
          mintRate: 42,
          uniqueMinters: 156,
          mintPrice: 300,
          supply: 25000,
          remaining: 8400,
          progress: 66.4,
          estimatedCompletion: '5h 30m'
        },
        {
          id: '4',
          name: 'Bitcoin Legends',
          category: 'Gaming',
          mintRate: 28,
          uniqueMinters: 98,
          mintPrice: 1200,
          supply: 3333,
          remaining: 745,
          progress: 77.6,
          estimatedCompletion: '3h 20m'
        }
      ];

      const trendingMints: TrendingMint[] = [
        {
          id: '1',
          name: 'Cyber Punks 2140',
          trendScore: 95,
          startTime: '4 hours ago',
          mintPrice: 888,
          mintRateIncrease: 125
        },
        {
          id: '2',
          name: 'Diamond Hands Club',
          trendScore: 88,
          startTime: '2 hours ago',
          mintPrice: 666,
          mintRateIncrease: 89
        },
        {
          id: '3',
          name: 'Moon Mission NFTs',
          trendScore: 82,
          startTime: '6 hours ago',
          mintPrice: 420,
          mintRateIncrease: 67
        },
        {
          id: '4',
          name: 'Bitcoin Wizards',
          trendScore: 76,
          startTime: '8 hours ago',
          mintPrice: 1111,
          mintRateIncrease: 45
        }
      ];

      const recentMints: RecentMint[] = [
        {
          id: '1',
          name: 'Fresh Ordinals',
          launchTime: '15 minutes',
          mintPrice: 250,
          supply: 50000,
          earlyMinters: 12
        },
        {
          id: '2',
          name: 'New Age Sats',
          launchTime: '32 minutes',
          mintPrice: 500,
          supply: 20000,
          earlyMinters: 28
        },
        {
          id: '3',
          name: 'Genesis Protocol',
          launchTime: '1 hour',
          mintPrice: 1000,
          supply: 10000,
          earlyMinters: 45
        },
        {
          id: '4',
          name: 'Alpha Collection',
          launchTime: '2 hours',
          mintPrice: 350,
          supply: 33333,
          earlyMinters: 67
        }
      ];

      setData({
        hotMints,
        trendingMints,
        recentMints,
        loading: false
      });
    };

    const timer = setTimeout(generateMockData, 600);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time updates for hot mints
  useEffect(() => {
    if (!data.loading) {
      const interval = setInterval(() => {
        setData(prevData => ({
          ...prevData,
          hotMints: prevData.hotMints.map(mint => ({
            ...mint,
            mintRate: Math.max(5, mint.mintRate + (Math.random() - 0.5) * 10),
            remaining: Math.max(0, mint.remaining - Math.floor(Math.random() * 5)),
            progress: Math.min(100, mint.progress + Math.random() * 2)
          }))
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [data.loading]);

  return data;
}