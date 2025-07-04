'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  PieChart as PieIcon, BarChart3, Activity, Calendar,
  Download, Upload, AlertCircle, Trophy, Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useRunesPortfolio } from '@/hooks/runes/useRunesPortfolio';

export function RunesPortfolio() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: portfolioData, isLoading } = useRunesPortfolio();

  // Portfolio holdings data
  const holdings = [
    {
      name: 'DOG•GO•TO•THE•MOON',
      symbol: 'DOG',
      amount: 125000,
      avgCost: 0.0089,
      currentPrice: 0.0123,
      value: 1537.5,
      pnl: 478.75,
      pnlPercent: 45.2,
      allocation: 35.2
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
      allocation: 17.8
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
      allocation: 10.0
    },
    {
      name: 'MEME•WARFARE',
      symbol: 'MEME',
      amount: 150000,
      avgCost: 0.0038,
      currentPrice: 0.0045,
      value: 675.0,
      pnl: 105.0,
      pnlPercent: 18.4,
      allocation: 15.5
    },
    {
      name: 'PIZZA•NINJAS',
      symbol: 'PIZZA',
      amount: 200000,
      avgCost: 0.0029,
      currentPrice: 0.0034,
      value: 680.0,
      pnl: 100.0,
      pnlPercent: 17.2,
      allocation: 15.6
    }
  ];

  // Calculate totals
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;

  // Performance history
  const performanceHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = 3500;
    const variation = Math.sin(i / 5) * 200 + Math.random() * 100;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: baseValue + variation + (i * 20),
      btcValue: (baseValue + variation + (i * 20)) / 67000
    };
  });

  // Risk metrics
  const riskMetrics = {
    sharpeRatio: 1.85,
    sortinoRatio: 2.12,
    maxDrawdown: -12.5,
    volatility: 24.3,
    beta: 1.15,
    correlation: 0.78
  };

  // Tax calculation
  const taxCalculation = {
    shortTermGains: 245.50,
    longTermGains: 456.25,
    shortTermTax: 73.65,
    longTermTax: 68.44,
    totalTaxLiability: 142.09
  };

  // Allocation chart data
  const allocationData = holdings.map(h => ({
    name: h.symbol,
    value: h.allocation
  }));

  // P&L by asset
  const pnlByAsset = holdings.map(h => ({
    name: h.symbol,
    pnl: h.pnl,
    pnlPercent: h.pnlPercent
  }));

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(totalValue / 67000).toFixed(4)} BTC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">DOG</div>
            <p className="text-xs text-green-500 mt-1">+45.2% gain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground mt-1">4 of 5 profitable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Portfolio Tabs */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="tax">Tax Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          {/* Holdings Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Holdings</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rune</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-right p-2">Avg Cost</th>
                      <th className="text-right p-2">Current</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">P&L</th>
                      <th className="text-right p-2">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{holding.symbol}</p>
                            <p className="text-xs text-muted-foreground">{holding.name}</p>
                          </div>
                        </td>
                        <td className="text-right p-2">{holding.amount.toLocaleString()}</td>
                        <td className="text-right p-2">${holding.avgCost.toFixed(4)}</td>
                        <td className="text-right p-2">${holding.currentPrice.toFixed(4)}</td>
                        <td className="text-right p-2">${holding.value.toFixed(2)}</td>
                        <td className={`text-right p-2 ${holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <div>
                            <p>{holding.pnl >= 0 ? '+' : ''}{holding.pnl.toFixed(2)}</p>
                            <p className="text-xs">
                              {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                            </p>
                          </div>
                        </td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end gap-2">
                            <span>{holding.allocation.toFixed(1)}%</span>
                            <Progress value={holding.allocation} className="w-16 h-2" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>P&L by Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pnlByAsset}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {pnlByAsset.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Performance</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={false}
                    name="Value (USD)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="btcValue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Value (BTC)"
                  />
                  <ReferenceLine y={3500} yAxisId="left" stroke="#666" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Period Return</p>
                    <p className="text-xl font-bold text-green-500">+23.4%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">vs BTC</p>
                    <p className="text-xl font-bold text-green-500">+5.2%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Best Day</p>
                    <p className="text-xl font-bold">+8.7%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Worst Day</p>
                    <p className="text-xl font-bold text-red-500">-4.2%</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Sharpe Ratio</span>
                      <span className="text-sm font-medium">{riskMetrics.sharpeRatio}</span>
                    </div>
                    <Progress value={riskMetrics.sharpeRatio * 30} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {riskMetrics.sharpeRatio > 1.5 ? 'Excellent' : 'Good'} risk-adjusted returns
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Sortino Ratio</span>
                      <span className="text-sm font-medium">{riskMetrics.sortinoRatio}</span>
                    </div>
                    <Progress value={riskMetrics.sortinoRatio * 25} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Strong downside protection
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Max Drawdown</span>
                      <span className="text-sm font-medium text-red-500">{riskMetrics.maxDrawdown}%</span>
                    </div>
                    <Progress value={Math.abs(riskMetrics.maxDrawdown)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate maximum loss
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Volatility (Annual)</span>
                      <span className="text-sm font-medium">{riskMetrics.volatility}%</span>
                    </div>
                    <Progress value={riskMetrics.volatility} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {riskMetrics.volatility < 30 ? 'Moderate' : 'High'} volatility
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Correlation Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Market Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6">
                    <div className="relative inline-flex">
                      <svg className="w-32 h-32">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="8"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                        />
                        <circle
                          className="text-orange-500 stroke-current"
                          strokeWidth="8"
                          strokeDasharray={`${riskMetrics.correlation * 352} 352`}
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                          transform="rotate(-90 64 64)"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                        {riskMetrics.correlation.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">BTC Correlation</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Beta</span>
                      <span className="text-sm font-medium">{riskMetrics.beta}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {riskMetrics.beta > 1 ? 'More volatile than' : 'Less volatile than'} market
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation Helper</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Short-Term Gains</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Realized Gains</span>
                        <span>${taxCalculation.shortTermGains.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Rate</span>
                        <span>30%</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Tax Liability</span>
                        <span className="text-orange-500">${taxCalculation.shortTermTax.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Long-Term Gains</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Realized Gains</span>
                        <span>${taxCalculation.longTermGains.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Rate</span>
                        <span>15%</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Tax Liability</span>
                        <span className="text-orange-500">${taxCalculation.longTermTax.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Estimated Tax</span>
                    <span className="text-xl font-bold text-orange-500">
                      ${taxCalculation.totalTaxLiability.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is an estimate only. Please consult with a tax professional for accurate calculations.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}