'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { ArbitrageOpportunity } from '@/hooks/useArbitrage';

interface SpreadChartProps {
  opportunities: ArbitrageOpportunity[];
}

interface SpreadDataPoint {
  timestamp: number;
  symbol: string;
  spread: number;
  type: 'ordinals' | 'runes' | 'tokens';
  buySource: string;
  sellSource: string;
  volume: number;
}

// Generate historical spread data for the chart
const generateSpreadHistory = (opportunities: ArbitrageOpportunity[]): SpreadDataPoint[] => {
  const now = Date.now();
  const history: SpreadDataPoint[] = [];
  
  // Generate data points for the last 6 hours (every 10 minutes)
  for (let i = 0; i < 36; i++) {
    const timestamp = now - (i * 10 * 60 * 1000); // 10 minutes intervals
    
    opportunities.forEach(opp => {
      // Simulate historical spread variation
      const baseSpread = opp.spread;
      const variation = (Math.random() - 0.5) * 5; // ±2.5% variation
      const historicalSpread = Math.max(3, baseSpread + variation);
      
      // Add some randomness to make it realistic
      if (Math.random() > 0.3) { // 70% chance of having data at this point
        history.push({
          timestamp,
          symbol: opp.symbol,
          spread: historicalSpread,
          type: opp.type,
          buySource: opp.buySource,
          sellSource: opp.sellSource,
          volume: opp.volume24h || 0
        });
      }
    });
  }
  
  return history.sort((a, b) => a.timestamp - b.timestamp);
};

