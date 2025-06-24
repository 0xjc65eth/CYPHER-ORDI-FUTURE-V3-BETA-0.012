// Custom hooks for Runes Tables with SWR and advanced caching

import { useState, useEffect, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { 
  RuneTokenData, 
  RuneHolderData, 
  RuneTransactionData, 
  MarketMoverData,
  TableFilters,
  SortConfig,
  PaginationConfig,
  TopRunesResponse,
  HoldersResponse,
  TransactionsResponse,
  MarketMoversResponse,
  UseTableConfig
} from '@/types/runes-tables';

// API Fetchers
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Top Runes Table Hook
export const useTopRunesTable = (config: UseTableConfig = {}) => {
  const [filters, setFilters] = useState<TableFilters>({
    limit: 50,
    offset: 0,
    sortBy: 'marketCap',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 50,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return params.toString();
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<TopRunesResponse>(
    `/api/runes/top?${queryString}`,
    fetcher,
    {
      refreshInterval: config.autoRefresh ? (config.refreshInterval || 30000) : 0,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      ...config
    }
  );

  useEffect(() => {
    if (data) {
      setPagination(prev => ({
        ...prev,
        total: data.total,
        hasNextPage: (pagination.page * pagination.pageSize) < data.total,
        hasPreviousPage: pagination.page > 1
      }));
    }
  }, [data, pagination.page, pagination.pageSize]);

  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateSort = useCallback((sortConfig: SortConfig) => {
    updateFilters({
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    });
  }, [updateFilters]);

  const goToPage = useCallback((page: number) => {
    const newOffset = (page - 1) * pagination.pageSize;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setPagination(prev => ({ ...prev, page }));
  }, [pagination.pageSize]);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    updateSort,
    goToPage,
    refresh
  };
};

// Holders Table Hook
export const useHoldersTable = (runeId: string, config: UseTableConfig = {}) => {
  const [filters, setFilters] = useState<TableFilters>({
    limit: 50,
    offset: 0,
    sortBy: 'balance',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 50,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return params.toString();
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<HoldersResponse>(
    runeId ? `/api/runes/${runeId}/holders?${queryString}` : null,
    fetcher,
    {
      refreshInterval: config.autoRefresh ? (config.refreshInterval || 30000) : 0,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      errorRetryCount: 3,
      ...config
    }
  );

  useEffect(() => {
    if (data) {
      setPagination(prev => ({
        ...prev,
        total: data.total,
        hasNextPage: (pagination.page * pagination.pageSize) < data.total,
        hasPreviousPage: pagination.page > 1
      }));
    }
  }, [data, pagination.page, pagination.pageSize]);

  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateSort = useCallback((sortConfig: SortConfig) => {
    updateFilters({
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    });
  }, [updateFilters]);

  const goToPage = useCallback((page: number) => {
    const newOffset = (page - 1) * pagination.pageSize;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setPagination(prev => ({ ...prev, page }));
  }, [pagination.pageSize]);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    updateSort,
    goToPage,
    refresh
  };
};

// Recent Transactions Hook
export const useRecentTransactionsTable = (config: UseTableConfig = {}) => {
  const [filters, setFilters] = useState<TableFilters>({
    limit: 100,
    offset: 0,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    timeframe: '24h'
  });

  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 100,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return params.toString();
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<TransactionsResponse>(
    `/api/runes/transactions?${queryString}`,
    fetcher,
    {
      refreshInterval: config.autoRefresh ? (config.refreshInterval || 15000) : 0,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
      errorRetryCount: 3,
      ...config
    }
  );

  useEffect(() => {
    if (data) {
      setPagination(prev => ({
        ...prev,
        total: data.total,
        hasNextPage: (pagination.page * pagination.pageSize) < data.total,
        hasPreviousPage: pagination.page > 1
      }));
    }
  }, [data, pagination.page, pagination.pageSize]);

  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateSort = useCallback((sortConfig: SortConfig) => {
    updateFilters({
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    });
  }, [updateFilters]);

  const goToPage = useCallback((page: number) => {
    const newOffset = (page - 1) * pagination.pageSize;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setPagination(prev => ({ ...prev, page }));
  }, [pagination.pageSize]);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    data: data?.data || [],
    total: data?.total || 0,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    updateSort,
    goToPage,
    refresh
  };
};

// Market Movers Hook
export const useMarketMoversTable = (config: UseTableConfig = {}) => {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  const { data, error, isLoading, mutate } = useSWR<MarketMoversResponse>(
    `/api/runes/market-movers?timeframe=${timeframe}`,
    fetcher,
    {
      refreshInterval: config.autoRefresh ? (config.refreshInterval || 60000) : 0,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      ...config
    }
  );

  const updateTimeframe = useCallback((newTimeframe: '1h' | '24h' | '7d') => {
    setTimeframe(newTimeframe);
  }, []);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    gainers: data?.gainers || [],
    losers: data?.losers || [],
    timeframe,
    isLoading,
    error,
    updateTimeframe,
    refresh
  };
};

// Export utilities
export const useTableExport = () => {
  const exportToCSV = useCallback((data: any[], filename: string = 'export.csv') => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportToJSON = useCallback((data: any[], filename: string = 'export.json') => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    exportToCSV,
    exportToJSON
  };
};