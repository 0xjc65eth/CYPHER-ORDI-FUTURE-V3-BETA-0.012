'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Layers, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

import { MarketDepthChartProps } from './types';
import { BLOOMBERG_DARK_THEME, formatters, TOOLTIP_STYLES, GRID_CONFIG } from './config';
import { useMarketDepthData, useChartDimensions } from './hooks';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const isBid = data.bidSize > 0;
  const size = isBid ? data.bidSize : data.askSize;
  const volume = isBid ? data.bidVolume : data.askVolume;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-black/95 border border-orange-500 rounded-lg p-3 shadow-2xl"
      style={TOOLTIP_STYLES.contentStyle}
    >
      <div className="text-orange-500 font-bold text-sm mb-2">
        {isBid ? 'BID' : 'ASK'} - {formatters.price(parseFloat(label))}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Size:</span>
          <span className={`font-mono font-bold ${isBid ? 'text-green-400' : 'text-red-400'}`}>
            {formatters.volume(size)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Total Volume:</span>
          <span className="text-white font-mono">{formatters.volume(volume)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">USD Value:</span>
          <span className="text-blue-400 font-mono">
            {formatters.price(parseFloat(label) * size)}
          </span>
        </div>
        {data.spread > 0 && (
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-700">
            <span className="text-gray-400">Spread:</span>
            <span className="text-yellow-400 font-mono">
              {formatters.price(data.spread)} ({formatters.percentage((data.spread / parseFloat(label)) * 100)})
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Depth Statistics Component
const DepthStatistics = ({ data }: { data: any[] }) => {
  const stats = useMemo(() => {
    if (!data.length) return null;

    const bids = data.filter(item => item.bidSize > 0);
    const asks = data.filter(item => item.askSize > 0);
    
    const totalBidVolume = bids.reduce((sum, item) => sum + item.bidVolume, 0);
    const totalAskVolume = asks.reduce((sum, item) => sum + item.askVolume, 0);
    
    const bestBid = bids.length > 0 ? Math.max(...bids.map(item => item.price)) : 0;
    const bestAsk = asks.length > 0 ? Math.min(...asks.map(item => item.price)) : 0;
    
    const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
    const spreadPercent = bestAsk > 0 ? (spread / bestAsk) * 100 : 0;
    
    const midPrice = bestAsk > 0 && bestBid > 0 ? (bestAsk + bestBid) / 2 : 0;
    
    return {
      totalBidVolume,
      totalAskVolume,
      bestBid,
      bestAsk,
      spread,
      spreadPercent,
      midPrice,
      bidAskRatio: totalAskVolume > 0 ? totalBidVolume / totalAskVolume : 0,
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Best Bid</div>
        <div className="text-green-400 font-bold">{formatters.price(stats.bestBid)}</div>
        <div className="text-gray-500 text-xs">
          Vol: {formatters.volume(stats.totalBidVolume)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Best Ask</div>
        <div className="text-red-400 font-bold">{formatters.price(stats.bestAsk)}</div>
        <div className="text-gray-500 text-xs">
          Vol: {formatters.volume(stats.totalAskVolume)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">Spread</div>
        <div className="text-yellow-400 font-bold">{formatters.price(stats.spread)}</div>
        <div className="text-gray-500 text-xs">
          {formatters.percentage(stats.spreadPercent)}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-3">
        <div className="text-gray-400 text-xs mb-1">B/A Ratio</div>
        <div className={`font-bold ${stats.bidAskRatio > 1 ? 'text-green-400' : stats.bidAskRatio < 1 ? 'text-red-400' : 'text-gray-400'}`}>
          {stats.bidAskRatio.toFixed(2)}
        </div>
        <div className="text-gray-500 text-xs">
          {stats.bidAskRatio > 1 ? 'Bullish' : stats.bidAskRatio < 1 ? 'Bearish' : 'Neutral'}
        </div>
      </div>
    </div>
  );
};

// Depth Control Panel
const DepthControlPanel = ({
  maxDepth,
  onMaxDepthChange,
  showSpread,
  onShowSpreadChange,
}: {
  maxDepth: number;
  onMaxDepthChange: (depth: number) => void;
  showSpread: boolean;
  onShowSpreadChange: (show: boolean) => void;
}) => {
  const depthOptions = [10, 25, 50, 100];

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-sm">Depth:</span>
        <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
          {depthOptions.map((depth) => (
            <button
              key={depth}
              onClick={() => onMaxDepthChange(depth)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                maxDepth === depth
                  ? 'bg-orange-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {depth}
            </button>
          ))}
        </div>
      </div>
      
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showSpread}
          onChange={(e) => onShowSpreadChange(e.target.checked)}
          className="w-4 h-4 text-orange-500 bg-black border-orange-500 rounded focus:ring-orange-500"
        />
        <span className="text-gray-400 text-sm">Show Spread</span>
      </label>
    </div>
  );
};

export const MarketDepthChart: React.FC<MarketDepthChartProps & { runeId: string }> = ({
  runeId,
  height = 400,
  showSpread = true,
  maxDepth: propMaxDepth = 50,
  className = '',
  ...props
}) => {
  const { dimensions, containerRef } = useChartDimensions();
  const { data, error, isLoading, maxDepth, setMaxDepth } = useMarketDepthData(runeId);
  
  const [localShowSpread, setLocalShowSpread] = useState(showSpread);
  const [showStats, setShowStats] = useState(true);

  // Separate bids and asks for visualization
  const chartData = useMemo(() => {
    if (!data.length) return [];

    const bids = data.filter(item => item.bidSize > 0);
    const asks = data.filter(item => item.askSize > 0);
    
    // Create combined data for the area chart
    const combined = [...bids, ...asks].sort((a, b) => a.price - b.price);
    
    return combined.map(item => ({
      ...item,
      cumulativeBidVolume: item.bidVolume,
      cumulativeAskVolume: item.askVolume,
    }));
  }, [data]);

  const midPrice = useMemo(() => {
    const bids = data.filter(item => item.bidSize > 0);
    const asks = data.filter(item => item.askSize > 0);
    
    if (bids.length === 0 || asks.length === 0) return null;
    
    const bestBid = Math.max(...bids.map(item => item.price));
    const bestAsk = Math.min(...asks.map(item => item.price));
    
    return (bestBid + bestAsk) / 2;
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-black border border-red-500 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-red-400">Failed to load market depth</div>
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
          <Layers className="w-5 h-5 text-orange-500" />
          <h3 className="text-white font-bold text-lg">Market Depth</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">LIVE</span>
          </div>
        </div>
        
        <DepthControlPanel
          maxDepth={maxDepth}
          onMaxDepthChange={setMaxDepth}
          showSpread={localShowSpread}
          onShowSpreadChange={setLocalShowSpread}
        />
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <DepthStatistics data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ width: '100%', height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <div className="text-gray-400">Loading market depth...</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid {...GRID_CONFIG} />
              
              <XAxis
                dataKey="price"
                type="number"
                scale="linear"
                domain={['dataMin * 0.999', 'dataMax * 1.001']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.price}
              />
              
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.volume}
                width={80}
              />
              
              <Tooltip content={<CustomTooltip />} />

              {/* Bid Area (Green) */}
              <Area
                type="stepAfter"
                dataKey="cumulativeBidVolume"
                stroke={BLOOMBERG_DARK_THEME.colors.bid}
                fill={BLOOMBERG_DARK_THEME.colors.bid}
                fillOpacity={0.3}
                strokeWidth={2}
                connectNulls={false}
              />

              {/* Ask Area (Red) */}
              <Area
                type="stepBefore"
                dataKey="cumulativeAskVolume"
                stroke={BLOOMBERG_DARK_THEME.colors.ask}
                fill={BLOOMBERG_DARK_THEME.colors.ask}
                fillOpacity={0.3}
                strokeWidth={2}
                connectNulls={false}
              />

              {/* Mid Price Line */}
              {midPrice && localShowSpread && (
                <ReferenceLine
                  x={midPrice}
                  stroke={BLOOMBERG_DARK_THEME.colors.accent}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Mid: ${formatters.price(midPrice)}`,
                    position: 'insideTopRight',
                    fill: BLOOMBERG_DARK_THEME.colors.accent,
                    fontSize: 12,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Bids (Buy Orders)</span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-red-400">Asks (Sell Orders)</span>
        </div>
        {localShowSpread && midPrice && (
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400">Mid Price</span>
          </div>
        )}
      </div>
    </div>
  );
};