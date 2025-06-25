'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket, useMarketData } from '@/lib/websocket-client';
import {
  Activity,
  BarChart3,
  Zap,
  Wallet,
  Settings,
  TrendingUp,
  DollarSign,
  Globe,
  Shield,
  Crown,
  Star,
  Rocket,
  Target,
  Award,
  Gem,
  Flame,
  RefreshCw,
  ArrowUpRight,
  Eye,
  EyeOff,
  Download,
  Share2,
  Bell,
  Heart,
  Bookmark,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Maximize2,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Import our components
import QuickTradeInterface from '@/components/quick-trade/QuickTradeInterface';
import { RunesChart } from '@/components/charts/RunesChart';
import { PortfolioRefined } from '@/components/portfolio/PortfolioRefined';
import { AnalyticsSystemPro } from '@/components/analytics/AnalyticsSystemPro';
import NotificationSystem from '@/components/notifications/NotificationSystem';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface DemoStats {
  totalUsers: number;
  totalVolume: string;
  totalTrades: number;
  activeDEXs: number;
  averageGasSavings: string;
  uptime: string;
  lastUpdated: Date;
}

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'live' | 'beta' | 'coming_soon';
  usage: number;
  color: string;
}

const DEMO_STATS: DemoStats = {
  totalUsers: 45678,
  totalVolume: '$2.3B',
  totalTrades: 123456,
  activeDEXs: 25,
  averageGasSavings: '23%',
  uptime: '99.9%',
  lastUpdated: new Date()
};

const DEMO_FEATURES: DemoFeature[] = [
  {
    id: 'quick-trade',
    title: 'Quick Trade Pro',
    description: 'Advanced multi-chain DEX aggregator with optimal routing',
    icon: Zap,
    status: 'live',
    usage: 98,
    color: 'cyan'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Manager',
    description: 'Professional portfolio tracking with analytics',
    icon: Wallet,
    status: 'live',
    usage: 87,
    color: 'green'
  },
  {
    id: 'runes-analytics',
    title: 'Runes Analytics',
    description: 'Real-time Bitcoin Runes market analysis',
    icon: Gem,
    status: 'live',
    usage: 92,
    color: 'purple'
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics',
    description: 'AI-powered market intelligence with predictions',
    icon: BarChart3,
    status: 'beta',
    usage: 76,
    color: 'blue'
  },
  {
    id: 'sentiment-analysis',
    title: 'Sentiment Analysis',
    description: 'Real-time market sentiment with ML predictions',
    icon: Activity,
    status: 'beta',
    usage: 65,
    color: 'orange'
  },
  {
    id: 'yield-farming',
    title: 'Yield Farming',
    description: 'Automated yield optimization across protocols',
    icon: TrendingUp,
    status: 'coming_soon',
    usage: 0,
    color: 'yellow'
  }
];

