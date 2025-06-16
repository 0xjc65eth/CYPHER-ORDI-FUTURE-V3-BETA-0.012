import { useState, useEffect, useRef, useCallback } from 'react';

interface NetworkHealthData {
  nodeCount: number;
  channelCount: number;
  networkCapacity: number; // in BTC
  avgChannelSize: number; // in BTC
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdate: Date;
  nodeGrowth24h: number; // percentage
  channelGrowth24h: number; // percentage
  capacityGrowth24h: number; // percentage
}

export function useNetworkHealth() {
  const [data, setData] = useState<NetworkHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs para evitar race conditions e memory leaks
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNetworkHealth = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      // Mock data for now - replace with actual Lightning Network API calls
      const mockData: NetworkHealthData = {
        nodeCount: 15234,
        channelCount: 73456,
        networkCapacity: 5432.67,
        avgChannelSize: 0.074,
        healthStatus: 'excellent',
        lastUpdate: new Date(),
        nodeGrowth24h: 2.3,
        channelGrowth24h: 1.8,
        capacityGrowth24h: 3.1
      };

      // Simulate API delay com AbortController
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 1000);
        
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
      
      // Verificar se ainda está montado antes de atualizar estado
      if (isMountedRef.current && !signal.aborted) {
        setData(mockData);
        setError(null);
      }
    } catch (err) {
      // Ignorar erros de abort
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      
      if (isMountedRef.current && !signal.aborted) {
        setError(err instanceof Error ? err : new Error('Failed to fetch network health'));
      }
    } finally {
      if (isMountedRef.current && !signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Executar fetch inicial
    fetchNetworkHealth();
    
    // Limpar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Refresh every 5 minutes com verificação de montagem
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchNetworkHealth();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      isMountedRef.current = false;
      
      // Abortar requisições pendentes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpar interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchNetworkHealth]);
  
  // Effect para cleanup final
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchNetworkHealth
  };
}