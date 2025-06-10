'use client';

import { useState, useCallback } from 'react';
import { sentimentAnalyzer, SentimentResult } from '@/lib/ai';
import { devLogger } from '@/lib/logger';

/**
 * Hook para análise de sentimento
 */
export function useSentimentAnalysis() {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [aggregatedSentiment, setAggregatedSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const result = await sentimentAnalyzer.analyzeSentiment(text);
      setSentiment(result);
      devLogger.log('HOOK', `Sentimento: ${result.sentiment} (${(result.score * 100).toFixed(1)}%)`);
      return result;
    } catch (error) {
      devLogger.error(error as Error, 'Erro na análise de sentimento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeMultiple = useCallback(async (texts: string[]) => {
    setLoading(true);
    try {
      const result = await sentimentAnalyzer.analyzeMultipleSources(texts);
      setAggregatedSentiment(result);
      devLogger.log('HOOK', `Sentimento agregado: ${result.overall.sentiment}`);
      return result;
    } catch (error) {
      devLogger.error(error as Error, 'Erro na análise agregada');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sentiment,
    aggregatedSentiment,
    loading,
    analyzeSentiment,
    analyzeMultiple,
  };
}
