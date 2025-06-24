'use client';

import React, { useMemo, lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  Wifi,
  WifiOff,
  Brain,
  Atom,
  Layers,
  Eye,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import types
import { RuneMarketData } from '@/services/runes';

// Services and contexts
import { useRunesTerminal, useRunesFilters, useRunesSettings, useRunesFavorites } from '@/contexts/RunesTerminalContext';
import { useRunesRealTimeData } from '@/hooks/useRunesRealTimeData';

// Professional components
const RunesProfessionalChart = lazy(() => import('@/components/runes/charts/RunesProfessionalChart'));
const RunesMarketTable = lazy(() => import('@/components/runes/tables/RunesMarketTable'));
const TopRunesMovers = lazy(() => import('@/components/runes/widgets/TopRunesMovers'));
const RunesHeatmap = lazy(() => import('@/components/runes/widgets/RunesHeatmap'));
const TradingFloorOverview = lazy(() => import('@/components/runes/layouts/TradingFloorOverview'));

// Revolutionary Futuristic Components
const HolographicTradingFloor = lazy(() => import('@/components/runes/layouts/HolographicTradingFloor'));
const QuantumDataMatrix = lazy(() => import('@/components/runes/widgets/QuantumDataMatrix'));
const Holographic3DChart = lazy(() => import('@/components/runes/charts/Holographic3DChart'));

// Main Professional Dashboard Component
export default function BloombergTerminalDashboardNew() {
  // Context hooks
  const { filters, setFilters } = useRunesFilters();
  const { settings, setSettings } = useRunesSettings();
  const { favorites, toggleFavorite } = useRunesFavorites();
  const { state, isConnected } = useRunesTerminal();
  
  // Local state
  const [selectedRune, setSelectedRune] = useState<RuneMarketData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'professional' | 'holographic' | 'neural' | 'quantum'>('professional');
  
  // Real-time data hook
  const { data, refreshData } = useRunesRealTimeData();

  // Market overview metrics
  const marketMetrics = useMemo(() => {
    if (!data.marketData.length) return null;

    const totalMarketCap = data.marketData.reduce((sum, rune) => sum + rune.marketCap.current, 0);
    const totalVolume24h = data.marketData.reduce((sum, rune) => sum + rune.volume.volume24h, 0);
    const avgChange = data.marketData.reduce((sum, rune) => sum + rune.price.change24h, 0) / data.marketData.length;
    const gainers = data.marketData.filter(rune => rune.price.change24h > 0).length;
    const losers = data.marketData.filter(rune => rune.price.change24h < 0).length;

    return {
      totalMarketCap,
      totalVolume24h,
      avgChange,
      gainers,
      losers,
      activeRunes: data.marketData.length
    };
  }, [data.marketData]);

  // Format numbers for display
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // Auto-select first rune if none selected
  React.useEffect(() => {
    if (!selectedRune && data.marketData.length > 0) {
      setSelectedRune(data.marketData[0]);
    }
  }, [data.marketData, selectedRune]);

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Bloomberg-style Header */}
      <div className="border-b border-orange-500/30 bg-gradient-to-r from-gray-900 to-black">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-2xl font-bold text-orange-400">RUNES</span>
                <span className="text-gray-400">Terminal</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm">OFFLINE</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Revolutionary View Mode Selector */}
              <div className="flex bg-black border border-gray-700 rounded-lg p-1">
                {[
                  { mode: 'professional', icon: BarChart3, label: 'Pro', color: 'orange' },
                  { mode: 'holographic', icon: Layers, label: 'Holo', color: 'cyan' },
                  { mode: 'neural', icon: Brain, label: 'Neural', color: 'purple' },
                  { mode: 'quantum', icon: Atom, label: 'Quantum', color: 'blue' }
                ].map(({ mode, icon: Icon, label, color }) => (
                  <motion.button
                    key={mode}
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all
                      ${viewMode === mode 
                        ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/50` 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setViewMode(mode as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </motion.button>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-orange-500/30 hover:border-orange-500"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="border-orange-500/30 hover:border-orange-500"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>

          {/* Market Overview Bar */}
          {marketMetrics && (
            <div className="grid grid-cols-6 gap-4 mt-4 pt-4 border-t border-gray-800">
              <div className="text-center">
                <p className="text-xs text-gray-400">TOTAL MCAP</p>
                <p className="text-lg font-bold text-white">${formatNumber(marketMetrics.totalMarketCap)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">24H VOLUME</p>
                <p className="text-lg font-bold text-white">${formatNumber(marketMetrics.totalVolume24h)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">AVG CHANGE</p>
                <p className={`text-lg font-bold ${
                  marketMetrics.avgChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {marketMetrics.avgChange >= 0 ? '+' : ''}{marketMetrics.avgChange.toFixed(2)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">GAINERS</p>
                <p className="text-lg font-bold text-green-400">{marketMetrics.gainers}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">LOSERS</p>
                <p className="text-lg font-bold text-red-400">{marketMetrics.losers}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">ACTIVE</p>
                <p className="text-lg font-bold text-orange-400">{marketMetrics.activeRunes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revolutionary Multi-Mode Layout System */}
      <AnimatePresence mode="wait">
        {viewMode === 'professional' && (
          <motion.div
            key="professional"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Professional Trading Layout */}
            <div className="px-6 py-4">
              <Suspense fallback={
                <div className="flex items-center justify-center h-96">
                  <Activity className="h-12 w-12 text-orange-400 animate-pulse" />
                </div>
              }>
                <TradingFloorOverview 
                  data={data.marketData}
                  selectedRune={selectedRune}
                  onSelectRune={setSelectedRune}
                />
              </Suspense>
            </div>

            <div className="flex h-[calc(100vh-200px)] px-6 pb-6 gap-6">
              <div className="w-1/2">
                <Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-900/50 rounded-lg"><Activity className="h-8 w-8 text-orange-400 animate-pulse" /></div>}>
                  <RunesMarketTable data={data.marketData} onSelectRune={setSelectedRune} favorites={favorites} onToggleFavorite={toggleFavorite} />
                </Suspense>
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1">
                  <Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-900/50 rounded-lg"><Activity className="h-8 w-8 text-orange-400 animate-pulse" /></div>}>
                    <RunesProfessionalChart selectedRune={selectedRune} height={350} />
                  </Suspense>
                </div>
                <div className="h-64">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <Suspense fallback={<div className="bg-gray-900/50 rounded-lg animate-pulse" />}><RunesHeatmap /></Suspense>
                    <Suspense fallback={<div className="bg-gray-900/50 rounded-lg animate-pulse" />}><TopRunesMovers /></Suspense>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'holographic' && (
          <motion.div
            key="holographic"
            initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.05, rotateX: 10 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="px-6 py-4"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-96 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-xl">
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Layers className="h-16 w-16 text-cyan-400" />
                </motion.div>
              </div>
            }>
              <HolographicTradingFloor 
                data={data.marketData}
                selectedRune={selectedRune}
                onSelectRune={setSelectedRune}
              />
            </Suspense>
          </motion.div>
        )}

        {viewMode === 'neural' && (
          <motion.div
            key="neural"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.6 }}
            className="px-6 py-4 space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              <Suspense fallback={<div className="h-96 bg-purple-900/20 rounded-xl animate-pulse" />}>
                <QuantumDataMatrix data={data.marketData} selectedRune={selectedRune} />
              </Suspense>
              <Suspense fallback={<div className="h-96 bg-purple-900/20 rounded-xl animate-pulse" />}>
                <Holographic3DChart selectedRune={selectedRune} data={data.marketData} />
              </Suspense>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Suspense fallback={<div className="h-64 bg-purple-900/20 rounded-xl animate-pulse" />}><RunesMarketTable data={data.marketData} onSelectRune={setSelectedRune} favorites={favorites} onToggleFavorite={toggleFavorite} /></Suspense>
              <Suspense fallback={<div className="h-64 bg-purple-900/20 rounded-xl animate-pulse" />}><RunesHeatmap /></Suspense>
              <Suspense fallback={<div className="h-64 bg-purple-900/20 rounded-xl animate-pulse" />}><TopRunesMovers /></Suspense>
            </div>
          </motion.div>
        )}

        {viewMode === 'quantum' && (
          <motion.div
            key="quantum"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.8 }}
            className="px-6 py-4 space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <Suspense fallback={<div className="h-[500px] bg-blue-900/20 rounded-xl animate-pulse" />}>
                <Holographic3DChart selectedRune={selectedRune} data={data.marketData} />
              </Suspense>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Suspense fallback={<div className="h-64 bg-blue-900/20 rounded-xl animate-pulse" />}>
                <QuantumDataMatrix data={data.marketData} selectedRune={selectedRune} />
              </Suspense>
              <Suspense fallback={<div className="h-64 bg-blue-900/20 rounded-xl animate-pulse" />}>
                <RunesHeatmap />
              </Suspense>
              <Suspense fallback={<div className="h-64 bg-blue-900/20 rounded-xl animate-pulse" />}>
                <TopRunesMovers />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {data.isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-orange-500/30 rounded-lg p-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-4"
            >
              <Activity className="h-12 w-12 text-orange-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Loading Market Data</h3>
            <p className="text-gray-400">Fetching real-time Runes data...</p>
          </motion.div>
        </div>
      )}

      {/* Error State */}
      {data.error && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-900/80 border border-red-500 rounded-lg p-4 max-w-sm"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-400 font-medium">Connection Error</span>
            </div>
            <p className="text-sm text-red-300 mt-1">{data.error}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}