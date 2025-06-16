"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  DollarSign,
  BarChart3,
  Shield,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { ArbitrageEngine, ArbitrageOpportunity, ArbitrageConfig } from '@/services/arbitrage/ArbitrageEngine';
import { ExchangeFactory, ExchangeCredentials } from '@/services/arbitrage/exchanges';
import { logger } from '@/lib/logger';

interface ArbitrageTerminalProps {
  initialConfig?: Partial<ArbitrageConfig>;
  credentials?: ExchangeCredentials;
}

export default function ArbitrageTerminal({ 
  initialConfig, 
  credentials 
}: ArbitrageTerminalProps) {
  const [engine, setEngine] = useState<ArbitrageEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ArbitrageConfig>({
    minSpreadPercentage: 0.5,
    maxPositionSize: 1000,
    enabledExchanges: ['binance', 'coinbase', 'kraken'],
    enabledPairs: ['BTC/USDT', 'ETH/USDT', 'BTC/USD', 'ETH/USD'],
    autoExecute: false,
    riskLevel: 'MODERATE',
    latencyThreshold: 1000,
    ...initialConfig
  });

  // Initialize arbitrage engine
  const initializeEngine = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!credentials) {
        throw new Error('Exchange credentials are required');
      }

      // Create exchange connectors
      const connectors = ExchangeFactory.createMultipleExchanges(credentials);
      
      if (connectors.length === 0) {
        throw new Error('No exchange connectors could be created');
      }

      // Create arbitrage engine
      const newEngine = new ArbitrageEngine(config, connectors);

      // Set up event listeners
      newEngine.on('opportunityFound', (opportunity: ArbitrageOpportunity) => {
        setOpportunities(prev => {
          const updated = [opportunity, ...prev.filter(op => op.id !== opportunity.id)];
          return updated.slice(0, 50); // Keep only latest 50 opportunities
        });
      });

      newEngine.on('executionSuccess', (data) => {
        logger.info('Arbitrage execution successful:', data);
        // Update opportunity status or remove from list
        setOpportunities(prev => 
          prev.filter(op => op.id !== data.opportunity.id)
        );
      });

      newEngine.on('executionError', (data) => {
        logger.error('Arbitrage execution failed:', data);
        setError(`Execution failed: ${data.error.message}`);
      });

      newEngine.on('started', () => {
        setIsRunning(true);
        logger.info('Arbitrage engine started');
      });

      newEngine.on('stopped', () => {
        setIsRunning(false);
        logger.info('Arbitrage engine stopped');
      });

      setEngine(newEngine);

    } catch (error: any) {
      setError(error.message);
      logger.error('Failed to initialize arbitrage engine:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, credentials]);

  // Start the arbitrage engine
  const startEngine = async () => {
    if (!engine) return;
    
    try {
      setIsLoading(true);
      await engine.start();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop the arbitrage engine
  const stopEngine = async () => {
    if (!engine) return;
    
    try {
      setIsLoading(true);
      await engine.stop();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update system status periodically
  useEffect(() => {
    if (!engine || !isRunning) return;

    const updateStatus = () => {
      try {
        setSystemStatus(engine.getSystemStatus());
        // Get risk metrics from risk manager if available
        // setRiskMetrics(engine.getRiskManager().getSystemHealth());
        // Get security status from security manager if available
        // setSecurityStatus(engine.getSecurityManager().getSecurityStatus());
      } catch (error) {
        logger.error('Error updating system status:', error);
      }
    };

    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    updateStatus(); // Initial update

    return () => clearInterval(interval);
  }, [engine, isRunning]);

  // Initialize engine on mount
  useEffect(() => {
    initializeEngine();
    
    return () => {
      if (engine) {
        engine.stop().catch(logger.error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const executeOpportunity = async (opportunity: ArbitrageOpportunity) => {
    if (!engine) return;
    
    try {
      const success = await engine.executeArbitrage(opportunity);
      if (success) {
        // Remove executed opportunity from list
        setOpportunities(prev => prev.filter(op => op.id !== opportunity.id));
      }
    } catch (error: any) {
      setError(`Execution failed: ${error.message}`);
    }
  };

  const updateConfig = (newConfig: Partial<ArbitrageConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    if (engine) {
      engine.updateConfig(updatedConfig);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  return (
    <div className="w-full h-full bg-black text-green-400 font-mono">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-orange-500">CYPHER ARBITRAGE TERMINAL</h1>
            <Badge 
              variant={isRunning ? "default" : "secondary"}
              className={isRunning ? "bg-green-600" : "bg-gray-600"}
            >
              {isRunning ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={isRunning ? stopEngine : startEngine}
              disabled={isLoading || !engine}
              className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Loading...' : isRunning ? 'Stop' : 'Start'}
            </Button>
            
            <Button
              onClick={initializeEngine}
              disabled={isLoading}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reinitialize
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500 bg-red-950 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-orange-500">
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-orange-500">
              Execution
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-orange-500">
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-orange-500">
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-400">
                    Active Opportunities
                  </CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {opportunities.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-400">
                    Best Spread
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {opportunities.length > 0 
                      ? formatPercentage(Math.max(...opportunities.map(op => op.spreadPercentage)))
                      : '0.000%'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-400">
                    Potential Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {formatCurrency(
                      opportunities.reduce((sum, op) => sum + op.estimatedProfit, 0)
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunities List */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400">Live Arbitrage Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No arbitrage opportunities found
                    </div>
                  ) : (
                    opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-600"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-semibold text-orange-500">
                              {opportunity.pair}
                            </div>
                            <div className="text-sm text-gray-400">
                              {opportunity.buyExchange} → {opportunity.sellExchange}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-green-400 font-bold">
                              +{formatPercentage(opportunity.spreadPercentage)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatCurrency(opportunity.estimatedProfit)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getRiskColor(opportunity.risk)}>
                            {opportunity.risk}
                          </Badge>
                          
                          <div className="text-xs text-gray-400">
                            <div>Conf: {(opportunity.confidence * 100).toFixed(0)}%</div>
                            <div>Vol: {opportunity.volume.toFixed(4)}</div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => executeOpportunity(opportunity)}
                            disabled={!config.autoExecute && opportunity.risk === 'HIGH'}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Execute
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Auto Execution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Enable Auto Execution</span>
                    <Switch
                      checked={config.autoExecute}
                      onCheckedChange={(checked) => updateConfig({ autoExecute: checked })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Risk Level</label>
                    <select
                      value={config.riskLevel}
                      onChange={(e) => updateConfig({ riskLevel: e.target.value as any })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
                    >
                      <option value="CONSERVATIVE">Conservative</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="AGGRESSIVE">Aggressive</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Max Position Size</label>
                    <input
                      type="number"
                      value={config.maxPositionSize}
                      onChange={(e) => updateConfig({ maxPositionSize: Number(e.target.value) })}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {systemStatus ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={systemStatus.isRunning ? "bg-green-600" : "bg-red-600"}>
                          {systemStatus.isRunning ? "Running" : "Stopped"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Connected Exchanges:</span>
                        <span className="text-orange-500">
                          {systemStatus.connectedExchanges?.length || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Active Opportunities:</span>
                        <span className="text-orange-500">
                          {systemStatus.activeOpportunities || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="text-gray-400">
                          {systemStatus.lastUpdate 
                            ? new Date(systemStatus.lastUpdate).toLocaleTimeString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No system data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Risk Management Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Risk management metrics will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Security status and alerts will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Minimum Spread Percentage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.minSpreadPercentage}
                    onChange={(e) => updateConfig({ minSpreadPercentage: Number(e.target.value) })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Latency Threshold (ms)</label>
                  <input
                    type="number"
                    value={config.latencyThreshold}
                    onChange={(e) => updateConfig({ latencyThreshold: Number(e.target.value) })}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-green-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Enabled Exchanges</label>
                  <div className="flex flex-wrap gap-2">
                    {['binance', 'coinbase', 'kraken', 'okx'].map((exchange) => (
                      <Badge
                        key={exchange}
                        className={`cursor-pointer ${
                          config.enabledExchanges.includes(exchange)
                            ? 'bg-green-600'
                            : 'bg-gray-600'
                        }`}
                        onClick={() => {
                          const updated = config.enabledExchanges.includes(exchange)
                            ? config.enabledExchanges.filter(e => e !== exchange)
                            : [...config.enabledExchanges, exchange];
                          updateConfig({ enabledExchanges: updated });
                        }}
                      >
                        {exchange.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}