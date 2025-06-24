'use client';

import React, { useState, useCallback } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, TrendingUp, Activity, Settings } from 'lucide-react';

import { RunesPriceChartProps, TooltipData } from './types';
import { BLOOMBERG_DARK_THEME, formatters, TOOLTIP_STYLES, GRID_CONFIG } from './config';
import { useRunesPriceData, useChartDimensions } from './hooks';

interface CandlestickBarProps {
  payload?: any;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// Custom Candlestick Component
const CandlestickBar: React.FC<CandlestickBarProps> = ({ payload, x, y, width, height }) => {
  if (!payload || !x || !y || !width || !height) return null;

  const { open, high, low, close } = payload;
  const isUp = close > open;
  const color = isUp ? BLOOMBERG_DARK_THEME.colors.candleUp : BLOOMBERG_DARK_THEME.colors.candleDown;
  
  const bodyHeight = Math.abs(close - open);
  const bodyY = Math.min(close, open);
  const wickTop = high;
  const wickBottom = low;
  
  // Scale calculations
  const priceRange = Math.max(high - low, 0.000001);
  const scaleFactor = height / priceRange;
  
  const bodyScaledHeight = bodyHeight * scaleFactor;
  const bodyScaledY = y + (wickTop - bodyY) * scaleFactor;
  const wickScaledTop = y;
  const wickScaledBottom = y + height;

  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={x + width / 2}
        y1={wickScaledTop}
        x2={x + width / 2}
        y2={wickScaledBottom}
        stroke={color}
        strokeWidth={1}
        opacity={0.8}
      />
      {/* Open-Close Body */}
      <rect
        x={x + width * 0.2}
        y={bodyScaledY}
        width={width * 0.6}
        height={Math.max(bodyScaledHeight, 1)}
        fill={isUp ? 'transparent' : color}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.9}
      />
    </g>
  );
};

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
        {formatters.date(label)} {formatters.timestamp(data.timestamp)}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Open:</span>
          <span className="text-white font-mono">{formatters.price(data.open)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">High:</span>
          <span className="text-green-400 font-mono">{formatters.price(data.high)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Low:</span>
          <span className="text-red-400 font-mono">{formatters.price(data.low)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Close:</span>
          <span className="text-white font-mono font-bold">{formatters.price(data.close)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Volume:</span>
          <span className="text-orange-400 font-mono">{formatters.volume(data.volume)}</span>
        </div>
        {data.ma20 && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">MA20:</span>
            <span className="text-blue-400 font-mono">{formatters.price(data.ma20)}</span>
          </div>
        )}
        {data.ma50 && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">MA50:</span>
            <span className="text-pink-400 font-mono">{formatters.price(data.ma50)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Settings Panel Component
const SettingsPanel = ({ 
  indicators, 
  onToggleIndicator, 
  onClose 
}: {
  indicators: any;
  onToggleIndicator: (indicator: string) => void;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    className="absolute top-0 right-0 bg-black/95 border border-orange-500 rounded-lg p-4 shadow-2xl z-50 min-w-48"
  >
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-orange-500 font-bold">Technical Indicators</h4>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
    <div className="space-y-2">
      {Object.entries(indicators).map(([key, value]) => (
        <label key={key} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={() => onToggleIndicator(key)}
            className="w-4 h-4 text-orange-500 bg-black border-orange-500 rounded focus:ring-orange-500"
          />
          <span className="text-white text-sm">{key.toUpperCase()}</span>
        </label>
      ))}
    </div>
  </motion.div>
);

export const RunesPriceChart: React.FC<RunesPriceChartProps & { runeId: string }> = ({
  runeId,
  height = 400,
  showVolume = true,
  showIndicators = true,
  zoomable = true,
  realTime = true,
  className = '',
  ...props
}) => {
  const { dimensions, containerRef } = useChartDimensions();
  const { data, error, isLoading, zoom, indicators, onZoom, toggleIndicator } = useRunesPriceData(runeId);
  
  const [showSettings, setShowSettings] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => {
    if (zoomLevel < 5) {
      const newZoom = zoomLevel + 0.5;
      setZoomLevel(newZoom);
      const dataLength = data.length;
      const newRange = Math.floor(dataLength / newZoom);
      const startIndex = Math.max(0, dataLength - newRange);
      onZoom({ startIndex, endIndex: dataLength, scale: newZoom });
    }
  }, [zoomLevel, data.length, onZoom]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > 0.5) {
      const newZoom = zoomLevel - 0.5;
      setZoomLevel(newZoom);
      const dataLength = data.length;
      const newRange = Math.floor(dataLength / newZoom);
      const startIndex = Math.max(0, dataLength - newRange);
      onZoom({ startIndex, endIndex: dataLength, scale: newZoom });
    }
  }, [zoomLevel, data.length, onZoom]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-black border border-red-500 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <div className="text-red-400">Failed to load price data</div>
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
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="text-white font-bold text-lg">Price Chart</h3>
          {realTime && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs">LIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {zoomable && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-gray-400 text-sm">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                disabled={zoomLevel >= 5}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}
          
          {showIndicators && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            indicators={indicators}
            onToggleIndicator={toggleIndicator}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ width: '100%', height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <div className="text-gray-400">Loading price data...</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid {...GRID_CONFIG} />
              
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.date}
              />
              
              <YAxis
                domain={['dataMin * 0.995', 'dataMax * 1.005']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: BLOOMBERG_DARK_THEME.colors.text, fontSize: 12 }}
                tickFormatter={formatters.price}
                width={80}
              />
              
              <Tooltip content={<CustomTooltip />} />

              {/* Price Candlesticks */}
              <Bar
                dataKey="close"
                fill="transparent"
                shape={<CandlestickBar />}
              />

              {/* Moving Averages */}
              {indicators.ma20 && (
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke={BLOOMBERG_DARK_THEME.colors.ma20}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              )}
              
              {indicators.ma50 && (
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke={BLOOMBERG_DARK_THEME.colors.ma50}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              )}

              {/* VWAP */}
              {indicators.vwap && (
                <Line
                  type="monotone"
                  dataKey="vwap"
                  stroke="#FFD700"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={false}
                />
              )}

              {/* Brush for zooming */}
              {zoomable && (
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={BLOOMBERG_DARK_THEME.colors.primary}
                  fill="rgba(255, 107, 53, 0.1)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume Chart */}
      {showVolume && (
        <div style={{ width: '100%', height: 100 }} className="mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
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
                tickFormatter={formatters.volume}
                width={60}
              />
              
              <Bar
                dataKey="volume"
                fill={BLOOMBERG_DARK_THEME.colors.volume}
                opacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};