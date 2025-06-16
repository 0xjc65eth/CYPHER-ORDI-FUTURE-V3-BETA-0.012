'use client';

import { useState } from 'react';
import { useBinance } from '@/hooks/useBinance';
import { DollarSign, RefreshCw, AlertCircle, CheckCircle, Wallet } from 'lucide-react';

export default function ExchangePanel() {
  const { 
    isConnected, 
    balances, 
    openOrders, 
    createOrder, 
    cancelOrder, 
    refreshBalances, 
    error 
  } = useBinance();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Binance Exchange
          </h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-500 text-sm">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-500 text-sm">Mock Mode</span>
              </>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-400 bg-red-900/20 rounded p-2">
            {error}
          </div>
        )}
      </div>

      {/* Balances */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Balances</h4>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-2">
          {balances.length > 0 ? (
            balances.map(balance => (
              <div key={balance.asset} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  <span className="font-medium">{balance.asset}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono">{balance.total.toFixed(8)}</div>
                  {balance.locked > 0 && (
                    <div className="text-xs text-zinc-500">
                      Locked: {balance.locked.toFixed(8)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-zinc-500 text-center py-4">
              No balances available
            </div>
          )}
        </div>
      </div>

      {/* Open Orders */}
      {openOrders.length > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <h4 className="font-medium mb-3">Open Orders</h4>
          <div className="space-y-2">
            {openOrders.map(order => (
              <div key={order.orderId} className="border border-zinc-800 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{order.symbol}</span>
                  <span className={`text-sm ${
                    order.side === 'BUY' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {order.side}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>
                    {order.quantity} @ {order.price}
                  </span>
                  <button
                    onClick={() => cancelOrder(order.symbol, order.orderId)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-zinc-500 text-center">
        {isConnected 
          ? 'Live trading enabled. Trade with caution.' 
          : 'Using mock data. Configure API keys for live trading.'}
      </div>
    </div>
  );
}
