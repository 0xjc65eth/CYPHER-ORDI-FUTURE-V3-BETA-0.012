'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Users,
  BarChart3,
  Clock,
  Bell,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Target,
  Flame
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic imports for charts (SSR safe)
const CandlestickChart = dynamic(() => import('./charts/RunesCandlestickChart'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-900/50 animate-pulse rounded-lg flex items-center justify-center">
    <RefreshCw className="h-8 w-8 text-orange-400 animate-spin" />
  </div>
});

const MarketHeatmap = dynamic(() => import('./widgets/RunesMarketHeatmap'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-900/50 animate-pulse rounded-lg" />
});

const OrderBookWidget = dynamic(() => import('./widgets/RunesOrderBook'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-900/50 animate-pulse rounded-lg" />
});

// Types
interface RuneData {
  name: string;
  symbol: string;
  price_btc: number;
  price_usd: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  holders: number;
  supply: number;
  tvl: number;
}

interface MarketAlert {
  id: string;
  type: 'whale' | 'volatility' | 'pattern' | 'volume';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  rune: string;
}

export default function RunesBloombergTerminal() {
  const [selectedRune, setSelectedRune] = useState<RuneData | null>(null);
  const [topGainers, setTopGainers] = useState<RuneData[]>([]);
  const [topLosers, setTopLosers] = useState<RuneData[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data generation (replace with real API calls)
  useEffect(() => {
    const generateMockData = () => {
      // Generate mock runes data
      const runeNames = [
        'RSIC•GENESIS•RUNE', 'DOG•GO•TO•THE•MOON', 'RUNESTONE', 'UNCOMMON•GOODS',
        'RUNE•COIN', 'SATOSHI•NAKAMOTO', 'BITCOIN•ORDINALS', 'RARE•PEPE•RUNE'
      ];

      const mockRunes: RuneData[] = runeNames.map((name, index) => ({
        name,
        symbol: name.split('•')[0],
        price_btc: 0.00001 + Math.random() * 0.001,
        price_usd: 45000 * (0.00001 + Math.random() * 0.001),
        change_24h: (Math.random() - 0.5) * 50,
        volume_24h: Math.random() * 1000000,
        market_cap: Math.random() * 50000000,
        holders: Math.floor(Math.random() * 10000),
        supply: Math.floor(Math.random() * 21000000),
        tvl: Math.random() * 5000000
      }));

      // Sort by change for gainers/losers
      const sorted = [...mockRunes].sort((a, b) => b.change_24h - a.change_24h);
      setTopGainers(sorted.slice(0, 5));
      setTopLosers(sorted.slice(-5).reverse());
      
      if (!selectedRune) {
        setSelectedRune(mockRunes[0]);
      }

      // Generate alerts
      const alertTypes = ['whale', 'volatility', 'pattern', 'volume'] as const;
      const newAlerts: MarketAlert[] = Array.from({ length: 3 }, (_, i) => ({
        id: `alert-${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        message: `Large ${mockRunes[i]?.name} transaction detected`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        rune: mockRunes[i]?.name || 'Unknown'
      }));
      setMarketAlerts(newAlerts);
      setLastUpdate(new Date());
    };

    generateMockData();
    const interval = setInterval(generateMockData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [selectedRune]);

  const formatPrice = (price: number, currency: 'BTC' | 'USD' = 'USD') => {
    if (currency === 'BTC') {
      return `₿${price.toFixed(8)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'medium': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Terminal Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  RUNES <span className="text-orange-500">TERMINAL</span>
                </h1>
                <p className="text-sm text-gray-400">Bloomberg-Style Professional Trading Interface</p>
              </div>
            </div>
            <Badge className={`${isLive ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'} border`}>
              <div className={`w-2 h-2 ${isLive ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-2 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Last Update</div>
              <div className="text-sm text-white font-mono">{lastUpdate.toLocaleTimeString()}</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-500/50 hover:border-orange-500"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Rune Header */}
        {selectedRune && (
          <Card className="bg-gray-900/50 border-orange-500/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-orange-400 mb-2">{selectedRune.name}</h2>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-white">
                      {formatPrice(selectedRune.price_usd)}
                    </div>
                    <div className="text-lg text-gray-400">
                      {formatPrice(selectedRune.price_btc, 'BTC')}
                    </div>
                    <div className="text-lg">
                      {formatChange(selectedRune.change_24h)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="text-lg font-bold text-white">
                      ${(selectedRune.market_cap / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">24h Volume</div>
                    <div className="text-lg font-bold text-white">
                      ${(selectedRune.volume_24h / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Holders</div>
                    <div className="text-lg font-bold text-white">
                      {selectedRune.holders.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">TVL</div>
                    <div className="text-lg font-bold text-white">
                      ${(selectedRune.tvl / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Price Chart - Takes 2 columns on large screens */}
        <Card className="lg:col-span-2 bg-black/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Chart - {selectedRune?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CandlestickChart rune={selectedRune} />
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card className="bg-black/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderBookWidget rune={selectedRune} />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Top Gainers */}
        <Card className="bg-black/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGainers.map((rune, index) => (
                <div 
                  key={rune.name}
                  className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors"
                  onClick={() => setSelectedRune(rune)}
                >
                  <div>
                    <div className="font-bold text-white text-sm">{rune.symbol}</div>
                    <div className="text-xs text-gray-400">{formatPrice(rune.price_usd)}</div>
                  </div>
                  <div className="text-right">
                    {formatChange(rune.change_24h)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="bg-black/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLosers.map((rune, index) => (
                <div 
                  key={rune.name}
                  className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors"
                  onClick={() => setSelectedRune(rune)}
                >
                  <div>
                    <div className="font-bold text-white text-sm">{rune.symbol}</div>
                    <div className="text-xs text-gray-400">{formatPrice(rune.price_usd)}</div>
                  </div>
                  <div className="text-right">
                    {formatChange(rune.change_24h)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Alerts */}
        <Card className="bg-black/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-bold uppercase">{alert.type}</span>
                  </div>
                  <div className="text-xs">{alert.message}</div>
                  <div className="text-xs opacity-70 mt-1">{alert.timestamp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Quick Trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedRune && (
                <>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Selected</div>
                    <div className="font-bold text-white">{selectedRune.symbol}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href={`https://app.runesdex.com/swap?base=BTC&quote=${selectedRune.name}&utm_source=terminal&utm_medium=dashboard&utm_campaign=trade`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Buy on RunesDEX
                      </Button>
                    </Link>
                    
                    <Link 
                      href={`https://unisat.io/market/brc20?tick=${selectedRune.symbol}&utm_source=terminal&utm_medium=dashboard&utm_campaign=trade`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full border-orange-500/50 hover:border-orange-500">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Trade on UniSat
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="bg-black/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Heatmap - Liquidity & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarketHeatmap />
        </CardContent>
      </Card>
    </div>
  );
}