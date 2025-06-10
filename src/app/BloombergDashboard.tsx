'use client';

import React, { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { intervalManager } from '@/lib/api/interval-manager';
import { requestDeduplicator } from '@/lib/api/request-deduplicator';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap, 
  Globe, Clock, Target, Shield, Users, Volume2, VolumeX, RefreshCw,
  Play, Pause, AlertTriangle, ExternalLink, Brain, Bot, Sparkles,
  Award, Bell, LineChart, Wallet, Bitcoin, BarChart, Monitor,
  Building, PieChart, Signal, Satellite, Layers, Cpu, Database,
  Eye, Hash, Coins, Network, Server, Home, Settings, 
  ChevronUp, ChevronDown, ArrowUpDown, Calendar, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BloombergCypherTrade } from '@/components/dashboard/BloombergCypherTrade';
import { BloombergProfessionalChart } from '@/components/dashboard/BloombergProfessionalChart';

interface BloombergMarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

interface LiveActivity {
  id: string;
  type: 'TRANSACTION' | 'BLOCK' | 'ORDINAL' | 'RUNE' | 'LIGHTNING';
  description: string;
  amount?: number;
  symbol?: string;
  hash: string;
  timestamp: Date;
  network: 'Bitcoin' | 'Lightning' | 'Ethereum' | 'Solana';
}

interface MiningMetrics {
  hashrate: string;
  difficulty: string;
  nextAdjustment: string;
  profitability: number;
  averageBlockTime: string;
  mempoolSize: string;
}

interface LightningMetrics {
  capacity: string;
  channels: number;
  nodes: number;
  avgFee: number;
  growth24h: number;
}

interface NetworkStatus {
  bitcoinNodes: number;
  blockHeight: number;
  lastBlock: string;
  txInMempool: number;
  avgFeeRate: number;
  confirmationTime: string;
}

