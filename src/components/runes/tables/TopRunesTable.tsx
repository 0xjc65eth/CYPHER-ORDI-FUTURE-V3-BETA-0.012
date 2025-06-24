'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BaseTable } from './BaseTable';
import { useTopRunesTable, useTableExport } from '@/hooks/runes/useRunesTables';
import { TableColumn, TableFilters } from '@/types/runes-tables';

interface TopRunesTableProps {
  className?: string;
  autoRefresh?: boolean;
  onRuneSelect?: (runeId: string) => void;
}

export const TopRunesTable: React.FC<TopRunesTableProps> = ({
  className,
  autoRefresh = true,
  onRuneSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketCapFilter, setMarketCapFilter] = useState<'all' | 'large' | 'mid' | 'small'>('all');
  
  const {
    data,
    total,
    pagination,
    filters,
    isLoading,
    error,
    updateFilters,
    updateSort,
    goToPage,
    refresh
  } = useTopRunesTable({
    autoRefresh,
    refreshInterval: 30000
  });

  const { exportToCSV, exportToJSON } = useTableExport();

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'rank',
      label: '#',
      sortable: true,
      width: '60px',
      align: 'center'
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '200px'
    },
    {
      key: 'symbol',
      label: 'Symbol',
      sortable: true,
      width: '100px'
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      format: 'currency',
      align: 'right',
      width: '120px'
    },
    {
      key: 'priceChange24h',
      label: '24h %',
      sortable: true,
      format: 'percentage',
      align: 'right',
      width: '100px'
    },
    {
      key: 'marketCap',
      label: 'Market Cap',
      sortable: true,
      format: 'currency',
      align: 'right',
      width: '150px'
    },
    {
      key: 'volume24h',
      label: '24h Volume',
      sortable: true,
      format: 'currency',
      align: 'right',
      width: '150px'
    },
    {
      key: 'holders',
      label: 'Holders',
      sortable: true,
      format: 'number',
      align: 'right',
      width: '100px'
    },
    {
      key: 'supply',
      label: 'Supply',
      sortable: true,
      format: 'number',
      align: 'right',
      width: '150px'
    }
  ];

  // Enhanced data with computed fields
  const enhancedData = React.useMemo(() => {
    return data.map((rune, index) => ({
      ...rune,
      rank: (pagination.page - 1) * pagination.pageSize + index + 1,
      // Add click handler for row selection
      onClick: () => onRuneSelect?.(rune.id)
    }));
  }, [data, pagination.page, pagination.pageSize, onRuneSelect]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    updateFilters({ search: term || undefined });
  }, [updateFilters]);

  // Handle market cap filter
  const handleMarketCapFilter = useCallback((filter: 'all' | 'large' | 'mid' | 'small') => {
    setMarketCapFilter(filter);
    
    let minMarketCap: number | undefined;
    let maxMarketCap: number | undefined;
    
    switch (filter) {
      case 'large':
        minMarketCap = 1000000000; // 1B+
        break;
      case 'mid':
        minMarketCap = 100000000; // 100M+
        maxMarketCap = 1000000000;
        break;
      case 'small':
        maxMarketCap = 100000000; // <100M
        break;
      default:
        minMarketCap = undefined;
        maxMarketCap = undefined;
    }
    
    updateFilters({ minMarketCap, maxMarketCap });
  }, [updateFilters]);

  // Handle export
  const handleExport = useCallback((config: any) => {
    const exportData = enhancedData.map(row => ({
      rank: row.rank,
      name: row.name,
      symbol: row.symbol,
      price: row.price,
      priceChange24h: row.priceChange24h,
      marketCap: row.marketCap,
      volume24h: row.volume24h,
      holders: row.holders,
      supply: row.supply
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `runes-top-${timestamp}.${config.format}`;

    if (config.format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      exportToJSON(exportData, filename);
    }
  }, [enhancedData, exportToCSV, exportToJSON]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Top Runes by Market Cap</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time ranking of Runes tokens by market capitalization
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search runes by name or symbol..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Market Cap Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'large', label: 'Large Cap' },
            { key: 'mid', label: 'Mid Cap' },
            { key: 'small', label: 'Small Cap' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleMarketCapFilter(key as any)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                marketCapFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total Runes</div>
          <div className="text-2xl font-bold text-white">{total.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total Market Cap</div>
          <div className="text-2xl font-bold text-white">
            ${data.reduce((sum, rune) => sum + rune.marketCap, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">24h Volume</div>
          <div className="text-2xl font-bold text-white">
            ${data.reduce((sum, rune) => sum + rune.volume24h, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Average Holders</div>
          <div className="text-2xl font-bold text-white">
            {Math.round(data.reduce((sum, rune) => sum + rune.holders, 0) / data.length || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <BaseTable
        data={enhancedData}
        columns={columns}
        loading={isLoading}
        error={error}
        sortConfig={filters.sortBy ? { key: filters.sortBy, direction: filters.sortOrder || 'desc' } : undefined}
        pagination={pagination}
        onSort={updateSort}
        onPageChange={goToPage}
        onExport={handleExport}
        emptyMessage="No runes found matching your criteria"
      />
    </div>
  );
};