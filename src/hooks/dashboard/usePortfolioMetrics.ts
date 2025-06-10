import { useState, useEffect } from 'react';

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  cost: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  var95: number;
  expectedReturn: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  assets: Asset[];
  riskMetrics: RiskMetrics;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

export function usePortfolioMetrics() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock portfolio data
        const mockAssets: Asset[] = [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            amount: 1.5,
            value: 97500,
            cost: 75000,
            pnl: 22500,
            pnlPercent: 30,
            allocation: 60
          },
          {
            symbol: 'ORDI',
            name: 'Ordinals',
            amount: 1000,
            value: 32500,
            cost: 20000,
            pnl: 12500,
            pnlPercent: 62.5,
            allocation: 20
          },
          {
            symbol: 'RUNE',
            name: 'Runes',
            amount: 5000,
            value: 16250,
            cost: 15000,
            pnl: 1250,
            pnlPercent: 8.33,
            allocation: 10
          },
          {
            symbol: 'SATS',
            name: 'Satoshis',
            amount: 10000000,
            value: 16250,
            cost: 18000,
            pnl: -1750,
            pnlPercent: -9.72,
            allocation: 10
          }
        ];

        const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
        const totalCost = mockAssets.reduce((sum, asset) => sum + asset.cost, 0);
        const totalPnL = totalValue - totalCost;
        const totalPnLPercent = (totalPnL / totalCost) * 100;

        setMetrics({
          totalValue,
          totalCost,
          totalPnL,
          totalPnLPercent,
          assets: mockAssets,
          riskMetrics: {
            sharpeRatio: 1.85,
            maxDrawdown: -15.2,
            volatility: 24.5,
            beta: 0.95,
            var95: -8.5,
            expectedReturn: 28.5
          },
          performance: {
            day: 2.5,
            week: 8.3,
            month: 15.2,
            year: 45.8
          }
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch portfolio data');
        setLoading(false);
      }
    };

    fetchPortfolioData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => {
        if (!prev) return null;
        
        // Simulate small price changes
        const updatedAssets = prev.assets.map(asset => {
          const priceChange = (Math.random() - 0.5) * 0.02; // ±2% change
          const newValue = asset.value * (1 + priceChange);
          const newPnL = newValue - asset.cost;
          const newPnLPercent = (newPnL / asset.cost) * 100;
          
          return {
            ...asset,
            value: newValue,
            pnl: newPnL,
            pnlPercent: newPnLPercent
          };
        });

        const newTotalValue = updatedAssets.reduce((sum, asset) => sum + asset.value, 0);
        const newTotalPnL = newTotalValue - prev.totalCost;
        const newTotalPnLPercent = (newTotalPnL / prev.totalCost) * 100;

        return {
          ...prev,
          totalValue: newTotalValue,
          totalPnL: newTotalPnL,
          totalPnLPercent: newTotalPnLPercent,
          assets: updatedAssets
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}