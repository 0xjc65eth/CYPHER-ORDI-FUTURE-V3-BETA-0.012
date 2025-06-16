'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, ShoppingCart, Zap, Shield, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { binanceEngine, type OrderParams } from '@/lib/trading/trading-engine';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { useWalletSafe } from '@/hooks/useWalletSafe';

export function QuickTradePanel() {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const { toast } = useToast();
  const { price: currentPrice, isLoading } = useBitcoinPrice();
  const { isConnected, balance } = useWalletSafe();
  
  const btcBalance = balance?.bitcoin || 0;
  const usdBalance = balance?.usd || 0;

  const calculateTotal = () => {
    const qty = parseFloat(amount) || 0;
    const prc = orderType === 'market' ? (currentPrice || 0) : (parseFloat(price) || 0);
    return (qty * prc).toFixed(2);
  };

  const calculatePositionSize = () => {
    const qty = parseFloat(amount) || 0;
    return (qty * (currentPrice || 0) / leverage[0]).toFixed(2);
  };

  const validateOrder = (): string | null => {
    if (!isConnected) return 'Please connect your wallet first';
    if (!amount || parseFloat(amount) <= 0) return 'Enter a valid amount';
    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) return 'Enter a valid price';
    
    const qty = parseFloat(amount);
    if (side === 'sell' && qty > btcBalance) return 'Insufficient BTC balance';
    if (side === 'buy') {
      const totalCost = qty * (orderType === 'market' ? (currentPrice || 0) : parseFloat(price));
      if (totalCost > usdBalance) return 'Insufficient USD balance';
    }
    
    return null;
  };

  const executeOrder = async () => {
    const validationError = validateOrder();
    if (validationError) {
      toast({
        title: 'Order Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      const orderParams: OrderParams = {
        symbol: 'BTCUSDT',
        side,
        type: orderType,
        quantity: parseFloat(amount),
        price: orderType !== 'market' ? parseFloat(price) : undefined,
        stopPrice: orderType === 'stop' ? parseFloat(price) : undefined,
        timeInForce: 'GTC'
      };

      // Use demo mode if no real API keys
      if (!process.env.NEXT_PUBLIC_BINANCE_API_KEY) {
        // Simulate order execution
        const demoOrder = {
          id: `demo_${Date.now()}`,
          symbol: 'BTCUSDT',
          side,
          type: orderType,
          quantity: parseFloat(amount),
          price: orderType === 'market' ? (currentPrice || 0) : parseFloat(price),
          status: 'filled' as const
        };
        
        setLastOrderId(demoOrder.id);
        
        toast({
          title: 'Demo Order Executed',
          description: `${side.toUpperCase()} ${amount} BTC at ${orderType === 'market' ? '$' + (currentPrice || 0).toFixed(2) : '$' + price}`,
        });
        
        // Clear form
        setAmount('');
        setPrice('');
        setStopLoss('');
        setTakeProfit('');
        
        return;
      }
      
      const order = await binanceEngine.executeWithRiskManagement(orderParams, 2);
      setLastOrderId(order.id);
      
      toast({
        title: 'Order Executed Successfully',
        description: `${side.toUpperCase()} ${amount} BTC - Order ID: ${order.id}`,
      });
      
      // Clear form on success
      setAmount('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      
    } catch (error: any) {
      console.error('Order execution failed:', error);
      toast({
        title: 'Order Failed',
        description: error.message || 'Failed to execute order',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Quick Trade
        </h3>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-xs">
            BTC: {btcBalance.toFixed(4)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            USD: ${usdBalance.toFixed(2)}
          </Badge>
          {!isConnected && (
            <Badge variant="destructive" className="text-xs">
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-1 mb-4">
        <Button
          variant={side === 'buy' ? 'default' : 'ghost'}
          className={`h-10 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          onClick={() => setSide('buy')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Buy
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'ghost'}
          className={`h-10 ${side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          onClick={() => setSide('sell')}
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Sell
        </Button>
      </div>

      {/* Order Type Tabs */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as any)} className="mb-4">
        <TabsList className="grid grid-cols-3 bg-gray-800">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="stop">Stop</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Order Form */}
      <div className="space-y-3">
        {/* Amount Input */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Amount (BTC)</label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-gray-800 border-gray-700 text-white pr-16"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-xs" 
                onClick={() => setAmount((btcBalance * 0.25).toFixed(4))}
                disabled={!isConnected}
              >
                25%
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-xs" 
                onClick={() => setAmount((btcBalance * 0.5).toFixed(4))}
                disabled={!isConnected}
              >
                50%
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-xs" 
                onClick={() => setAmount(btcBalance.toFixed(4))}
                disabled={!isConnected}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Price Input (for limit/stop orders) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              {orderType === 'limit' ? 'Limit Price' : 'Stop Price'} (USD)
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={(currentPrice || 0).toFixed(2)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        )}

        {/* Leverage Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">Leverage</label>
            <span className="text-sm font-bold text-white">{leverage[0]}x</span>
          </div>
          <Slider
            value={leverage}
            onValueChange={setLeverage}
            min={1}
            max={100}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Stop Loss / Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stop Loss</label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional"
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Take Profit</label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Optional"
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Order Value</span>
            <span className="text-white font-medium">${calculateTotal()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Required Margin</span>
            <span className="text-white font-medium">${calculatePositionSize()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Fee (0.075%)</span>
            <span className="text-white font-medium">${(parseFloat(calculateTotal()) * 0.00075).toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={executeOrder}
          disabled={isExecuting || !amount || isLoading}
          className={`w-full h-12 font-bold text-lg ${
            side === 'buy' 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExecuting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {side === 'buy' ? 'Buy' : 'Sell'} {orderType === 'market' ? 'Market' : orderType.charAt(0).toUpperCase() + orderType.slice(1)}
            </>
          )}
        </Button>
        
        {lastOrderId && (
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-3 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-400">
              Last Order: {lastOrderId}
            </span>
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-400">
              Connect wallet to enable trading
            </span>
          </div>
        )}

        {/* Advanced Options */}
        <div className="flex items-center justify-center space-x-4 text-xs">
          <button className="text-gray-500 hover:text-gray-300 flex items-center">
            <Calculator className="w-3 h-3 mr-1" />
            Calculator
          </button>
          <button className="text-gray-500 hover:text-gray-300 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            Risk Settings
          </button>
        </div>
      </div>
    </Card>
  );
}