'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Users, 
  Maximize2, 
  Minimize2,
  Settings,
  RefreshCw,
  Filter
} from 'lucide-react';

import {
  RunesPriceChart,
  RunesVolumeChart,
  MarketDepthChart,
  HoldersDistributionChart,
} from './index';

interface RunesAdvancedChartsSectionProps {
  runeId: string;
  className?: string;
  enableFullscreen?: boolean;
}

const chartConfigs = [
  {
    id: 'price',
    title: 'Price Analysis',
    icon: TrendingUp,
    description: 'Candlestick chart with technical indicators',
    component: RunesPriceChart,
    defaultProps: {
      height: 500,
      showVolume: true,
      showIndicators: true,
      zoomable: true,
      realTime: true,
    },
  },
  {
    id: 'volume',
    title: 'Volume Analysis',
    icon: BarChart3,
    description: 'Trading volume and activity metrics',
    component: RunesVolumeChart,
    defaultProps: {
      height: 400,
      period: '1d',
      showTrades: true,
    },
  },
  {
    id: 'depth',
    title: 'Market Depth',
    icon: Layers,
    description: 'Order book visualization and spread analysis',
    component: MarketDepthChart,
    defaultProps: {
      height: 400,
      showSpread: true,
      maxDepth: 50,
    },
  },
  {
    id: 'holders',
    title: 'Holders Distribution',
    icon: Users,
    description: 'Token distribution and concentration metrics',
    component: HoldersDistributionChart,
    defaultProps: {
      height: 400,
      showPercentage: true,
      showValue: true,
    },
  },
];

export const RunesAdvancedChartsSection: React.FC<RunesAdvancedChartsSectionProps> = ({
  runeId,
  className = '',
  enableFullscreen = true,
}) => {
  const [activeChart, setActiveChart] = useState<string>('price');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const activeConfig = chartConfigs.find(config => config.id === activeChart);
  const ActiveComponent = activeConfig?.component || RunesPriceChart;

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">Advanced Charts</h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">LIVE DATA</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Chart Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {enableFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex overflow-x-auto bg-gray-900 border-b border-gray-800">
        {chartConfigs.map((config) => {
          const IconComponent = config.icon;
          return (
            <button
              key={config.id}
              onClick={() => setActiveChart(config.id)}
              className={`flex items-center space-x-2 px-4 py-3 min-w-fit border-b-2 transition-all ${
                activeChart === config.id
                  ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">{config.title}</div>
                <div className="text-xs text-gray-500">{config.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 border-b border-gray-700 p-4"
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Chart Settings:</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-orange-500 bg-black border-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-300 text-sm">Real-time Updates</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-orange-500 bg-black border-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-300 text-sm">Show Animations</span>
                </label>
                
                <select className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600">
                  <option value="auto">Auto Refresh</option>
                  <option value="5s">5 seconds</option>
                  <option value="10s">10 seconds</option>
                  <option value="30s">30 seconds</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Chart */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-auto'} bg-black`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeChart}-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ActiveComponent
              runeId={runeId}
              {...activeConfig?.defaultProps}
              height={isFullscreen ? 600 : activeConfig?.defaultProps.height}
              className="p-0"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Chart Info Footer */}
      {activeConfig && (
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <activeConfig.icon className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium">{activeConfig.title}</span>
              </div>
              <span className="text-gray-400 text-sm">{activeConfig.description}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>Rune ID: {runeId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
};