import { useState, useEffect, useCallback } from 'react';

const RUNESDX_API_BASE = 'https://api.runesdx.com/v1';

export const useUserLiquidity = (userAddress) => {
  const [positions, setPositions] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserLiquidity = useCallback(async () => {
    if (!userAddress) {
      setPositions([]);
      setTotalValue(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${RUNESDX_API_BASE}/users/${userAddress}/liquidity`);
      if (!response.ok) {
        throw new Error('Falha ao carregar posições de liquidez');
      }
      
      const data = await response.json();
      
      // Transformar dados para formato esperado
      const formattedPositions = data.positions?.map(position => ({
        id: position.id,
        poolId: position.pair.id,
        poolName: `${position.pair.token0.symbol}/${position.pair.token1.symbol}`,
        token0: position.pair.token0,
        token1: position.pair.token1,
        liquidity: position.liquidityTokenBalance,
        share: position.liquidityTokenBalance / position.pair.totalSupply,
        value: position.liquidityUSD || 0,
        token0Amount: position.liquidityTokenBalance * position.pair.reserve0 / position.pair.totalSupply,
        token1Amount: position.liquidityTokenBalance * position.pair.reserve1 / position.pair.totalSupply,
        impermanentLoss: calculateImpermanentLoss(position),
        feesEarned: position.feesEarned || 0,
        createdAt: position.createdAt
      })) || [];
      
      const total = formattedPositions.reduce((sum, pos) => sum + pos.value, 0);
      
      setPositions(formattedPositions);
      setTotalValue(total);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar liquidez do usuário:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  const calculateImpermanentLoss = (position) => {
    // Cálculo simplificado de impermanent loss
    if (!position.initialValue || !position.currentValue) return 0;
    
    const hodlValue = position.initialValue;
    const currentValue = position.currentValue;
    
    return ((currentValue - hodlValue) / hodlValue) * 100;
  };

  useEffect(() => {
    fetchUserLiquidity();
    
    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchUserLiquidity, 60000);
    
    return () => clearInterval(interval);
  }, [fetchUserLiquidity]);

  return {
    positions,
    totalValue,
    loading,
    error,
    refetch: fetchUserLiquidity
  };
};

export const useArbitrageOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${RUNESDX_API_BASE}/arbitrage`);
      if (!response.ok) {
        throw new Error('Falha ao carregar oportunidades de arbitragem');
      }
      
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar oportunidades de arbitragem:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
    
    // Atualizar a cada 15 segundos para arbitragem
    const interval = setInterval(fetchOpportunities, 15000);
    
    return () => clearInterval(interval);
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities
  };
};