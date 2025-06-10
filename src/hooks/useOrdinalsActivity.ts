import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  type: 'sale' | 'mint' | 'listing';
  title: string;
  description: string;
  timestamp: Date;
  value?: string;
}

export function useOrdinalsActivity() {
  const [data, setData] = useState<{ activity: ActivityItem[]; loading: boolean }>({
    activity: [],
    loading: true
  });

  useEffect(() => {
    const activity: ActivityItem[] = [
      {
        id: '1',
        type: 'sale',
        title: 'Bitcoin Punk #234 Sold',
        description: 'Sold for 0.45 BTC on Magic Eden',
        timestamp: new Date(Date.now() - 300000),
        value: '0.45 BTC'
      },
      {
        id: '2',
        type: 'mint',
        title: 'New Ordinal Wizards Collection',
        description: '1000 items minted',
        timestamp: new Date(Date.now() - 600000),
        value: '0.1 BTC'
      },
      {
        id: '3',
        type: 'listing',
        title: 'Rare Sat Listed',
        description: 'Pizza Sat from 2010',
        timestamp: new Date(Date.now() - 900000),
        value: '2.5 BTC'
      }
    ];
    setData({ activity, loading: false });
  }, []);

  return data;
}