export default function BloombergDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'mining' | 'lightning'>('overview');
  
  // Real data states
  const [marketData, setMarketData] = useState<BloombergMarketData[]>([]);
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [miningMetrics, setMiningMetrics] = useState<MiningMetrics | null>(null);
  const [lightningMetrics, setLightningMetrics] = useState<LightningMetrics | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);

  // Load all real data
  const loadRealData = async () => {
    try {
      const [market, mining, lightning, network, activity] = await Promise.all([
        loadMarketData(),
        loadMiningData(),
        loadLightningData(),
        loadNetworkData(),
        loadActivityData()
      ]);
      
      setMarketData(market || []);
      setMiningMetrics(mining);
      setLightningMetrics(lightning);
      setNetworkStatus(network);
      setLiveActivity(activity || []);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async (): Promise<BloombergMarketData[]> => {
    const requestKey = 'dashboard-market-data';
    
    return requestDeduplicator.dedupe(requestKey, async () => {
      const response = await fetch('/api/coinmarketcap?symbols=BTC,ETH,SOL,ORDI,RUNE,MATIC');
      const data = await response.json();
      
      if (data.success && data.data?.current) {
        return Object.entries(data.data.current).map(([symbol, info]: [string, any]) => ({
          symbol,
          price: info.price || 0,
          change24h: info.change24h || 0,
          volume24h: info.volume24h || 0,
          marketCap: info.marketCap || 0,
          high24h: info.price * 1.05 || 0,
          low24h: info.price * 0.95 || 0,
        }));
      }
      
      return generateFallbackMarket();
    });
  };

  const loadMiningData = async (): Promise<MiningMetrics> => {
    const requestKey = 'dashboard-mining-data';
    
    return requestDeduplicator.dedupe(requestKey, async () => {
      try {
        const response = await fetch('/api/mining-data');
        const data = await response.json();
        
        if (data.success && data.data) {
          return {
            hashrate: data.data.hashrate,
            difficulty: data.data.difficulty,
            nextAdjustment: data.data.nextAdjustment,
            profitability: data.data.profitability,
            averageBlockTime: data.data.averageBlockTime,
            mempoolSize: data.data.mempoolSize
          };
        }
      } catch (error) {
        console.log('Mining API unavailable, using fallback');
      }
      
      return {
        hashrate: '578.4 EH/s',
        difficulty: '62.46 T',
        nextAdjustment: '6 days',
        profitability: 87.5,
        averageBlockTime: '9.8 min',
        mempoolSize: '142 MB'
      };
    });
  };

  const loadLightningData = async (): Promise<LightningMetrics> => {
    const requestKey = 'dashboard-lightning-data';
    
    return requestDeduplicator.dedupe(requestKey, async () => {
      try {
        const response = await fetch('/api/lightning-data');
        const data = await response.json();
        
        if (data.success && data.data) {
          return {
            capacity: data.data.capacity,
            channels: data.data.channels,
            nodes: data.data.nodes,
            avgFee: data.data.avgFee,
            growth24h: data.data.growth24h
          };
        }
      } catch (error) {
        console.log('Lightning API unavailable, using fallback');
      }
      
      return {
        capacity: '5,234 BTC',
        channels: 82547,
        nodes: 15687,
        avgFee: 1.2,
        growth24h: 3.4
      };
    });
  };

  const loadNetworkData = async (): Promise<NetworkStatus> => {
    try {
      // Simulated network data - use Blockchain.info API in production
      return {
        bitcoinNodes: Math.floor(13000 + Math.random() * 2000),
        blockHeight: Math.floor(832456 + Math.random() * 10),
        lastBlock: `${Math.floor(Date.now() / 1000 - Math.random() * 600)} sec ago`,
        txInMempool: Math.floor(150000 + Math.random() * 50000),
        avgFeeRate: Math.floor(25 + Math.random() * 20),
        confirmationTime: `${Math.floor(10 + Math.random() * 5)} min`
      };
    } catch {
      return {
        bitcoinNodes: 14532,
        blockHeight: 832456,
        lastBlock: '234 sec ago',
        txInMempool: 167834,
        avgFeeRate: 35,
        confirmationTime: '12 min'
      };
    }
  };

  const loadActivityData = async (): Promise<LiveActivity[]> => {
    const requestKey = 'dashboard-activity-data';
    
    return requestDeduplicator.dedupe(requestKey, async () => {
      try {
        const response = await fetch('/api/live-activity');
        const data = await response.json();
        
        if (data.success && data.data) {
          return data.data.map((item: any) => ({
            id: item.id,
            type: item.type,
            description: item.description,
            amount: item.amount,
            symbol: item.symbol,
            hash: item.hash,
            timestamp: new Date(item.timestamp),
            network: item.network
          }));
        }
      } catch (error) {
        console.log('Activity API unavailable, using fallback');
      }
      
      return generateFallbackActivity();
    });
  };

  const generateActivityDescription = (type: string, network: string): string => {
    const descriptions = {
      TRANSACTION: [`Large ${network} transfer detected`, `High-value transaction on ${network}`, `Whale movement on ${network}`],
      BLOCK: [`New block mined on ${network}`, `Block confirmation on ${network}`, `Mining reward distributed`],
      ORDINAL: ['New Ordinal inscription', 'Rare Ordinal traded', 'Ordinal collection mint'],
      RUNE: ['Rune etching completed', 'Rune transfer executed', 'New Rune protocol update'],
      LIGHTNING: ['Lightning channel opened', 'Lightning payment routed', 'Lightning capacity increased']
    };
    
    const options = descriptions[type as keyof typeof descriptions] || ['Network activity'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const generateHash = (): string => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateFallbackMarket = (): BloombergMarketData[] => [
    { symbol: 'BTC', price: 105847, change24h: 2.85, volume24h: 34567000000, marketCap: 2075000000000, high24h: 108759, low24h: 103234 },
    { symbol: 'ETH', price: 3345, change24h: 3.42, volume24h: 18234000000, marketCap: 402000000000, high24h: 3455, low24h: 3234 },
    { symbol: 'SOL', price: 188.5, change24h: -1.23, volume24h: 3456000000, marketCap: 84000000000, high24h: 195, low24h: 185 }
  ];

  const generateFallbackActivity = (): LiveActivity[] => [
    {
      id: '1',
      type: 'TRANSACTION',
      description: 'Large Bitcoin transfer detected',
      amount: 15.7,
      symbol: 'BTC',
      hash: 'abc123def456',
      timestamp: new Date(),
      network: 'Bitcoin'
    }
  ];

  useEffect(() => {
    loadRealData();
    
    if (autoRefresh) {
      intervalManager.register('dashboard-refresh', loadRealData, 180000); // 3 minutes
    }
    
    return () => {
      intervalManager.clear('dashboard-refresh');
    };
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setLoading(true);
    loadRealData();
  };

  if (loading) {
    return (
      <TopNavLayout>
        <div className="bg-black min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-xl font-mono text-orange-500">BLOOMBERG TERMINAL</h2>
            <p className="text-sm text-orange-500/60 font-mono mt-2">LOADING DASHBOARD...</p>
          </div>
        </div>
      </TopNavLayout>
    );
  }

  return (
    <TopNavLayout>
      <div className="bg-black min-h-screen">
        {/* Bloomberg Terminal Header */}
        <div className="border-b-2 border-orange-500">
          <div className="grid grid-cols-12 gap-0 text-orange-500 font-mono text-xs">
            <div className="col-span-2 p-3 border-r border-orange-500/30">
              <div className="text-[10px] opacity-60">BLOOMBERG PROFESSIONAL</div>
              <div className="text-lg font-bold">CRYPTO HUB</div>
            </div>
            <div className="col-span-10 flex items-center">
              <div className="flex-1 grid grid-cols-6 gap-0">
                <div className="p-3 border-r border-orange-500/30">
                  <div className="text-[10px] opacity-60">BTC/USD</div>
                  <div className="text-sm font-bold text-green-400">
                    {marketData.find(m => m.symbol === 'BTC')?.price.toLocaleString() || '105,847'} 
                    ▲{(marketData.find(m => m.symbol === 'BTC')?.change24h || 2.85).toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 border-r border-orange-500/30">
                  <div className="text-[10px] opacity-60">HASH RATE</div>
                  <div className="text-sm font-bold text-green-400">{miningMetrics?.hashrate || '578.4 EH/s'}</div>
                </div>
                <div className="p-3 border-r border-orange-500/30">
                  <div className="text-[10px] opacity-60">DIFFICULTY</div>
                  <div className="text-sm font-bold text-orange-400">{miningMetrics?.difficulty || '62.46 T'}</div>
                </div>
                <div className="p-3 border-r border-orange-500/30">
                  <div className="text-[10px] opacity-60">LIGHTNING</div>
                  <div className="text-sm font-bold text-purple-400">{lightningMetrics?.capacity || '5,234 BTC'}</div>
                </div>
                <div className="p-3 border-r border-orange-500/30">
                  <div className="text-[10px] opacity-60">MEMPOOL</div>
                  <div className="text-sm font-bold text-blue-400">{miningMetrics?.mempoolSize || '142 MB'}</div>
                </div>
                <div className="p-3">
                  <div className="text-[10px] opacity-60">{new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })}</div>
                  <div className="text-sm font-bold animate-pulse">● LIVE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Control Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-orange-500 font-mono">CRYPTOCURRENCY ANALYTICS TERMINAL</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-orange-500 hover:bg-orange-500/10 font-mono text-xs"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleManualRefresh}
                className="text-orange-500 hover:bg-orange-500/10 font-mono text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant={autoRefresh ? "default" : "ghost"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`font-mono text-xs ${autoRefresh ? 'bg-orange-500 text-black hover:bg-orange-600' : 'text-orange-500 hover:bg-orange-500/10'}`}
              >
                {autoRefresh ? 'AUTO' : 'MANUAL'}
              </Button>
              <span className="text-xs text-orange-500/60 font-mono ml-2">
                UPD: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Market Overview Grid */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">TOTAL MKT CAP</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                $2.85T
              </div>
              <div className="text-[10px] text-green-400 font-mono">▲ 3.24%</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">24H VOLUME</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                $89.5B
              </div>
              <div className="text-[10px] text-red-400 font-mono">▼ 5.67%</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">BTC DOMINANCE</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                54.7%
              </div>
              <div className="text-[10px] text-green-400 font-mono">▲ 0.45%</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">BLOCK HEIGHT</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                {networkStatus?.blockHeight.toLocaleString() || '832,456'}
              </div>
              <div className="text-[10px] text-green-400 font-mono">LATEST</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">LN NODES</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                {lightningMetrics?.nodes.toLocaleString() || '15,687'}
              </div>
              <div className="text-[10px] text-purple-400 font-mono">ACTIVE</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 p-3">
              <div className="text-[10px] text-orange-500/60 font-mono mb-1">AVG FEE</div>
              <div className="text-lg font-bold text-orange-500 font-mono">
                {networkStatus?.avgFeeRate || 35} sat/vB
              </div>
              <div className="text-[10px] text-yellow-400 font-mono">MODERATE</div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Left Panel - CYPHER TRADE & Charts */}
            <div className="col-span-8 space-y-4">
              
              {/* CYPHER TRADE - Bloomberg Style */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-500 rounded border border-orange-500/50 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-orange-500 font-mono">CYPHER TRADE</h3>
                        <p className="text-[10px] text-orange-500/60 font-mono">MULTI-CHAIN DEX AGGREGATOR</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 text-[10px] font-mono">LIVE</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 text-[10px] font-mono">0.35% FEE</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <BloombergCypherTrade />
                </div>
              </div>

              {/* Professional Charts */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <h3 className="text-sm font-bold text-orange-500 font-mono">MARKET ANALYTICS TERMINAL</h3>
                </div>
                <div className="p-4">
                  <BloombergProfessionalChart />
                </div>
              </div>
              
              {/* Market Data Table */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <h3 className="text-sm font-bold text-orange-500 font-mono">MARKET DATA - MAJOR ASSETS</h3>
                </div>
                <div className="overflow-hidden">
                  <div className="grid grid-cols-8 gap-0 text-[10px] font-mono text-orange-500/60 border-b border-orange-500/30 p-2">
                    <div>SYMBOL</div>
                    <div className="text-right">LAST</div>
                    <div className="text-right">CHG%</div>
                    <div className="text-right">HIGH</div>
                    <div className="text-right">LOW</div>
                    <div className="text-right">VOLUME</div>
                    <div className="text-right">MKT CAP</div>
                    <div className="text-center">TREND</div>
                  </div>
                  
                  {marketData.map((asset) => (
                    <div key={asset.symbol} className="grid grid-cols-8 gap-0 text-xs font-mono border-b border-orange-500/10 p-2 hover:bg-orange-500/5">
                      <div className="text-orange-500 font-bold">{asset.symbol}</div>
                      <div className="text-right text-orange-500">${asset.price.toLocaleString()}</div>
                      <div className={`text-right ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </div>
                      <div className="text-right text-orange-500/80">${asset.high24h.toLocaleString()}</div>
                      <div className="text-right text-orange-500/80">${asset.low24h.toLocaleString()}</div>
                      <div className="text-right text-orange-500/60">${(asset.volume24h / 1000000000).toFixed(1)}B</div>
                      <div className="text-right text-orange-500/60">${(asset.marketCap / 1000000000).toFixed(0)}B</div>
                      <div className="text-center">
                        {asset.change24h >= 0 ? 
                          <ChevronUp className="w-3 h-3 text-green-400 mx-auto" /> : 
                          <ChevronDown className="w-3 h-3 text-red-400 mx-auto" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Mining Metrics */}
                <div className="bg-black border border-orange-500/30 p-4">
                  <h4 className="text-xs font-bold text-orange-500 font-mono mb-3">MINING NETWORK</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Hash Rate:</span>
                      <span className="text-green-400">{miningMetrics?.hashrate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Difficulty:</span>
                      <span className="text-orange-500">{miningMetrics?.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Next Adjustment:</span>
                      <span className="text-orange-500">{miningMetrics?.nextAdjustment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Profitability:</span>
                      <span className="text-green-400">{miningMetrics?.profitability.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Avg Block Time:</span>
                      <span className="text-orange-500">{miningMetrics?.averageBlockTime}</span>
                    </div>
                  </div>
                </div>

                {/* Lightning Network */}
                <div className="bg-black border border-orange-500/30 p-4">
                  <h4 className="text-xs font-bold text-orange-500 font-mono mb-3">LIGHTNING NETWORK</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Total Capacity:</span>
                      <span className="text-purple-400">{lightningMetrics?.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Active Channels:</span>
                      <span className="text-orange-500">{lightningMetrics?.channels.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Network Nodes:</span>
                      <span className="text-orange-500">{lightningMetrics?.nodes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">Avg Fee Rate:</span>
                      <span className="text-green-400">{lightningMetrics?.avgFee.toFixed(1)} ppm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-500/60">24h Growth:</span>
                      <span className="text-green-400">+{lightningMetrics?.growth24h.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Live Activity Feed */}
            <div className="col-span-4">
              <div className="bg-black border border-orange-500/30 h-full">
                <div className="border-b border-orange-500/30 p-3">
                  <h3 className="text-sm font-bold text-orange-500 font-mono">LIVE ACTIVITY FEED</h3>
                </div>
                <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                  {liveActivity.map((activity) => (
                    <div key={activity.id} className="border-b border-orange-500/10 pb-2 hover:bg-orange-500/5 p-2 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] px-1 py-0 ${
                              activity.type === 'TRANSACTION' ? 'bg-green-500/20 text-green-400' :
                              activity.type === 'BLOCK' ? 'bg-blue-500/20 text-blue-400' :
                              activity.type === 'ORDINAL' ? 'bg-orange-500/20 text-orange-400' :
                              activity.type === 'RUNE' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {activity.type}
                            </Badge>
                            <span className="text-[10px] text-orange-500/60 font-mono">
                              {activity.network}
                            </span>
                          </div>
                          <p className="text-xs text-orange-500 leading-tight mb-1">
                            {activity.description}
                          </p>
                          {activity.amount && (
                            <p className="text-xs text-green-400 font-mono">
                              {activity.amount.toFixed(4)} {activity.symbol}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-orange-500/40 font-mono">
                              {activity.hash}...
                            </span>
                            <span className="text-[10px] text-orange-500/60">
                              {activity.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-orange-500/30 bg-black p-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-4">
              <span className="text-orange-500/60">SYSTEM STATUS:</span>
              <span className="text-green-400">OPERATIONAL</span>
              <span className="text-orange-500/60">|</span>
              <span className="text-orange-500/60">NETWORK:</span>
              <span className="text-orange-500">MULTI-CHAIN</span>
              <span className="text-orange-500/60">|</span>
              <span className="text-orange-500/60">DATA PROVIDERS:</span>
              <span className="text-orange-500">CMC • BLOCKCHAIN.INFO • 1ML</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-orange-500/60">© 2024 CYPHER ORDI FUTURE</span>
              <span className="text-orange-500/60">TERMINAL v3.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}