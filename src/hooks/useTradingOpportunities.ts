import { useState, useEffect } from 'react';

interface Opportunity {
  id: string;
  type: 'arbitrage' | 'trend' | 'breakout' | 'reversal';
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  potentialProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
}

export function useTradingOpportunities() {
  const [data, setData] = useState<{ opportunities: Opportunity[]; loading: boolean }>({
    opportunities: [],
    loading: true
  });

  useEffect(() => {
    const opportunities: Opportunity[] = [
      {
        id: '1',
        type: 'arbitrage',
        asset: 'BTC/USDT',
        action: 'buy',
        potentialProfit: 2.3,
        riskLevel: 'low',
        confidence: 0.89,
        entryPrice: 98000,
        targetPrice: 100254,
        stopLoss: 97000
      },
      {
        id: '2',
        type: 'breakout',
        asset: 'ORDI/USDT',
        action: 'buy',
        potentialProfit: 15.5,
        riskLevel: 'medium',
        confidence: 0.76,
        entryPrice: 75,
        targetPrice: 86.6,
        stopLoss: 72
      },
      {
        id: '3',
        type: 'trend',
        asset: 'ETH/USDT',
        action: 'sell',
        potentialProfit: 5.2,
        riskLevel: 'low',
        confidence: 0.82,
        entryPrice: 3456,
        targetPrice: 3276,
        stopLoss: 3520
      }
    ];
    setData({ opportunities, loading: false });
  }, []);

  return data;
}