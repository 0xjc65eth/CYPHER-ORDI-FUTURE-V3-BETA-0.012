'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Settings,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Percent
} from 'lucide-react';

interface DEXPair {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  dex: 'uniswap' | 'sushiswap' | 'pancakeswap' | 'curve';
  fee: number;
}

interface QuickOrder {
  side: 'buy' | 'sell';
  amount: string;
  price: string;
  total: number;
  fee: number;
  slippage: number;
  estimatedGas: number;
}

export const QuickTradeEnhanced: React.FC = () => {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('cex');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [selectedDEX, setSelectedDEX] = useState<DEXPair['dex']>('uniswap');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isExecuting, setIsExecuting] = useState(false);

  // Mock DEX pairs data
  const dexPairs: DEXPair[] = [
    {
      symbol: 'ETH/USDC',
      name: 'Ethereum / USD Coin',
      price: 3245.67,
      change24h: 2.34,
      volume24h: 125000000,
      liquidity: 890000000,
      dex: 'uniswap',
      fee: 0.3
    },
    {
      symbol: 'WBTC/ETH',
      name: 'Wrapped Bitcoin / Ethereum',
      price: 33.52,
      change24h: -1.23,
      volume24h: 45000000,
      liquidity: 320000000,
      dex: 'uniswap',
      fee: 0.3
    },
    {
      symbol: 'USDC/DAI',
      name: 'USD Coin / Dai',
      price: 1.0002,
      change24h: 0.01,
      volume24h: 67000000,
      liquidity: 450000000,
      dex: 'curve',
      fee: 0.04
    },
    {
      symbol: 'UNI/ETH',
      name: 'Uniswap / Ethereum',
      price: 0.0032,
      change24h: 5.67,
      volume24h: 23000000,
      liquidity: 156000000,
      dex: 'sushiswap',
      fee: 0.25
    }
  ];

  const cexPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 
    'ADA/USDT', 'XRP/USDT', 'DOT/USDT', 'AVAX/USDT'
  ];

  const dexOptions = [
    { value: 'uniswap', label: 'Uniswap V3', logo: '🦄' },
    { value: 'sushiswap', label: 'SushiSwap', logo: '🍣' },
    { value: 'pancakeswap', label: 'PancakeSwap', logo: '🥞' },
    { value: 'curve', label: 'Curve Finance', logo: '📈' }
  ] as const;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'b':
            e.preventDefault();
            setSide('buy');
            break;
          case 's':
            e.preventDefault();
            setSide('sell');
            break;
          case 'Enter':
            e.preventDefault();
            handleTrade();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [amount, price]);

  const handleTrade = async () => {
    if (!amount || (orderType === 'limit' && !price)) {
      toast({
        title: 'Invalid Order',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: `${side.toUpperCase()} Order ${activeTab === 'dex' ? 'Submitted' : 'Executed'}`,
        description: `${amount} ${selectedPair.split('/')[0]} ${side === 'buy' ? 'bought' : 'sold'} ${activeTab === 'dex' ? 'on ' + selectedDEX : 'successfully'}`,
        duration: 5000
      });

      // Reset form
      setAmount('');
      setPrice('');
    } catch (error) {
      toast({
        title: 'Trade Failed',
        description: 'There was an error executing your trade',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = orderType === 'market' ? 50000 : parseFloat(price) || 0;
    return amountNum * priceNum;
  };

  const calculateFee = (total: number) => {
    const feeRate = activeTab === 'dex' ? 0.0005 : 0.001; // 0.05% QuickTrade V3, 0.1% CEX
    const maxFee = 100; // $100 maximum fee cap (V3.0.0)
    const calculatedFee = total * feeRate;
    return Math.min(calculatedFee, maxFee);
  };

  const getDEXIcon = (dex: string) => {
    const icons = {
      uniswap: '🦄',
      sushiswap: '🍣', 
      pancakeswap: '🥞',
      curve: '📈'
    };
    return icons[dex as keyof typeof icons] || '🔄';
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            QuickTrade Enhanced V3.0
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
              Ctrl+B/S/Enter
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              0.05% Fee
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="cex" className="data-[state=active]:bg-gray-700">
              CEX Trading
            </TabsTrigger>
            <TabsTrigger value="dex" className="data-[state=active]:bg-gray-700">
              DEX Aggregation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cex" className="space-y-4">
            {/* CEX Trading */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Trading Pair</label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {cexPairs.map(pair => (
                      <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={side === 'buy' ? 'default' : 'outline'}
                  onClick={() => setSide('buy')}
                  className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Buy
                </Button>
                <Button
                  variant={side === 'sell' ? 'default' : 'outline'}
                  onClick={() => setSide('sell')}
                  className={side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Sell
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                {orderType === 'limit' && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Price</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                )}

                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">QuickTrade Fee (0.05%):</span>
                    <span className="text-white">${calculateFee(calculateTotal()).toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dex" className="space-y-4">
            {/* DEX Trading */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">DEX Protocol</label>
                <Select value={selectedDEX} onValueChange={(value) => setSelectedDEX(value as DEXPair['dex'])}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {dexOptions.map(dex => (
                      <SelectItem key={dex.value} value={dex.value}>
                        <div className="flex items-center gap-2">
                          <span>{dex.logo}</span>
                          <span>{dex.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Available Pairs</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dexPairs
                    .filter(pair => pair.dex === selectedDEX)
                    .map((pair) => (
                    <div
                      key={pair.symbol}
                      className={`p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${
                        selectedPair === pair.symbol ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => setSelectedPair(pair.symbol)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{pair.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {getDEXIcon(pair.dex)} {pair.dex}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">{pair.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">${pair.price.toLocaleString()}</div>
                          <div className={`text-xs ${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Vol: ${(pair.volume24h / 1000000).toFixed(1)}M</span>
                        <span>TVL: ${(pair.liquidity / 1000000).toFixed(1)}M</span>
                        <span>Fee: {pair.fee}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Slippage %</label>
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    placeholder="0.5"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Route:</span>
                  <span className="text-white flex items-center gap-1">
                    {selectedPair.split('/')[0]} 
                    <ArrowUpDown className="w-3 h-3" /> 
                    {selectedPair.split('/')[1]}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Est. Gas:</span>
                  <span className="text-white">$12.50</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">QuickTrade Fee (0.05%):</span>
                  <span className="text-white">${calculateFee(calculateTotal()).toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Min. Received:</span>
                  <span className="text-white">
                    {amount ? (parseFloat(amount) * (1 - parseFloat(slippage) / 100)).toFixed(4) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-3">
          {!isConnected && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Connect your wallet to start trading
              </div>
            </div>
          )}

          <Button
            onClick={handleTrade}
            disabled={!amount || isExecuting || (!isConnected && activeTab === 'dex')}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {activeTab === 'dex' ? 'Submitting to DEX...' : 'Executing Trade...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {side.toUpperCase()} {selectedPair.split('/')[0]}
                {activeTab === 'dex' && ` on ${selectedDEX}`}
              </>
            )}
          </Button>

          {activeTab === 'dex' && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <ExternalLink className="w-3 h-3" />
              <span>Powered by {selectedDEX} protocol with QuickTrade V3.0 aggregation</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};