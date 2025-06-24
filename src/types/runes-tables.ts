// Types for Runes Advanced Tables System

export interface RuneTokenData {
  id: string;
  name: string;
  symbol: string;
  marketCap: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  supply: number;
  holders: number;
  rank: number;
  logo?: string;
  description?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  createdAt: string;
  isActive: boolean;
}

export interface RuneHolderData {
  address: string;
  balance: number;
  percentage: number;
  rank: number;
  firstActivity: string;
  lastActivity: string;
  transactionCount: number;
  isContract?: boolean;
  label?: string; // Exchange, Smart Contract, etc.
}

export interface RuneTransactionData {
  txHash: string;
  timestamp: string;
  type: 'mint' | 'transfer' | 'burn' | 'trade';
  from: string;
  to: string;
  amount: number;
  value?: number; // USD value
  fee: number;
  blockHeight: number;
  runeName: string;
  runeSymbol: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface MarketMoverData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  logo?: string;
  reason?: string; // Why it's moving
}

export interface TableFilters {
  search?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPrice?: number;
  maxPrice?: number;
  timeframe?: '1h' | '24h' | '7d' | '30d';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'number' | 'currency' | 'percentage' | 'date' | 'address' | 'hash';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  includeColumns: string[];
  filename?: string;
}

export interface TableLoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  error?: string;
}

// API Response Types
export interface TopRunesResponse {
  data: RuneTokenData[];
  total: number;
  page: number;
  pageSize: number;
  timestamp: string;
}

export interface HoldersResponse {
  data: RuneHolderData[];
  total: number;
  page: number;
  pageSize: number;
  runeId: string;
  timestamp: string;
}

export interface TransactionsResponse {
  data: RuneTransactionData[];
  total: number;
  page: number;
  pageSize: number;
  timestamp: string;
}

export interface MarketMoversResponse {
  gainers: MarketMoverData[];
  losers: MarketMoverData[];
  timestamp: string;
}

// Hook Configuration Types
export interface UseTableConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableInfiniteScroll?: boolean;
  cacheKey?: string;
  staleTime?: number;
}