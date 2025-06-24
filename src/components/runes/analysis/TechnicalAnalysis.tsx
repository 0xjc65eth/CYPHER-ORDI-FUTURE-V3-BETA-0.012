'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Brain,
  LineChart
} from 'lucide-react';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  timeframe: string;
  description: string;
}

interface PatternSignal {
  pattern: string;
  confidence: number;
  direction: 'BULLISH' | 'BEARISH';
  target: number;
  stopLoss: number;
  timeDetected: string;
}

interface SupportResistance {
  level: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number;
  touches: number;
  lastTest: string;
}

export default function TechnicalAnalysis() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [patterns, setPatterns] = useState<PatternSignal[]>([]);
  const [levels, setLevels] = useState<SupportResistance[]>([]);
  const [overallSignal, setOverallSignal] = useState<'BUY' | 'SELL' | 'NEUTRAL'>('NEUTRAL');

  const timeframes = ['5m', '15m', '1H', '4H', '1D', '1W'];

  useEffect(() => {
    generateTechnicalData();
  }, [selectedTimeframe]);

  const generateTechnicalData = () => {
    // Generate realistic technical indicators
    const newIndicators: TechnicalIndicator[] = [
      {
        name: 'RSI (14)',
        value: 45 + Math.random() * 40,
        signal: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'NEUTRAL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Relative Strength Index - momentum oscillator'
      },
      {
        name: 'MACD',
        value: (Math.random() - 0.5) * 1000,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Moving Average Convergence Divergence'
      },
      {
        name: 'Bollinger Bands',
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'NEUTRAL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Volatility bands indicator'
      },
      {
        name: 'Stochastic %K',
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Momentum indicator comparing closing price to price range'
      },
      {
        name: 'Williams %R',
        value: Math.random() * 100,
        signal: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'NEUTRAL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Momentum indicator measuring overbought/oversold levels'
      },
      {
        name: 'CCI (20)',
        value: (Math.random() - 0.5) * 400,
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        strength: Math.random() * 100,
        timeframe: selectedTimeframe,
        description: 'Commodity Channel Index'
      }
    ];

    // Generate pattern signals
    const patternNames = [
      'Double Top', 'Head and Shoulders', 'Ascending Triangle', 'Bull Flag',
      'Falling Wedge', 'Cup and Handle', 'Inverse Head and Shoulders', 'Bear Flag'
    ];

    const newPatterns: PatternSignal[] = patternNames.slice(0, 3).map(pattern => ({
      pattern,
      confidence: 60 + Math.random() * 35,
      direction: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      target: 45000 + Math.random() * 10000,
      stopLoss: 40000 + Math.random() * 5000,
      timeDetected: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()
    }));

    // Generate support/resistance levels
    const newLevels: SupportResistance[] = [
      {
        level: 44500,
        type: 'SUPPORT',
        strength: 85,
        touches: 5,
        lastTest: '2 hours ago'
      },
      {
        level: 47200,
        type: 'RESISTANCE',
        strength: 92,
        touches: 7,
        lastTest: '1 hour ago'
      },
      {
        level: 42800,
        type: 'SUPPORT',
        strength: 78,
        touches: 3,
        lastTest: '4 hours ago'
      }
    ];

    setIndicators(newIndicators);
    setPatterns(newPatterns);
    setLevels(newLevels);

    // Calculate overall signal
    const buySignals = newIndicators.filter(i => i.signal === 'BUY').length;
    const sellSignals = newIndicators.filter(i => i.signal === 'SELL').length;
    
    if (buySignals > sellSignals + 1) {
      setOverallSignal('BUY');
    } else if (sellSignals > buySignals + 1) {
      setOverallSignal('SELL');
    } else {
      setOverallSignal('NEUTRAL');
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-400/20 border-green-400';
      case 'SELL': return 'text-red-400 bg-red-400/20 border-red-400';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="h-3 w-3" />;
      case 'SELL': return <TrendingDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                TECHNICAL ANALYSIS
              </h1>
            </div>
            <Badge className={`${getSignalColor(overallSignal)} border text-sm px-3 py-1`}>
              {getSignalIcon(overallSignal)}
              OVERALL: {overallSignal}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                variant={selectedTimeframe === tf ? 'default' : 'outline'}
                size="sm"
                className={selectedTimeframe === tf ? 'bg-blue-600' : 'border-blue-500/30'}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Technical Indicators */}
        <Card className="col-span-2 bg-black/50 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-400">TECHNICAL INDICATORS</h2>
              <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">
                <Clock className="h-3 w-3 mr-1" />
                {selectedTimeframe}
              </Badge>
            </div>

            <div className="space-y-4">
              {indicators.map((indicator, index) => (
                <motion.div
                  key={indicator.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white">{indicator.name}</h3>
                      <Badge className={`${getSignalColor(indicator.signal)} border text-xs px-2 py-0`}>
                        {getSignalIcon(indicator.signal)}
                        {indicator.signal}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-blue-400">
                      {indicator.value.toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-3">{indicator.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Signal Strength</span>
                        <span>{indicator.strength.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            indicator.signal === 'BUY' ? 'bg-green-400' :
                            indicator.signal === 'SELL' ? 'bg-red-400' : 'bg-gray-400'
                          }`}
                          style={{ width: `${indicator.strength}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pattern Recognition */}
        <Card className="bg-black/50 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-purple-400">PATTERNS</h2>
              <Eye className="h-6 w-6 text-purple-400" />
            </div>

            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.pattern}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{pattern.pattern}</h3>
                    <Badge className={`${
                      pattern.direction === 'BULLISH' 
                        ? 'text-green-400 bg-green-400/20 border-green-400' 
                        : 'text-red-400 bg-red-400/20 border-red-400'
                    } border text-xs`}>
                      {pattern.direction}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-purple-400 font-bold">{pattern.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-green-400">${pattern.target.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Stop Loss:</span>
                      <span className="text-red-400">${pattern.stopLoss.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Detected:</span>
                      <span className="text-gray-300">{pattern.timeDetected}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${pattern.confidence}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support & Resistance Levels */}
      <Card className="mt-6 bg-black/50 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-orange-400">SUPPORT & RESISTANCE LEVELS</h2>
            <Target className="h-6 w-6 text-orange-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {levels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  level.type === 'SUPPORT' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${
                    level.type === 'SUPPORT' 
                      ? 'text-green-400 bg-green-400/20 border-green-400' 
                      : 'text-red-400 bg-red-400/20 border-red-400'
                  } border text-xs`}>
                    {level.type}
                  </Badge>
                  <span className={`text-lg font-bold ${
                    level.type === 'SUPPORT' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${level.level.toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Strength:</span>
                    <span className="text-white font-bold">{level.strength}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Touches:</span>
                    <span className="text-white">{level.touches}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Last Test:</span>
                    <span className="text-gray-300">{level.lastTest}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        level.type === 'SUPPORT' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${level.strength}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Recommendations */}
      <Card className="mt-6 bg-black/50 border-yellow-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-yellow-400">AI TRADING RECOMMENDATIONS</h2>
            <Brain className="h-6 w-6 text-yellow-400" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                BUY SIGNALS
              </h3>
              <div className="space-y-2">
                {indicators.filter(i => i.signal === 'BUY').map((indicator, index) => (
                  <div key={index} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{indicator.name}</span>
                      <span className="text-xs text-green-400">Strength: {indicator.strength.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                SELL SIGNALS
              </h3>
              <div className="space-y-2">
                {indicators.filter(i => i.signal === 'SELL').map((indicator, index) => (
                  <div key={index} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{indicator.name}</span>
                      <span className="text-xs text-red-400">Strength: {indicator.strength.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}