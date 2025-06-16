'use client';

import { useState, useEffect } from 'react';

interface RareSat {
  id: string;
  name: string;
  number: number;
  category: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'uncommon';
  rarityScore: number;
  floorPrice: string;
  change24h: number;
  holders: number;
  visual?: string;
}

interface RareSatsData {
  rareSats: RareSat[];
  categories: string[];
  loading: boolean;
}

export function useRareSats(): RareSatsData {
  const [data, setData] = useState<RareSatsData>({
    rareSats: [],
    categories: [],
    loading: true
  });

  useEffect(() => {
    const generateMockData = () => {
      const rareSats: RareSat[] = [
        {
          id: '1',
          name: 'Genesis Sat',
          number: 1,
          category: 'Genesis',
          rarity: 'legendary',
          rarityScore: 100,
          floorPrice: '50.0',
          change24h: 25.5,
          holders: 1,
          visual: '👑'
        },
        {
          id: '2',
          name: 'Pizza Sat',
          number: 2099999997689999,
          category: 'Historical',
          rarity: 'legendary',
          rarityScore: 98,
          floorPrice: '35.2',
          change24h: 18.3,
          holders: 1,
          visual: '🍕'
        },
        {
          id: '3',
          name: 'Block 78 Sat',
          number: 390000000000,
          category: 'Vintage',
          rarity: 'epic',
          rarityScore: 95,
          floorPrice: '28.7',
          change24h: -5.2,
          holders: 2,
          visual: '🏛️'
        },
        {
          id: '4',
          name: 'Palindrome Sat',
          number: 1234554321,
          category: 'Mathematical',
          rarity: 'epic',
          rarityScore: 92,
          floorPrice: '15.8',
          change24h: 12.1,
          holders: 5,
          visual: '🔢'
        },
        {
          id: '5',
          name: 'Fibonacci Sat',
          number: 1123581321,
          category: 'Mathematical',
          rarity: 'rare',
          rarityScore: 88,
          floorPrice: '8.9',
          change24h: 7.6,
          holders: 12,
          visual: '🌀'
        },
        {
          id: '6',
          name: 'First Alpha',
          number: 1979820448,
          category: 'Alpha',
          rarity: 'rare',
          rarityScore: 85,
          floorPrice: '12.3',
          change24h: -2.8,
          holders: 8,
          visual: '🅰️'
        },
        {
          id: '7',
          name: 'Black Rare',
          number: 1968750000,
          category: 'Black',
          rarity: 'uncommon',
          rarityScore: 78,
          floorPrice: '3.4',
          change24h: 15.2,
          holders: 25,
          visual: '⚫'
        },
        {
          id: '8',
          name: 'Nakamoto Sat',
          number: 546875000000,
          category: 'Nakamoto',
          rarity: 'uncommon',
          rarityScore: 82,
          floorPrice: '6.7',
          change24h: 9.8,
          holders: 18,
          visual: '👤'
        },
        {
          id: '9',
          name: 'Vintage 2009',
          number: 156250000000,
          category: 'Vintage',
          rarity: 'rare',
          rarityScore: 90,
          floorPrice: '19.5',
          change24h: 22.4,
          holders: 6,
          visual: '📅'
        },
        {
          id: '10',
          name: 'Block 420',
          number: 2100000000000,
          category: 'Meme',
          rarity: 'uncommon',
          rarityScore: 75,
          floorPrice: '4.2',
          change24h: 420.0,
          holders: 42,
          visual: '🌿'
        }
      ];

      const categories = [
        'Genesis',
        'Historical',
        'Vintage',
        'Mathematical',
        'Alpha',
        'Black',
        'Nakamoto',
        'Meme'
      ];

      setData({
        rareSats,
        categories,
        loading: false
      });
    };

    const timer = setTimeout(generateMockData, 800);
    return () => clearTimeout(timer);
  }, []);

  return data;
}