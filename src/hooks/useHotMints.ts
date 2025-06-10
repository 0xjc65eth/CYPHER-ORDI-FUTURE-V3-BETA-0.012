import { useState, useEffect } from 'react';

interface HotMint {
  id: string;
  name: string;
  totalSupply: number;
  mintedCount: number;
  price: number;
  timestamp: Date;
}

export function useHotMints() {
  const [data, setData] = useState<{ mints: HotMint[]; loading: boolean }>({
    mints: [],
    loading: true
  });

  useEffect(() => {
    const mints: HotMint[] = [
      {
        id: '1',
        name: 'Bitcoin Frogs',
        totalSupply: 10000,
        mintedCount: 7823,
        price: 0.01,
        timestamp: new Date()
      },
      {
        id: '2',
        name: 'Ordinal Punks',
        totalSupply: 5000,
        mintedCount: 3456,
        price: 0.02,
        timestamp: new Date()
      }
    ];
    setData({ mints, loading: false });
  }, []);

  return data;
}