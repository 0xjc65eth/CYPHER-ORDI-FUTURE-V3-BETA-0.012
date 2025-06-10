/**
 * 🪝 useTradingEngine Hook
 * Interface React para o Trading Engine
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TradingEngine, TradingConfig, Order, Position } from '@/lib/trading/trading-engine';

const defaultConfig: TradingConfig = {
  maxDrawdown: 2,
  positionSize: 5,
  stopLoss: 3,
  takeProfit: 6,
  dailyTradeLimit: 20,
  riskRewardRatio: 2
};

let engineInstance: TradingEngine | null = null;

export function useTradingEngine() {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState({
    openPositions: 0,
    pendingOrders: 0,
    dailyTradeCount: 0,
    portfolioValue: 100000
  });

  useEffect(() => {
    if (!engineInstance) {
      engineInstance = new TradingEngine(defaultConfig);
    }

    const engine = engineInstance;

    const handleEngineStarted = () => setIsActive(true);
    const handleEngineStopped = () => setIsActive(false);
    
    engine.on('engine:started', handleEngineStarted);
    engine.on('engine:stopped', handleEngineStopped);

    // Atualizar status inicial
    setStatus(engine.getStatus());
    setIsActive(engine.getStatus().isActive);

    return () => {
      engine.off('engine:started', handleEngineStarted);
      engine.off('engine:stopped', handleEngineStopped);
    };
  }, []);

  const startEngine = useCallback(() => {
    engineInstance?.start();
    setStatus(engineInstance?.getStatus() || status);
  }, [status]);

  const stopEngine = useCallback(() => {
    engineInstance?.stop();
    setStatus(engineInstance?.getStatus() || status);
  }, [status]);

  const createOrder = useCallback(async (params: any) => {
    if (!engineInstance) throw new Error('Engine não inicializado');
    
    try {
      const order = await engineInstance.createOrder(params);
      setStatus(engineInstance.getStatus());
      return order;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      throw error;
    }
  }, []);

  return {
    isActive,
    status,
    startEngine,
    stopEngine,
    createOrder
  };
}