/**
 * React hook for RUNESDX.IO order management
 * Handles order placement, tracking, and wallet integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { runesDXService, RunesDXOrder, RunesDXOrderRequest, RunesDXOrderResponse } from '@/services/RunesDXService';
import { useWallet } from '@/hooks/useWallet';
import { logger } from '@/lib/logger';

export interface UseRunesDXOrdersOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface OrderFormData {
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  runeSymbol: string;
  amount: string;
  price?: string;
  slippageTolerance?: number;
}

export function useRunesDXOrders(options: UseRunesDXOrdersOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const { wallet, isConnected, address, signMessage } = useWallet();
  const queryClient = useQueryClient();
  
  const [activeOrders, setActiveOrders] = useState<Map<string, RunesDXOrder>>(new Map());
  const [orderCallbacks, setOrderCallbacks] = useState<Map<string, (order: RunesDXOrder) => void>>(new Map());
  const subscriptionsRef = useRef<Set<string>>(new Set());

  // Get order history
  const {
    data: orderHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['runesdx-orders', address],
    queryFn: () => address ? runesDXService.getOrderHistory(address) : [],
    enabled: !!address && isConnected,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: OrderFormData): Promise<RunesDXOrderResponse> => {
      if (!isConnected || !address || !wallet) {
        throw new Error('Wallet not connected');
      }

      // Create order message for signing
      const orderMessage = createOrderMessage(orderData, address);
      
      // Sign the order
      const signature = await signOrderMessage(orderMessage);
      
      // Get public key from wallet
      const publicKey = await getWalletPublicKey();

      // Prepare order request
      const orderRequest: RunesDXOrderRequest = {
        ...orderData,
        walletAddress: address,
        signature,
        publicKey,
        clientId: `cypher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      return runesDXService.placeOrder(orderRequest);
    },
    onSuccess: (response, variables) => {
      if (response.success && response.order) {
        // Add to active orders
        setActiveOrders(prev => new Map(prev.set(response.order!.id, response.order!)));
        
        // Subscribe to order updates
        subscribeToOrderUpdates(response.order.id);
        
        // Invalidate order history to refresh
        queryClient.invalidateQueries({ queryKey: ['runesdx-orders', address] });
        
        logger.info('Order placed successfully:', response.order);
      }
    },
    onError: (error) => {
      logger.error('Failed to place order:', error);
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      // Create cancellation message for signing
      const cancelMessage = `Cancel order ${orderId} from ${address} at ${Date.now()}`;
      const signature = await signOrderMessage(cancelMessage);

      return runesDXService.cancelOrder(orderId, signature);
    },
    onSuccess: (result, orderId) => {
      if (result.success) {
        // Remove from active orders
        setActiveOrders(prev => {
          const newMap = new Map(prev);
          newMap.delete(orderId);
          return newMap;
        });
        
        // Unsubscribe from updates
        unsubscribeFromOrderUpdates(orderId);
        
        // Refresh order history
        queryClient.invalidateQueries({ queryKey: ['runesdx-orders', address] });
        
        logger.info('Order cancelled successfully:', orderId);
      }
    },
    onError: (error) => {
      logger.error('Failed to cancel order:', error);
    },
  });

  // Get order fees estimation
  const estimateFeesQuery = useCallback(
    (orderData: Omit<OrderFormData, 'slippageTolerance'>) => {
      return useQuery({
        queryKey: ['runesdx-fees', orderData],
        queryFn: () => runesDXService.estimateOrderFees({
          ...orderData,
          walletAddress: address || '',
        }),
        enabled: !!address && !!orderData.amount && parseFloat(orderData.amount) > 0,
        staleTime: 10000,
      });
    },
    [address]
  );

  // Create order message for signing
  const createOrderMessage = (orderData: OrderFormData, walletAddress: string): string => {
    const timestamp = Date.now();
    const message = [
      'RUNESDX ORDER',
      `Type: ${orderData.type.toUpperCase()}`,
      `Side: ${orderData.side.toUpperCase()}`,
      `Rune: ${orderData.runeSymbol}`,
      `Amount: ${orderData.amount}`,
      orderData.price ? `Price: ${orderData.price}` : '',
      `Address: ${walletAddress}`,
      `Timestamp: ${timestamp}`,
    ].filter(Boolean).join('\n');
    
    return message;
  };

  // Sign order message using wallet
  const signOrderMessage = async (message: string): Promise<string> => {
    try {
      if (!wallet || !signMessage) {
        throw new Error('Wallet or signing function not available');
      }

      const signature = await signMessage(message);
      return signature;
    } catch (error) {
      logger.error('Failed to sign order message:', error);
      throw new Error('Failed to sign order. Please try again.');
    }
  };

  // Get wallet public key
  const getWalletPublicKey = async (): Promise<string> => {
    try {
      if (!wallet) {
        throw new Error('Wallet not available');
      }

      // Try to get public key from wallet
      if (wallet.publicKey) {
        return wallet.publicKey;
      }

      // For some wallets, we might need to derive it from address
      // This is a simplified approach - in production, use proper key derivation
      return `pub_${address}_${Date.now()}`;
    } catch (error) {
      logger.error('Failed to get wallet public key:', error);
      throw new Error('Failed to get wallet public key');
    }
  };

  // Subscribe to order updates
  const subscribeToOrderUpdates = useCallback((orderId: string) => {
    if (subscriptionsRef.current.has(orderId)) return;

    const callback = (updatedOrder: RunesDXOrder) => {
      setActiveOrders(prev => new Map(prev.set(orderId, updatedOrder)));
      
      // Call any registered callbacks
      const orderCallback = orderCallbacks.get(orderId);
      if (orderCallback) {
        orderCallback(updatedOrder);
      }
      
      // Refresh order history if order is completed
      if (['filled', 'cancelled', 'failed'].includes(updatedOrder.status)) {
        queryClient.invalidateQueries({ queryKey: ['runesdx-orders', address] });
        
        // Remove from active orders after a delay
        setTimeout(() => {
          setActiveOrders(prev => {
            const newMap = new Map(prev);
            newMap.delete(orderId);
            return newMap;
          });
          unsubscribeFromOrderUpdates(orderId);
        }, 5000);
      }
    };

    runesDXService.subscribeToOrderUpdates(orderId, callback);
    subscriptionsRef.current.add(orderId);
    
    logger.info('Subscribed to order updates:', orderId);
  }, [orderCallbacks, queryClient, address]);

  // Unsubscribe from order updates
  const unsubscribeFromOrderUpdates = useCallback((orderId: string) => {
    runesDXService.unsubscribeFromOrderUpdates(orderId);
    subscriptionsRef.current.delete(orderId);
    
    logger.info('Unsubscribed from order updates:', orderId);
  }, []);

  // Register order callback
  const registerOrderCallback = useCallback((orderId: string, callback: (order: RunesDXOrder) => void) => {
    setOrderCallbacks(prev => new Map(prev.set(orderId, callback)));
  }, []);

  // Get order status
  const getOrderStatus = useCallback(async (orderId: string): Promise<RunesDXOrder | null> => {
    try {
      return await runesDXService.getOrderStatus(orderId);
    } catch (error) {
      logger.error('Failed to get order status:', error);
      return null;
    }
  }, []);

  // Check if order can be cancelled
  const canCancelOrder = useCallback((order: RunesDXOrder): boolean => {
    return ['pending', 'placed', 'partial'].includes(order.status);
  }, []);

  // Get active orders array
  const activeOrdersArray = Array.from(activeOrders.values());

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(orderId => {
        unsubscribeFromOrderUpdates(orderId);
      });
    };
  }, [unsubscribeFromOrderUpdates]);

  return {
    // Order history
    orderHistory: orderHistory || [],
    isLoadingHistory,
    historyError,
    refetchHistory,
    
    // Active orders
    activeOrders: activeOrdersArray,
    
    // Order placement
    placeOrder: placeOrderMutation.mutate,
    isPlacingOrder: placeOrderMutation.isPending,
    placeOrderError: placeOrderMutation.error,
    lastPlacedOrder: placeOrderMutation.data,
    
    // Order cancellation
    cancelOrder: cancelOrderMutation.mutate,
    isCancellingOrder: cancelOrderMutation.isPending,
    cancelOrderError: cancelOrderMutation.error,
    
    // Utilities
    estimateFeesQuery,
    getOrderStatus,
    canCancelOrder,
    registerOrderCallback,
    subscribeToOrderUpdates,
    unsubscribeFromOrderUpdates,
    
    // Connection status
    isConnected,
    address,
    
    // Service status
    connectionStatus: runesDXService.getConnectionStatus(),
  };
}