'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface RuneHolding {
  name: string;
  symbol: string;
  amount: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  firstPurchase: Date;
  lastPurchase: Date;
  transactions: {
    type: 'buy' | 'sell';
    amount: number;
    price: number;
    fee: number;
    timestamp: Date;
    txid: string;
  }[];
}

interface PortfolioData {
  holdings: RuneHolding[];
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  btcValue: number;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
  metrics: {
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    volatility: number;
    winRate: number;
  };
}

export function useRunesPortfolio() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  const fetchPortfolioData = async () => {
    // Mock implementation - in production, fetch from wallet connection
    const holdings: RuneHolding[] = [
      {
        name: 'DOG•GO•TO•THE•MOON',
        symbol: 'DOG',
        amount: 125000,
        avgCost: 0.0089,
        currentPrice: 0.0123,
        value: 1537.5,
        pnl: 425.0,
        pnlPercent: 38.2,
        allocation: 0,
        firstPurchase: new Date('2024-01-15'),
        lastPurchase: new Date('2024-02-20'),
        transactions: [
          {
            type: 'buy',
            amount: 50000,
            price: 0.0085,
            fee: 0.0001,
            timestamp: new Date('2024-01-15'),
            txid: 'abc123...'
          },
          {
            type: 'buy',
            amount: 75000,
            price: 0.0092,
            fee: 0.00015,
            timestamp: new Date('2024-02-20'),
            txid: 'def456...'
          }
        ]
      },
      {
        name: 'UNCOMMON•GOODS',
        symbol: 'GOODS',
        amount: 87500,
        avgCost: 0.0076,
        currentPrice: 0.0089,
        value: 778.75,
        pnl: 113.75,
        pnlPercent: 17.1,
        allocation: 0,
        firstPurchase: new Date('2024-01-20'),
        lastPurchase: new Date('2024-02-15'),
        transactions: []
      },
      {
        name: 'RSIC•METAPROTOCOL',
        symbol: 'RSIC',
        amount: 65000,
        avgCost: 0.0071,
        currentPrice: 0.0067,
        value: 435.5,
        pnl: -26.0,
        pnlPercent: -5.6,
        allocation: 0,
        firstPurchase: new Date('2024-02-01'),
        lastPurchase: new Date('2024-02-01'),
        transactions: []
      }
    ];

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.amount * h.avgCost), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = (totalPnL / totalCost) * 100;

    // Calculate allocations
    holdings.forEach(h => {
      h.allocation = (h.value / totalValue) * 100;
    });

    const mockData: PortfolioData = {
      holdings,
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      btcValue: totalValue / 67000,
      performance: {
        day: 2.3,
        week: 8.7,
        month: 23.4,
        year: 156.8
      },
      metrics: {
        sharpeRatio: 1.85,
        sortinoRatio: 2.12,
        maxDrawdown: -12.5,
        volatility: 24.3,
        winRate: holdings.filter(h => h.pnl > 0).length / holdings.length * 100
      }
    };

    return mockData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['runesPortfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 10000,
  });

  // Simulate real-time price updates
  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      setPortfolioData(prev => {
        if (!prev) return data;
        
        const updated = { ...prev };
        updated.holdings = updated.holdings.map(holding => {
          const priceChange = (Math.random() - 0.5) * 0.0002;
          const newPrice = holding.currentPrice + priceChange;
          const newValue = holding.amount * newPrice;
          const newPnL = newValue - (holding.amount * holding.avgCost);
          const newPnLPercent = (newPnL / (holding.amount * holding.avgCost)) * 100;
          
          return {
            ...holding,
            currentPrice: newPrice,
            value: newValue,
            pnl: newPnL,
            pnlPercent: newPnLPercent
          };
        });
        
        // Recalculate totals
        updated.totalValue = updated.holdings.reduce((sum, h) => sum + h.value, 0);
        updated.totalPnL = updated.totalValue - updated.totalCost;
        updated.totalPnLPercent = (updated.totalPnL / updated.totalCost) * 100;
        updated.btcValue = updated.totalValue / 67000;
        
        // Update allocations
        updated.holdings.forEach(h => {
          h.allocation = (h.value / updated.totalValue) * 100;
        });
        
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  return {
    data: portfolioData || data,
    isLoading,
    error,
    refetch
  };
}