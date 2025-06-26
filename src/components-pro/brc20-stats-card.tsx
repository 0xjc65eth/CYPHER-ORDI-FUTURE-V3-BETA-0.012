/**
 * BRC-20 Stats Card Component
 * 
 * Display BRC-20 token statistics and balances
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import { DataSourceManager } from '@/libs/lasereyes-core/src/lib/data-sources/manager';
import { Brc20Balance } from '@/libs/lasereyes-core/src/types/lasereyes';
import { formatCurrency } from '@/utils/formatters';

interface BRC20StatsCardProps {
  title?: string;
  className?: string;
}

export const BRC20StatsCard: React.FC<BRC20StatsCardProps> = ({
  title = 'BRC-20 Tokens',
  className = ''
}) => {
  const { address, connected } = useWallet();
  const [balances, setBalances] = useState<Brc20Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && address) {
      fetchBRC20Balances();
    }
  }, [connected, address]);

  const fetchBRC20Balances = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const dataSourceManager = DataSourceManager.getInstance();
      const brc20Data = await dataSourceManager.getAddressBrc20Balances(address);
      setBalances(brc20Data || []);
    } catch (err) {
      console.error('Error fetching BRC-20 balances:', err);
      setError('Failed to fetch BRC-20 balances');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalValue = () => {
    // This would typically calculate based on current market prices
    // For now, returning a placeholder
    return 0;
  };

  if (!connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view BRC-20 tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {balances.length} tokens
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {balances.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No BRC-20 tokens found
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              {balances.map((balance, index) => (
                <BRC20TokenRow key={`${balance.ticker}-${index}`} balance={balance} />
              ))}
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(calculateTotalValue())}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface BRC20TokenRowProps {
  balance: Brc20Balance;
}

const BRC20TokenRow: React.FC<BRC20TokenRowProps> = ({ balance }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            {balance.ticker.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium text-sm">{balance.ticker}</p>
          <p className="text-xs text-muted-foreground">BRC-20</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{balance.overall}</p>
        <p className="text-xs text-muted-foreground">
          Available: {balance.available}
        </p>
      </div>
    </div>
  );
};

export default BRC20StatsCard;