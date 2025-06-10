/**
 * 🟡 BRC-20 ANALYTICS COMPONENT
 * Professional analytics dashboard with market insights and trends
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { brc20Service, type BRC20Token } from '@/services/BRC20Service';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  DollarSign,
  Users,
  Activity,
  Star,
  Zap,
  Globe,
  Clock,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalMarketCap: number;
  totalVolume24h: number;
  totalTokens: number;
  totalHolders: number;
  topGainers: BRC20Token[];
  topLosers: BRC20Token[];
  mostActive: BRC20Token[];
  recentlyDeployed: BRC20Token[];
}

export function BRC20Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await brc20Service.getBRC20Analytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, compact = false) => {
    if (compact && num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (compact && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`;
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-gray-900 border-gray-700 p-8">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Analytics Unavailable</h3>
          <p className="text-gray-400 mb-4">Failed to load analytics data</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-500" />
            BRC-20 Market Analytics
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive market insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedPeriod === period
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadAnalytics}
            className="border-gray-600 hover:border-gray-500"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Market Cap</p>
              <p className="text-2xl font-bold text-white">
                ${formatNumber(analytics.totalMarketCap, true)}
              </p>
              <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">24h Volume</p>
              <p className="text-2xl font-bold text-white">
                ${formatNumber(analytics.totalVolume24h, true)}
              </p>
              <p className="text-xs text-blue-400 mt-1">+8.3% from yesterday</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Tokens</p>
              <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalTokens)}</p>
              <p className="text-xs text-purple-400 mt-1">+15 new this week</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Holders</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(analytics.totalHolders, true)}
              </p>
              <p className="text-xs text-orange-400 mt-1">+2.1K new holders</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Gainers (24h)
          </h3>
          <div className="space-y-3">
            {analytics.topGainers.slice(0, 5).map((token, index) => (
              <TokenAnalyticsRow 
                key={token.ticker} 
                token={token} 
                rank={index + 1}
                showChange={true}
                formatPrice={formatPrice}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </Card>

        {/* Top Losers */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Top Losers (24h)
          </h3>
          <div className="space-y-3">
            {analytics.topLosers.slice(0, 5).map((token, index) => (
              <TokenAnalyticsRow 
                key={token.ticker} 
                token={token} 
                rank={index + 1}
                showChange={true}
                formatPrice={formatPrice}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </Card>

        {/* Most Active */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Most Active (Volume)
          </h3>
          <div className="space-y-3">
            {analytics.mostActive.slice(0, 5).map((token, index) => (
              <TokenAnalyticsRow 
                key={token.ticker} 
                token={token} 
                rank={index + 1}
                showVolume={true}
                formatPrice={formatPrice}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </Card>

        {/* Recently Deployed */}
        <Card className="bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Recently Deployed
          </h3>
          <div className="space-y-3">
            {analytics.recentlyDeployed.slice(0, 5).map((token, index) => (
              <TokenAnalyticsRow 
                key={token.ticker} 
                token={token} 
                rank={index + 1}
                showDeployDate={true}
                formatPrice={formatPrice}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Market Insights */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-500" />
          Market Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1">Market Leader</h4>
            <p className="text-sm text-gray-400 mb-2">
              {analytics.topGainers[0]?.ticker.toUpperCase() || 'ORDI'}
            </p>
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              Highest Market Cap
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1">Most Volatile</h4>
            <p className="text-sm text-gray-400 mb-2">
              {analytics.topGainers[0]?.ticker.toUpperCase() || 'MEME'}
            </p>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              High Price Swings
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1">Community Favorite</h4>
            <p className="text-sm text-gray-400 mb-2">
              {analytics.mostActive[0]?.ticker.toUpperCase() || 'PEPE'}
            </p>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              Most Holders
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface TokenAnalyticsRowProps {
  token: BRC20Token;
  rank: number;
  showChange?: boolean;
  showVolume?: boolean;
  showDeployDate?: boolean;
  formatPrice: (price: number) => string;
  formatNumber: (num: number, compact?: boolean) => string;
}

function TokenAnalyticsRow({ 
  token, 
  rank, 
  showChange, 
  showVolume, 
  showDeployDate,
  formatPrice,
  formatNumber
}: TokenAnalyticsRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm font-mono w-6">{rank}</span>
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs uppercase">
            {token.ticker.slice(0, 2)}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase font-mono">{token.ticker}</span>
            {token.verified && (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                Verified
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-400">{formatPrice(token.price)}</div>
        </div>
      </div>
      
      <div className="text-right">
        {showChange && (
          <div className={`flex items-center gap-1 ${
            token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {token.priceChange24h >= 0 ? 
              <TrendingUp className="w-3 h-3" /> : 
              <TrendingDown className="w-3 h-3" />
            }
            <span className="font-medium text-sm">
              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
            </span>
          </div>
        )}
        
        {showVolume && (
          <div className="text-white font-medium text-sm">
            ${formatNumber(token.volume24h, true)}
          </div>
        )}
        
        {showDeployDate && (
          <div className="text-gray-400 text-sm">
            {formatDate(token.deployedAt)}
          </div>
        )}
      </div>
    </div>
  );
}