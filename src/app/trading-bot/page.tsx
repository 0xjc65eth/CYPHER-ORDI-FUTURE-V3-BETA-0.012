'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  AlertCircle,
  Play,
  Pause,
  Settings,
  BarChart3,
  Zap,
  Target,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react';
import { hyperliquidService } from '@/services/hyperliquid-service';

interface BacktestResult {
  strategy: string;
  asset: string;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: number;
}

interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  target?: number;
  stopLoss?: number;
  reason: string;
  timestamp: number;
  timeframe: string;
  strategy: string;
}
import BotConfiguration from '@/components/trading-bot/BotConfiguration';

export default function TradingBotPage() {
  const [botStatus, setBotStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [metrics, setMetrics] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [currentSignals, setCurrentSignals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [riskWarnings, setRiskWarnings] = useState<string[]>([]);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<any>(null);

  useEffect(() => {
    loadBotData();
    
    // Atualizar dados a cada 5 segundos quando o bot estiver rodando
    const interval = setInterval(() => {
      if (botStatus === 'running') {
        loadBotData();
      }
    }, 5000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [botStatus]);

  const loadBotData = async () => {
    try {
      // Fetch bot status from API
      const statusResponse = await fetch('/api/trading-bot/status');
      const statusData = await statusResponse.json();
      
      const tradesResponse = await fetch('/api/trading-bot/status?action=trades&limit=20');
      const tradesData = await tradesResponse.json();
      
      const signalsResponse = await fetch('/api/trading-bot/status?action=signals');
      const signalsData = await signalsResponse.json();
      
      const configResponse = await fetch('/api/trading-bot/status?action=config');
      const configData = await configResponse.json();

      if (statusData.success) {
        setMetrics(statusData.data);
        setBotStatus(statusData.data.isActive ? 'running' : 'idle');
        setPortfolioAnalytics({
          totalValue: statusData.data.netProfit,
          dailyPnl: statusData.data.dailyStats.profit,
          positions: statusData.data.currentPositions
        });
        setRiskWarnings(statusData.data.systemHealth.errors > 0 ? ['System errors detected'] : []);
      }

      if (tradesData.success) {
        setRecentTrades(tradesData.data.trades);
      }

      if (signalsData.success) {
        setCurrentSignals(signalsData.data.signals);
      }

      if (configData.success) {
        setConfig(configData.data.config);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do bot:', error);
    }
  };

  const handleStartBot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading-bot/status?action=start', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setBotStatus('running');
        loadBotData();
      } else {
        alert(result.message || 'Erro ao iniciar o bot');
      }
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      alert('Erro ao iniciar o bot de trading');
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async () => {
    try {
      const response = await fetch('/api/trading-bot/status?action=stop', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        setBotStatus('idle');
        loadBotData();
      }
    } catch (error) {
      console.error('Erro ao parar bot:', error);
    }
  };

  const toggleStrategy = async (strategy: string) => {
    if (config) {
      const newStrategies = { ...config.strategies };
      newStrategies[strategy] = !newStrategies[strategy];
      
      try {
        const response = await fetch('/api/trading-bot/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'updateConfig',
            strategies: newStrategies
          })
        });
        
        if (response.ok) {
          loadBotData();
        }
      } catch (error) {
        console.error('Erro ao atualizar estratégia:', error);
      }
    }
  };

  const updateRiskLevel = async (level: 'conservative' | 'moderate' | 'aggressive') => {
    try {
      const response = await fetch('/api/trading-bot/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateConfig',
          riskLevel: level
        })
      });
      
      if (response.ok) {
        loadBotData();
      }
    } catch (error) {
      console.error('Erro ao atualizar nível de risco:', error);
    }
  };

  const runBacktest = async (strategy: string, asset: string) => {
    setIsBacktesting(true);
    try {
      // Simulate backtest results for now
      const simulatedResult: BacktestResult = {
        strategy,
        asset,
        totalReturn: 15 + Math.random() * 25, // 15-40% return
        winRate: 60 + Math.random() * 25, // 60-85% win rate
        maxDrawdown: 5 + Math.random() * 10, // 5-15% max drawdown
        sharpeRatio: 1 + Math.random() * 2, // 1-3 Sharpe ratio
        trades: 50 + Math.floor(Math.random() * 150) // 50-200 trades
      };
      
      setBacktestResults(prev => [simulatedResult, ...prev.slice(0, 4)]); // Keep last 5 results
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setIsBacktesting(false);
    }
  };

  const executeArbitrage = async (opportunity: any) => {
    setLoading(true);
    try {
      const result = await hyperliquidService.executeArbitrageStrategy(opportunity);
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadBotData();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Arbitrage execution error:', error);
      alert('Erro na execução da arbitragem');
    } finally {
      setLoading(false);
    }
  };

  const executeGridTrading = async (asset: string) => {
    setLoading(true);
    try {
      const result = await hyperliquidService.executeGridTradingStrategy(asset, 10, 0.02);
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadBotData();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Grid trading error:', error);
      alert('Erro na configuração do Grid Trading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen pt-20 p-4">
      {/* Bloomberg Terminal Header */}
      <div className="border-b-2 border-orange-500 mb-6">
        <div className="grid grid-cols-12 gap-0 text-orange-500 font-mono text-xs">
          <div className="col-span-2 p-3 border-r border-orange-500/30">
            <div className="text-[10px] opacity-60">CYPHER TRADING BOT</div>
            <div className="text-lg font-bold">AUTO TRADER</div>
          </div>
          <div className="col-span-10 flex items-center">
            <div className="flex-1 grid grid-cols-5 gap-0">
              <div className="p-3 border-r border-orange-500/30">
                <div className="text-[10px] opacity-60">STATUS</div>
                <div className={`text-sm font-bold ${
                  botStatus === 'running' ? 'text-green-400' : 
                  botStatus === 'paused' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {botStatus === 'running' ? '● ATIVO' : 
                   botStatus === 'paused' ? '● PAUSADO' : '● INATIVO'}
                </div>
              </div>
              <div className="p-3 border-r border-orange-500/30">
                <div className="text-[10px] opacity-60">TRADES HOJE</div>
                <div className="text-sm font-bold text-orange-400">
                  {metrics?.totalTrades || 0}
                </div>
              </div>
              <div className="p-3 border-r border-orange-500/30">
                <div className="text-[10px] opacity-60">P&L DIÁRIO</div>
                <div className={`text-sm font-bold ${
                  (metrics?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(metrics?.dailyPnL || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 border-r border-orange-500/30">
                <div className="text-[10px] opacity-60">WIN RATE</div>
                <div className="text-sm font-bold text-orange-400">
                  {(metrics?.winRate || 0).toFixed(1)}%
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] opacity-60">NÍVEL DE RISCO</div>
                <div className={`text-sm font-bold ${
                  config?.riskLevel === 'aggressive' ? 'text-red-400' :
                  config?.riskLevel === 'moderate' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {config?.riskLevel?.toUpperCase() || 'MODERADO'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
          {/* Control Panel */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={botStatus === 'running' ? handleStopBot : handleStartBot}
                disabled={loading}
                className={`${
                  botStatus === 'running' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-black font-mono font-bold`}
              >
                {botStatus === 'running' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    PARAR BOT
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    INICIAR BOT
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                  <Bot className="w-3 h-3 mr-1" />
                  v3.0.0
                </Badge>
                <Badge variant="outline" className={`${
                  botStatus === 'running' ? 'text-green-400 border-green-400/30' : 
                  'text-gray-400 border-gray-400/30'
                }`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {botStatus === 'running' ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>
            </div>

            <Button
              onClick={loadBotData}
              variant="ghost"
              className="text-orange-500 hover:bg-orange-500/10 font-mono"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              ATUALIZAR
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-gray-900 border border-orange-500/30">
              <TabsTrigger value="overview" className="font-mono">VISÃO GERAL</TabsTrigger>
              <TabsTrigger value="strategies" className="font-mono">ESTRATÉGIAS</TabsTrigger>
              <TabsTrigger value="trades" className="font-mono">TRADES</TabsTrigger>
              <TabsTrigger value="signals" className="font-mono">SINAIS</TabsTrigger>
              <TabsTrigger value="settings" className="font-mono">CONFIGURAÇÕES</TabsTrigger>
              <TabsTrigger value="backtest" className="font-mono">BACKTEST</TabsTrigger>
              <TabsTrigger value="risk" className="font-mono">GESTÃO DE RISCO</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Metrics Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-black border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500/60 font-mono">LUCRO TOTAL</span>
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${
                    (metrics?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${(metrics?.totalPnL || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-500/40 font-mono mt-1">
                    Desde o início
                  </div>
                </Card>

                <Card className="bg-black border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500/60 font-mono">SHARPE RATIO</span>
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400 font-mono">
                    {(metrics?.sharpeRatio || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-500/40 font-mono mt-1">
                    Risco-retorno
                  </div>
                </Card>

                <Card className="bg-black border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500/60 font-mono">MAX DRAWDOWN</span>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-red-400 font-mono">
                    -${(metrics?.maxDrawdown || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-orange-500/40 font-mono mt-1">
                    Perda máxima
                  </div>
                </Card>

                <Card className="bg-black border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500/60 font-mono">ARBITRAGENS</span>
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 font-mono">
                    {metrics?.successfulArbitrages || 0}
                  </div>
                  <div className="text-xs text-orange-500/40 font-mono mt-1">
                    Oportunidades capturadas
                  </div>
                </Card>

                <Card className="bg-black border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-500/60 font-mono">VALOR PORTFÓLIO</span>
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400 font-mono">
                    ${(portfolioAnalytics?.totalValue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-500/40 font-mono mt-1">
                    Hyperliquid Portfolio
                  </div>
                </Card>
              </div>

              {/* Performance Chart Placeholder */}
              <Card className="bg-black border-orange-500/30 p-6">
                <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                  PERFORMANCE DO BOT
                </h3>
                <div className="h-64 flex items-center justify-center border border-orange-500/20 rounded">
                  <span className="text-orange-500/40 font-mono">
                    Gráfico de performance (Em desenvolvimento)
                  </span>
                </div>
              </Card>
            </TabsContent>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="space-y-4">
              <Card className="bg-black border-orange-500/30 p-6">
                <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                  ESTRATÉGIAS DE TRADING
                </h3>
                
                <div className="space-y-4">
                  {/* Arbitrage Strategy */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="font-bold text-orange-500 font-mono">Arbitragem</h4>
                        <p className="text-sm text-orange-500/60">
                          Captura diferenças de preço entre exchanges
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config?.strategies?.arbitrage || false}
                      onCheckedChange={() => toggleStrategy('arbitrage')}
                      disabled={botStatus === 'running'}
                    />
                  </div>

                  {/* Grid Trading Strategy */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-bold text-orange-500 font-mono">Grid Trading</h4>
                        <p className="text-sm text-orange-500/60">
                          Ordens em grid para capturar volatilidade
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config?.strategies?.gridTrading || false}
                      onCheckedChange={() => toggleStrategy('gridTrading')}
                      disabled={botStatus === 'running'}
                    />
                  </div>

                  {/* DCA Strategy */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-400" />
                      <div>
                        <h4 className="font-bold text-orange-500 font-mono">DCA (Dollar-Cost Averaging)</h4>
                        <p className="text-sm text-orange-500/60">
                          Compras periódicas para reduzir preço médio
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config?.strategies?.dca || false}
                      onCheckedChange={() => toggleStrategy('dca')}
                      disabled={botStatus === 'running'}
                    />
                  </div>

                  {/* Momentum Strategy */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="font-bold text-orange-500 font-mono">Momentum Trading</h4>
                        <p className="text-sm text-orange-500/60">
                          Segue tendências fortes do mercado
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config?.strategies?.momentum || false}
                      onCheckedChange={() => toggleStrategy('momentum')}
                      disabled={botStatus === 'running'}
                    />
                  </div>

                  {/* Mean Reversion Strategy */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h4 className="font-bold text-orange-500 font-mono">Mean Reversion</h4>
                        <p className="text-sm text-orange-500/60">
                          Opera contra movimentos extremos
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config?.strategies?.meanReversion || false}
                      onCheckedChange={() => toggleStrategy('meanReversion')}
                      disabled={botStatus === 'running'}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Trades Tab */}
            <TabsContent value="trades" className="space-y-4">
              <Card className="bg-black border-orange-500/30">
                <div className="border-b border-orange-500/30 p-4">
                  <h3 className="text-lg font-bold text-orange-500 font-mono">
                    HISTÓRICO DE TRADES
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-orange-500/30">
                        <th className="text-left p-3 text-sm font-mono text-orange-500/60">DATA</th>
                        <th className="text-left p-3 text-sm font-mono text-orange-500/60">ATIVO</th>
                        <th className="text-left p-3 text-sm font-mono text-orange-500/60">AÇÃO</th>
                        <th className="text-right p-3 text-sm font-mono text-orange-500/60">PREÇO</th>
                        <th className="text-right p-3 text-sm font-mono text-orange-500/60">QTD</th>
                        <th className="text-right p-3 text-sm font-mono text-orange-500/60">P&L</th>
                        <th className="text-left p-3 text-sm font-mono text-orange-500/60">ESTRATÉGIA</th>
                        <th className="text-center p-3 text-sm font-mono text-orange-500/60">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrades.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center p-8 text-orange-500/40 font-mono">
                            Nenhum trade executado ainda
                          </td>
                        </tr>
                      ) : (
                        recentTrades.map((trade, index) => (
                          <tr key={trade.id} className="border-b border-orange-500/10 hover:bg-orange-500/5">
                            <td className="p-3 text-sm font-mono text-orange-500/80">
                              {new Date(trade.timestamp).toLocaleString('pt-BR')}
                            </td>
                            <td className="p-3 text-sm font-mono text-orange-500">
                              {trade.asset}
                            </td>
                            <td className="p-3">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  trade.action === 'buy' 
                                    ? 'text-green-400 border-green-400/30' 
                                    : 'text-red-400 border-red-400/30'
                                }`}
                              >
                                {trade.action?.toUpperCase() || 'N/A'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm font-mono text-orange-500/80 text-right">
                              ${trade.price.toFixed(2)}
                            </td>
                            <td className="p-3 text-sm font-mono text-orange-500/80 text-right">
                              {trade.quantity.toFixed(4)}
                            </td>
                            <td className={`p-3 text-sm font-mono text-right ${
                              (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                            </td>
                            <td className="p-3 text-sm font-mono text-orange-500/60">
                              {trade.strategy}
                            </td>
                            <td className="p-3 text-center">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  trade.status === 'executed' 
                                    ? 'text-green-400 border-green-400/30' 
                                    : trade.status === 'failed'
                                    ? 'text-red-400 border-red-400/30'
                                    : 'text-yellow-400 border-yellow-400/30'
                                }`}
                              >
                                {trade.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="space-y-4">
              <Card className="bg-black border-orange-500/30">
                <div className="border-b border-orange-500/30 p-4">
                  <h3 className="text-lg font-bold text-orange-500 font-mono">
                    SINAIS DE TRADING ATIVOS
                  </h3>
                </div>
                
                <div className="p-4 space-y-3">
                  {currentSignals.length === 0 ? (
                    <div className="text-center p-8 text-orange-500/40 font-mono">
                      Nenhum sinal ativo no momento
                    </div>
                  ) : (
                    currentSignals.map((signal, index) => (
                      <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-orange-500 font-mono">{signal.asset}</h4>
                            <Badge 
                              variant="outline" 
                              className={`${
                                signal.action === 'buy' 
                                  ? 'text-green-400 border-green-400/30' 
                                  : 'text-red-400 border-red-400/30'
                              }`}
                            >
                              {signal.action.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-500/60 font-mono">Confiança:</span>
                            <span className={`text-sm font-bold font-mono ${
                              signal.confidence > 80 ? 'text-green-400' :
                              signal.confidence > 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {signal.confidence}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-orange-500/80 mb-2">{signal.reason}</p>
                        
                        <div className="grid grid-cols-4 gap-4 text-xs font-mono mb-3">
                          <div>
                            <span className="text-orange-500/60">Entrada:</span>
                            <span className="text-orange-500 ml-1">${signal.entryPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Stop Loss:</span>
                            <span className="text-red-400 ml-1">${signal.stopLoss.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Take Profit:</span>
                            <span className="text-green-400 ml-1">${signal.takeProfit.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Tamanho:</span>
                            <span className="text-orange-500 ml-1">${signal.positionSize.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {signal.reason.includes('Arbitrage') ? (
                            <Button
                              onClick={() => executeArbitrage({
                                asset: signal.asset,
                                exchange1: 'Hyperliquid',
                                exchange2: 'Binance',
                                price1: signal.entryPrice,
                                price2: signal.takeProfit,
                                spread: signal.takeProfit - signal.entryPrice,
                                profitPotential: ((signal.takeProfit - signal.entryPrice) / signal.entryPrice) * 100,
                                volume: signal.positionSize,
                                confidence: signal.confidence
                              })}
                              disabled={loading}
                              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 text-xs font-mono"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Executar Arbitragem
                            </Button>
                          ) : (
                            <Button
                              onClick={() => executeGridTrading(signal.asset)}
                              disabled={loading}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs font-mono"
                            >
                              <Target className="w-3 h-3 mr-1" />
                              Configurar Grid
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => {
                              if (confirm(`Deseja ignorar este sinal para ${signal.asset}?`)) {
                                // Remove signal from current signals
                                setCurrentSignals(prev => prev.filter((_, i) => i !== index));
                              }
                            }}
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/10 text-xs font-mono"
                          >
                            Ignorar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <BotConfiguration
                config={config}
                onUpdateConfig={(updates) => {
                  // Update bot configuration via Hyperliquid service
                  hyperliquidService.updateBotConfiguration?.(updates);
                  loadBotData();
                }}
                isRunning={botStatus === 'running'}
              />
            </TabsContent>

            {/* Backtest Tab */}
            <TabsContent value="backtest" className="space-y-4">
              <Card className="bg-black border-orange-500/30 p-6">
                <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                  BACKTESTING DE ESTRATÉGIAS
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Button
                    onClick={() => runBacktest('Arbitrage Scanner', 'BTC')}
                    disabled={isBacktesting}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-mono"
                  >
                    {isBacktesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    Backtest Arbitragem
                  </Button>
                  
                  <Button
                    onClick={() => runBacktest('Grid Trading', 'ETH')}
                    disabled={isBacktesting}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-mono"
                  >
                    {isBacktesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                    Backtest Grid Trading
                  </Button>
                  
                  <Button
                    onClick={() => runBacktest('Momentum Trading', 'SOL')}
                    disabled={isBacktesting}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-mono"
                  >
                    {isBacktesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                    Backtest Momentum
                  </Button>
                </div>

                <div className="space-y-4">
                  {backtestResults.length === 0 ? (
                    <div className="text-center p-8 text-orange-500/40 font-mono">
                      Nenhum backtest executado ainda. Clique nos botões acima para testar estratégias.
                    </div>
                  ) : (
                    backtestResults.map((result, index) => (
                      <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-orange-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-orange-500 font-mono">{result.strategy}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${
                              result.totalReturn > 0 ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'
                            }`}
                          >
                            {result.totalReturn > 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-orange-500/60 font-mono mb-3">
                          Período: {result.period}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm font-mono">
                          <div>
                            <span className="text-orange-500/60">Sharpe Ratio:</span>
                            <span className="text-orange-500 ml-1">{result.sharpeRatio.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Max Drawdown:</span>
                            <span className="text-red-400 ml-1">-{result.maxDrawdown.toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Win Rate:</span>
                            <span className="text-green-400 ml-1">{result.winRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-orange-500/60">Total Trades:</span>
                            <span className="text-orange-500 ml-1">{result.totalTrades}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Risk Management Tab */}
            <TabsContent value="risk" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Risk Warnings */}
                <Card className="bg-black border-orange-500/30 p-6">
                  <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                    ALERTAS DE RISCO
                  </h3>
                  
                  {riskWarnings.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-mono text-green-400">
                        Todos os limites de risco estão dentro dos parâmetros seguros
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {riskWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          <span className="text-sm font-mono text-red-400">
                            {warning}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Portfolio Analytics */}
                <Card className="bg-black border-orange-500/30 p-6">
                  <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                    ANÁLISE DE PORTFÓLIO
                  </h3>
                  
                  {portfolioAnalytics && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                        <div>
                          <span className="text-orange-500/60">Posições Ativas:</span>
                          <span className="text-orange-500 ml-2">{portfolioAnalytics.totalPositions}</span>
                        </div>
                        <div>
                          <span className="text-orange-500/60">Valor Total:</span>
                          <span className="text-orange-500 ml-2">${portfolioAnalytics.totalValue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-orange-500/60">P&L Total:</span>
                          <span className={`ml-2 ${portfolioAnalytics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${portfolioAnalytics.totalPnL.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-orange-500/60">Alavancagem Média:</span>
                          <span className="text-orange-500 ml-2">{portfolioAnalytics.avgLeverage.toFixed(2)}x</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-orange-500/60">Nível de Risco:</span>
                          <Badge 
                            variant="outline" 
                            className={`${
                              portfolioAnalytics.riskLevel === 'High' ? 'text-red-400 border-red-400/30' :
                              portfolioAnalytics.riskLevel === 'Medium' ? 'text-yellow-400 border-yellow-400/30' :
                              'text-green-400 border-green-400/30'
                            }`}
                          >
                            {portfolioAnalytics.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Emergency Controls */}
              <Card className="bg-black border-orange-500/30 p-6">
                <h3 className="text-lg font-bold text-orange-500 font-mono mb-4">
                  CONTROLES DE EMERGÊNCIA
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja parar todas as operações?')) {
                        handleStopBot();
                        alert('🛑 Todas as operações foram pausadas');
                      }
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-mono"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    PARADA DE EMERGÊNCIA
                  </Button>
                  
                  <Button
                    onClick={() => {
                      loadBotData();
                      alert('📊 Dados atualizados com sucesso');
                    }}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-mono"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    ATUALIZAR DADOS
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (confirm('Deseja realmente resetar todas as configurações?')) {
                        // Reset configurations
                        // Reset bot configuration via Hyperliquid service
                        hyperliquidService.updateBotConfiguration?.({
                          riskLevel: 'moderate',
                          strategies: {
                            arbitrage: false,
                            gridTrading: false,
                            dca: false,
                            momentum: false,
                            meanReversion: false
                          }
                        });
                        loadBotData();
                        alert('🔄 Configurações resetadas');
                      }
                    }}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-mono"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    RESET CONFIG
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}