/**
 * 🔥 REAL ANALYTICS DATA HOOKS - CYPHER ORDI FUTURE v3.2.0
 * 
 * React hooks for fetching and managing real analytics data
 * from Hiro APIs and other real data sources.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  realAnalyticsDataService, 
  RealMarketMetrics, 
  RealNetworkMetrics, 
  RealOrdinalsMetrics, 
  RealRunesMetrics, 
  RealHolderStatistics, 
  RealMiningMetrics 
} from '@/services/RealAnalyticsDataService';

// Market Data Hook
export function useRealMarketData(): UseQueryResult<RealMarketMetrics> {
  return useQuery({
    queryKey: ['real-market-data'],
    queryFn: () => realAnalyticsDataService.getRealMarketMetrics(),
    refetchInterval: 30000, // 30 seconds
    staleTime: 20000, // 20 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Network Metrics Hook
export function useRealNetworkData(): UseQueryResult<RealNetworkMetrics> {
  return useQuery({
    queryKey: ['real-network-data'],
    queryFn: () => realAnalyticsDataService.getRealNetworkMetrics(),
    refetchInterval: 60000, // 1 minute
    staleTime: 45000, // 45 seconds
    retry: 3,
  });
}

// Ordinals Data Hook
export function useRealOrdinalsData(): UseQueryResult<RealOrdinalsMetrics> {
  return useQuery({
    queryKey: ['real-ordinals-data'],
    queryFn: () => realAnalyticsDataService.getRealOrdinalsMetrics(),
    refetchInterval: 120000, // 2 minutes
    staleTime: 90000, // 1.5 minutes
    retry: 2,
  });
}

// Runes Data Hook
export function useRealRunesData(): UseQueryResult<RealRunesMetrics> {
  return useQuery({
    queryKey: ['real-runes-data'],
    queryFn: () => realAnalyticsDataService.getRealRunesMetrics(),
    refetchInterval: 120000, // 2 minutes
    staleTime: 90000, // 1.5 minutes
    retry: 2,
  });
}

// Holder Statistics Hook
export function useRealHolderData(): UseQueryResult<RealHolderStatistics> {
  return useQuery({
    queryKey: ['real-holder-data'],
    queryFn: () => realAnalyticsDataService.getRealHolderStatistics(),
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000, // 4 minutes
    retry: 2,
  });
}

// Mining Metrics Hook
export function useRealMiningData(): UseQueryResult<RealMiningMetrics> {
  return useQuery({
    queryKey: ['real-mining-data'],
    queryFn: () => realAnalyticsDataService.getRealMiningMetrics(),
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000, // 4 minutes
    retry: 2,
  });
}

// Combined Analytics Hook
export function useRealAnalyticsData() {
  const marketData = useRealMarketData();
  const networkData = useRealNetworkData();
  const ordinalsData = useRealOrdinalsData();
  const runesData = useRealRunesData();
  const holderData = useRealHolderData();
  const miningData = useRealMiningData();

  return {
    market: marketData,
    network: networkData,
    ordinals: ordinalsData,
    runes: runesData,
    holders: holderData,
    mining: miningData,
    isLoading: marketData.isLoading || networkData.isLoading || ordinalsData.isLoading || runesData.isLoading,
    isError: marketData.isError || networkData.isError || ordinalsData.isError || runesData.isError,
    errors: {
      market: marketData.error,
      network: networkData.error,
      ordinals: ordinalsData.error,
      runes: runesData.error,
      holders: holderData.error,
      mining: miningData.error,
    },
  };
}

// Health Check Hook
export function useAnalyticsHealthCheck() {
  return useQuery({
    queryKey: ['analytics-health'],
    queryFn: () => realAnalyticsDataService.healthCheck(),
    refetchInterval: 300000, // 5 minutes
    staleTime: 240000, // 4 minutes
    retry: 1,
  });
}

// Cache Statistics Hook
export function useCacheStatistics() {
  return useQuery({
    queryKey: ['cache-stats'],
    queryFn: () => realAnalyticsDataService.getCacheStats(),
    refetchInterval: 60000, // 1 minute
    staleTime: 45000, // 45 seconds
    enabled: process.env.NODE_ENV === 'development', // Only in development
  });
}

// Utility hook for clearing cache
export function useClearCache() {
  return {
    clearCache: () => {
      realAnalyticsDataService.clearCache();
      // Invalidate all queries
      return Promise.resolve();
    }
  };
}

export default {
  useRealMarketData,
  useRealNetworkData,
  useRealOrdinalsData,
  useRealRunesData,
  useRealHolderData,
  useRealMiningData,
  useRealAnalyticsData,
  useAnalyticsHealthCheck,
  useCacheStatistics,
  useClearCache,
};