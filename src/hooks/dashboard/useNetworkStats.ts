import { useState, useEffect } from 'react';

interface NetworkStats {
  hashrate: number;
  difficulty: string;
  nextAdjustment: number;
  blocksToAdjustment: number;
  blockHeight: number;
  blockTime: number;
  mempoolSize: number;
  mempoolFees: {
    fast: number;
    medium: number;
    slow: number;
  };
  lastBlock: {
    height: number;
    hash: string;
    time: Date;
    size: number;
    weight: number;
    txCount: number;
    miner: string;
  };
  networkHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export function useNetworkStats() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        // Simulate API call to mempool.space or similar
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockStats: NetworkStats = {
          hashrate: 485.23,
          difficulty: '62.46T',
          nextAdjustment: -2.3,
          blocksToAdjustment: 1234,
          blockHeight: 821456,
          blockTime: 10.2,
          mempoolSize: 145,
          mempoolFees: {
            fast: 45,
            medium: 32,
            slow: 18
          },
          lastBlock: {
            height: 821456,
            hash: '00000000000000000002c0cc6c2e3b8a2e3f7f8a9e3d8c9f8e7d6c5b4a3',
            time: new Date(Date.now() - 2 * 60 * 1000),
            size: 1.45 * 1024 * 1024,
            weight: 3.98 * 1000 * 1000,
            txCount: 3421,
            miner: 'Foundry USA'
          },
          networkHealth: 'excellent'
        };

        setStats(mockStats);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch network stats');
        setLoading(false);
      }
    };

    fetchNetworkStats();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => {
        if (!prev) return null;

        // Simulate new block every ~10 minutes
        const shouldAddBlock = Math.random() > 0.98;
        
        return {
          ...prev,
          hashrate: prev.hashrate + (Math.random() - 0.5) * 10,
          mempoolSize: Math.max(50, prev.mempoolSize + (Math.random() - 0.5) * 20),
          mempoolFees: {
            fast: Math.max(1, prev.mempoolFees.fast + Math.floor((Math.random() - 0.5) * 10)),
            medium: Math.max(1, prev.mempoolFees.medium + Math.floor((Math.random() - 0.5) * 5)),
            slow: Math.max(1, prev.mempoolFees.slow + Math.floor((Math.random() - 0.5) * 3))
          },
          ...(shouldAddBlock ? {
            blockHeight: prev.blockHeight + 1,
            lastBlock: {
              height: prev.blockHeight + 1,
              hash: Math.random().toString(36).substr(2, 64),
              time: new Date(),
              size: 1.2 + Math.random() * 0.8,
              weight: 3.5 + Math.random() * 0.9,
              txCount: 2000 + Math.floor(Math.random() * 2000),
              miner: ['Foundry USA', 'AntPool', 'F2Pool', 'ViaBTC'][Math.floor(Math.random() * 4)]
            }
          } : {})
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}