/**
 * 🪝 useMultiAgentSystem Hook
 * Interface React para o sistema multi-agente
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMultiAgentSystem, SystemStatus } from '@/lib/agents/multiAgentSystem';
import { TradingSignal } from '@/lib/agents/agent-024';

export function useMultiAgentSystem() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentSignals, setRecentSignals] = useState<TradingSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const system = getMultiAgentSystem();
    
    // Update system status
    const updateStatus = () => {
      const status = system.getSystemStatus();
      setSystemStatus(status);
      
      // Get recent signals
      const agent024 = system.getAgent024();
      const signals = agent024.getSignalHistory().slice(-5);
      setRecentSignals(signals);
    };

    // Event handlers
    const handleSignalGenerated = (signal: TradingSignal) => {
      setRecentSignals(prev => [signal, ...prev].slice(0, 5));
    };

    const handleSystemEvent = () => {
      updateStatus();
    };

    // Subscribe to events
    system.on('signal:generated', handleSignalGenerated);
    system.on('system:started', handleSystemEvent);
    system.on('system:stopped', handleSystemEvent);
    system.on('agent:started', handleSystemEvent);
    system.on('agent:stopped', handleSystemEvent);
    system.on('trade:executed', handleSystemEvent);

    // Initial update
    updateStatus();
    setIsLoading(false);

    // Update interval
    const interval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(interval);
      system.off('signal:generated', handleSignalGenerated);
      system.off('system:started', handleSystemEvent);
      system.off('system:stopped', handleSystemEvent);
      system.off('agent:started', handleSystemEvent);
      system.off('agent:stopped', handleSystemEvent);
      system.off('trade:executed', handleSystemEvent);
    };
  }, []);

  const startSystem = useCallback(async () => {
    const system = getMultiAgentSystem();
    await system.start();
  }, []);

  const stopSystem = useCallback(async () => {
    const system = getMultiAgentSystem();
    await system.stop();
  }, []);

  const emergencyStop = useCallback(() => {
    const system = getMultiAgentSystem();
    system.emergencyStop();
  }, []);

  return {
    systemStatus,
    recentSignals,
    isLoading,
    startSystem,
    stopSystem,
    emergencyStop
  };
}