export default function SpreadChart({ opportunities }: SpreadChartProps) {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['ORDI', 'SATS', 'NodeMonkes']);
  const [timeframe, setTimeframe] = useState<string>('6h');
  const [selectedType, setSelectedType] = useState<string>('all');

  const spreadHistory = useMemo(() => generateSpreadHistory(opportunities), [opportunities]);

  const filteredData = useMemo(() => {
    return spreadHistory.filter(point => {
      const symbolMatch = selectedSymbols.length === 0 || selectedSymbols.includes(point.symbol);
      const typeMatch = selectedType === 'all' || point.type === selectedType;
      
      // Timeframe filter
      const now = Date.now();
      let timeMatch = true;
      if (timeframe === '1h') {
        timeMatch = point.timestamp > now - 3600000;
      } else if (timeframe === '3h') {
        timeMatch = point.timestamp > now - 10800000;
      } else if (timeframe === '6h') {
        timeMatch = point.timestamp > now - 21600000;
      }
      
      return symbolMatch && typeMatch && timeMatch;
    });
  }, [spreadHistory, selectedSymbols, timeframe, selectedType]);

  const uniqueSymbols = useMemo(() => {
    return Array.from(new Set(opportunities.map(opp => opp.symbol)));
  }, [opportunities]);

  const chartData = useMemo(() => {
    // Group data by symbol for charting
    const groupedData: { [symbol: string]: SpreadDataPoint[] } = {};
    
    filteredData.forEach(point => {
      if (!groupedData[point.symbol]) {
        groupedData[point.symbol] = [];
      }
      groupedData[point.symbol].push(point);
    });
    
    return groupedData;
  }, [filteredData]);

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getSymbolColor = (symbol: string, index: number) => {
    const colors = [
      'text-orange-400 border-orange-400',
      'text-blue-400 border-blue-400', 
      'text-green-400 border-green-400',
      'text-purple-400 border-purple-400',
      'text-cyan-400 border-cyan-400',
      'text-pink-400 border-pink-400',
      'text-yellow-400 border-yellow-400',
      'text-red-400 border-red-400',
    ];
    return colors[index % colors.length];
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentStats = useMemo(() => {
    const symbols = Object.keys(chartData);
    if (symbols.length === 0) return null;

    const stats = symbols.map(symbol => {
      const points = chartData[symbol];
      if (points.length === 0) return null;

      const latestPoint = points[points.length - 1];
      const firstPoint = points[0];
      const change = latestPoint.spread - firstPoint.spread;
      const changePercent = firstPoint.spread > 0 ? (change / firstPoint.spread) * 100 : 0;

      return {
        symbol,
        currentSpread: latestPoint.spread,
        change,
        changePercent,
        type: latestPoint.type
      };
    }).filter(Boolean);

    return stats;
  }, [chartData]);

  // Simple SVG line chart implementation
  const renderChart = () => {
    const width = 100; // Percentage width
    const height = 200; // Fixed height in pixels
    const symbols = Object.keys(chartData);
    
    if (symbols.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Selecione ativos para visualizar</p>
          </div>
        </div>
      );
    }

    const allPoints = filteredData.filter(p => selectedSymbols.includes(p.symbol));
    if (allPoints.length === 0) return null;

    const minSpread = Math.min(...allPoints.map(p => p.spread));
    const maxSpread = Math.max(...allPoints.map(p => p.spread));
    const minTime = Math.min(...allPoints.map(p => p.timestamp));
    const maxTime = Math.max(...allPoints.map(p => p.timestamp));

    const spreadRange = maxSpread - minSpread || 1;
    const timeRange = maxTime - minTime || 1;

    return (
      <div className="relative">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-48 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y * height / 100}
              x2={width}
              y2={y * height / 100}
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Chart lines for each symbol */}
          {symbols.map((symbol, symbolIndex) => {
            const points = chartData[symbol] || [];
            if (points.length < 2) return null;

            const pathData = points.map((point, index) => {
              const x = ((point.timestamp - minTime) / timeRange) * width;
              const y = height - ((point.spread - minSpread) / spreadRange) * height;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');

            const colorClass = getSymbolColor(symbol, symbolIndex);
            const strokeColor = colorClass.includes('orange') ? '#fb923c' :
                              colorClass.includes('blue') ? '#60a5fa' :
                              colorClass.includes('green') ? '#4ade80' :
                              colorClass.includes('purple') ? '#a78bfa' :
                              colorClass.includes('cyan') ? '#22d3ee' :
                              colorClass.includes('pink') ? '#f472b6' :
                              colorClass.includes('yellow') ? '#facc15' : '#f87171';

            return (
              <g key={symbol}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  opacity="0.8"
                />
                {/* Data points */}
                {points.map((point, index) => {
                  const x = ((point.timestamp - minTime) / timeRange) * width;
                  const y = height - ((point.spread - minSpread) / spreadRange) * height;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill={strokeColor}
                      opacity="0.9"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-12">
          <span>{maxSpread.toFixed(1)}%</span>
          <span>{((maxSpread + minSpread) / 2).toFixed(1)}%</span>
          <span>{minSpread.toFixed(1)}%</span>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {minTime && maxTime && (
            <>
              <span>{formatTime(minTime)}</span>
              <span>{formatTime(maxTime)}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Período:</span>
          <div className="flex gap-1">
            {[
              { key: '1h', label: '1h' },
              { key: '3h', label: '3h' },
              { key: '6h', label: '6h' }
            ].map(period => (
              <Button
                key={period.key}
                size="sm"
                variant={timeframe === period.key ? 'default' : 'outline'}
                className={timeframe === period.key ? 'bg-cyan-600' : 'border-gray-600 hover:border-cyan-500'}
                onClick={() => setTimeframe(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Tipo:</span>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'ordinals', label: 'Ordinals' },
              { key: 'runes', label: 'Runes' },
              { key: 'tokens', label: 'Tokens' }
            ].map(type => (
              <Button
                key={type.key}
                size="sm"
                variant={selectedType === type.key ? 'default' : 'outline'}
                className={selectedType === type.key ? 'bg-purple-600' : 'border-gray-600 hover:border-purple-500'}
                onClick={() => setSelectedType(type.key)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Selection */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-300 text-sm">Ativos para Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueSymbols.map((symbol, index) => {
              const isSelected = selectedSymbols.includes(symbol);
              const colorClass = getSymbolColor(symbol, index);
              
              return (
                <Button
                  key={symbol}
                  size="sm"
                  variant="outline"
                  className={`${isSelected ? colorClass : 'border-gray-600 text-gray-400'} transition-colors`}
                  onClick={() => toggleSymbol(symbol)}
                >
                  {isSelected ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  {symbol}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-black/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução de Spreads • Últimas {timeframe}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pl-12">
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* Current Stats */}
      {currentStats && currentStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentStats.map((stat, index) => {
            if (!stat) return null;
            
            const colorClass = getSymbolColor(stat.symbol, index);
            
            return (
              <Card key={stat.symbol} className="bg-gray-800/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        stat.type === 'ordinals' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                        stat.type === 'runes' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                        'bg-blue-500/20 border-blue-500 text-blue-400'
                      } border text-xs`}>
                        {stat.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-white">{stat.symbol}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-white">
                      {stat.currentSpread.toFixed(1)}%
                    </div>
                    <div className={`text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}% 
                      ({stat.changePercent >= 0 ? '+' : ''}{stat.changePercent.toFixed(1)}%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}