import { useState, useEffect } from 'react';

interface RareSatDiscovery {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  rarity: string;
}

export function useRareSatsDiscoveries() {
  const [data, setData] = useState<{ discoveries: RareSatDiscovery[]; loading: boolean }>({
    discoveries: [],
    loading: true
  });

  useEffect(() => {
    const discoveries: RareSatDiscovery[] = [
      {
        id: '1',
        type: 'Vintage Sat',
        description: 'Block 1000 satoshi discovered',
        timestamp: new Date(Date.now() - 1800000),
        rarity: 'Epic'
      },
      {
        id: '2',
        type: 'Pizza Sat',
        description: 'Satoshi from May 22, 2010',
        timestamp: new Date(Date.now() - 3600000),
        rarity: 'Legendary'
      },
      {
        id: '3',
        type: 'Palindrome',
        description: 'Sat 12344321 found',
        timestamp: new Date(Date.now() - 5400000),
        rarity: 'Rare'
      }
    ];
    setData({ discoveries, loading: false });
  }, []);

  return data;
}