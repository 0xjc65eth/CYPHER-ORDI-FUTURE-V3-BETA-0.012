'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BaseTable } from './BaseTable';
import { useMarketMoversTable, useTableExport } from '@/hooks/runes/useRunesTables';
import { TableColumn } from '@/types/runes-tables';

interface MarketMoversTableProps {
  className?: string;
  autoRefresh?: boolean;
  onRuneSelect?: (runeId: string) => void;
}

export const MarketMoversTable: React.FC<MarketMoversTableProps> = ({
  className,
  autoRefresh = true,
  onRuneSelect
}) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  
  const {
    gainers,
    losers,
    timeframe,
    isLoading,
    error,
    updateTimeframe,
    refresh
  } = useMarketMoversTable({
    autoRefresh,
    refreshInterval: 60000 // 1 minute
  });

  const { exportToCSV, exportToJSON } = useTableExport();

  // Define table columns for market movers
  const columns: TableColumn[] = [
    {
      key: 'rank',
      label: '#',
      sortable: false,
      width: '50px',
      align: 'center'
    },
    {
      key: 'name',
      label: 'Name',
      sortable: false,
      width: '150px'
    },
    {
      key: 'symbol',
      label: 'Symbol',
      sortable: false,
      width: '80px'
    },
    {
      key: 'price',
      label: 'Price',
      sortable: false,
      format: 'currency',
      align: 'right',
      width: '100px'
    },
    {
      key: 'priceChange1h',
      label: '1h %',
      sortable: false,
      format: 'percentage',
      align: 'right',
      width: '80px'
    },
    {
      key: 'priceChange24h',
      label: '24h %',
      sortable: false,
      format: 'percentage',
      align: 'right',
      width: '80px'
    },
    {
      key: 'priceChange7d',
      label: '7d %',
      sortable: false,
      format: 'percentage',
      align: 'right',
      width: '80px'
    },
    {
      key: 'volume24h',
      label: '24h Volume',
      sortable: false,
      format: 'currency',
      align: 'right',
      width: '120px'
    },
    {
      key: 'marketCap',
      label: 'Market Cap',
      sortable: false,
      format: 'currency',
      align: 'right',
      width: '120px'
    },
    {
      key: 'reason',
      label: 'Catalyst',
      sortable: false,
      width: '150px'
    }
  ];

  // Get current data based on active tab
  const currentData = useMemo(() => {
    const data = activeTab === 'gainers' ? gainers : losers;
    return data.map((item, index) => ({
      ...item,
      rank: index + 1,
      onClick: () => onRuneSelect?.(item.id)
    }));
  }, [activeTab, gainers, losers, onRuneSelect]);

  // Handle export
  const handleExport = useCallback((config: any) => {
    const exportData = currentData.map(row => ({
      rank: row.rank,
      name: row.name,
      symbol: row.symbol,
      price: row.price,
      priceChange1h: row.priceChange1h,
      priceChange24h: row.priceChange24h,
      priceChange7d: row.priceChange7d,
      volume24h: row.volume24h,
      marketCap: row.marketCap,
      reason: row.reason || 'N/A'
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `runes-${activeTab}-${timeframe}-${timestamp}.${config.format}`;

    if (config.format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      exportToJSON(exportData, filename);
    }
  }, [currentData, activeTab, timeframe, exportToCSV, exportToJSON]);

  // Calculate stats
  const stats = useMemo(() => {
    const gainersAvgChange = gainers.length > 0 
      ? gainers.reduce((sum, g) => sum + g.priceChange24h, 0) / gainers.length 
      : 0;
    
    const losersAvgChange = losers.length > 0 
      ? losers.reduce((sum, l) => sum + l.priceChange24h, 0) / losers.length 
      : 0;

    const topGainer = gainers[0];
    const topLoser = losers[0];

    const totalGainersVolume = gainers.reduce((sum, g) => sum + g.volume24h, 0);
    const totalLosersVolume = losers.reduce((sum, l) => sum + l.volume24h, 0);

    return {
      gainersAvgChange,
      losersAvgChange,
      topGainer,
      topLoser,
      totalGainersVolume,
      totalLosersVolume
    };
  }, [gainers, losers]);

  // Custom rendering for movement indicators
  const renderMovementIndicator = useCallback((change: number, size: 'sm' | 'lg' = 'sm') => {
    const isPositive = change > 0;
    const sizeClasses = size === 'lg' ? 'text-2xl' : 'text-sm';
    
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? (
          <svg className={`w-4 h-4 mr-1 ${size === 'lg' ? 'w-6 h-6' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 mr-1 ${size === 'lg' ? 'w-6 h-6' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        <span className={sizeClasses}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    );
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Market Movers</h2>
          <p className="text-sm text-gray-400 mt-1">
            Top gaining and declining Runes by price movement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="flex bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { key: '1h', label: '1 Hour' },
          { key: '24h', label: '24 Hours' },
          { key: '7d', label: '7 Days' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => updateTimeframe(key as any)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              timeframe === key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Top Gainer</div>
          <div className="text-lg font-bold text-white">
            {stats.topGainer?.symbol || 'N/A'}
          </div>
          {stats.topGainer && renderMovementIndicator(stats.topGainer.priceChange24h, 'lg')}
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Top Loser</div>
          <div className="text-lg font-bold text-white">
            {stats.topLoser?.symbol || 'N/A'}
          </div>
          {stats.topLoser && renderMovementIndicator(stats.topLoser.priceChange24h, 'lg')}
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Gainers Volume</div>
          <div className="text-2xl font-bold text-green-400">
            ${stats.totalGainersVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Losers Volume</div>
          <div className="text-2xl font-bold text-red-400">
            ${stats.totalLosersVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Market Sentiment Indicator */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Market Sentiment</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{gainers.length}</div>
              <div className="text-sm text-gray-400">Gainers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{losers.length}</div>
              <div className="text-sm text-gray-400">Losers</div>
            </div>
          </div>
          <div className="flex-1 mx-8">
            <div className="bg-gray-700 rounded-full h-4 relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(gainers.length / (gainers.length + losers.length)) * 100}%` }}
              />
              <div 
                className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(losers.length / (gainers.length + losers.length)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Bullish</span>
              <span>Bearish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('gainers')}
          className={`px-6 py-2 rounded text-sm transition-colors flex items-center ${
            activeTab === 'gainers'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Top Gainers ({gainers.length})
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`px-6 py-2 rounded text-sm transition-colors flex items-center ${
            activeTab === 'losers'
              ? 'bg-red-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Top Losers ({losers.length})
        </button>
      </div>

      {/* Table */}
      <BaseTable
        data={currentData}
        columns={columns}
        loading={isLoading}
        error={error}
        onExport={handleExport}
        showPagination={false}
        emptyMessage={`No ${activeTab} found for the selected timeframe`}
        className={activeTab === 'gainers' ? 'border-green-500/20' : 'border-red-500/20'}
      />
    </div>
  );
};