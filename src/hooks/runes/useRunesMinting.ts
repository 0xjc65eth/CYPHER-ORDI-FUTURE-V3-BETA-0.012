'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface MintingData {
  runeName: string;
  symbol: string;
  totalSupply: number;
  currentSupply: number;
  mintedToday: number;
  mintingRate: number; // mints per hour
  estimatedCompletion: Date | null;
  currentBlock: number;
  endBlock: number;
  mintPrice: number;
  gasRecommendation: {
    low: number;
    medium: number;
    high: number;
    current: number;
  };
  recentMints: {
    txid: string;
    amount: number;
    block: number;
    timestamp: Date;
    fee: number;
  }[];
  isActive: boolean;
}

export function useRunesMinting(runeName?: string) {
  const [liveData, setLiveData] = useState<MintingData | null>(null);

  const fetchMintingData = async () => {
    // Mock implementation - in production, fetch from mempool.space and ordiscan
    const mockData: MintingData = {
      runeName: runeName || 'EXAMPLE•RUNE',
      symbol: runeName?.split('•')[0] || 'EXAMPLE',
      totalSupply: 10000,
      currentSupply: Math.floor(6500 + Math.random() * 1000),
      mintedToday: Math.floor(200 + Math.random() * 100),
      mintingRate: Math.floor(50 + Math.random() * 30),
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000 * Math.random() * 7),
      currentBlock: 834567,
      endBlock: 840000,
      mintPrice: 0.0001,
      gasRecommendation: {
        low: 20 + Math.floor(Math.random() * 10),
        medium: 50 + Math.floor(Math.random() * 20),
        high: 100 + Math.floor(Math.random() * 50),
        current: 45 + Math.floor(Math.random() * 15)
      },
      recentMints: Array.from({ length: 10 }, (_, i) => ({
        txid: `${Math.random().toString(36).substring(2, 15)}...`,
        amount: Math.floor(10 + Math.random() * 100),
        block: 834567 - i,
        timestamp: new Date(Date.now() - i * 60000),
        fee: 0.00001 + Math.random() * 0.00005
      })),
      isActive: true
    };

    return mockData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['runesMinting', runeName],
    queryFn: fetchMintingData,
    refetchInterval: 10000, // Refetch every 10 seconds for near real-time data
    staleTime: 5000,
  });

  // Simulate real-time minting updates
  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      setLiveData(prev => {
        const newData = prev || data;
        const updated = { ...newData };
        
        // Simulate new mints
        if (Math.random() > 0.7) {
          const newMint = Math.floor(10 + Math.random() * 50);
          updated.currentSupply = Math.min(updated.currentSupply + newMint, updated.totalSupply);
          updated.mintedToday += newMint;
          
          // Add to recent mints
          updated.recentMints = [
            {
              txid: `${Math.random().toString(36).substring(2, 15)}...`,
              amount: newMint,
              block: updated.currentBlock,
              timestamp: new Date(),
              fee: 0.00001 + Math.random() * 0.00005
            },
            ...updated.recentMints.slice(0, 9)
          ];
        }
        
        // Update gas recommendations
        updated.gasRecommendation = {
          low: Math.max(10, updated.gasRecommendation.low + (Math.random() - 0.5) * 5),
          medium: Math.max(30, updated.gasRecommendation.medium + (Math.random() - 0.5) * 10),
          high: Math.max(80, updated.gasRecommendation.high + (Math.random() - 0.5) * 20),
          current: Math.max(25, updated.gasRecommendation.current + (Math.random() - 0.5) * 8)
        };
        
        // Check if minting completed
        if (updated.currentSupply >= updated.totalSupply) {
          updated.isActive = false;
        }
        
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return {
    data: liveData || data,
    isLoading,
    error,
    refetch
  };
}