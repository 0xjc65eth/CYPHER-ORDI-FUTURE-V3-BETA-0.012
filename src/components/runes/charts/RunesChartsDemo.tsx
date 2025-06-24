'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Layers, Users, RefreshCw } from 'lucide-react';

import {
  RunesPriceChart,
  RunesVolumeChart,
  MarketDepthChart,
  HoldersDistributionChart,
} from './index';

interface RunesChartsDemoProps {
  runeId?: string;
  className?: string;
}

// Sample data for demonstration when API is not available
const samplePriceData = [
  {
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    open: 0.00001234,
    high: 0.00001456,
    low: 0.00001123,
    close: 0.00001345,
    volume: 1500000,
    ma20: 0.00001300,
    ma50: 0.00001280,
  },
  {
    timestamp: Date.now() - 23 * 60 * 60 * 1000,
    date: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    open: 0.00001345,
    high: 0.00001567,
    low: 0.00001234,
    close: 0.00001456,
    volume: 1750000,
    ma20: 0.00001320,
    ma50: 0.00001290,
  },
  // Add more sample data as needed
];

const sampleVolumeData = [
  {
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    volume: 1500000,
    volumeUSD: 18750,
    trades: 245,
    period: '1d',
  },
  {
    timestamp: Date.now() - 23 * 60 * 60 * 1000,
    date: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    volume: 1750000,
    volumeUSD: 21875,
    trades: 298,
    period: '1d',
  },
];

const sampleDepthData = [
  { price: 0.00001200, bidSize: 500000, askSize: 0, bidVolume: 500000, askVolume: 0, spread: 0.00000100 },
  { price: 0.00001250, bidSize: 300000, askSize: 0, bidVolume: 800000, askVolume: 0, spread: 0.00000100 },
  { price: 0.00001350, bidSize: 0, askSize: 400000, bidVolume: 0, askVolume: 400000, spread: 0.00000100 },
  { price: 0.00001400, bidSize: 0, askSize: 600000, bidVolume: 0, askVolume: 1000000, spread: 0.00000100 },
];

const sampleHoldersData = [
  { range: '1-100', holders: 15420, percentage: 65.2, amount: 1250000, value: 15625 },
  { range: '101-1,000', holders: 4580, percentage: 19.4, amount: 2100000, value: 26250 },
  { range: '1,001-10,000', holders: 2340, percentage: 9.9, amount: 3500000, value: 43750 },
  { range: '10,001-100,000', holders: 890, percentage: 3.8, amount: 4800000, value: 60000 },
  { range: '100,001+', holders: 170, percentage: 0.7, amount: 8350000, value: 104375 },
];

export const RunesChartsDemo: React.FC<RunesChartsDemoProps> = ({
  runeId = 'demo-rune',
  className = '',
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedChart, setSelectedChart] = useState<'all' | 'price' | 'volume' | 'depth' | 'holders'>('all');

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const chartTypes = [
    { id: 'all', label: 'All Charts', icon: TrendingUp },
    { id: 'price', label: 'Price', icon: TrendingUp },
    { id: 'volume', label: 'Volume', icon: BarChart3 },
    { id: 'depth', label: 'Depth', icon: Layers },
    { id: 'holders', label: 'Holders', icon: Users },
  ];

  return (
    <div className={`bg-black min-h-screen p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Runes Advanced Charts
            </h1>
            <p className="text-gray-400">
              Professional trading charts with Bloomberg Terminal styling
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedChart(type.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedChart === type.id
                    ? 'bg-orange-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        {(selectedChart === 'all' || selectedChart === 'price') && (
          <motion.div
            key={`price-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RunesPriceChart
              runeId={runeId}
              height={500}
              showVolume={true}
              showIndicators={true}
              zoomable={true}
              realTime={true}
              className="mb-8"
            />
          </motion.div>
        )}

        {(selectedChart === 'all' || selectedChart === 'volume') && (
          <motion.div
            key={`volume-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RunesVolumeChart
              runeId={runeId}
              height={400}
              period="1d"
              showTrades={true}
              className="mb-8"
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {(selectedChart === 'all' || selectedChart === 'depth') && (
            <motion.div
              key={`depth-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MarketDepthChart
                runeId={runeId}
                height={450}
                showSpread={true}
                maxDepth={50}
              />
            </motion.div>
          )}

          {(selectedChart === 'all' || selectedChart === 'holders') && (
            <motion.div
              key={`holders-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <HoldersDistributionChart
                runeId={runeId}
                height={450}
                showPercentage={true}
                showValue={true}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="mt-12 bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-bold text-orange-500 mb-4">Chart Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Price Chart</h3>
            <ul className="text-gray-400 space-y-1">
              <li>• Candlestick visualization</li>
              <li>• Moving averages (MA20, MA50)</li>
              <li>• VWAP indicator</li>
              <li>• Zoom and pan controls</li>
              <li>• Volume overlay</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Volume Chart</h3>
            <ul className="text-gray-400 space-y-1">
              <li>• Period selection (1H-1W)</li>
              <li>• Trading activity overlay</li>
              <li>• Volume statistics</li>
              <li>• Color intensity mapping</li>
              <li>• Average trade size</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Market Depth</h3>
            <ul className="text-gray-400 space-y-1">
              <li>• Bid/Ask visualization</li>
              <li>• Spread analysis</li>
              <li>• Order book depth</li>
              <li>• Mid-price reference</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Holders Distribution</h3>
            <ul className="text-gray-400 space-y-1">
              <li>• Pie and bar chart views</li>
              <li>• Whale concentration</li>
              <li>• Gini coefficient</li>
              <li>• Distribution insights</li>
              <li>• Range analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};