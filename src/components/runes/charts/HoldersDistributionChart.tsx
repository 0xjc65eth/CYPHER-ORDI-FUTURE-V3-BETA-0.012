'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PieChart as PieChartIcon, BarChart3, Eye, EyeOff } from 'lucide-react';

import { HoldersDistributionChartProps } from './types';
import { BLOOMBERG_DARK_THEME, formatters, TOOLTIP_STYLES, GRID_CONFIG } from './config';
import { useHoldersDistributionData, useChartDimensions } from './hooks';

// Color palette for different holder ranges
const HOLDER_COLORS = [
  '#FF6B35', // Orange - Whales
  '#FFA500', // Gold - Large holders
  '#FFD700', // Yellow - Medium holders
  '#00FF41', // Green - Small holders
  '#00BFFF', // Blue - Micro holders
  '#FF69B4', // Pink - Dust holders
  '#9370DB', // Purple - Others
];

// Custom Tooltip Component for Pie Chart
const PieTooltip = ({ active, payload }: any) => {
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
        {data.range}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Holders:</span>
          <span className="text-white font-mono font-bold">{formatters.holders(data.holders)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Percentage:</span>
          <span className="text-orange-400 font-mono">{formatters.percentage(data.percentage)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Total Amount:</span>
          <span className="text-green-400 font-mono">{formatters.volume(data.amount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">USD Value:</span>
          <span className="text-blue-400 font-mono">{formatters.price(data.value)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Custom Tooltip Component for Bar Chart
const BarTooltip = ({ active, payload, label }: any) => {
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
        {label}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Holders:</span>
          <span className="text-white font-mono font-bold">{formatters.holders(data.holders)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Average Holdings:</span>
          <span className="text-blue-400 font-mono">
            {data.holders > 0 ? formatters.volume(data.amount / data.holders) : '0'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Distribution Statistics Component
const DistributionStatistics = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => {
    if (!data.length) return null;

    const totalHolders = data.reduce((sum, item) => sum + item.holders, 0);
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate concentration metrics
    const whaleData = data.find(item => item.range.toLowerCase().includes('whale')) || { holders: 0, amount: 0 };
    const whaleConcentration = totalAmount > 0 ? (whaleData.amount / totalAmount) * 100 : 0;
    
    // Calculate Gini coefficient (wealth inequality)
    const sortedData = [...data].sort((a, b) => a.amount - b.amount);
    let giniSum = 0;
    let totalAmountForGini = 0;
    
    sortedData.forEach((item, index) => {
      totalAmountForGini += item.amount;
      giniSum += item.amount * (2 * (index + 1) - sortedData.length - 1);
    });
    
    const giniCoefficient = totalAmountForGini > 0 ? giniSum / (totalAmountForGini * sortedData.length) : 0;
    
    return {
      totalHolders,
      totalAmount,
      totalValue,
      whaleConcentration,
      giniCoefficient: Math.abs(giniCoefficient),
      averageHolding: totalHolders > 0 ? totalAmount / totalHolders : 0,
    };
  }, [data]);

  if (!stats) return null;

  const getGiniColor = (gini: number) => {
    if (gini < 0.3) return 'text-green-400';
    if (gini < 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGiniDescription = (gini: number) => {
    if (gini < 0.3) return 'Low Inequality';
    if (gini < 0.5) return 'Moderate Inequality';
    return 'High Inequality';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Total Holders</div>
        <div className="text-white font-bold">{formatters.holders(stats.totalHolders)}</div>
        <div className="text-gray-500 text-xs">
          Avg: {formatters.volume(stats.averageHolding)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Total Supply</div>
        <div className="text-orange-400 font-bold">{formatters.volume(stats.totalAmount)}</div>
        <div className="text-gray-500 text-xs">
          {formatters.price(stats.totalValue)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Whale Concentration</div>
        <div className={`font-bold ${stats.whaleConcentration > 50 ? 'text-red-400' : stats.whaleConcentration > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
          {formatters.percentage(stats.whaleConcentration)}
        </div>
        <div className="text-gray-500 text-xs">
          {stats.whaleConcentration > 50 ? 'Very High' : stats.whaleConcentration > 30 ? 'High' : 'Normal'}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Gini Coefficient</div>
        <div className={`font-bold ${getGiniColor(stats.giniCoefficient)}`}>
          {stats.giniCoefficient.toFixed(3)}
        </div>
        <div className="text-gray-500 text-xs">
          {getGiniDescription(stats.giniCoefficient)}
        </div>
      </div>
    </div>
  );
};

// Chart Type Selector
const ChartTypeSelector = ({
  chartType,
  onChartTypeChange,
}: {
  chartType: 'pie' | 'bar';
  onChartTypeChange: (type: 'pie' | 'bar') => void;
}) => (
  <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
    <button
      onClick={() => onChartTypeChange('pie')}
      className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        chartType === 'pie'
          ? 'bg-orange-500 text-black'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <PieChartIcon className="w-3 h-3" />
      <span>Pie</span>
    </button>
    <button
      onClick={() => onChartTypeChange('bar')}
      className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        chartType === 'bar'
          ? 'bg-orange-500 text-black'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      <BarChart3 className="w-3 h-3" />
      <span>Bar</span>
    </button>
  </div>
);

// Custom Legend Component
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-4 mt-4">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-gray-300 text-xs">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const HoldersDistributionChart: React.FC<HoldersDistributionChartProps & { runeId: string }> = ({
  runeId,
  height = 400,
  showPercentage = true,
  showValue = true,
  className = '',
  ...props
}) => {
  const { dimensions, containerRef } = useChartDimensions();
  const { data, error, isLoading } = useHoldersDistributionData(runeId);
  
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [showStats, setShowStats] = useState(true);

  // Prepare data for charts
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: HOLDER_COLORS[index % HOLDER_COLORS.length],
    }));
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-black border border-red-500 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-red-400">Failed to load holders distribution</div>
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
          <Users className="w-5 h-5 text-orange-500" />
          <h3 className="text-white font-bold text-lg">Holders Distribution</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Toggle Statistics"
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <ChartTypeSelector
            chartType={chartType}
            onChartTypeChange={setChartType}
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
            <DistributionStatistics data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ width: '100%', height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="w-8 h-8 text-orange-500 animate-pulse mx-auto mb-2" />
              <div className="text-gray-400">Loading holders distribution...</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={height * 0.3}
                  innerRadius={height * 0.15}
                  paddingAngle={2}
                  dataKey="holders"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid {...GRID_CONFIG} />
                
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                  tickFormatter={formatters.holders}
                  width={80}
                />
                
                <Tooltip content={<BarTooltip />} />
                
                <Bar dataKey="holders" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Additional Insights */}
      {data.length > 0 && (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <h4 className="text-orange-500 font-bold text-sm mb-2">Distribution Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Most Common Range:</span>
              <span className="text-white ml-2 font-mono">
                {data.sort((a, b) => b.holders - a.holders)[0]?.range || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Largest Holding Range:</span>
              <span className="text-white ml-2 font-mono">
                {data.sort((a, b) => b.amount - a.amount)[0]?.range || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};