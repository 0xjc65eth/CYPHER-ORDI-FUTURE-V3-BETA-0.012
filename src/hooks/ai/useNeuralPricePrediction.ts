'use client';

import { useState, useEffect, useCallback } from 'react';
import { neuralPricePredictor, PricePrediction } from '@/lib/ai';
import { devLogger } from '@/lib/logger';

/**
 * Hook para previsão neural de preços
 */
export function useNeuralPricePrediction() {
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [realtimePrediction, setRealtimePrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const predict = useCallback(async (historicalData: number[][]) => {
    setLoading(true);
    setError(null);

    try {
      // Extract closing prices from the historical data
      const prices = historicalData.map(data => data[3] || data[0]); // Close price or first value
      const result = await neuralPricePredictor.predict(prices);
      setPrediction(result);
      devLogger.log('HOOK', 'Previsão de preço gerada', result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      devLogger.error(error, 'Erro na previsão de preço');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictRealtime = useCallback(async (
    currentPrice: number,
    recentHistory: number[][]
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Use predict method with recent history plus current price
      const historicalPrices = recentHistory.map(data => data[3] || data[0]);
      const prices = [...historicalPrices, currentPrice];
      const result = await neuralPricePredictor.predict(prices);
      setRealtimePrediction(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    prediction,
    realtimePrediction,
    loading,
    error,
    predict,
    predictRealtime,
  };
}
