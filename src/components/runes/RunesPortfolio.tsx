'use client';

import React, { useState } from 'react';
import { useTradingStore } from '@/stores/trading-store';

export const RunesPortfolio: React.FC = () => {
  const { activeWallet, runes } = useTradingStore();
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // Mock portfolio data - in real implementation, this would come from wallet integration
  const portfolioRunes = [
    {
      name: 'UNCOMMON•GOODS',
      symbol: 'UG',
      balance: 15000,
      divisibility: 0,
      valueInBTC: 0.0023,
      change24h: 12.3
    },
    {
      name: 'RSIC•METAPROTOCOL',
      symbol: 'RSIC',
      balance: 500,
      divisibility: 2,
      valueInBTC: 0.0018,
      change24h: -5.7
    },
    {
      name: 'DOG•GO•TO•THE•MOON',
      symbol: 'DGTM',
      balance: 2500000,
      divisibility: 8,
      valueInBTC: 0.0001,
      change24h: 8.9
    }
  ];

  const totalPortfolioValue = portfolioRunes.reduce((sum, rune) => sum + rune.valueInBTC, 0);
  const totalChange24h = portfolioRunes.reduce((sum, rune, _, arr) => 
    sum + (rune.change24h * (rune.valueInBTC / totalPortfolioValue)), 0
  );

  const formatBalance = (balance: number, divisibility: number) => {
    return (balance / Math.pow(10, divisibility)).toLocaleString();
  };

  return (
    <div className="h-full space-y-4">
      {/* Portfolio Header */}
      <div className="text-center pb-4 border-b border-bloomberg-orange/20">
        <h3 className="text-lg font-terminal text-bloomberg-orange">Runes Portfolio</h3>
        <div className="text-xs text-bloomberg-orange/60 mt-1">
          Your Runes holdings and performance
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-bloomberg-black-700 p-4 rounded border border-bloomberg-orange/20">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-terminal text-bloomberg-orange">Connected Wallet</h4>
          {activeWallet && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-bloomberg-green rounded-full"></div>
              <span className="text-xs text-bloomberg-green">Connected</span>
            </div>
          )}
        </div>
        
        {activeWallet ? (
          <div className="space-y-2">
            <div className="text-sm font-terminal text-bloomberg-orange">
              {activeWallet.address.slice(0, 8)}...{activeWallet.address.slice(-8)}
            </div>
            <div className="text-xs text-bloomberg-orange/60">
              Type: {activeWallet.type.toUpperCase()} • Balance: {activeWallet.balance.total.toFixed(8)} BTC
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-sm text-bloomberg-orange/60 mb-2">No wallet connected</div>
            <button className="bg-bloomberg-orange text-black font-terminal text-xs py-2 px-4 rounded hover:bg-bloomberg-orange/80 transition-colors">
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">Total Value</div>
          <div className="text-xl font-terminal text-bloomberg-orange">
            {totalPortfolioValue.toFixed(6)}
          </div>
          <div className="text-xs text-bloomberg-orange/60">BTC</div>
        </div>

        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">24h Change</div>
          <div className={`text-xl font-terminal ${totalChange24h >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
            {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
          </div>
        </div>

        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">Holdings</div>
          <div className="text-xl font-terminal text-bloomberg-orange">
            {portfolioRunes.length}
          </div>
          <div className="text-xs text-bloomberg-orange/60">runes</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-bloomberg-black-700 rounded border border-bloomberg-orange/20 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-3 bg-bloomberg-black-600 border-b border-bloomberg-orange/20 text-xs text-bloomberg-orange/60 font-terminal">
          <div>RUNE</div>
          <div>BALANCE</div>
          <div>VALUE</div>
          <div>24H CHANGE</div>
          <div>ACTION</div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {portfolioRunes.map((rune, index) => (
            <div 
              key={index}
              className="grid grid-cols-5 gap-4 p-3 border-b border-bloomberg-orange/10 hover:bg-bloomberg-black-600 transition-colors"
            >
              {/* Rune Info */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-bloomberg-orange/30 to-bloomberg-blue/30 rounded border border-bloomberg-orange/30 flex items-center justify-center">
                  <span className="text-xs font-terminal text-bloomberg-orange">R</span>
                </div>
                <div>
                  <div className="text-sm font-terminal text-bloomberg-orange">
                    {rune.symbol}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60 truncate">
                    {rune.name}
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-terminal text-bloomberg-orange">
                    {formatBalance(rune.balance, rune.divisibility)}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60">
                    {rune.symbol}
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-terminal text-bloomberg-orange">
                    {rune.valueInBTC.toFixed(6)}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60">
                    BTC
                  </div>
                </div>
              </div>

              {/* 24h Change */}
              <div className="flex items-center">
                <div className={`text-sm font-terminal ${rune.change24h >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {rune.change24h >= 0 ? '+' : ''}{rune.change24h.toFixed(2)}%
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="text-xs bg-bloomberg-green/20 hover:bg-bloomberg-green/30 text-bloomberg-green px-2 py-1 rounded transition-colors">
                  Trade
                </button>
                <button className="text-xs bg-bloomberg-blue/20 hover:bg-bloomberg-blue/30 text-bloomberg-blue px-2 py-1 rounded transition-colors">
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>

        {portfolioRunes.length === 0 && (
          <div className="text-center py-8 text-bloomberg-orange/60">
            <div className="text-lg font-terminal">No runes in portfolio</div>
            <div className="text-sm">Connect wallet to view holdings</div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-bloomberg-black-700 p-4 rounded border border-bloomberg-orange/20">
        <h4 className="text-sm font-terminal text-bloomberg-orange mb-3">Recent Transactions</h4>
        
        <div className="space-y-2">
          {[
            { type: 'mint', rune: 'UNCOMMON•GOODS', amount: '1,000', time: '2m ago', hash: 'a1b2c3...' },
            { type: 'transfer', rune: 'RSIC•METAPROTOCOL', amount: '500', time: '1h ago', hash: 'x4y5z6...' },
            { type: 'etch', rune: 'DOG•GO•TO•THE•MOON', amount: 'New Rune', time: '3h ago', hash: 'm7n8o9...' }
          ].map((tx, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-bloomberg-black-600 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  tx.type === 'mint' ? 'bg-bloomberg-green' :
                  tx.type === 'transfer' ? 'bg-bloomberg-blue' : 'bg-bloomberg-orange'
                }`}></div>
                <div>
                  <div className="text-sm text-bloomberg-orange">
                    {tx.type.toUpperCase()}: {tx.rune}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60">
                    {tx.amount} • {tx.time}
                  </div>
                </div>
              </div>
              <button className="text-xs text-bloomberg-blue hover:text-bloomberg-blue/80">
                {tx.hash}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};