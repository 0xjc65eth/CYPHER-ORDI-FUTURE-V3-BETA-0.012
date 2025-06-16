/**
 * 🪝 useBitcoinWebSocket Hook
 * Real-time Bitcoin data via WebSocket
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { getBitcoinWebSocket, BitcoinPrice } from '@/lib/websocket/bitcoin-websocket';

export function useBitcoinWebSocket() {
  const [lastUpdate, setLastUpdate] = useState<BitcoinPrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Ref para evitar race conditions
  const isMountedRef = useRef(true);

  useEffect(() => {
    const ws = getBitcoinWebSocket();

    const handlePrice = (price: BitcoinPrice) => {
      if (!isMountedRef.current) return;
      setLastUpdate(price);
    };

    const handleConnected = () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
    };

    // Subscribe to events
    ws.on('price', handlePrice);
    ws.on('connected', handleConnected);
    ws.on('disconnected', handleDisconnected);

    // Get current state apenas se montado
    if (isMountedRef.current) {
      const currentPrice = ws.getLastPrice();
      if (currentPrice) {
        setLastUpdate(currentPrice);
      }
      setIsConnected(ws.isActive());
    }

    // Iniciar conexão se não ativa
    if (!ws.isActive()) {
      ws.connect();
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      ws.off('price', handlePrice);
      ws.off('connected', handleConnected);
      ws.off('disconnected', handleDisconnected);
      
      // Não desconectar o WebSocket pois é singleton
      // Apenas remover os listeners
    };
  }, []);
  
  // Effect para marcar como desmontado na limpeza final
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    lastUpdate,
    isConnected
  };
}