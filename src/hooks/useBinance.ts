/**
 * Hook para Binance Exchange
 */

import { useState, useEffect, useCallback } from 'react';
import { binance, Balance, Order, OrderParams } from '@/lib/exchanges/binance-connector';

export interface BinanceHook {
  isConnected: boolean;
  balances: Balance[];
  openOrders: Order[];
  createOrder: (params: OrderParams) => Promise<Order>;
  cancelOrder: (symbol: string, orderId: string) => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  error: string | null;
}

export function useBinance(): BinanceHook {
  const [isConnected, setIsConnected] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await binance.ping();
        setIsConnected(connected);
        
        if (connected && process.env.NEXT_PUBLIC_BINANCE_API_KEY) {
          await refreshBalances();
          await refreshOrders();
        }
      } catch (err) {
        console.error('Binance connection test failed:', err);
        setIsConnected(false);
      }
    };

    testConnection();

    // Listen to events
    binance.on('error', (err) => {
      setError(err.message);
    });

    binance.on('order:created', () => {
      refreshOrders();
    });

    binance.on('order:cancelled', () => {
      refreshOrders();
    });

    return () => {
      binance.removeAllListeners();
    };
  }, []);

  const refreshBalances = useCallback(async () => {
    try {
      setError(null);
      const balances = await binance.getBalances();
      setBalances(balances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balances');
      // Use mock data if API fails
      setBalances([
        { asset: 'BTC', free: 0.0025, locked: 0, total: 0.0025 },
        { asset: 'USDT', free: 1000, locked: 0, total: 1000 },
      ]);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      setError(null);
      const orders = await binance.getOpenOrders();
      setOpenOrders(orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get orders');
      setOpenOrders([]);
    }
  }, []);

  const createOrder = useCallback(async (params: OrderParams): Promise<Order> => {
    try {
      setError(null);
      const order = await binance.createOrder(params);
      await refreshBalances();
      await refreshOrders();
      return order;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [refreshBalances, refreshOrders]);

  const cancelOrder = useCallback(async (symbol: string, orderId: string): Promise<void> => {
    try {
      setError(null);
      await binance.cancelOrder(symbol, orderId);
      await refreshOrders();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [refreshOrders]);

  return {
    isConnected,
    balances,
    openOrders,
    createOrder,
    cancelOrder,
    refreshBalances,
    refreshOrders,
    error
  };
}
