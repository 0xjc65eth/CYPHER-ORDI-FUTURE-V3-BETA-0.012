/**
 * 🎛️ TRADING ENGINE CONTROLLER - CYPHER AI v3.0
 * Componente para controlar o motor de trading automatizado
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import RechartsChart from '@/components/charts/RechartsChart';
import { 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Brain,
  Mic,
  MicOff,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  LineChart
} from 'lucide-react';

interface TradingStatus {
  status: 'active' | 'inactive' | 'error';
  performance?: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    sharpeRatio: number;
  };
  activePositions?: any[];
}

export function TradingEngineController() {
  const [tradingStatus, setTradingStatus] = useState<TradingStatus>({ status: 'inactive' });
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'aggressive' | 'moderate' | 'conservative' | 'defensive'>('moderate');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const { toast } = useToast();

  // Generate trading performance chart data
  const performanceChartData = useMemo(() => {
    const days = 30;
    const seed = 33456;
    
    const pseudoRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    let cumulativeProfit = 0;
    
    return Array.from({ length: days }, (_, i) => {
      const dayAgo = days - i;
      const now = new Date();
      const time = new Date(now.getTime() - dayAgo * 24 * 60 * 60 * 1000);
      
      // Simulate trading performance based on mode
      const modeMultiplier = {
        aggressive: 0.03,
        moderate: 0.015,
        conservative: 0.008,
        defensive: 0.004
      }[mode];
      
      const dailyReturn = (pseudoRandom(i) - 0.5) * modeMultiplier * 2;
      cumulativeProfit += dailyReturn * 1000; // Assuming $1000 base
      
      const dailyTrades = Math.floor(pseudoRandom(i + 100) * 10) + 1;
      
      return {
        time: time.toISOString(),
        value: cumulativeProfit,
        trades: dailyTrades,
        winRate: 0.55 + (pseudoRandom(i + 200) - 0.5) * 0.3
      };
    }).reverse();
  }, [mode]);

  // Generate real-time profit chart
  const profitChartData = useMemo(() => {
    const hours = 24;
    const seed = 78901;
    
    const pseudoRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    let profit = tradingStatus.performance?.totalProfit || 0;
    
    return Array.from({ length: hours }, (_, i) => {
      const hourAgo = hours - i;
      const now = new Date();
      const time = new Date(now.getTime() - hourAgo * 60 * 60 * 1000);
      
      const hourlyChange = (pseudoRandom(i) - 0.5) * 50;
      profit += hourlyChange;
      
      return {
        time: time.toISOString(),
        value: profit
      };
    }).reverse();
  }, [tradingStatus.performance?.totalProfit]);

  // Chart configurations
  const performanceConfig = useMemo(() => ({
    type: 'line' as const,
    height: 200,
    theme: 'dark' as const,
    showGrid: true,
    showCrosshair: true,
    showTooltip: true,
    colors: ['#10B981', '#EF4444'],
    precision: 2,
    realtime: true,
    library: 'recharts' as const
  }), []);

  const profitConfig = useMemo(() => ({
    type: 'area' as const,
    height: 120,
    theme: 'dark' as const,
    showGrid: false,
    showCrosshair: true,
    showTooltip: true,
    colors: ['#3B82F6', '#1D4ED8'],
    precision: 2,
    realtime: true,
    library: 'recharts' as const
  }), []);

  useEffect(() => {
    checkTradingStatus();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkTradingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkTradingStatus = async () => {
    try {
      const response = await fetch('/api/trading/start');
      const data = await response.json();
      setTradingStatus(data);
    } catch (error) {
      console.error('Failed to check trading status:', error);
    }
  };

  const startTrading = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          config: {
            pairs: ['BTCUSDT', 'ETHUSDT', 'ORDIUSDT'],
            enableArbitrage: true,
            enableMLPredictions: true,
            enableSentimentAnalysis: true
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTradingStatus({ status: 'active' });
        toast({
          title: 'Trading Started',
          description: `Automated trading started in ${mode} mode`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start trading',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopTrading = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trading/start', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setTradingStatus({ status: 'inactive' });
        toast({
          title: 'Trading Stopped',
          description: 'Automated trading has been stopped',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop trading',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceCommands = () => {
    setVoiceEnabled(!voiceEnabled);
    
    if (!voiceEnabled) {
      // Inicializar comandos por voz (simulado)
      toast({
        title: 'Voice Commands Activated',
        description: 'Say "Comprar Bitcoin" or "Mostrar lucro"',
      });
      
      // Simular comando recebido
      setTimeout(() => {
        setLastCommand('Comprar 100 dólares de Bitcoin');
      }, 3000);
    } else {
      toast({
        title: 'Voice Commands Deactivated',
        description: 'Voice recognition stopped',
      });
    }
  };

  const getModeColor = (selectedMode: string) => {
    const colors = {
      aggressive: 'bg-red-600',
      moderate: 'bg-blue-600',
      conservative: 'bg-green-600',
      defensive: 'bg-purple-600'
    };
    return colors[selectedMode as keyof typeof colors];
  };

  const getStatusColor = () => {
    switch (tradingStatus.status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
            <div>
              <h2 className="text-2xl font-bold text-white">Trading Engine</h2>
              <p className="text-gray-400">
                Status: {tradingStatus.status} • Mode: {mode}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={toggleVoiceCommands}
              className="flex items-center space-x-2"
            >
              {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span>Voice</span>
            </Button>
            
            {tradingStatus.status === 'active' ? (
              <Button
                onClick={stopTrading}
                disabled={isLoading}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Trading</span>
              </Button>
            ) : (
              <Button
                onClick={startTrading}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                <span>Start Trading</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Enhanced Performance Dashboard with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Performance Overview
            </h3>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          
          {tradingStatus.performance ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    ${tradingStatus.performance.totalProfit.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {(tradingStatus.performance.winRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {tradingStatus.performance.totalTrades}
                  </div>
                  <div className="text-sm text-gray-400">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {tradingStatus.performance.sharpeRatio.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Sharpe Ratio</div>
                </div>
              </div>
              
              {/* Real-time Profit Chart */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <LineChart className="w-4 h-4 mr-2 text-blue-400" />
                  Profit Trend (24h)
                </h4>
                <RechartsChart
                  data={profitChartData}
                  config={profitConfig}
                  className="bg-transparent border-0 p-0"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Start trading to see performance metrics</p>
            </div>
          )}
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              30-Day Performance
            </h3>
            <span className="text-xs text-gray-400 font-mono">{mode.toUpperCase()} MODE</span>
          </div>
          
          <RechartsChart
            data={performanceChartData}
            config={performanceConfig}
            className="bg-transparent border-0 p-0"
          />
          
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-green-400">
                +{((performanceChartData[performanceChartData.length - 1]?.value || 0) / 1000 * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Monthly Return</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">
                {(performanceChartData.reduce((acc, curr) => acc + (curr.winRate || 0), 0) / performanceChartData.length * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Avg Win Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-400">
                {performanceChartData.reduce((acc, curr) => acc + (curr.trades || 0), 0)}
              </div>
              <div className="text-xs text-gray-400">Total Trades</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="grid grid-cols-4 bg-gray-800">
          <TabsTrigger value="aggressive" className="text-red-400">Aggressive</TabsTrigger>
          <TabsTrigger value="moderate" className="text-blue-400">Moderate</TabsTrigger>
          <TabsTrigger value="conservative" className="text-green-400">Conservative</TabsTrigger>
          <TabsTrigger value="defensive" className="text-purple-400">Defensive</TabsTrigger>
        </TabsList>

        <TabsContent value="aggressive" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-white">Aggressive Mode</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• High risk, high reward strategy</p>
              <p>• Max position size: 5% per trade</p>
              <p>• Max drawdown: 25%</p>
              <p>• Up to 10 open positions</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="moderate" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-white">Moderate Mode</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Balanced risk/reward approach</p>
              <p>• Max position size: 2% per trade</p>
              <p>• Max drawdown: 15%</p>
              <p>• Up to 5 open positions</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conservative" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-white">Conservative Mode</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Low risk, steady growth</p>
              <p>• Max position size: 1% per trade</p>
              <p>• Max drawdown: 10%</p>
              <p>• Up to 3 open positions</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="defensive" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-white">Defensive Mode</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Capital preservation focus</p>
              <p>• Max position size: 0.5% per trade</p>
              <p>• Max drawdown: 5%</p>
              <p>• Up to 2 open positions</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voice Commands */}
      {voiceEnabled && (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Mic className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-white">Voice Commands Active</h3>
          </div>
          
          {lastCommand && (
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">Last Command: "{lastCommand}"</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">Português:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• "Comprar X bitcoin"</li>
                <li>• "Vender X bitcoin"</li>
                <li>• "Iniciar trading automático"</li>
                <li>• "Mostrar lucro"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">English:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• "Buy X bitcoin"</li>
                <li>• "Sell X bitcoin"</li>
                <li>• "Start automated trading"</li>
                <li>• "Show profit"</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Active Positions */}
      {tradingStatus.activePositions && tradingStatus.activePositions.length > 0 && (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
          <div className="space-y-3">
            {tradingStatus.activePositions.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={position.side === 'buy' ? 'default' : 'destructive'}>
                    {position.side.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-white">{position.symbol}</span>
                  <span className="text-gray-400">{position.quantity}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">${position.entryPrice}</div>
                  <div className="text-sm text-gray-400">Entry</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
            <Brain className="w-6 h-6 mb-2" />
            <span>AI Analysis</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
            <Shield className="w-6 h-6 mb-2" />
            <span>Risk Check</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
            <DollarSign className="w-6 h-6 mb-2" />
            <span>Manual Trade</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
            <Settings className="w-6 h-6 mb-2" />
            <span>Settings</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}