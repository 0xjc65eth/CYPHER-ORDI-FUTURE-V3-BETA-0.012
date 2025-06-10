/**
 * 🪝 useBitcoinWebSocket Hook
 * Real-time Bitcoin data via WebSocket
 */

'use client';

import { useState, useEffect } from 'react';
import { getBitcoinWebSocket, BitcoinPrice } from '@/lib/websocket/bitcoin-websocket';

export function useBitcoinWebSocket() {
  const [lastUpdate, setLastUpdate] = useState<BitcoinPrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = getBitcoinWebSocket();

    const handlePrice = (price: BitcoinPrice) => {
      setLastUpdate(price);
    };

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Subscribe to events
    ws.on('price', handlePrice);
    ws.on('connected', handleConnected);
    ws.on('disconnected', handleDisconnected);

    // Get current state
    const currentPrice = ws.getLastPrice();
    if (currentPrice) {
      setLastUpdate(currentPrice);
    }
    setIsConnected(ws.isActive());

    // Cleanup
    return () => {
      ws.off('price', handlePrice);
      ws.off('connected', handleConnected);
      ws.off('disconnected', handleDisconnected);
    };
  }, []);

  return {
    lastUpdate,
    isConnected
  };
}