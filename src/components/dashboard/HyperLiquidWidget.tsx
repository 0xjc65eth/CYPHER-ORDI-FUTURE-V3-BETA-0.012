'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Target,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { useHyperLiquid } from '@/hooks/useHyperLiquid';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';

interface HyperLiquidWidgetProps {
  showFullData?: boolean;
  className?: string;
}

const HyperLiquidWidget: React.FC<HyperLiquidWidgetProps> = ({ 
  showFullData = false, 
  className = '' 
}) => {
  const { address, isConnected } = useWallet();
  const { 
    portfolio, 
    positions, 
    totalPnL, 
    dailyPnL, 
    riskMetrics, 
    alerts, 
    isLoading, 
    error, 
    refreshAll 
  } = useHyperLiquid(address, {
    enablePortfolio: true,
    enablePositions: true,
    enableRealTimePnL: true
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Format currency
  const formatCurrency = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Get P&L color class
  const getPnLColorClass = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            HyperLiquid Perpetuals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Connect wallet to view perpetuals portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            HyperLiquid Perpetuals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load HyperLiquid data</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            HyperLiquid Perpetuals
            {isLoading && <RefreshCw className="h-4 w-4 ml-2 animate-spin" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/portfolio">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total P&L</p>
            <p className={`text-lg font-bold ${getPnLColorClass(totalPnL)}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Daily P&L</p>
            <p className={`text-lg font-bold ${getPnLColorClass(dailyPnL)}`}>
              {formatCurrency(dailyPnL)}
            </p>
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Portfolio Value</span>
              <span className="font-semibold">{formatCurrency(portfolio.totalPortfolioValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Open Positions</span>
              <Badge variant="outline">{portfolio.summary.openPositions}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Leverage</span>
              <Badge variant={portfolio.summary.averageLeverage > 10 ? 'destructive' : 'default'}>
                {portfolio.summary.averageLeverage.toFixed(1)}x
              </Badge>
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {riskMetrics && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Risk Level
              </span>
              <Badge variant={riskMetrics.leverageRisk === 'High' ? 'destructive' : 
                             riskMetrics.leverageRisk === 'Medium' ? 'default' : 'secondary'}>
                {riskMetrics.leverageRisk}
              </Badge>
            </div>
            
            {riskMetrics.positionRisk > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Position Risk</span>
                  <span>{riskMetrics.positionRisk.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(riskMetrics.positionRisk, 100)} />
              </div>
            )}
          </div>
        )}

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {alerts.length} active risk alert{alerts.length > 1 ? 's' : ''}
            </AlertDescription>
          </Alert>
        )}

        {/* Positions Summary */}
        {showFullData && positions && positions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Active Positions
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {positions
                .filter(pos => pos.size && Math.abs(pos.size) > 0)
                .slice(0, 5) // Show max 5 positions
                .map((position, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{position.position.coin}</span>
                    <Badge variant={position.size > 0 ? 'default' : 'secondary'} className="text-xs">
                      {position.size > 0 ? 'LONG' : 'SHORT'}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {position.leverage.toFixed(1)}x
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getPnLColorClass(position.unrealizedPnl)}`}>
                      {formatCurrency(position.unrealizedPnl, 0)}
                    </p>
                    <p className={`text-xs ${getPnLColorClass(position.unrealizedPnlPercent)}`}>
                      {position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {!showFullData && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        )}

        {/* Expanded Content */}
        {!showFullData && isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* Recent Performance */}
            <div>
              <h4 className="font-medium text-sm mb-2">Performance</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profitable Positions</span>
                  <span>{portfolio?.summary.profitablePositions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Drawdown</span>
                  <span className="text-red-600">
                    {riskMetrics ? formatCurrency(riskMetrics.maxDrawdown, 0) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Link href="/trading" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Target className="h-4 w-4 mr-1" />
                  Trade
                </Button>
              </Link>
              <Link href="/portfolio" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Portfolio
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!portfolio || portfolio.summary.openPositions === 0) && (
          <div className="text-center py-4">
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No active perpetual positions</p>
            <Link href="/trading">
              <Button variant="outline" size="sm" className="mt-2">
                <Target className="h-4 w-4 mr-1" />
                Start Trading
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HyperLiquidWidget;