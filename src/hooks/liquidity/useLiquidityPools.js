import { useState, useEffect, useCallback } from 'react';

const RUNESDX_API_BASE = 'https://api.runesdx.com/v1';

export const useLiquidityPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${RUNESDX_API_BASE}/pairs`);
      if (!response.ok) {
        throw new Error('Falha ao carregar pools de liquidez');
      }
      
      const data = await response.json();
      
      // Transformar dados da API para o formato esperado
      const formattedPools = data.map(pool => ({
        id: pool.id,
        name: `${pool.token0.symbol}/${pool.token1.symbol}`,
        token0: pool.token0,
        token1: pool.token1,
        tvl: pool.reserveUSD || 0,
        volume24h: pool.volumeUSD || 0,
        apy: calculateAPY(pool.volumeUSD, pool.reserveUSD),
        fee: pool.fee || 0.3,
        liquidity: pool.totalSupply || 0,
        reserve0: pool.reserve0 || 0,
        reserve1: pool.reserve1 || 0,
        price: pool.token1Price || 0
      }));
      
      setPools(formattedPools);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar pools:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateAPY = (volume24h, tvl) => {
    if (!tvl || tvl === 0) return 0;
    const dailyFees = (volume24h * 0.003); // 0.3% fee
    const yearlyFees = dailyFees * 365;
    return (yearlyFees / tvl) * 100;
  };

  useEffect(() => {
    fetchPools();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchPools, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPools]);

  return {
    pools,
    loading,
    error,
    refetch: fetchPools
  };
};

export const usePoolStats = (poolId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPoolStats = useCallback(async () => {
    if (!poolId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${RUNESDX_API_BASE}/pairs/${poolId}/stats`);
      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas do pool');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar estatísticas do pool:', err);
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    fetchPoolStats();
  }, [fetchPoolStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchPoolStats
  };
};