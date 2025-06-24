'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, Filter } from 'lucide-react';

import { RunesVolumeChartProps } from './types';
import { BLOOMBERG_DARK_THEME, formatters, TOOLTIP_STYLES, GRID_CONFIG } from './config';
import { useRunesVolumeData, useChartDimensions } from './hooks';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-black/95 border border-orange-500 rounded-lg p-3 shadow-2xl"
      style={TOOLTIP_STYLES.contentStyle}
    >
      <div className="text-orange-500 font-bold text-sm mb-2">
        {formatters.date(label)}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Volume:</span>
          <span className="text-orange-400 font-mono font-bold">{formatters.volume(data.volume)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Volume USD:</span>
          <span className="text-green-400 font-mono">{formatters.price(data.volumeUSD)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Trades:</span>
          <span className="text-blue-400 font-mono">{data.trades.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Avg Size:</span>
          <span className="text-white font-mono">
            {data.trades > 0 ? formatters.volume(data.volume / data.trades) : '0'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Period Selector Component
const PeriodSelector = ({ 
  currentPeriod, 
  onPeriodChange 
}: {
  currentPeriod: string;
  onPeriodChange: (period: string) => void;
}) => {
  const periods = [
    { value: '1h', label: '1H', description: 'Hourly' },
    { value: '4h', label: '4H', description: '4 Hours' },
    { value: '1d', label: '1D', description: 'Daily' },
    { value: '1w', label: '1W', description: 'Weekly' },
  ];

  return (
    <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currentPeriod === period.value
              ? 'bg-orange-500 text-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title={period.description}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// Statistics Panel Component
const StatisticsPanel = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => {
    if (!data.length) return null;

    const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
    const totalVolumeUSD = data.reduce((sum, item) => sum + item.volumeUSD, 0);
    const totalTrades = data.reduce((sum, item) => sum + item.trades, 0);
    const avgVolume = totalVolume / data.length;
    const maxVolume = Math.max(...data.map(item => item.volume));
    const maxVolumeDay = data.find(item => item.volume === maxVolume);

    return {
      totalVolume,
      totalVolumeUSD,
      totalTrades,
      avgVolume,
      maxVolume,
      maxVolumeDay,
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Total Volume</div>
        <div className="text-orange-400 font-bold">{formatters.volume(stats.totalVolume)}</div>
        <div className="text-gray-500 text-xs">{formatters.price(stats.totalVolumeUSD)}</div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Total Trades</div>
        <div className="text-green-400 font-bold">{stats.totalTrades.toLocaleString()}</div>
        <div className="text-gray-500 text-xs">
          Avg: {formatters.volume(stats.avgVolume)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3 col-span-2 lg:col-span-1">
        <div className="text-gray-400 text-xs mb-1">Peak Volume</div>
        <div className="text-blue-400 font-bold">{formatters.volume(stats.maxVolume)}</div>
        <div className="text-gray-500 text-xs">
          {stats.maxVolumeDay ? formatters.date(stats.maxVolumeDay.date) : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export const RunesVolumeChart: React.FC<RunesVolumeChartProps & { runeId: string }> = ({
  runeId,
  height = 300,
  period = '1d',
  showTrades = true,
  className = '',
  ...props
}) => {
  const { dimensions, containerRef } = useChartDimensions();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showStats, setShowStats] = useState(true);
  
  const { data, error, isLoading } = useRunesVolumeData(runeId, selectedPeriod);

  // Calculate color intensity based on volume
  const getBarColor = (volume: number, maxVolume: number) => {
    const intensity = Math.max(0.3, volume / maxVolume);
    const r = Math.floor(255 * intensity);
    const g = Math.floor(107 * intensity);
    const b = Math.floor(53 * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const maxVolume = useMemo(() => 
    data.length > 0 ? Math.max(...data.map(item => item.volume)) : 0,
    [data]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-black border border-red-500 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-red-400">Failed to load volume data</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative bg-black rounded-lg border border-gray-800 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <h3 className="text-white font-bold text-lg">Volume Analysis</h3>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">{selectedPeriod.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Toggle Statistics"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <PeriodSelector
            currentPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <StatisticsPanel data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ width: '100%', height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-orange-500 animate-pulse mx-auto mb-2" />
              <div className="text-gray-400">Loading volume data...</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid {...GRID_CONFIG} />
              
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.date}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.volume}
                width={80}
              />
              
              <Tooltip content={<CustomTooltip />} />

              {/* Volume Bars */}
              <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.volume, maxVolume)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Trades Chart (if enabled) */}
      {showTrades && (
        <div style={{ width: '100%', height: height * 0.6 }} className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Trading Activity</span>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid {...GRID_CONFIG} />
              
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 10 }}
                tickFormatter={formatters.date}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 10 }}
                tickFormatter={(value) => value.toLocaleString()}
                width={60}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-black/95 border border-blue-500 rounded-lg p-2 text-xs">
                      <div className="text-blue-400 font-bold mb-1">{formatters.date(label)}</div>
                      <div className="text-white">Trades: {data.trades.toLocaleString()}</div>
                    </div>
                  );
                }}
              />
              
              <Bar 
                dataKey="trades" 
                fill={BLOOMBERG_DARK_THEME.colors.ma20}
                opacity={0.7}
                radius={[1, 1, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};