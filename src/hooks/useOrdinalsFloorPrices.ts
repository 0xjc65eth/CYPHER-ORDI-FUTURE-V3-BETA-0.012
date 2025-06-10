import { useState, useEffect } from 'react';

interface OrdinalsCollection {
  name: string;
  floorPrice: number;
  volume24h: number;
  change24h: number;
  listings: number;
}

interface OrdinalsFloorPricesData {
  collections: OrdinalsCollection[];
  loading: boolean;
  error: string | null;
}

export function useOrdinalsFloorPrices() {
  const [data, setData] = useState<OrdinalsFloorPricesData>({
    collections: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = () => {
      // Simulated data for Ordinals collections
      const collections: OrdinalsCollection[] = [
        { name: 'Bitcoin Punks', floorPrice: 0.45, volume24h: 12.3, change24h: 5.2, listings: 234 },
        { name: 'Ordinal Monkeys', floorPrice: 0.38, volume24h: 8.7, change24h: -2.1, listings: 189 },
        { name: 'Bitcoin Wizards', floorPrice: 0.52, volume24h: 15.4, change24h: 8.9, listings: 156 },
        { name: 'Pixel Pepes', floorPrice: 0.29, volume24h: 6.2, change24h: -4.5, listings: 412 },
        { name: 'Bitcoin Frogs', floorPrice: 0.67, volume24h: 22.1, change24h: 12.3, listings: 98 },
        { name: 'Ordinal Eggs', floorPrice: 0.19, volume24h: 3.8, change24h: -1.2, listings: 567 },
        { name: 'Bitcoin Bears', floorPrice: 0.33, volume24h: 7.9, change24h: 3.4, listings: 234 }
      ];

      // Add some randomness to simulate real-time changes
      const updatedCollections = collections.map(col => ({
        ...col,
        floorPrice: col.floorPrice * (1 + (Math.random() - 0.5) * 0.05),
        volume24h: col.volume24h * (1 + (Math.random() - 0.5) * 0.1),
        change24h: col.change24h + (Math.random() - 0.5) * 2
      }));

      setData({
        collections: updatedCollections,
        loading: false,
        error: null
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return data;
}