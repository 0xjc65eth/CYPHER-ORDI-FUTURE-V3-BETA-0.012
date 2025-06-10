import { useState, useEffect } from 'react';

interface NetworkHealthData {
  nodeCount: number;
  channelCount: number;
  networkCapacity: number; // in BTC
  avgChannelSize: number; // in BTC
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdate: Date;
  nodeGrowth24h: number; // percentage
  channelGrowth24h: number; // percentage
  capacityGrowth24h: number; // percentage
}

export function useNetworkHealth() {
  const [data, setData] = useState<NetworkHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNetworkHealth = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - replace with actual Lightning Network API calls
        const mockData: NetworkHealthData = {
          nodeCount: 15234,
          channelCount: 73456,
          networkCapacity: 5432.67,
          avgChannelSize: 0.074,
          healthStatus: 'excellent',
          lastUpdate: new Date(),
          nodeGrowth24h: 2.3,
          channelGrowth24h: 1.8,
          capacityGrowth24h: 3.1
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch network health'));
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkHealth();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNetworkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-trigger the effect
      useEffect(() => {}, []);
    }
  };
}