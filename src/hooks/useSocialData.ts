import { useState, useEffect } from 'react';
import { SocialData, getSocialData, refreshSocialData } from '@/services/social-data-service';

export function useSocialData(refreshInterval: number = 60000) {
  const [data, setData] = useState<SocialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const socialData = await getSocialData();
        setData(socialData);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately
    fetchData();

    // Set up interval for refreshing data
    const intervalId = setInterval(async () => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        try {
          const refreshedData = await refreshSocialData();
          setData(refreshedData);
          setLastUpdated(new Date());
        } catch (err) {
          console.error('Error refreshing social data:', err);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, refreshInterval);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval, isRefreshing]);

  // Function to manually refresh data
  const refresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      const refreshedData = await refreshSocialData();
      setData(refreshedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return { data, isLoading, error, lastUpdated, refresh, isRefreshing };
}
