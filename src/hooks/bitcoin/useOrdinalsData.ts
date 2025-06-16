'use client';

import { useState, useEffect } from 'react';

interface OrdinalsCollection {
  id: string;
  name: string;
  supply: number;
  floorPrice: string;
  change24h: number;
  volume24h: string;
}

interface NewInscription {
  id: string;
  number: number;
  contentType: string;
  size: string;
  timestamp: string;
  fee: number;
}

interface RareInscription {
  id: string;
  name: string;
  category: string;
  rarityScore: number;
  rarityRank: number;
  traits: number;
  lastSale: string;
  holders: number;
}

interface OrdinalsData {
  collections: OrdinalsCollection[];
  newInscriptions: NewInscription[];
  rareInscriptions: RareInscription[];
  loading: boolean;
}

export function useOrdinalsData(): OrdinalsData {
  const [data, setData] = useState<OrdinalsData>({
    collections: [],
    newInscriptions: [],
    rareInscriptions: [],
    loading: true
  });

  useEffect(() => {
    const generateMockData = () => {
      const collections: OrdinalsCollection[] = [
        {
          id: '1',
          name: 'Bitcoin Punks',
          supply: 10000,
          floorPrice: '0.085',
          change24h: 12.5,
          volume24h: '2.45'
        },
        {
          id: '2',
          name: 'Ordinal Maxi Biz',
          supply: 5000,
          floorPrice: '0.120',
          change24h: -3.2,
          volume24h: '1.89'
        },
        {
          id: '3',
          name: 'Bitcoin Rocks',
          supply: 7500,
          floorPrice: '0.058',
          change24h: 8.7,
          volume24h: '3.12'
        },
        {
          id: '4',
          name: 'Taproot Wizards',
          supply: 2121,
          floorPrice: '0.195',
          change24h: 15.3,
          volume24h: '4.67'
        },
        {
          id: '5',
          name: 'Quantum Cats',
          supply: 3333,
          floorPrice: '0.145',
          change24h: -5.8,
          volume24h: '2.23'
        }
      ];

      const newInscriptions: NewInscription[] = [
        {
          id: '1',
          number: 73845621,
          contentType: 'image',
          size: '45KB',
          timestamp: '2 minutes ago',
          fee: 25
        },
        {
          id: '2',
          number: 73845620,
          contentType: 'text',
          size: '2KB',
          timestamp: '5 minutes ago',
          fee: 15
        },
        {
          id: '3',
          number: 73845619,
          contentType: 'audio',
          size: '128KB',
          timestamp: '8 minutes ago',
          fee: 45
        },
        {
          id: '4',
          number: 73845618,
          contentType: 'image',
          size: '67KB',
          timestamp: '12 minutes ago',
          fee: 32
        },
        {
          id: '5',
          number: 73845617,
          contentType: 'text',
          size: '1KB',
          timestamp: '15 minutes ago',
          fee: 12
        }
      ];

      const rareInscriptions: RareInscription[] = [
        {
          id: '1',
          name: 'Genesis Block Text',
          category: 'Historic',
          rarityScore: 98,
          rarityRank: 1,
          traits: 12,
          lastSale: '15.5',
          holders: 1
        },
        {
          id: '2',
          name: 'Satoshi Portrait',
          category: 'Art',
          rarityScore: 95,
          rarityRank: 2,
          traits: 8,
          lastSale: '8.2',
          holders: 1
        },
        {
          id: '3',
          name: 'First 50 Block',
          category: 'Vintage',
          rarityScore: 92,
          rarityRank: 3,
          traits: 15,
          lastSale: '12.7',
          holders: 3
        },
        {
          id: '4',
          name: 'Pizza Transaction',
          category: 'Meme',
          rarityScore: 89,
          rarityRank: 4,
          traits: 6,
          lastSale: '5.9',
          holders: 2
        },
        {
          id: '5',
          name: 'Palindrome Inscription',
          category: 'Mathematical',
          rarityScore: 85,
          rarityRank: 5,
          traits: 9,
          lastSale: '3.4',
          holders: 8
        }
      ];

      setData({
        collections,
        newInscriptions,
        rareInscriptions,
        loading: false
      });
    };

    const timer = setTimeout(generateMockData, 1000);
    return () => clearTimeout(timer);
  }, []);

  return data;
}