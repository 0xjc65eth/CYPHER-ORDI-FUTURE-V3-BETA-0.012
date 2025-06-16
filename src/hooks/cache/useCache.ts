import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '@/lib/cache';
import { devLogger } from '@/lib/logger';

/**
 * Hook customizado para usar cache de forma reativa
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { ttl, refreshInterval, enabled = true } = options || {};

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await cacheService.getOrCompute(
        key,
        fetcher,
        ttl
      );

      setData(result);
      devLogger.log('HOOK', `Cache data loaded for ${key}`);
    } catch (err) {
      const error = err as Error;
      setError(error);
      devLogger.error(error, `Failed to load cache data for ${key}`);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh se configurado
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, enabled]);

  const invalidate = useCallback(async () => {
    await cacheService.delete(key);
    await fetchData();
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
  };
}
