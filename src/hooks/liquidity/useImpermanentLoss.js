import { useState, useEffect, useCallback } from 'react';

export const useImpermanentLoss = (initialPrice, currentPrice, token0Amount, token1Amount) => {
  const [impermanentLoss, setImpermanentLoss] = useState(0);
  const [hodlValue, setHodlValue] = useState(0);
  const [liquidityValue, setLiquidityValue] = useState(0);
  const [priceRatio, setPriceRatio] = useState(1);

  const calculateImpermanentLoss = useCallback(() => {
    if (!initialPrice || !currentPrice || initialPrice === 0) {
      setImpermanentLoss(0);
      setHodlValue(0);
      setLiquidityValue(0);
      setPriceRatio(1);
      return;
    }

    const ratio = currentPrice / initialPrice;
    setPriceRatio(ratio);

    // Valor se tivesse segurado os tokens (HODL)
    const hodlVal = token0Amount * currentPrice + token1Amount;
    setHodlValue(hodlVal);

    // Valor atual na posição de liquidez
    // Fórmula: 2 * sqrt(ratio) * k / (1 + ratio)
    // Onde k é o produto constante inicial
    const k = Math.sqrt(token0Amount * token1Amount);
    const liquidityVal = 2 * Math.sqrt(ratio) * k;
    setLiquidityValue(liquidityVal);

    // Impermanent Loss = (Valor Liquidez / Valor HODL) - 1
    const il = hodlVal > 0 ? ((liquidityVal / hodlVal) - 1) * 100 : 0;
    setImpermanentLoss(il);
  }, [initialPrice, currentPrice, token0Amount, token1Amount]);

  useEffect(() => {
    calculateImpermanentLoss();
  }, [calculateImpermanentLoss]);

  const getImpermanentLossData = () => {
    const scenarios = [];
    const basePrice = initialPrice || 1;
    
    // Cenários de mudança de preço
    const priceChanges = [-0.9, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 4];
    
    priceChanges.forEach(change => {
      const scenarioPrice = basePrice * (1 + change);
      const ratio = scenarioPrice / basePrice;
      
      const hodlVal = token0Amount * scenarioPrice + token1Amount;
      const k = Math.sqrt(token0Amount * token1Amount);
      const liquidityVal = 2 * Math.sqrt(ratio) * k;
      const il = hodlVal > 0 ? ((liquidityVal / hodlVal) - 1) * 100 : 0;
      
      scenarios.push({
        priceChange: change * 100,
        price: scenarioPrice,
        impermanentLoss: il,
        hodlValue: hodlVal,
        liquidityValue: liquidityVal
      });
    });
    
    return scenarios;
  };

  const getImpermanentLossLevel = () => {
    const absIL = Math.abs(impermanentLoss);
    
    if (absIL < 0.1) return { level: 'minimal', color: 'green', description: 'Mínimo' };
    if (absIL < 2) return { level: 'low', color: 'yellow', description: 'Baixo' };
    if (absIL < 5) return { level: 'moderate', color: 'orange', description: 'Moderado' };
    if (absIL < 10) return { level: 'high', color: 'red', description: 'Alto' };
    return { level: 'extreme', color: 'red', description: 'Extremo' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return {
    impermanentLoss,
    hodlValue,
    liquidityValue,
    priceRatio,
    scenarios: getImpermanentLossData(),
    level: getImpermanentLossLevel(),
    formatCurrency,
    formatPercentage,
    recalculate: calculateImpermanentLoss
  };
};

// Hook para calcular ganhos com taxas vs impermanent loss
export const useFeesVsImpermanentLoss = (
  feesEarned, 
  impermanentLoss, 
  timeInPool, 
  initialValue
) => {
  const [netGain, setNetGain] = useState(0);
  const [breakEvenFees, setBreakEvenFees] = useState(0);
  const [projectedAnnualReturn, setProjectedAnnualReturn] = useState(0);

  useEffect(() => {
    // Ganho líquido = Taxas ganhas - Impermanent Loss
    const netGainValue = feesEarned + (impermanentLoss / 100) * initialValue;
    setNetGain(netGainValue);

    // Taxas necessárias para compensar IL
    const breakEven = Math.abs((impermanentLoss / 100) * initialValue);
    setBreakEvenFees(breakEven);

    // Projeção anual baseada no tempo no pool
    if (timeInPool > 0) {
      const dailyReturn = netGainValue / timeInPool;
      const annualReturn = (dailyReturn * 365 / initialValue) * 100;
      setProjectedAnnualReturn(annualReturn);
    }
  }, [feesEarned, impermanentLoss, timeInPool, initialValue]);

  const getRecommendation = () => {
    if (netGain > 0) {
      return {
        action: 'hold',
        message: 'Posição lucrativa - continue fornecendo liquidez',
        color: 'green'
      };
    } else if (Math.abs(netGain) < initialValue * 0.02) { // 2% do valor inicial
      return {
        action: 'monitor',
        message: 'Monitore a posição - próximo do ponto de equilíbrio',
        color: 'yellow'
      };
    } else {
      return {
        action: 'consider_exit',
        message: 'Considere remover liquidez - perdas significativas',
        color: 'red'
      };
    }
  };

  return {
    netGain,
    breakEvenFees,
    projectedAnnualReturn,
    recommendation: getRecommendation(),
    isPositive: netGain > 0,
    daysToBreakEven: breakEvenFees > 0 && feesEarned > 0 ? 
      Math.ceil((breakEvenFees - feesEarned) / (feesEarned / timeInPool)) : 0
  };
};

// Hook para alertas de oportunidades
export const useLiquidityAlerts = (pools, userPositions) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];

    // Alertas de APY alto
    pools.forEach(pool => {
      if (pool.apy > 100) {
        newAlerts.push({
          type: 'high-apy',
          priority: 'high',
          title: 'APY Alto Detectado',
          message: `${pool.name} oferece ${pool.apy.toFixed(2)}% APY`,
          pool: pool,
          action: 'add_liquidity'
        });
      }
    });

    // Alertas de Impermanent Loss alto
    userPositions.forEach(position => {
      if (Math.abs(position.impermanentLoss) > 10) {
        newAlerts.push({
          type: 'high-il',
          priority: 'medium',
          title: 'Impermanent Loss Alto',
          message: `${position.poolName} tem IL de ${position.impermanentLoss.toFixed(2)}%`,
          position: position,
          action: 'review_position'
        });
      }
    });

    // Alertas de volume baixo
    pools.forEach(pool => {
      if (pool.volume24h < 1000 && pool.tvl > 100000) {
        newAlerts.push({
          type: 'low-volume',
          priority: 'low',
          title: 'Volume Baixo',
          message: `${pool.name} tem volume baixo para seu TVL`,
          pool: pool,
          action: 'monitor'
        });
      }
    });

    // Ordenar por prioridade
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    newAlerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    setAlerts(newAlerts);
  }, [pools, userPositions]);

  const dismissAlert = (alertIndex) => {
    setAlerts(prev => prev.filter((_, index) => index !== alertIndex));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'high-apy': return '🚀';
      case 'high-il': return '⚠️';
      case 'low-volume': return '📉';
      default: return '💡';
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  return {
    alerts,
    dismissAlert,
    getAlertIcon,
    getAlertColor,
    hasHighPriorityAlerts: alerts.some(alert => alert.priority === 'high')
  };
};