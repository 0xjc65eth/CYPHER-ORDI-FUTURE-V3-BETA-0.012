/**
 * BRC-20 Token List Component
 * 
 * Display a comprehensive list of BRC-20 tokens with filtering and sorting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { DataSourceManager } from '@/libs/lasereyes-core/src/lib/data-sources/manager';
import { Brc20Balance } from '@/libs/lasereyes-core/src/types/lasereyes';
import { formatCurrency } from '@/utils/formatters';

interface BRC20TokenListProps {
  showFilters?: boolean;
  limit?: number;
  className?: string;
}

export const BRC20TokenList: React.FC<BRC20TokenListProps> = ({
  showFilters = true,
  limit,
  className = ''
}) => {
  const { address, connected } = useWallet();
  const [balances, setBalances] = useState<Brc20Balance[]>([]);
  const [filteredBalances, setFilteredBalances] = useState<Brc20Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'ticker' | 'balance'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (connected && address) {
      fetchBRC20Balances();
    }
  }, [connected, address]);

  useEffect(() => {
    filterAndSortBalances();
  }, [balances, searchTerm, sortBy, sortOrder]);

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

  const filterAndSortBalances = () => {
    let filtered = [...balances];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(balance =>
        balance.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'ticker') {
        const comparison = a.ticker.localeCompare(b.ticker);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const aBalance = parseFloat(a.overall) || 0;
        const bBalance = parseFloat(b.overall) || 0;
        return sortOrder === 'asc' ? aBalance - bBalance : bBalance - aBalance;
      }
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredBalances(filtered);
  };

  const handleSort = (field: 'ticker' | 'balance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>BRC-20 Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your BRC-20 tokens
            </p>
            <Button>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>BRC-20 Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <CardTitle>BRC-20 Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchBRC20Balances} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>BRC-20 Tokens</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredBalances.length} of {balances.length} tokens
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Search tokens..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {filteredBalances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No tokens match your search' : 'No BRC-20 tokens found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left pb-3 cursor-pointer hover:text-orange-600"
                    onClick={() => handleSort('ticker')}
                  >
                    <span className="flex items-center gap-1">
                      Token
                      {sortBy === 'ticker' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                  <th 
                    className="text-right pb-3 cursor-pointer hover:text-orange-600"
                    onClick={() => handleSort('balance')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Balance
                      {sortBy === 'balance' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                  <th className="text-right pb-3">Available</th>
                  <th className="text-right pb-3">Transferable</th>
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map((balance, index) => (
                  <tr 
                    key={`${balance.ticker}-${index}`}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {balance.ticker.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{balance.ticker}</p>
                          <p className="text-xs text-muted-foreground">BRC-20 Token</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4">
                      <p className="font-medium">{balance.overall}</p>
                    </td>
                    <td className="text-right py-4">
                      <p className="text-sm text-muted-foreground">{balance.available}</p>
                    </td>
                    <td className="text-right py-4">
                      <p className="text-sm text-muted-foreground">
                        {balance.transferable === 'na' ? '-' : balance.transferable}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BRC20TokenList;