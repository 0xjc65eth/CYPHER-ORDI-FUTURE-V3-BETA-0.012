/**
 * Hook para Backtesting
 */

import { useState, useCallback, useRef } from 'react';
import { BacktestingEngine, BacktestConfig, BacktestResult } from '@/lib/backtesting/backtesting-engine';
import { Strategy } from '@/lib/backtesting/strategies';

export interface BacktestingHook {
  runBacktest: (strategy: Strategy, data: any[]) => Promise<void>;
  results: BacktestResult | null;
  isRunning: boolean;
  progress: number;
  error: string | null;
  stop: () => void;
}

const defaultConfig: BacktestConfig = {
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: new Date(),
  initialBalance: 10000,
  maxDrawdown: 0.20, // 20%
  commission: 0.001, // 0.1%
  slippage: 0.0005 // 0.05%
};

export function useBacktesting(config?: Partial<BacktestConfig>): BacktestingHook {
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<BacktestingEngine | null>(null);

  const runBacktest = useCallback(async (strategy: Strategy, data: any[]) => {
    try {
      setIsRunning(true);
      setError(null);
      setProgress(0);
      setResults(null);

      const engine = new BacktestingEngine({ ...defaultConfig, ...config });
      engineRef.current = engine;

      // Listen to events
      engine.on('backtest:progress', (event) => {
        const progressPercent = (data.indexOf(event) / data.length) * 100;
        setProgress(progressPercent);
      });

      engine.on('backtest:error', (err) => {
        setError(err.message || 'Backtest failed');
      });

      const result = await engine.runBacktest(strategy.execute, data);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  }, [config]);

  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  return {
    runBacktest,
    results,
    isRunning,
    progress,
    error,
    stop
  };
}
