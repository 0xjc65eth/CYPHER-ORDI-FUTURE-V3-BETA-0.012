'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Clock,
  DollarSign,
  Activity,
  Award,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';

interface PerformanceData {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  avgProfitPerTrade: number;
  avgLossPerTrade: number;
  maxDrawdown: number;
  maxProfit: number;
  sharpeRatio: number;
  profitFactor: number;
  avgHoldTime: number;
  totalVolume: number;
}

interface StrategyPerformance {
  name: string;
  trades: number;
  profit: number;
  winRate: number;
  avgProfit: number;
  enabled: boolean;
}

interface TradeHistory {
  id: string;
  timestamp: number;
  type: string;
  pair: string;
  strategy: string;
  entry: number;
  exit: number;
  profit: number;
  profitPercentage: number;
  duration: number;
  status: 'completed' | 'failed';
}

interface BotPerformanceAnalyticsProps {
  className?: string;
}

export default function BotPerformanceAnalytics({ className }: BotPerformanceAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');

  // Mock performance data
  const [performanceData] = useState<PerformanceData>({
    totalTrades: 1247,
    successfulTrades: 891,
    failedTrades: 356,
    totalProfit: 15420.50,
    totalLoss: 4230.25,
    netProfit: 11190.25,
    winRate: 0.714,
    avgProfitPerTrade: 17.31,
    avgLossPerTrade: -11.88,
    maxDrawdown: 0.085,
    maxProfit: 234.67,
    sharpeRatio: 2.45,
    profitFactor: 3.64,
    avgHoldTime: 42, // minutes
    totalVolume: 2456789.50
  });

  const [strategyPerformance] = useState<StrategyPerformance[]>([
    {
      name: 'Arbitrage',
      trades: 523,
      profit: 6250.30,
      winRate: 0.82,
      avgProfit: 11.95,
      enabled: true
    },
    {
      name: 'Trend Following',
      trades: 389,
      profit: 3890.45,
      winRate: 0.68,
      avgProfit: 10.00,
      enabled: true
    },
    {
      name: 'Mean Reversion',
      trades: 335,
      profit: 1049.50,
      winRate: 0.61,
      avgProfit: 3.13,
      enabled: true
    }
  ]);

  const [recentTrades] = useState<TradeHistory[]>([
    {
      id: '1',
      timestamp: Date.now() - 300000,
      type: 'arbitrage',
      pair: 'WETH/USDC',
      strategy: 'Arbitrage',
      entry: 2456.78,
      exit: 2463.45,
      profit: 45.23,
      profitPercentage: 0.27,
      duration: 120,
      status: 'completed'
    },
    {
      id: '2',
      timestamp: Date.now() - 600000,
      type: 'trend',
      pair: 'WBTC/USDC',
      strategy: 'Trend Following',
      entry: 45678.90,
      exit: 45890.12,
      profit: 67.89,
      profitPercentage: 0.46,
      duration: 1800,
      status: 'completed'
    },
    {
      id: '3',
      timestamp: Date.now() - 900000,
      type: 'meanReversion',
      pair: 'LINK/USDC',
      strategy: 'Mean Reversion',
      entry: 15.67,
      exit: 15.34,
      profit: -12.45,
      profitPercentage: -2.11,
      duration: 3600,
      status: 'failed'
    }
  ]);

  const OverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-green-600">
                ${performanceData.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-green-600">
              +{((performanceData.netProfit / 10000) * 100).toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold">
                {(performanceData.winRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <Progress value={performanceData.winRate * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold">{performanceData.totalTrades}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {performanceData.successfulTrades} successful
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sharpe Ratio</p>
              <p className="text-2xl font-bold">{performanceData.sharpeRatio.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <Badge variant={performanceData.sharpeRatio > 2 ? "default" : "secondary"}>
              {performanceData.sharpeRatio > 2 ? 'Excellent' : 'Good'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DetailedMetrics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Profit:</span>
                <span className="font-medium text-green-600">
                  ${performanceData.totalProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Loss:</span>
                <span className="font-medium text-red-600">
                  ${performanceData.totalLoss.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Profit/Trade:</span>
                <span className="font-medium">
                  ${performanceData.avgProfitPerTrade.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Drawdown:</span>
                <span className="font-medium text-red-600">
                  {(performanceData.maxDrawdown * 100).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profit Factor:</span>
                <span className="font-medium">
                  {performanceData.profitFactor.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Profit:</span>
                <span className="font-medium text-green-600">
                  ${performanceData.maxProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Hold Time:</span>
                <span className="font-medium">
                  {performanceData.avgHoldTime}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Volume:</span>
                <span className="font-medium">
                  ${(performanceData.totalVolume / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Strategy Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategyPerformance.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{strategy.name}</h4>
                    <p className="text-sm text-gray-600">{strategy.trades} trades</p>
                  </div>
                  <Badge variant={strategy.enabled ? "default" : "secondary"}>
                    {strategy.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Profit</div>
                    <div className="font-medium text-green-600">
                      ${strategy.profit.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Win Rate</div>
                    <div className="font-medium">
                      {(strategy.winRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Profit</div>
                    <div className="font-medium">
                      ${strategy.avgProfit.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <Progress value={strategy.winRate * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TradeHistoryTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTrades.map((trade) => (
            <div key={trade.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{trade.pair}</span>
                    <Badge variant="outline" className="text-xs">
                      {trade.strategy}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(trade.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </div>
                  <div className={`text-sm ${trade.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.profitPercentage >= 0 ? '+' : ''}{trade.profitPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Entry</div>
                  <div className="font-medium">${trade.entry.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Exit</div>
                  <div className="font-medium">${trade.exit.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Duration</div>
                  <div className="font-medium">{Math.round(trade.duration / 60)}m</div>
                </div>
                <div>
                  <div className="text-gray-600">Status</div>
                  <Badge 
                    variant={trade.status === 'completed' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {trade.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Trades
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const RiskMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {(performanceData.maxDrawdown * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-red-600">Max Drawdown</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {performanceData.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-sm text-blue-600">Sharpe Ratio</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Drawdown Risk</span>
              <span>{(performanceData.maxDrawdown * 100).toFixed(2)}%</span>
            </div>
            <Progress 
              value={performanceData.maxDrawdown * 100} 
              className="h-2"
            />
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <Badge variant={performanceData.maxDrawdown < 0.1 ? "default" : "destructive"}>
                {performanceData.maxDrawdown < 0.1 ? 'Low' : 'Moderate'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Risk/Reward Ratio:</span>
              <span>{(performanceData.avgProfitPerTrade / Math.abs(performanceData.avgLossPerTrade)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Volatility:</span>
              <span>Medium</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TimeframeSelector = () => (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <div className="flex gap-1">
        {(['1d', '7d', '30d', 'all'] as const).map((period) => (
          <Button
            key={period}
            variant={timeframe === period ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(period)}
          >
            {period === 'all' ? 'All Time' : period.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bot Performance Analytics</h2>
        <div className="flex items-center gap-4">
          <TimeframeSelector />
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewMetrics />
          <DetailedMetrics />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DetailedMetrics />
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <TradeHistoryTable />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskMetrics />
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart visualization would go here
                  <br />
                  (Integration with charting library needed)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}