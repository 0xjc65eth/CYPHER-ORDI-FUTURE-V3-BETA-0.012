'use client';

import React, { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';

export default function BRC20SimplePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('🔍 BRC20 Simple - Component mounting...');
    setMounted(true);
    console.log('✅ BRC20 Simple - Component mounted');
  }, []);

  console.log('🔍 BRC20 Simple - Render called, mounted:', mounted);

  if (!mounted) {
    console.log('🔍 BRC20 Simple - Returning loading state');
    return (
      <TopNavLayout>
        <div className="min-h-screen bg-black p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-500 mb-4">Loading BRC-20 Hub...</h1>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </TopNavLayout>
    );
  }

  console.log('🔍 BRC20 Simple - Returning main content');

  return (
    <TopNavLayout>
      <div className="min-h-screen bg-black p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">BRC-20 Simple Test Page</h1>
        
        <div className="grid gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              🟡 BRC-20 Intelligence Hub - Simple Version
            </h2>
            <p className="text-gray-400">
              This is a simplified version to test if the page renders correctly.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">Total Market Cap</h3>
              <p className="text-2xl font-bold text-white">$978.6M</p>
              <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">24h Volume</h3>
              <p className="text-2xl font-bold text-white">$5.3M</p>
              <p className="text-xs text-blue-400 mt-1">+8.3% from yesterday</p>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold mb-2">Active Tokens</h3>
              <p className="text-2xl font-bold text-white">125</p>
              <p className="text-xs text-purple-400 mt-1">+15 new this week</p>
            </div>
            
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-orange-400 font-semibold mb-2">Total Holders</h3>
              <p className="text-2xl font-bold text-white">71.4K</p>
              <p className="text-xs text-orange-400 mt-1">+2.1K new holders</p>
            </div>
          </div>

          {/* Token List */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top BRC-20 Tokens</h3>
            <div className="space-y-3">
              {[
                { ticker: 'ORDI', name: 'Ordinals', price: '$45.67', change: '+8.5%', positive: true },
                { ticker: 'SATS', name: 'Satoshis', price: '$0.0000005', change: '+12.3%', positive: true },
                { ticker: 'RATS', name: 'Rats', price: '$0.000015', change: '-5.2%', positive: false },
                { ticker: 'MEME', name: 'Meme', price: '$0.0025', change: '+15.7%', positive: true },
                { ticker: 'PEPE', name: 'Pepe', price: '$0.000008', change: '-2.8%', positive: false }
              ].map((token, index) => (
                <div key={token.ticker} className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {token.ticker.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-white">{token.ticker}</span>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono">{token.price}</div>
                    <div className={`text-sm ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {token.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Test */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Navigation Test</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  console.log('🔍 Navigating to original BRC20 page...');
                  window.location.href = '/brc20';
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
              >
                Go to Original BRC20 Page
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Navigating to debug page...');
                  window.location.href = '/brc20-debug';
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Go to Debug Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}