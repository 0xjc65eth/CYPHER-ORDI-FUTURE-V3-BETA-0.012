'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { runesService, RuneMarketData, RunesAnalytics } from '@/services/runes';
import { bitcoinEcosystemService } from '@/services/BitcoinEcosystemService';
import { useRunesTerminal } from '@/contexts/RunesTerminalContext';

// Types
export interface RunesRealTimeData {
  marketData: RuneMarketData[];
  analytics: RunesAnalytics;
  realData: any[];
  pools: LiquidityPool[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface LiquidityPool {
  id: string;
  tokenA: { symbol: string; name: string };
  tokenB: { symbol: string; name: string };
  reserveA: number;
  reserveB: number;
  fee: number;
  volume24h: number;
  apr: number;
  tvl: number;
}

interface WebSocketMessage {
  type: 'price_update' | 'volume_update' | 'pool_update' | 'transaction' | 'status';
  data: any;
  timestamp: number;
}

// Data fetchers
const fetchRunesData = async () => {
  try {
    const [marketData, analytics, realData] = await Promise.all([
      runesService.getRunesMarketData(),
      runesService.getRunesAnalytics(),
      bitcoinEcosystemService.getRunesData().catch(() => [])
    ]);
    
    return { marketData, analytics, realData };
  } catch (error) {
    console.error('❌ Failed to fetch runes data:', error);
    throw new Error('Failed to fetch market data');
  }
};

const fetchLiquidityPools = async (): Promise<LiquidityPool[]> => {
  // Mock data - in production this would connect to real DEX APIs
  const mockPools: LiquidityPool[] = [
    {
      id: 'pool_btc_rune',
      tokenA: { symbol: 'BTC', name: 'Bitcoin' },
      tokenB: { symbol: 'RUNE', name: 'Rune Token' },
      reserveA: 1000000,
      reserveB: 2000000,
      fee: 0.3,
      volume24h: 50000 + Math.random() * 10000,
      apr: 12.5 + Math.random() * 5,
      tvl: 150000 + Math.random() * 20000
    },
    {
      id: 'pool_ordinal_meme',
      tokenA: { symbol: 'ORDINAL', name: 'Ordinals' },
      tokenB: { symbol: 'MEME', name: 'Meme Coin' },
      reserveA: 500000,
      reserveB: 1500000,
      fee: 0.3,
      volume24h: 30000 + Math.random() * 8000,
      apr: 18.2 + Math.random() * 7,
      tvl: 95000 + Math.random() * 15000
    },
    {
      id: 'pool_uncommon_goods',
      tokenA: { symbol: 'UNCOMMON', name: 'Uncommon Goods' },
      tokenB: { symbol: 'GOODS', name: 'Digital Goods' },
      reserveA: 750000,
      reserveB: 1250000,
      fee: 0.25,
      volume24h: 40000 + Math.random() * 12000,
      apr: 15.8 + Math.random() * 6,
      tvl: 120000 + Math.random() * 18000
    }
  ];

  return mockPools;
};

// Custom hook for real-time runes data
export function useRunesRealTimeData() {
  const { state, setConnectionStatus, updateLastUpdate, setError } = useRunesTerminal();
  const { settings } = state;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // SWR for initial data load and periodic refresh
  const { 
    data: runesData, 
    error: runesError, 
    mutate: mutateRunes,
    isLoading: runesLoading 
  } = useSWR(
    'runes-data',
    fetchRunesData,
    { 
      refreshInterval: settings.autoRefresh ? settings.refreshInterval : 0,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      errorRetryCount: 3,
      onSuccess: () => {
        updateLastUpdate();
        setError(null);
      },
      onError: (error) => {
        console.error('🔄 SWR Error:', error);
        setError(error.message);
      }
    }
  );

  const { 
    data: poolsData, 
    error: poolsError,
    mutate: mutatePools,
    isLoading: poolsLoading 
  } = useSWR(
    'liquidity-pools',
    fetchLiquidityPools,
    { 
      refreshInterval: settings.autoRefresh ? 60000 : 0,
      dedupingInterval: 30000
    }
  );

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('reconnecting');
      
      // Mock WebSocket URL - in production use real WebSocket endpoint
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://echo.websocket.org';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔗 WebSocket connected');
        setConnectionStatus('connected');
        setConnectionAttempts(0);
        updateLastUpdate();

        // Subscribe to runes data updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['runes_prices', 'runes_volume', 'liquidity_pools']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'price_update':
              // Update price data in SWR cache
              mutateRunes(current => {
                if (!current) return current;
                
                const updatedMarketData = current.marketData.map(rune => {
                  const update = message.data.find((u: any) => u.id === rune.id);
                  if (update) {
                    return {
                      ...rune,
                      price: { ...rune.price, ...update.price }
                    };
                  }
                  return rune;
                });
                
                return { ...current, marketData: updatedMarketData };
              }, { revalidate: false });
              break;

            case 'volume_update':
              mutateRunes(current => {
                if (!current) return current;
                
                const updatedMarketData = current.marketData.map(rune => {
                  const update = message.data.find((u: any) => u.id === rune.id);
                  if (update) {
                    return {
                      ...rune,
                      volume: { ...rune.volume, ...update.volume }
                    };
                  }
                  return rune;
                });
                
                return { ...current, marketData: updatedMarketData };
              }, { revalidate: false });
              break;

            case 'pool_update':
              mutatePools(current => {
                if (!current) return current;
                
                return current.map(pool => {
                  const update = message.data.find((u: any) => u.id === pool.id);
                  return update ? { ...pool, ...update } : pool;
                });
              }, { revalidate: false });
              break;

            case 'transaction':
              // Handle new transaction data
              console.log('💰 New transaction:', message.data);
              break;

            default:
              console.log('📨 Unknown message type:', message.type);
          }
          
          updateLastUpdate();
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('🔌 WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not intentional close
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${connectionAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [connectionAttempts, setConnectionStatus, updateLastUpdate, mutateRunes, mutatePools]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    setConnectionAttempts(0);
  }, [setConnectionStatus]);

  // Connect WebSocket when auto-refresh is enabled
  useEffect(() => {
    if (settings.autoRefresh) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [settings.autoRefresh, connectWebSocket, disconnectWebSocket]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([mutateRunes(), mutatePools()]);
      updateLastUpdate();
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
      setError('Failed to refresh data');
    }
  }, [mutateRunes, mutatePools, updateLastUpdate, setError]);

