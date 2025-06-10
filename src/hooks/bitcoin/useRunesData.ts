'use client';

import { useState, useEffect } from 'react';

interface RunesTradingPair {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: string;
  totalSupply: number;
  isHot: boolean;
}

interface RunesVolumeLeader {
  id: string;
  name: string;
  symbol: string;
  volume24h: string;
  trades24h: number;
  marketCap: string;
  volumeChange: number;
}

interface RunesNewLaunch {
  id: string;
  name: string;
  symbol: string;
  launchDate: string;
  initialPrice: number;
  currentPrice: number;
  totalSupply: number;
  priceIncrease: number;
}

interface RunesData {
  tradingPairs: RunesTradingPair[];
  volumeLeaders: RunesVolumeLeader[];
  newLaunches: RunesNewLaunch[];
  loading: boolean;
}

export function useRunesData(): RunesData {
  const [data, setData] = useState<RunesData>({
    tradingPairs: [],
    volumeLeaders: [],
    newLaunches: [],
    loading: true
  });

  useEffect(() => {
    const generateMockData = () => {
      const tradingPairs: RunesTradingPair[] = [
        {
          id: '1',
          name: 'UNCOMMON•GOODS',
          symbol: 'GOODS',
          price: 1250,
          change24h: 18.5,
          volume24h: '15.8',
          totalSupply: 21000000,
          isHot: true
        },
        {
          id: '2',
          name: 'BITCOIN•RUNES',
          symbol: 'RUNES',
          price: 890,
          change24h: -4.2,
          volume24h: '12.3',
          totalSupply: 100000000,
          isHot: false
        },
        {
          id: '3',
          name: 'SATOSHI•MAGIC',
          symbol: 'MAGIC',
          price: 2150,
          change24h: 32.7,
          volume24h: '28.9',
          totalSupply: 10000000,
          isHot: true
        },
        {
          id: '4',
          name: 'HODL•FOREVER',
          symbol: 'HODL',
          price: 675,
          change24h: 8.9,
          volume24h: '9.4',
          totalSupply: 50000000,
          isHot: false
        },
        {
          id: '5',
          name: 'MOON•LAMBO',
          symbol: 'LAMBO',
          price: 3420,
          change24h: 45.6,
          volume24h: '31.2',
          totalSupply: 5000000,
          isHot: true
        }
      ];

      const volumeLeaders: RunesVolumeLeader[] = [
        {
          id: '1',
          name: 'MOON•LAMBO',
          symbol: 'LAMBO',
          volume24h: '31.2',
          trades24h: 1847,
          marketCap: '17.1',
          volumeChange: 67
        },
        {
          id: '2',
          name: 'SATOSHI•MAGIC',
          symbol: 'MAGIC',
          volume24h: '28.9',
          trades24h: 1523,
          marketCap: '21.5',
          volumeChange: 45
        },
        {
          id: '3',
          name: 'UNCOMMON•GOODS',
          symbol: 'GOODS',
          volume24h: '15.8',
          trades24h: 892,
          marketCap: '26.25',
          volumeChange: 23
        },
        {
          id: '4',
          name: 'BITCOIN•RUNES',
          symbol: 'RUNES',
          volume24h: '12.3',
          trades24h: 634,
          marketCap: '89.0',
          volumeChange: -12
        }
      ];

      const newLaunches: RunesNewLaunch[] = [
        {
          id: '1',
          name: 'ROCKET•SHIP',
          symbol: 'ROCKET',
          launchDate: '2 hours ago',
          initialPrice: 500,
          currentPrice: 850,
          totalSupply: 25000000,
          priceIncrease: 70
        },
        {
          id: '2',
          name: 'DIAMOND•HANDS',
          symbol: 'DIAMOND',
          launchDate: '6 hours ago',
          initialPrice: 750,
          currentPrice: 1200,
          totalSupply: 15000000,
          priceIncrease: 60
        },
        {
          id: '3',
          name: 'CYBER•PUNK',
          symbol: 'CYBER',
          launchDate: '1 day ago',
          initialPrice: 300,
          currentPrice: 425,
          totalSupply: 40000000,
          priceIncrease: 42
        },
        {
          id: '4',
          name: 'NANO•TECH',
          symbol: 'NANO',
          launchDate: '2 days ago',
          initialPrice: 1000,
          currentPrice: 1350,
          totalSupply: 8000000,
          priceIncrease: 35
        }
      ];

      setData({
        tradingPairs,
        volumeLeaders,
        newLaunches,
        loading: false
      });
    };

    const timer = setTimeout(generateMockData, 1200);
    return () => clearTimeout(timer);
  }, []);

  return data;
}