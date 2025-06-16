/**
 * Performance Metrics Component
 * 
 * This component displays detailed performance metrics for the user's portfolio
 * including returns, profit/loss, risk metrics, and more.
 */

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Progress
} from '@/components/ui';
import { PortfolioMetrics } from '@/services/portfolio-service';
import { formatCurrency, formatPercentage, formatDate } from '@/utils/formatters';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: PortfolioMetrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const isPositiveReturn = metrics.allTimeReturnPct >= 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Returns</CardTitle>
            <CardDescription>Portfolio performance over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Daily</span>
              <span className={metrics.dailyChangePct >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(metrics.dailyChangePct)} ({formatCurrency(metrics.dailyChangeUsd)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Weekly</span>
              <span className={metrics.weeklyChangePct >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(metrics.weeklyChangePct)} ({formatCurrency(metrics.weeklyChangeUsd)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly</span>
              <span className={metrics.monthlyChangePct >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(metrics.monthlyChangePct)} ({formatCurrency(metrics.monthlyChangeUsd)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">All Time</span>
              <span className={metrics.allTimeReturnPct >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercentage(metrics.allTimeReturnPct)} ({formatCurrency(metrics.allTimeReturnUsd)})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss</CardTitle>
            <CardDescription>Portfolio profit and loss metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Cost Basis</span>
              <span>{formatCurrency(metrics.totalCostBasis)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Value</span>
              <span>{formatCurrency(metrics.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Unrealized P/L</span>
              <span className={metrics.unrealizedProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatCurrency(metrics.unrealizedProfitLoss)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Realized P/L</span>
              <span className={metrics.realizedProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatCurrency(metrics.realizedProfitLoss)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Portfolio distribution by asset type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Bitcoin</span>
                <span>{formatPercentage(metrics.assetAllocation.bitcoin)}</span>
              </div>
              <Progress value={metrics.assetAllocation.bitcoin} className="bg-gray-200 h-2">
                <div className="bg-[#F7931A] h-full" style={{ width: `${metrics.assetAllocation.bitcoin}%` }}></div>
              </Progress>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Ordinals</span>
                <span>{formatPercentage(metrics.assetAllocation.ordinals)}</span>
              </div>
              <Progress value={metrics.assetAllocation.ordinals} className="bg-gray-200 h-2">
                <div className="bg-[#6F4E37] h-full" style={{ width: `${metrics.assetAllocation.ordinals}%` }}></div>
              </Progress>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Runes</span>
                <span>{formatPercentage(metrics.assetAllocation.runes)}</span>
              </div>
              <Progress value={metrics.assetAllocation.runes} className="bg-gray-200 h-2">
                <div className="bg-[#9945FF] h-full" style={{ width: `${metrics.assetAllocation.runes}%` }}></div>
              </Progress>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>Portfolio risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Risk Score</span>
              <div className="flex items-center">
                <span className={`mr-2 ${metrics.riskScore > 7 ? 'text-red-500' : metrics.riskScore > 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {metrics.riskScore}/10
                </span>
                {metrics.riskScore > 7 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : metrics.riskScore > 4 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <BarChart3 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            {metrics.volatility !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Volatility</span>
                <span>{formatPercentage(metrics.volatility)}</span>
              </div>
            )}
            {metrics.sharpeRatio !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sharpe Ratio</span>
                <span>{metrics.sharpeRatio.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="text-sm">{formatDate(new Date(metrics.lastUpdated).getTime())}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
