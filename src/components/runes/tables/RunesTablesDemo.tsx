'use client';

import React, { useState, useCallback } from 'react';
import {
  TopRunesTable,
  HoldersTable,
  RecentTransactionsTable,
  MarketMoversTable,
  AdvancedFilters
} from './index';

interface RunesTablesDemoProps {
  className?: string;
}

export const RunesTablesDemo: React.FC<RunesTablesDemoProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'holders' | 'transactions' | 'movers'>('overview');
  const [selectedRune, setSelectedRune] = useState<{
    id: string;
    name: string;
    symbol: string;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // Handle rune selection from tables
  const handleRuneSelect = useCallback((runeId: string, runeName?: string, runeSymbol?: string) => {
    setSelectedRune({
      id: runeId,
      name: runeName || 'Unknown',
      symbol: runeSymbol || 'UNK'
    });
    setActiveTab('holders');
  }, []);

  // Handle address selection
  const handleAddressSelect = useCallback((address: string) => {
    setSelectedAddress(address);
  }, []);

  // Handle transaction selection
  const handleTransactionSelect = useCallback((txHash: string) => {
    // Open transaction in block explorer
    window.open(`https://mempool.space/tx/${txHash}`, '_blank');
  }, []);

  const tabs = [
    { 
      key: 'overview', 
      label: 'Top Runes', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Market cap rankings and overview'
    },
    { 
      key: 'holders', 
      label: 'Holders', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Token holder distribution and analysis'
    },
    { 
      key: 'transactions', 
      label: 'Transactions', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: 'Real-time transaction monitoring'
    },
    { 
      key: 'movers', 
      label: 'Market Movers', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: 'Top gainers and losers'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Runes Market Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Advanced data tables with real-time market intelligence
          </p>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live Data</span>
        </div>
      </div>

      {/* Selected Context */}
      <div className="flex flex-wrap gap-2">
        {selectedRune && (
          <div className="flex items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
            <span className="text-sm text-blue-400">Selected Rune:</span>
            <span className="text-sm font-medium text-white">
              {selectedRune.name} ({selectedRune.symbol})
            </span>
            <button
              onClick={() => setSelectedRune(null)}
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              ×
            </button>
          </div>
        )}
        
        {selectedAddress && (
          <div className="flex items-center space-x-2 bg-purple-600/20 px-3 py-1 rounded-full border border-purple-500/30">
            <span className="text-sm text-purple-400">Watching Address:</span>
            <span className="text-sm font-mono text-white">
              {selectedAddress.slice(0, 8)}...{selectedAddress.slice(-8)}
            </span>
            <button
              onClick={() => setSelectedAddress('')}
              className="text-purple-400 hover:text-purple-300 ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700/50">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ key, label, icon, description }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`group py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className={`transition-colors ${
                activeTab === key ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'
              }`}>
                {icon}
              </span>
              <div className="text-left">
                <div>{label}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">
                  {description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <TopRunesTable
            autoRefresh={true}
            onRuneSelect={(runeId) => {
              // Find the rune details for better context
              handleRuneSelect(runeId, 'Selected Rune', 'RUNE');
            }}
          />
        )}

        {activeTab === 'holders' && (
          <div className="space-y-6">
            {!selectedRune ? (
              <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a Rune</h3>
                <p className="text-gray-400 mb-6">
                  Choose a rune from the Overview tab to analyze its holder distribution
                </p>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                >
                  Browse Runes
                </button>
              </div>
            ) : (
              <HoldersTable
                runeId={selectedRune.id}
                runeName={selectedRune.name}
                runeSymbol={selectedRune.symbol}
                autoRefresh={true}
                onAddressSelect={handleAddressSelect}
              />
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <RecentTransactionsTable
            autoRefresh={true}
            runeFilter={selectedRune?.symbol}
            onTransactionSelect={handleTransactionSelect}
            onAddressSelect={handleAddressSelect}
          />
        )}

        {activeTab === 'movers' && (
          <MarketMoversTable
            autoRefresh={true}
            onRuneSelect={(runeId) => {
              handleRuneSelect(runeId, 'Market Mover', 'MOVER');
            }}
          />
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Data updated every 30 seconds</span>
            <span>•</span>
            <span>Real-time blockchain monitoring</span>
            <span>•</span>
            <span>Advanced caching enabled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};