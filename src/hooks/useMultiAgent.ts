'use client';

import { useState, useEffect, useCallback } from 'react';
import { cypherMultiAgent } from '@/lib/agents/multi-agent-system';
import type { Agent } from '@/lib/agents/multi-agent-system';

export const useMultiAgent = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemStats, setSystemStats] = useState<{ totalAgents: number; activeAgents: number; taskQueue: number; completedTasks: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setAgents(cypherMultiAgent.getAllAgents());
      setSystemStats(cypherMultiAgent.getSystemStats());
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }, []);

  const designLayout = useCallback(async (layoutType: string) => 
    cypherMultiAgent.designLayout(layoutType), []);

  const createChart = useCallback(async (chartConfig: any) => 
    cypherMultiAgent.createChart(chartConfig), []);

  const connectWallet = useCallback(async (walletType: string) => 
    cypherMultiAgent.connectWallet(walletType), []);

  const analyzeOrdinals = useCallback(async (collection: string) => 
    cypherMultiAgent.analyzeOrdinals(collection), []);

  const processVoice = useCallback(async (transcript: string) => 
    cypherMultiAgent.processVoice(transcript), []);

  const performTechnicalAnalysis = useCallback(async (symbol: string) => 
    cypherMultiAgent.performTechnicalAnalysis(symbol), []);

  return {
    agents, systemStats, isLoading,
    designLayout, createChart, connectWallet,
    analyzeOrdinals, processVoice, performTechnicalAnalysis
  };
};

export default useMultiAgent;