  // Prefetch data for performance
  useEffect(() => {
    // Prefetch related data when component mounts
    const prefetchTimer = setTimeout(() => {
      if (!runesData) {
        mutateRunes();
      }
      if (!poolsData) {
        mutatePools();
      }
    }, 100);

    return () => clearTimeout(prefetchTimer);
  }, [mutateRunes, mutatePools, runesData, poolsData]);

  // Return combined data and status
  const isLoading = runesLoading || poolsLoading;
  const error = runesError || poolsError || state.error;

  const data: RunesRealTimeData = {
    marketData: runesData?.marketData || [],
    analytics: runesData?.analytics || {
      marketOverview: {
        totalMarketCap: 0,
        totalVolume24h: 0,
        averageChange24h: 0,
        activeRunes: 0,
        newRunes24h: 0,
        marketSentiment: 'neutral' as const
      },
      topPerformers: {
        gainers24h: [],
        losers24h: [],
        volumeLeaders: []
      },
      crossChainMetrics: {
        bridgeVolume24h: 0,
        activeBridges: 0,
        averageBridgeTime: 0
      }
    },
    realData: runesData?.realData || [],
    pools: poolsData || [],
    isLoading,
    error: error?.message || null,
    lastUpdate: state.lastUpdate,
    connectionStatus: state.connectionStatus
  };

  return {
    data,
    refreshData,
    connectWebSocket,
    disconnectWebSocket,
    mutateRunes,
    mutatePools
  };
}