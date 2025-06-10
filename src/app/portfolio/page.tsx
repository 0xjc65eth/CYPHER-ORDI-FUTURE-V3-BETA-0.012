'use client';

import { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { ProfessionalPortfolio } from './ProfessionalPortfolio';
import { devLogger } from '@/lib/logger';
import { useWallet } from '@/contexts/WalletContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BitcoinWalletConnect } from '@/components/wallet/BitcoinWalletConnect';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, Shield, BarChart3, 
  Target, Award, Bitcoin, Gem, Sparkles, RefreshCw, Download,
  AlertTriangle, Activity, Clock, Hash, Eye, EyeOff 
} from 'lucide-react';
import { useBitcoinPrice } from '@/hooks/cache';
import { useBitcoinWallet } from '@/hooks/useBitcoinWallet';
import { format } from 'date-fns';

// Enhanced mock portfolio data with more comprehensive structure
const enhancedMockPortfolio = {
  totalValue: {
    usd: 325750.80,
    btc: 7.756,
    change24h: 8.23,
    change7d: 15.67,
    change30d: 45.12
  },
  assets: {
    bitcoin: {
      amount: 7.50,
      value: 315000,
      avgBuyPrice: 38500,
      currentPrice: 42000,
      pnl: 26250,
      pnlPercentage: 9.09,
      percentage: 96.7,
      icon: '₿',
      color: '#f97316',
      transactions: 15
    },
    ordinals: {
      count: 12,
      totalValue: 8250,
      floorValue: 6800,
      bestPerformer: 'Bitcoin Punks #1337',
      pnl: 2450,
      pnlPercentage: 42.3,
      percentage: 2.5,
      icon: '🎨',
      color: '#8b5cf6',
      collections: [
        { name: 'Bitcoin Punks', count: 3, value: 4500, floor: 1200 },
        { name: 'Ordinal Maxi Biz', count: 2, value: 2200, floor: 800 },
        { name: 'Bitcoin Wizards', count: 4, value: 1200, floor: 250 },
        { name: 'NodeMonkes', count: 3, value: 350, floor: 100 }
      ]
    },
    runes: {
      tokens: 5,
      totalValue: 2250.80,
      totalAmount: 125000,
      bestPerformer: 'UNCOMMON•GOODS',
      pnl: -150,
      pnlPercentage: -6.25,
      percentage: 0.7,
      icon: 'ᚱ',
      color: '#10b981',
      holdings: [
        { symbol: 'UNCOMMON•GOODS', amount: 50000, value: 1500, pnl: 200 },
        { symbol: 'RSIC•GENESIS•RUNE', amount: 25000, value: 400, pnl: -100 },
        { symbol: 'MEME•COIN', amount: 30000, value: 250, pnl: -150 },
        { symbol: 'SATOSHI•NAKAMOTO', amount: 15000, value: 80, pnl: -50 },
        { symbol: 'BITCOIN•PIZZA', amount: 5000, value: 20.80, pnl: -50 }
      ]
    },
    brc20: {
      tokens: 3,
      totalValue: 250,
      holdings: [
        { symbol: 'ordi', amount: 100, value: 150, pnl: 50 },
        { symbol: 'sats', amount: 1000000, value: 80, pnl: 10 },
        { symbol: 'rats', amount: 50000, value: 20, pnl: -40 }
      ],
      percentage: 0.1,
      icon: '🪙',
      color: '#fbbf24'
    }
  },
  transactions: [
    { date: '2024-12-10', type: 'Buy', asset: 'Bitcoin', amount: 0.5, price: 42000, total: 21000, fee: 15.50, hash: 'abc123' },
    { date: '2024-12-09', type: 'Mint', asset: 'Bitcoin Punks #1337', amount: 1, price: 1200, total: 1200, fee: 25.80, hash: 'def456' },
    { date: '2024-12-08', type: 'Buy', asset: 'UNCOMMON•GOODS', amount: 10000, price: 0.03, total: 300, fee: 8.20, hash: 'ghi789' },
    { date: '2024-12-07', type: 'Buy', asset: 'Bitcoin', amount: 1.0, price: 41500, total: 41500, fee: 28.75, hash: 'jkl012' },
    { date: '2024-12-06', type: 'Sell', asset: 'ordi', amount: 50, price: 2.1, total: 105, fee: 4.20, hash: 'mno345' },
    { date: '2024-12-05', type: 'Mint', asset: 'NodeMonkes #567', amount: 1, price: 120, total: 120, fee: 18.40, hash: 'pqr678' }
  ],
  performanceHistory: [
    { date: '2024-11-10', value: 285000, btcPrice: 38000 },
    { date: '2024-11-17', value: 295800, btcPrice: 39300 },
    { date: '2024-11-24', value: 308200, btcPrice: 40100 },
    { date: '2024-12-01', value: 312500, btcPrice: 40800 },
    { date: '2024-12-08', value: 325750, btcPrice: 42000 }
  ],
  analytics: {
    sharpeRatio: 2.15,
    maxDrawdown: -8.5,
    volatility: 28.3,
    riskScore: 'Medium',
    diversificationScore: 75,
    holdingPeriod: 180,
    winRate: 72,
    totalFees: 186.85,
    averageTransactionSize: 10704
  }
};

