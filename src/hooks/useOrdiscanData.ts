'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchOrdiscanData } from '@/lib/ordiscan';

export function useOrdiscanData(endpoint: string) {
  return useQuery({
    queryKey: ['ordiscan', endpoint],
    queryFn: () => fetchOrdiscanData(endpoint),
    refetchInterval: 60000, // Refetch every minute
    retry: 3, // Retry failed requests 3 times
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when internet connection is restored
  });
} 