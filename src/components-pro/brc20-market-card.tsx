/**
 * BRC-20 Market Card Component
 * 
 * Display BRC-20 market overview statistics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrdiscanData } from '@/hooks/useOrdiscanData';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface MarketStat {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
}

export const BRC20MarketCard: React.FC = () => {
  const { data: marketData, loading, error } = useOrdiscanData('/brc20/market');
  const [stats, setStats] = useState<MarketStat[]>([]);

  useEffect(() => {
    if (marketData) {
      setStats([
        {
          label: 'Market Cap',
          value: formatCurrency(marketData.market_cap || 0),
          change: marketData.market_cap_change_24h
        },
        {
          label: '24h Volume',
          value: formatCurrency(marketData.volume_24h || 0),
          change: marketData.volume_change_24h
        },
        {
          label: 'Total Tokens',
          value: (marketData.total_tokens || 0).toLocaleString(),
          prefix: ''
        },
        {
          label: 'Active Holders',
          value: (marketData.active_holders || 0).toLocaleString(),
          prefix: ''
        }
      ]);
    }
  }, [marketData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BRC-20 Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BRC-20 Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load market data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>BRC-20 Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">
                {stat.prefix}{stat.value}
              </p>
              {stat.change !== undefined && (
                <p className={`text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? '+' : ''}{formatPercentage(stat.change)}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BRC20MarketCard;