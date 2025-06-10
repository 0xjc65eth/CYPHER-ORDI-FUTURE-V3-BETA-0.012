// hooks/useRealTimeData.js
import { useState, useEffect } from 'react';
import { wsManager } from '../lib/websocket-client';

export function useRealTimeData(channels = []) {
  const [data, setData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Conectar WebSocket se não estiver conectado
    if (!wsManager.isConnected) {
      wsManager.connect();
    }

    // Subscribir aos canais especificados
    const unsubscribeFunctions = [];

    // Subscribir ao status de conexão
    const unsubscribeConnection = wsManager.subscribe('connection', (payload) => {
      setIsConnected(payload.status === 'connected');
    });
    unsubscribeFunctions.push(unsubscribeConnection);

    // Subscribir aos canais de dados
    channels.forEach(channel => {
      const unsubscribe = wsManager.subscribe(channel, (payload) => {
        setData(prevData => ({
          ...prevData,
          [channel]: payload
        }));
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    // Cleanup
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { data, isConnected };
}