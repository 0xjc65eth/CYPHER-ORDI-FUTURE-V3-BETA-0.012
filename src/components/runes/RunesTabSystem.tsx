'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Brain, 
  Building2, 
  BarChart3, 
  TrendingUp,
  Eye,
  Zap,
  Activity,
  Timer,
  Star,
  Settings,
  Bell,
  Crown,
  Flame,
  LineChart
} from 'lucide-react';

// Lazy load components
const BloombergTerminalDashboard = lazy(() => import('./BloombergTerminalDashboardNew'));
const WallStreetTradingFloor = lazy(() => import('../trading/WallStreetTradingFloor'));
const ProfessionalOrderBook = lazy(() => import('../trading/ProfessionalOrderBook'));

// New Analysis Components
const TechnicalAnalysis = lazy(() => import('./analysis/TechnicalAnalysis'));
const SentimentAnalysis = lazy(() => import('./analysis/SentimentAnalysis'));
const MarketDepthAnalysis = lazy(() => import('./analysis/MarketDepthAnalysis'));
const AdvancedCharts = lazy(() => import('./analysis/AdvancedCharts'));
const RiskManagement = lazy(() => import('./analysis/RiskManagement'));

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  badge?: string;
  color: string;
  description: string;
  premium?: boolean;
}

const tabs: Tab[] = [
  {
    id: 'terminal',
    label: 'Terminal',
    icon: Target,
    component: BloombergTerminalDashboard,
    color: 'orange',
    description: 'Bloomberg-style professional trading interface'
  },
  {
    id: 'technical',
    label: 'Technical Analysis',
    icon: BarChart3,
    component: TechnicalAnalysis,
    badge: 'NEW',
    color: 'blue',
    description: 'Advanced technical indicators and chart analysis'
  },
  {
    id: 'orderbook',
    label: 'Order Book',
    icon: Brain,
    component: ProfessionalOrderBook,
    color: 'cyan',
    description: 'Level II market data and professional order entry'
  },
  {
    id: 'trading-floor',
    label: 'Trading Floor',
    icon: Building2,
    component: WallStreetTradingFloor,
    color: 'green',
    description: 'Wall Street style trading floor simulation'
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    icon: Eye,
    component: SentimentAnalysis,
    badge: 'AI',
    color: 'purple',
    description: 'AI-powered market sentiment analysis',
    premium: true
  },
  {
    id: 'depth',
    label: 'Market Depth',
    icon: Activity,
    component: MarketDepthAnalysis,
    color: 'red',
    description: 'Deep market microstructure analysis'
  },
  {
    id: 'charts',
    label: 'Advanced Charts',
    icon: LineChart,
    component: AdvancedCharts,
    badge: 'PRO',
    color: 'yellow',
    description: 'Professional charting with multiple timeframes',
    premium: true
  },
  {
    id: 'risk',
    label: 'Risk Management',
    icon: Zap,
    component: RiskManagement,
    color: 'pink',
    description: 'Portfolio risk analysis and management tools'
  }
];

const LoadingSpinner = ({ tab }: { tab: Tab }) => (
  <div className="min-h-[600px] flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="relative mb-4">
        <div className={`w-16 h-16 border-4 border-${tab.color}-400/20 rounded-full animate-spin`}>
          <div className={`absolute inset-2 border-4 border-${tab.color}-400 border-t-transparent rounded-full animate-spin`} 
               style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
        </div>
      </div>
      <h3 className={`text-xl font-bold text-${tab.color}-400 mb-2`}>
        Loading {tab.label}
      </h3>
      <p className="text-gray-400 text-sm">{tab.description}</p>
    </motion.div>
  </div>
);

export default function RunesTabSystem() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(true);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Simulate notifications
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const messages = [
        'New market opportunity detected',
        'Price alert triggered',
        'Volume spike detected',
        'Technical pattern formed',
        'Risk threshold reached'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setNotifications(prev => [randomMessage, ...prev.slice(0, 4)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getTabColorClass = (color: string, type: 'text' | 'border' | 'bg' = 'text') => {
    const colorMap: Record<string, Record<string, string>> = {
      orange: { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400' },
      blue: { text: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400' },
      cyan: { text: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400' },
      green: { text: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400' },
      purple: { text: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400' },
      red: { text: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400' },
      yellow: { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400' },
      pink: { text: 'text-pink-400', border: 'border-pink-400', bg: 'bg-pink-400' }
    };
    return colorMap[color]?.[type] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Status Bar */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                    RUNES PROFESSIONAL TERMINAL
                  </h1>
                  <p className="text-sm text-gray-400">Bloomberg-Style Trading Interface</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Status */}
              <Badge className={`${isLive ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                <div className={`w-2 h-2 ${isLive ? 'bg-green-400' : 'bg-red-400'} rounded-full mr-2 ${isLive ? 'animate-pulse' : ''}`} />
                {isLive ? 'LIVE' : 'OFFLINE'}
              </Badge>

              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="sm" className="border-gray-600">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </div>

              {/* Settings */}
              <Button variant="outline" size="sm" className="border-gray-600">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? `${getTabColorClass(tab.color, 'bg')}/20 ${getTabColorClass(tab.color, 'border')} border ${getTabColorClass(tab.color, 'text')}` 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  
                  {tab.badge && (
                    <Badge className="text-xs px-1 py-0 bg-yellow-500/20 border-yellow-500 text-yellow-400">
                      {tab.badge}
                    </Badge>
                  )}
                  
                  {tab.premium && (
                    <Star className="h-3 w-3 text-yellow-400" />
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${getTabColorClass(tab.color, 'bg')} rounded-full`}
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Tab Description */}
      {activeTabData && (
        <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 ${getTabColorClass(activeTabData.color, 'bg')} rounded-full animate-pulse`} />
              <span className="text-sm text-gray-400">{activeTabData.description}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {activeTabData && (
              <Suspense fallback={<LoadingSpinner tab={activeTabData} />}>
                <activeTabData.component />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 w-80 z-50"
          >
            <Card className="bg-black/95 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Live Notifications</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setNotifications([])}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 bg-gray-800/50 rounded text-xs text-gray-300 border-l-2 border-orange-400"
                    >
                      {notification}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}