/**
 * RunesDEX Dashboard - Professional Trading Interface
 * Bloomberg Terminal Style for Runes Trading and Analytics
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Activity,
  Settings,
  RefreshCw,
  AlertTriangle,
  Target,
  Zap,
  PieChart,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Info
} from 'lucide-react';

import { runesService } from '@/services/runes';

// Mock types for dashboard functionality
interface LiquidityPool {
  id: string;
  tokenA: { symbol: string; name: string };
  tokenB: { symbol: string; name: string };
  reserveA: number;
  reserveB: number;
  fee: number;
  volume24h: number;
  apr: number;
}

interface RunesMarketMetrics {
  totalValueLocked: number;
  totalVolume24h: number;
  avgApyAcrossPools: number;
  topPerformingTokens: Array<{
    token: { id: string; symbol: string; name: string };
    priceChange24h: number;
    volume24h: number;
  }>;
}

interface TokenAnalysis {
  token: { id: string; symbol: string; name: string };
  priceChange24h: number;
  volume24h: number;
}

interface LiquidityPosition {
  id: string;
  poolId: string;
  totalValue: number;
  apr: number;
  impermanentLoss: number;
  uncollectedFeesA: number;
  uncollectedFeesB: number;
}

interface PortfolioMetrics {
  totalValue: number;
}

// Mock runesDEX service
const runesDEX = {
  connect: async () => {},
  disconnect: () => {},
  on: (event: string, callback: Function) => {},
  getPools: async (options?: any): Promise<LiquidityPool[]> => {
    return [
      {
        id: 'pool_1',
        tokenA: { symbol: 'BTC', name: 'Bitcoin' },
        tokenB: { symbol: 'RUNE', name: 'Rune Token' },
        reserveA: 1000000,
        reserveB: 2000000,
        fee: 300,
        volume24h: 50000,
        apr: 12.5
      }
    ];
  },
  getMarketMetrics: async (): Promise<RunesMarketMetrics> => {
    return {
      totalValueLocked: 10000000,
      totalVolume24h: 1000000,
      avgApyAcrossPools: 15.2,
      topPerformingTokens: [
        {
          token: { id: 'token_1', symbol: 'RUNE', name: 'Rune Token' },
          priceChange24h: 12.5,
          volume24h: 250000
        }
      ]
    };
  },
  getPositions: async (address: string): Promise<LiquidityPosition[]> => {
    return [];
  },
  getPortfolioMetrics: async (address: string): Promise<PortfolioMetrics> => {
    return { totalValue: 0 };
  }
};

const createRunesAnalytics = (data: any) => data;

interface DashboardState {
  pools: LiquidityPool[];
  marketMetrics: RunesMarketMetrics | null;
  userPositions: LiquidityPosition[];
  portfolioMetrics: PortfolioMetrics | null;
  selectedPool: LiquidityPool | null;
  loading: boolean;
  error: string | null;
  autoRefresh: boolean;
  lastUpdate: number;
}

export default function RunesDashboard() {
  const [state, setState] = useState<DashboardState>({
    pools: [],
    marketMetrics: null,
    userPositions: [],
    portfolioMetrics: null,
    selectedPool: null,
    loading: true,
    error: null,
    autoRefresh: true,
    lastUpdate: 0
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'positions' | 'analytics'>('overview');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const analytics = useMemo(() => createRunesAnalytics(runesDEX), []);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    connectToRunesDEX();

    return () => {
      runesDEX.disconnect();
    };
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [state.autoRefresh]);

  const connectToRunesDEX = async () => {
    try {
      await runesDEX.connect();
      
      // Listen to real-time updates
      runesDEX.on('poolUpdated', (pool) => {
        setState(prev => ({
          ...prev,
          pools: prev.pools.map(p => p.id === pool.id ? pool : p)
        }));
      });

      runesDEX.on('priceUpdate', () => {
        if (state.autoRefresh) {
          loadDashboardData();
        }
      });

    } catch (error) {
      console.error('Failed to connect to RunesDEX:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect to RunesDEX' }));
    }
  };

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [pools, marketMetrics] = await Promise.all([
        runesDEX.getPools({ sortBy: 'volume', sortOrder: 'desc' }),
        analytics.getMarketMetrics()
      ]);

      let userPositions: LiquidityPosition[] = [];
      let portfolioMetrics: PortfolioMetrics | null = null;

      if (walletAddress) {
        userPositions = await runesDEX.getUserPositions(walletAddress);
        portfolioMetrics = await analytics.getPortfolioMetrics(userPositions);
      }

      setState(prev => ({
        ...prev,
        pools,
        marketMetrics,
        userPositions,
        portfolioMetrics,
        loading: false,
        lastUpdate: Date.now()
      }));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const formatNumber = (value: number, decimals: number = 2): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const MarketOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-400 text-sm font-medium">Total Value Locked</p>
            <p className="text-white text-2xl font-bold">
              {state.marketMetrics ? formatCurrency(state.marketMetrics.totalValueLocked) : '--'}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-orange-400" />
        </div>
        <div className="mt-4 flex items-center text-green-400 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>+12.5% vs last week</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-400 text-sm font-medium">24H Volume</p>
            <p className="text-white text-2xl font-bold">
              {state.marketMetrics ? formatCurrency(state.marketMetrics.totalVolume24h) : '--'}
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-orange-400" />
        </div>
        <div className="mt-4 flex items-center text-red-400 text-sm">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span>-5.2% vs yesterday</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-400 text-sm font-medium">Active Pools</p>
            <p className="text-white text-2xl font-bold">{state.pools.length}</p>
          </div>
          <Activity className="w-8 h-8 text-orange-400" />
        </div>
        <div className="mt-4 flex items-center text-green-400 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>+3 new pools</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-400 text-sm font-medium">Avg APY</p>
            <p className="text-white text-2xl font-bold">
              {state.marketMetrics ? `${state.marketMetrics.avgApyAcrossPools.toFixed(1)}%` : '--'}
            </p>
          </div>
          <Target className="w-8 h-8 text-orange-400" />
        </div>
        <div className="mt-4 flex items-center text-green-400 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>High yield opportunity</span>
        </div>
      </motion.div>
    </div>
  );

  const PoolsTable = () => (
    <div className="bg-gray-900 border border-orange-500/30 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-orange-500/30">
        <h2 className="text-xl font-bold text-white flex items-center">
          <PieChart className="w-6 h-6 mr-2 text-orange-400" />
          Liquidity Pools
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                Pool
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                Liquidity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                Volume 24H
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                APR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {state.pools.slice(0, 10).map((pool, index) => (
              <motion.tr
                key={pool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-800 cursor-pointer"
                onClick={() => setState(prev => ({ ...prev, selectedPool: pool }))}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {pool.tokenA.symbol.slice(0, 2)}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {pool.tokenB.symbol.slice(0, 2)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {pool.tokenA.symbol}/{pool.tokenB.symbol}
                      </div>
                      <div className="text-sm text-gray-400">
                        Fee: {pool.fee / 100}%
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatCurrency(Number(pool.reserveA + pool.reserveB) / 1e8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatCurrency(pool.volume24h)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-200">
                    {pool.apr.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-orange-400 hover:text-orange-300 mr-4">
                    Add Liquidity
                  </button>
                  <button className="text-blue-400 hover:text-blue-300">
                    Swap
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PositionsTable = () => (
    <div className="bg-gray-900 border border-orange-500/30 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-orange-500/30">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wallet className="w-6 h-6 mr-2 text-orange-400" />
          Your Positions
        </h2>
      </div>
      
      {!walletAddress ? (
        <div className="p-8 text-center">
          <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Connect wallet to view your positions</p>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-64 mr-4"
          />
          <button
            onClick={loadDashboardData}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Load Positions
          </button>
        </div>
      ) : state.userPositions.length === 0 ? (
        <div className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No liquidity positions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  Pool
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  Position Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  APR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  IL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  Unclaimed Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {state.userPositions.map((position, index) => (
                <motion.tr
                  key={position.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      Pool #{position.poolId.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatCurrency(position.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-200">
                      {position.apr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getChangeColor(position.impermanentLoss)}`}>
                      {position.impermanentLoss >= 0 ? '+' : ''}{(position.impermanentLoss * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatNumber(Number(position.uncollectedFeesA + position.uncollectedFeesB) / 1e8, 6)} BTC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-400 hover:text-orange-300 mr-4">
                      Claim
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const TopPerformers = () => (
    <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-orange-400" />
        Top Performing Tokens
      </h3>
      
      <div className="space-y-4">
        {state.marketMetrics?.topPerformingTokens.slice(0, 5).map((token, index) => (
          <motion.div
            key={token.token.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {token.token.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-white font-medium">{token.token.symbol}</p>
                <p className="text-gray-400 text-sm">{token.token.name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`flex items-center ${getChangeColor(token.priceChange24h)}`}>
                {getChangeIcon(token.priceChange24h)}
                <span className="ml-1 font-medium">
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Vol: {formatCurrency(token.volume24h)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-orange-400">RUNES</span>DEX Dashboard
          </h1>
          <p className="text-gray-400">
            Professional AMM Trading Platform • Last updated: {new Date(state.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              state.autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${state.autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <button
            onClick={loadDashboardData}
            disabled={state.loading}
            className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900 border border-red-500 rounded-lg p-4 mb-6 flex items-center"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
          <span className="text-red-200">{state.error}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg border border-orange-500/30">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'pools', label: 'Pools', icon: PieChart },
          { id: 'positions', label: 'Positions', icon: Wallet },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <MarketOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PoolsTable />
              </div>
              <div>
                <TopPerformers />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pools' && (
          <motion.div
            key="pools"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PoolsTable />
          </motion.div>
        )}

        {activeTab === 'positions' && (
          <motion.div
            key="positions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PositionsTable />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <Info className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Advanced analytics coming soon...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {state.loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-8 flex items-center space-x-4">
            <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
            <span className="text-white">Loading RunesDEX data...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}