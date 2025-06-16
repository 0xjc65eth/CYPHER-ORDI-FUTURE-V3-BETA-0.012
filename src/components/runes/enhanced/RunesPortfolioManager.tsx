'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  BarChart3, ArrowUpRight, ArrowDownRight, History,
  Target, Zap, Shield, AlertCircle, RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { runesService, type RunesPortfolioItem } from '@/services/runes';

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  topPerformer: RunesPortfolioItem | null;
  worstPerformer: RunesPortfolioItem | null;
  diversificationScore: number;
}

export function RunesPortfolioManager() {
  const [portfolio, setPortfolio] = useState<RunesPortfolioItem[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'pnlPercentage'>('value');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        const portfolioData = await runesService.getRunesPortfolio(walletAddress || undefined);
        setPortfolio(portfolioData);
        calculateMetrics(portfolioData);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [walletAddress]);

  const calculateMetrics = (portfolioData: RunesPortfolioItem[]) => {
    if (portfolioData.length === 0) {
      setPortfolioMetrics(null);
      return;
    }

    const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
    const totalPnL = portfolioData.reduce((sum, item) => sum + item.pnl, 0);
    const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

    const sortedByPnL = [...portfolioData].sort((a, b) => b.pnlPercentage - a.pnlPercentage);
    const topPerformer = sortedByPnL[0];
    const worstPerformer = sortedByPnL[sortedByPnL.length - 1];

    // Calculate diversification score (1-10, 10 being most diversified)
    const totalHoldings = portfolioData.length;
    const valueDistribution = portfolioData.map(item => item.value / totalValue);
    const herfindahlIndex = valueDistribution.reduce((sum, share) => sum + share * share, 0);
    const diversificationScore = Math.max(1, Math.min(10, (1 - herfindahlIndex) * 10));

    setPortfolioMetrics({
      totalValue,
      totalPnL,
      totalPnLPercentage,
      topPerformer,
      worstPerformer,
      diversificationScore
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    switch (sortBy) {
      case 'value': return b.value - a.value;
      case 'pnl': return b.pnl - a.pnl;
      case 'pnlPercentage': return b.pnlPercentage - a.pnlPercentage;
      default: return 0;
    }
  });

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const portfolioDistribution = portfolio.map((item, index) => ({
    name: item.symbol,
    value: item.value,
    percentage: portfolioMetrics ? (item.value / portfolioMetrics.totalValue) * 100 : 0,
    color: COLORS[index % COLORS.length]
  }));

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${formatNumber(portfolioMetrics.totalValue)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            portfolioMetrics.totalPnL >= 0 
              ? 'from-green-900/20 to-green-800/20 border-green-500/20' 
              : 'from-red-900/20 to-red-800/20 border-red-500/20'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${
                    portfolioMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {portfolioMetrics.totalPnL >= 0 ? '+' : ''}${formatNumber(portfolioMetrics.totalPnL)}
                  </p>
                  <p className={`text-xs ${
                    portfolioMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {portfolioMetrics.totalPnL >= 0 ? '+' : ''}{portfolioMetrics.totalPnLPercentage.toFixed(2)}%
                  </p>
                </div>
                {portfolioMetrics.totalPnL >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Holdings</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {portfolio.length}
                  </p>
                  <p className="text-xs text-purple-400">
                    Runes
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Diversification</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {portfolioMetrics.diversificationScore.toFixed(1)}/10
                  </p>
                  <Progress 
                    value={portfolioMetrics.diversificationScore * 10} 
                    className="h-2 mt-1"
                  />
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Portfolio Interface */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <Wallet className="h-5 w-5" />
            Runes Portfolio Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="holdings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-400">Sort by:</span>
                <div className="flex gap-2">
                  {(['value', 'pnl', 'pnlPercentage'] as const).map((option) => (
                    <Button
                      key={option}
                      variant={sortBy === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option)}
                      className={sortBy === option ? "bg-orange-500 text-black" : ""}
                    >
                      {option === 'pnlPercentage' ? 'P&L %' : option.toUpperCase()}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                {sortedPortfolio.map((item) => (
                  <Card key={item.runeId} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {item.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{item.symbol}</h3>
                            <p className="text-sm text-gray-400">{item.name}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            ${formatNumber(item.value)}
                          </div>
                          <div className={`text-sm font-bold flex items-center gap-1 ${
                            item.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.pnl >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {item.pnl >= 0 ? '+' : ''}${formatNumber(item.pnl)} ({item.pnlPercentage.toFixed(2)}%)
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                        <div>
                          <span className="text-xs text-gray-400">Balance</span>
                          <div className="font-mono text-sm text-white">
                            {formatNumber(item.balance)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Avg Buy Price</span>
                          <div className="font-mono text-sm text-gray-300">
                            ${formatPrice(item.averageBuyPrice)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Transactions</span>
                          <div className="text-sm text-blue-400">
                            {item.transactions.length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {portfolioMetrics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Portfolio Distribution */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Portfolio Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={portfolioDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => percentage > 5 ? `${name}` : ''}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {portfolioDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                              formatter={(value: any) => [`$${formatNumber(value)}`, 'Value']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {portfolioDistribution.slice(0, 8).map((item, index) => (
                            <div key={item.name} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-300">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  ${formatNumber(item.value)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {item.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Highlights */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Performance Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {portfolioMetrics.topPerformer && (
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-400">Best Performer</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">{portfolioMetrics.topPerformer.symbol}</span>
                            <span className="text-green-400 font-bold">
                              +{portfolioMetrics.topPerformer.pnlPercentage.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            ${formatNumber(portfolioMetrics.topPerformer.value)} value
                          </div>
                        </div>
                      )}

                      {portfolioMetrics.worstPerformer && (
                        <div className="bg-red-500/10 p-3 rounded border border-red-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-semibold text-red-400">Needs Attention</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">{portfolioMetrics.worstPerformer.symbol}</span>
                            <span className="text-red-400 font-bold">
                              {portfolioMetrics.worstPerformer.pnlPercentage.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            ${formatNumber(portfolioMetrics.worstPerformer.value)} value
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-400">Risk Assessment</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Diversification</span>
                            <Badge className={
                              portfolioMetrics.diversificationScore >= 7 
                                ? 'bg-green-500/20 text-green-400'
                                : portfolioMetrics.diversificationScore >= 4
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }>
                              {portfolioMetrics.diversificationScore >= 7 ? 'Good' : 
                               portfolioMetrics.diversificationScore >= 4 ? 'Moderate' : 'Poor'}
                            </Badge>
                          </div>
                          <Progress 
                            value={portfolioMetrics.diversificationScore * 10} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="space-y-4">
                {portfolio.map((item) => (
                  <Card key={item.runeId} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{item.symbol}</span>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {item.transactions.length} transactions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {item.transactions.slice(0, 5).map((tx, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  tx.type === 'buy' || tx.type === 'mint' 
                                    ? 'bg-green-500/20 text-green-400'
                                    : tx.type === 'sell'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }
                              >
                                {tx.type.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-300">
                                {formatNumber(tx.amount)} @ ${formatPrice(tx.price)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Holdings Value Chart */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Holdings Value Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={portfolio.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="symbol" 
                          stroke="#9CA3AF"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#9CA3AF" tickFormatter={formatNumber} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          formatter={(value: any) => [`$${formatNumber(value)}`, 'Value']}
                        />
                        <Bar dataKey="value" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* P&L Analysis */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">P&L Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={portfolio.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="symbol" 
                          stroke="#9CA3AF"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          formatter={(value: any) => [`${value.toFixed(2)}%`, 'P&L %']}
                        />
                        <Bar 
                          dataKey="pnlPercentage" 
                          fill={(entry: any) => entry.pnlPercentage >= 0 ? '#10b981' : '#ef4444'}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}