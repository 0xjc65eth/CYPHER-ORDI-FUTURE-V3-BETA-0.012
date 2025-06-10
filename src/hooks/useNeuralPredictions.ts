import { useState, useEffect } from 'react';

interface Prediction {
  asset: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  priceTarget?: number;
  supportLevel?: number;
  resistanceLevel?: number;
}

export function useNeuralPredictions() {
  const [data, setData] = useState<{ predictions: Prediction[]; loading: boolean }>({
    predictions: [],
    loading: true
  });

  useEffect(() => {
    const predictions: Prediction[] = [
      {
        asset: 'BTC/USDT',
        prediction: 'bullish',
        confidence: 0.85,
        timeframe: '24h',
        priceTarget: 102000,
        supportLevel: 96000,
        resistanceLevel: 100000
      },
      {
        asset: 'ETH/USDT',
        prediction: 'bearish',
        confidence: 0.72,
        timeframe: '1h',
        priceTarget: 3200,
        supportLevel: 3300,
        resistanceLevel: 3500
      },
      {
        asset: 'ORDI/USDT',
        prediction: 'bullish',
        confidence: 0.91,
        timeframe: '4h',
        priceTarget: 85,
        supportLevel: 72,
        resistanceLevel: 80
      }
    ];
    setData({ predictions, loading: false });
  }, []);

  return data;
}