export default function CypherDemo() {
  // State management
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [stats, setStats] = useState<DemoStats>(DEMO_STATS);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showPrivacyMode, setShowPrivacyMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<DemoFeature | null>(null);

  // WebSocket connection
  const { connectionStatus } = useWebSocket();
  const { marketData: btcData } = useMarketData('BTC');
  const { marketData: ethData } = useMarketData('ETH');

  // Simulate live updates with real WebSocket data when available
  React.useEffect(() => {
    if (!isLiveMode || !autoRefresh) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 5),
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 10),
        // Update volume with real BTC data if available
        totalVolume: btcData ? `$${(btcData.volume24h / 1e9).toFixed(1)}B` : prev.totalVolume,
        lastUpdated: new Date()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode, autoRefresh, btcData]);

  // Handle demo navigation
  const handleDemoChange = useCallback((demoId: string) => {
    setActiveDemo(demoId);
    toast.success(`Switched to ${demoId.replace('-', ' ')} demo`);
  }, []);

  // Handle feature selection
  const handleFeatureSelect = useCallback((feature: DemoFeature) => {
    setSelectedFeature(feature);
    setActiveDemo(feature.id);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'beta': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'coming_soon': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400';
    }
  };

  const formatNumber = (num: number): string => {
    if (showPrivacyMode) return '****';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    CYPHER ORDI FUTURE
                  </h1>
                  <p className="text-gray-400 text-sm">Advanced Bitcoin Analytics & Trading Platform</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                LIVE DEMO
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Live Mode Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-400">Live Mode</Label>
                <Switch 
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
                {isLiveMode && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      connectionStatus.status === 'connected' 
                        ? 'bg-green-500' 
                        : connectionStatus.status === 'connecting'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-gray-500">
                      {connectionStatus.status === 'connected' ? 'Live' : 
                       connectionStatus.status === 'connecting' ? 'Connecting' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Privacy Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivacyMode(!showPrivacyMode)}
                className="text-gray-400 hover:text-white"
              >
                {showPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              
              {/* Auto Refresh */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-gray-400 hover:text-white ${autoRefresh ? 'text-cyan-400' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
        >
          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Total Users</span>
              </div>
              <p className="text-xl font-bold text-cyan-400">{formatNumber(stats.totalUsers)}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Total Volume</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {showPrivacyMode ? '****' : stats.totalVolume}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Total Trades</span>
              </div>
              <p className="text-xl font-bold text-purple-400">{formatNumber(stats.totalTrades)}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Active DEXs</span>
              </div>
              <p className="text-xl font-bold text-orange-400">{stats.activeDEXs}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Gas Savings</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">{stats.averageGasSavings}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Uptime</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{stats.uptime}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                Platform Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEMO_FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedFeature?.id === feature.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                    onClick={() => handleFeatureSelect(feature)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center`}>
                        <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                            {feature.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{feature.description}</p>
                        {feature.status !== 'coming_soon' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Usage</span>
                              <span className={`text-${feature.color}-400`}>{feature.usage}%</span>
                            </div>
                            <Progress value={feature.usage} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs value={activeDemo} onValueChange={handleDemoChange}>
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quick-trade">Quick Trade</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="runes-analytics">Runes</TabsTrigger>
              <TabsTrigger value="advanced-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Welcome Card */}
                <Card className="border-gradient-to-r from-cyan-500/20 to-blue-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Welcome to Cypher Ordi Future
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">
                      The most advanced Bitcoin analytics and trading platform featuring:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Multi-chain DEX aggregation with optimal routing
                      </li>
                      <li className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Professional portfolio management tools
                      </li>
                      <li className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Real-time Bitcoin Runes analytics
                      </li>
                      <li className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        AI-powered market sentiment analysis
                      </li>
                      <li className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Advanced technical indicators and predictions
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                      Start Trading Now
                    </Button>
                  </CardContent>
                </Card>

                {/* Live Stats */}
                <Card className="border-gray-800 bg-gray-900/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      Live Platform Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">$2.3B+</div>
                        <div className="text-xs text-gray-400">Total Volume</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">45K+</div>
                        <div className="text-xs text-gray-400">Active Users</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400">123K+</div>
                        <div className="text-xs text-gray-400">Trades</div>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <div className="text-2xl font-bold text-orange-400">25</div>
                        <div className="text-xs text-gray-400">DEX Partners</div>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="text-center">
                      <div className="text-xs text-gray-500">
                        Last updated: {format(stats.lastUpdated, 'HH:mm:ss')}
                      </div>
                      {isLiveMode && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-400">Live Data</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quick-trade">
              <div className="max-w-2xl mx-auto">
                <QuickTradeInterface 
                  onSwapComplete={(result) => {
                    toast.success(`Swap completed: ${result.status}`);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              <PortfolioRefined />
            </TabsContent>

            <TabsContent value="runes-analytics">
              <RunesChart 
                timeframe="7d"
                showVolume={true}
                showMinting={true}
                allowFullscreen={true}
              />
            </TabsContent>

            <TabsContent value="advanced-analytics">
              <AnalyticsSystemPro />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-800 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Platform Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Multi-chain DEX Aggregation</li>
                <li>Portfolio Management</li>
                <li>Advanced Analytics</li>
                <li>Sentiment Analysis</li>
                <li>Real-time Price Data</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Supported Networks</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Bitcoin & Runes</li>
                <li>Ethereum & L2s</li>
                <li>Solana</li>
                <li>BSC, Polygon</li>
                <li>Arbitrum, Optimism</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Security</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Non-custodial Trading</li>
                <li>Secure Wallet Connection</li>
                <li>Real-time Risk Analysis</li>
                <li>MEV Protection</li>
                <li>99.9% Uptime SLA</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              CYPHER ORDI FUTURE
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Cypher Technologies. Advanced Bitcoin Analytics & Trading Platform.
            </div>
            <div className="text-xs text-gray-600">
              Demo Mode • Real-time Data • Secure & Non-custodial
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        maxNotifications={5}
        defaultDuration={5000}
        position="top-right"
      />
    </div>
  );
}