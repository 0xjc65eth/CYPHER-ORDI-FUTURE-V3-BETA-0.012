'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ExternalLink,
  Eye
} from 'lucide-react';

interface WhaleTransaction {
  id: string;
  address: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  asset: string;
  valueUSD: number;
  timestamp: Date;
  exchange?: string;
  toAddress?: string;
}

export function WhaleTracker() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([
    {
      id: '1',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      type: 'buy',
      amount: 150.5,
      asset: 'BTC',
      valueUSD: 15725250,
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      exchange: 'Binance'
    },
    {
      id: '2',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      type: 'sell',
      amount: 2500,
      asset: 'ETH',
      valueUSD: 5712500,
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      exchange: 'Coinbase'
    },
    {
      id: '3',
      address: '3FupnQyuTkiKnyeGzbDh8df8DpZTd9xunq',
      type: 'transfer',
      amount: 89.3,
      asset: 'BTC',
      valueUSD: 9332350,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      toAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'transfer'>('all');
  const [timeframe, setTimeframe] = useState('1h');

  // Simulate real-time whale transactions
  useEffect(() => {
    const addRandomTransaction = () => {
      const types: WhaleTransaction['type'][] = ['buy', 'sell', 'transfer'];
      const assets = ['BTC', 'ETH', 'SOL'];
      const exchanges = ['Binance', 'Coinbase', 'OKX', 'Kraken'];
      
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      const randomExchange = randomType !== 'transfer' ? 
        exchanges[Math.floor(Math.random() * exchanges.length)] : undefined;

      const basePrice = randomAsset === 'BTC' ? 104500 : 
                       randomAsset === 'ETH' ? 2285 : 98.75;
      const amount = Math.random() * 100 + 10;
      const valueUSD = amount * basePrice;

      const newTransaction: WhaleTransaction = {
        id: Date.now().toString(),
        address: generateRandomAddress(),
        type: randomType,
        amount: amount,
        asset: randomAsset,
        valueUSD: valueUSD,
        timestamp: new Date(),
        exchange: randomExchange,
        toAddress: randomType === 'transfer' ? generateRandomAddress() : undefined
      };

      if (valueUSD > 1000000) { // Only show transactions > $1M
        setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
      }
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        addRandomTransaction();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateRandomAddress = (): string => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = Math.random() > 0.5 ? '1' : 'bc1q';
    const length = result.startsWith('bc1q') ? 35 : 25;
    
    for (let i = result.length; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getTransactionIcon = (type: WhaleTransaction['type']) => {
    switch (type) {
      case 'buy':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'sell':
        return <ArrowDownLeft className="w-4 h-4 text-red-400" />;
      case 'transfer':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTransactionColor = (type: WhaleTransaction['type']): string => {
    switch (type) {
      case 'buy':
        return 'border-l-green-500 bg-green-500/5';
      case 'sell':
        return 'border-l-red-500 bg-red-500/5';
      case 'transfer':
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const filteredTransactions = filter === 'all' ? 
    transactions : transactions.filter(tx => tx.type === filter);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-medium">Whale Activity</h4>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
          Live
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {['all', 'buy', 'sell', 'transfer'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(filterType as any)}
            className="h-6 px-2 text-xs capitalize"
          >
            {filterType}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredTransactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border-l-4 ${getTransactionColor(tx.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTransactionIcon(tx.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-700/50 text-gray-300 text-xs">
                      {tx.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatAddress(tx.address)}
                    </span>
                  </div>
                  {tx.exchange && (
                    <p className="text-xs text-gray-500 mt-1">
                      via {tx.exchange}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-sm">
                  {tx.amount.toFixed(2)} {tx.asset}
                </p>
                <p className="text-xs text-gray-400">
                  {formatValue(tx.valueUSD)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">
                  {formatTimeAgo(tx.timestamp)}
                </span>
                {tx.toAddress && (
                  <>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-400">
                      {formatAddress(tx.toAddress)}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Total Inflow</span>
          </div>
          <p className="font-medium">$127.5M</p>
        </div>
        
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3 text-red-400" />
            <span className="text-gray-400">Total Outflow</span>
          </div>
          <p className="font-medium">$89.2M</p>
        </div>
      </div>
    </div>
  );
}