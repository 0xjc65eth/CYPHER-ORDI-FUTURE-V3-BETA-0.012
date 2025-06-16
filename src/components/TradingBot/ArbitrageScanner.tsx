'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter
} from 'lucide-react';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyDex: string;
  sellDex: string;
  buyPrice: number;
  sellPrice: number;
  priceDiff: number;
  profitPercentage: number;
  volume24h: number;
  confidence: number;
  gasEstimate: number;
  netProfit: number;
  timestamp: number;
  status: 'active' | 'expired' | 'executed';
}

interface ArbitrageScannerProps {
  className?: string;
}

export default function ArbitrageScanner({ className }: ArbitrageScannerProps) {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [minProfitFilter, setMinProfitFilter] = useState(0.5);
  const [showExpired, setShowExpired] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(Date.now());

  // Mock DEX data
  const supportedDEXs = [
    { name: 'Uniswap V3', id: 'uniswap', status: 'active', avgGas: 150 },
    { name: 'SushiSwap', id: 'sushiswap', status: 'active', avgGas: 120 },
    { name: '1inch', id: 'oneinch', status: 'active', avgGas: 180 },
    { name: 'Balancer', id: 'balancer', status: 'active', avgGas: 200 },
    { name: 'Curve', id: 'curve', status: 'active', avgGas: 160 },
    { name: 'DODO', id: 'dodo', status: 'active', avgGas: 140 }
  ];

  const popularPairs = [
    'WETH/USDC', 'WBTC/USDC', 'LINK/USDC', 'UNI/USDC',
    'AAVE/USDC', 'COMP/USDC', 'MKR/USDC', 'SNX/USDC'
  ];

  useEffect(() => {
    // Initial scan
    scanForOpportunities();

    // Auto-scan interval
    let interval: NodeJS.Timeout;
    if (autoScan) {
      interval = setInterval(scanForOpportunities, 30000); // Every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScan, minProfitFilter]);

  const scanForOpportunities = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setLastScanTime(Date.now());

    try {
      // Simulate scanning multiple DEXs for arbitrage opportunities
      const newOpportunities: ArbitrageOpportunity[] = [];

      for (const pair of popularPairs) {
        const opportunity = await findArbitrageForPair(pair);
        if (opportunity && opportunity.profitPercentage >= minProfitFilter) {
          newOpportunities.push(opportunity);
        }
      }

      // Update opportunities and mark expired ones
      setOpportunities(prev => {
        const updated = prev.map(opp => ({
          ...opp,
          status: Date.now() - opp.timestamp > 120000 ? 'expired' as const : opp.status
        }));

        // Add new opportunities
        const combined = [...updated, ...newOpportunities];
        
        // Sort by profit percentage
        return combined.sort((a, b) => b.profitPercentage - a.profitPercentage);
      });

    } catch (error) {
      console.error('Arbitrage scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const findArbitrageForPair = async (pair: string): Promise<ArbitrageOpportunity | null> => {
    // Simulate fetching prices from different DEXs
    const prices = supportedDEXs.map(dex => ({
      dex: dex.name,
      id: dex.id,
      price: Math.random() * 1000 + 1000, // Random price between 1000-2000
      gasEstimate: dex.avgGas + Math.random() * 50
    }));

    // Find best buy and sell prices
    const sortedByPrice = prices.sort((a, b) => a.price - b.price);
    const buyPrice = sortedByPrice[0];
    const sellPrice = sortedByPrice[sortedByPrice.length - 1];

    const priceDiff = sellPrice.price - buyPrice.price;
    const profitPercentage = (priceDiff / buyPrice.price) * 100;

    // Estimate gas costs and net profit
    const estimatedGasCost = (buyPrice.gasEstimate + sellPrice.gasEstimate) * 20; // $20 per 100 gwei
    const grossProfit = priceDiff * 100; // Assume 100 token trade
    const netProfit = grossProfit - estimatedGasCost;

    // Only return if profitable after gas
    if (netProfit > 10 && profitPercentage > 0.1) {
      return {
        id: `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pair,
        buyDex: buyPrice.dex,
        sellDex: sellPrice.dex,
        buyPrice: buyPrice.price,
        sellPrice: sellPrice.price,
        priceDiff,
        profitPercentage,
        volume24h: Math.random() * 10000000, // Random volume
        confidence: Math.min(0.6 + (profitPercentage / 10), 0.95),
        gasEstimate: buyPrice.gasEstimate + sellPrice.gasEstimate,
        netProfit,
        timestamp: Date.now(),
        status: 'active'
      };
    }

    return null;
  };

  const executeArbitrage = async (opportunity: ArbitrageOpportunity) => {
    try {
      // Mark as executing
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunity.id 
            ? { ...opp, status: 'executed' as const }
            : opp
        )
      );

      // Simulate execution (in real implementation, this would execute actual trades)
      console.log('Executing arbitrage:', opportunity);
      
      // You would integrate with actual DEX APIs here
      // const buyResult = await executeBuyOrder(opportunity);
      // const sellResult = await executeSellOrder(opportunity);
      
    } catch (error) {
      console.error('Arbitrage execution error:', error);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (!showExpired && opp.status === 'expired') return false;
    return opp.profitPercentage >= minProfitFilter;
  });

  const OpportunityCard = ({ opportunity }: { opportunity: ArbitrageOpportunity }) => (
    <Card className="border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{opportunity.pair}</h3>
            <div className="text-sm text-gray-600">
              {opportunity.buyDex} → {opportunity.sellDex}
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant={
                opportunity.status === 'active' ? 'default' :
                opportunity.status === 'executed' ? 'secondary' : 'destructive'
              }
            >
              {opportunity.status}
            </Badge>
            <div className="text-sm text-gray-500 mt-1">
              {Math.round((Date.now() - opportunity.timestamp) / 1000)}s ago
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-red-50 p-3 rounded">
            <div className="text-sm text-red-600">Buy Price</div>
            <div className="font-semibold">${opportunity.buyPrice.toFixed(4)}</div>
            <div className="text-xs text-red-600">{opportunity.buyDex}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-green-600">Sell Price</div>
            <div className="font-semibold">${opportunity.sellPrice.toFixed(4)}</div>
            <div className="text-xs text-green-600">{opportunity.sellDex}</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Profit Percentage:</span>
            <span className="font-semibold text-green-600">
              +{opportunity.profitPercentage.toFixed(3)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estimated Net Profit:</span>
            <span className="font-semibold text-green-600">
              ${opportunity.netProfit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Gas Estimate:</span>
            <span>{opportunity.gasEstimate.toFixed(0)} gwei</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>24h Volume:</span>
            <span>${(opportunity.volume24h / 1000000).toFixed(2)}M</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm">Confidence:</span>
          <div className="flex items-center gap-2">
            <Progress value={opportunity.confidence * 100} className="w-20 h-2" />
            <span className="text-sm">{(opportunity.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => executeArbitrage(opportunity)}
            disabled={opportunity.status !== 'active'}
            className="flex-1"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Execute
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ScannerControls = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Scanner Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-scan">Auto Scan</Label>
          <Switch
            id="auto-scan"
            checked={autoScan}
            onCheckedChange={setAutoScan}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min-profit">Min Profit % Filter</Label>
          <Input
            id="min-profit"
            type="number"
            step="0.1"
            value={minProfitFilter}
            onChange={(e) => setMinProfitFilter(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-expired">Show Expired</Label>
          <Switch
            id="show-expired"
            checked={showExpired}
            onCheckedChange={setShowExpired}
          />
        </div>

        <Button 
          onClick={scanForOpportunities}
          disabled={isScanning}
          className="w-full"
        >
          {isScanning ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isScanning ? 'Scanning...' : 'Scan Now'}
        </Button>

        <div className="text-xs text-gray-500">
          Last scan: {new Date(lastScanTime).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );

  const DEXStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          DEX Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {supportedDEXs.map((dex) => (
            <div key={dex.id} className="flex justify-between items-center">
              <span className="text-sm">{dex.name}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={dex.status === 'active' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {dex.status}
                </Badge>
                <span className="text-xs text-gray-500">{dex.avgGas}g</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ScannerStats = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Scanner Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {filteredOpportunities.length}
            </div>
            <div className="text-sm text-blue-600">Active Opportunities</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {filteredOpportunities.length > 0 
                ? filteredOpportunities[0].profitPercentage.toFixed(2)
                : '0.00'
              }%
            </div>
            <div className="text-sm text-green-600">Best Opportunity</div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Pairs Monitored:</span>
            <span>{popularPairs.length}</span>
          </div>
          <div className="flex justify-between">
            <span>DEXs Connected:</span>
            <span>{supportedDEXs.filter(d => d.status === 'active').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Scan Frequency:</span>
            <span>30s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Arbitrage Scanner</h2>
        <div className="flex items-center gap-2">
          {isScanning && (
            <Badge variant="outline" className="animate-pulse">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Scanning
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScannerControls />
        <DEXStatus />
        <ScannerStats />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Arbitrage Opportunities ({filteredOpportunities.length})
          </h3>
          {filteredOpportunities.length > 0 && (
            <div className="text-sm text-gray-600">
              Total potential profit: $
              {filteredOpportunities.reduce((sum, opp) => sum + opp.netProfit, 0).toFixed(2)}
            </div>
          )}
        </div>

        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingDown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Arbitrage Opportunities Found
              </h3>
              <p className="text-gray-500">
                {isScanning 
                  ? 'Scanning for opportunities...' 
                  : 'Try lowering the minimum profit filter or check back later.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}