export default function PortfolioPage() {
  const [portfolioMode, setPortfolioMode] = useState<'professional' | 'simplified'>('professional');
  const [portfolioData, setPortfolioData] = useState(enhancedMockPortfolio);
  const [loading, setLoading] = useState(false);
  const [showMockData, setShowMockData] = useState(true);
  
  const { data: btcPrice } = useBitcoinPrice();
  const wallet = useWallet();
  const bitcoinWallet = useBitcoinWallet();

  useEffect(() => {
    devLogger.log('PAGE', 'Enhanced Portfolio page loaded');
    devLogger.progress('Portfolio Page Enhancement', 100);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Show professional portfolio if wallet is connected
  if (portfolioMode === 'professional') {
    return (
      <TopNavLayout>
        <div className="space-y-6">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Professional Portfolio Analytics
                  <Badge variant="outline" className="ml-3 text-orange-400 border-orange-600">
                    ENHANCED
                  </Badge>
                </h1>
                <p className="text-gray-400 text-lg">
                  Real-time Bitcoin ecosystem portfolio tracking with advanced analytics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowMockData(!showMockData)}
                  variant="outline" 
                  className="border-gray-600"
                >
                  {showMockData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showMockData ? 'Hide Demo' : 'Show Demo'}
                </Button>
                <Button 
                  onClick={() => setPortfolioMode('simplified')}
                  variant="ghost" 
                  className="text-gray-400"
                >
                  Switch to Simple View
                </Button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Real-time Analytics</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Risk Assessment</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Performance Metrics</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-300">Multi-Asset Support</p>
              </div>
            </div>
          </div>

          {/* Portfolio Content */}
          {showMockData ? (
            <ProfessionalPortfolio />
          ) : (
            <Card className="bg-gray-900 border-gray-700 p-16 text-center">
              <Shield className="w-20 h-20 text-orange-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Bitcoin Wallet</h2>
              <p className="text-gray-400 text-lg mb-8">Access your real portfolio data and advanced analytics</p>
              <div className="max-w-md mx-auto">
                <BitcoinWalletConnect />
              </div>
            </Card>
          )}
        </div>
      </TopNavLayout>
    );
  }

  // Simplified Portfolio View
  return (
    <TopNavLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio Tracker</h1>
            <p className="text-gray-400">Track your Bitcoin ecosystem investments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setPortfolioMode('professional')}
              variant="outline" 
              className="border-orange-600 text-orange-400"
            >
              Upgrade to Professional
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">Total Portfolio Value</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatCurrency(portfolioData.totalValue.usd)}</div>
              <div className="text-sm text-gray-400">{portfolioData.totalValue.btc} BTC</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-gray-400">24h Change</span>
              </div>
              <div className={`text-3xl font-bold ${portfolioData.totalValue.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioData.totalValue.change24h > 0 ? '+' : ''}{portfolioData.totalValue.change24h}%
              </div>
              <div className="text-sm text-gray-400">
                {portfolioData.totalValue.change24h > 0 ? '+' : ''}{formatCurrency(portfolioData.totalValue.usd * portfolioData.totalValue.change24h / 100)}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">Current BTC Price</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {btcPrice ? formatCurrency(btcPrice.price) : formatCurrency(42000)}
              </div>
              <div className="text-sm text-gray-400">
                {btcPrice && btcPrice.change24h ? (btcPrice.change24h > 0 ? '+' : '') + btcPrice.change24h.toFixed(2) + '%' : '+2.45%'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-gray-400">Total Assets</span>
              </div>
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-sm text-gray-400">Types held</div>
            </div>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
            <h2 className="text-xl font-semibold text-orange-500 mb-4">Asset Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bitcoin', value: portfolioData.assets.bitcoin.percentage, color: '#f97316' },
                    { name: 'Ordinals', value: portfolioData.assets.ordinals.percentage, color: '#8b5cf6' },
                    { name: 'Runes', value: portfolioData.assets.runes.percentage, color: '#10b981' },
                    { name: 'BRC-20', value: portfolioData.assets.brc20.percentage, color: '#fbbf24' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[portfolioData.assets.bitcoin, portfolioData.assets.ordinals, portfolioData.assets.runes, portfolioData.assets.brc20].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
            <h2 className="text-xl font-semibold text-orange-500 mb-4">Holdings Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bitcoin className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="text-white font-medium">Bitcoin</div>
                    <div className="text-sm text-gray-400">{portfolioData.assets.bitcoin.amount} BTC</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(portfolioData.assets.bitcoin.value)}</div>
                  <div className="text-sm text-green-400">+{portfolioData.assets.bitcoin.pnlPercentage}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gem className="w-6 h-6 text-purple-500" />
                  <div>
                    <div className="text-white font-medium">Ordinals</div>
                    <div className="text-sm text-gray-400">{portfolioData.assets.ordinals.count} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(portfolioData.assets.ordinals.totalValue)}</div>
                  <div className="text-sm text-green-400">+{portfolioData.assets.ordinals.pnlPercentage}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="text-white font-medium">Runes</div>
                    <div className="text-sm text-gray-400">{portfolioData.assets.runes.tokens} tokens</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(portfolioData.assets.runes.totalValue)}</div>
                  <div className="text-sm text-red-400">{portfolioData.assets.runes.pnlPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
          <h2 className="text-xl font-semibold text-orange-500 mb-4">Portfolio Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioData.performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #f97316' }}
                labelStyle={{ color: '#f97316' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ fill: '#f97316', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
          <h2 className="text-xl font-semibold text-orange-500 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Fee</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.transactions.slice(0, 6).map((tx, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-3 text-gray-400">{format(new Date(tx.date), 'MMM dd')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'Buy' || tx.type === 'Mint' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-white">{tx.asset}</td>
                    <td className="py-3 text-white">{formatNumber(tx.amount, 4)}</td>
                    <td className="py-3 text-gray-400">{formatCurrency(tx.price)}</td>
                    <td className="py-3 text-white font-medium">{formatCurrency(tx.total)}</td>
                    <td className="py-3 text-gray-400">${tx.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Sharpe Ratio</span>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioData.analytics.sharpeRatio}</p>
            <p className="text-xs text-gray-400">Risk-adjusted returns</p>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioData.analytics.winRate}%</p>
            <p className="text-xs text-gray-400">Successful trades</p>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400 text-sm">Avg Hold</span>
            </div>
            <p className="text-2xl font-bold text-white">{portfolioData.analytics.holdingPeriod}d</p>
            <p className="text-xs text-gray-400">Holding period</p>
          </Card>

          <Card className="bg-gray-900 border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Total Fees</span>
            </div>
            <p className="text-2xl font-bold text-white">${portfolioData.analytics.totalFees}</p>
            <p className="text-xs text-gray-400">Network costs</p>
          </Card>
        </div>
      </div>
    </TopNavLayout>
  );
}