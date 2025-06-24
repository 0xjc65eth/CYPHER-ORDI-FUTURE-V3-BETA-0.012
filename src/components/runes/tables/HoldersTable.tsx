'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BaseTable } from './BaseTable';
import { useHoldersTable, useTableExport } from '@/hooks/runes/useRunesTables';
import { TableColumn } from '@/types/runes-tables';

interface HoldersTableProps {
  runeId: string;
  runeName?: string;
  runeSymbol?: string;
  className?: string;
  autoRefresh?: boolean;
  onAddressSelect?: (address: string) => void;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({
  runeId,
  runeName = 'Unknown Rune',
  runeSymbol = 'UNKNOWN',
  className,
  autoRefresh = true,
  onAddressSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [holderTypeFilter, setHolderTypeFilter] = useState<'all' | 'whale' | 'retail' | 'contracts'>('all');
  
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
  } = useHoldersTable(runeId, {
    autoRefresh,
    refreshInterval: 60000 // 1 minute for holders
  });

  const { exportToCSV, exportToJSON } = useTableExport();

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'rank',
      label: 'Rank',
      sortable: true,
      width: '80px',
      align: 'center'
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      format: 'address',
      width: '200px'
    },
    {
      key: 'balance',
      label: `Balance (${runeSymbol})`,
      sortable: true,
      format: 'number',
      align: 'right',
      width: '150px'
    },
    {
      key: 'percentage',
      label: '% of Supply',
      sortable: true,
      format: 'percentage',
      align: 'right',
      width: '120px'
    },
    {
      key: 'transactionCount',
      label: 'Tx Count',
      sortable: true,
      format: 'number',
      align: 'right',
      width: '100px'
    },
    {
      key: 'firstActivity',
      label: 'First Activity',
      sortable: true,
      format: 'date',
      align: 'center',
      width: '150px'
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      format: 'date',
      align: 'center',
      width: '150px'
    },
    {
      key: 'label',
      label: 'Type',
      sortable: false,
      width: '120px'
    }
  ];

  // Enhanced data with computed fields and labels
  const enhancedData = useMemo(() => {
    return data.map((holder, index) => {
      let label = 'Retail';
      if (holder.isContract) {
        label = 'Contract';
      } else if (holder.percentage > 5) {
        label = 'Whale';
      } else if (holder.percentage > 1) {
        label = 'Large Holder';
      }

      return {
        ...holder,
        rank: (pagination.page - 1) * pagination.pageSize + index + 1,
        label,
        onClick: () => onAddressSelect?.(holder.address)
      };
    });
  }, [data, pagination.page, pagination.pageSize, onAddressSelect]);

  // Filter data based on holder type
  const filteredData = useMemo(() => {
    if (holderTypeFilter === 'all') return enhancedData;
    
    return enhancedData.filter(holder => {
      switch (holderTypeFilter) {
        case 'whale':
          return holder.percentage > 1;
        case 'retail':
          return holder.percentage <= 1 && !holder.isContract;
        case 'contracts':
          return holder.isContract;
        default:
          return true;
      }
    });
  }, [enhancedData, holderTypeFilter]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    updateFilters({ search: term || undefined });
  }, [updateFilters]);

  // Handle holder type filter
  const handleHolderTypeFilter = useCallback((filter: 'all' | 'whale' | 'retail' | 'contracts') => {
    setHolderTypeFilter(filter);
  }, []);

  // Handle export
  const handleExport = useCallback((config: any) => {
    const exportData = filteredData.map(row => ({
      rank: row.rank,
      address: row.address,
      balance: row.balance,
      percentage: row.percentage,
      transactionCount: row.transactionCount,
      firstActivity: row.firstActivity,
      lastActivity: row.lastActivity,
      type: row.label
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${runeSymbol}-holders-${timestamp}.${config.format}`;

    if (config.format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      exportToJSON(exportData, filename);
    }
  }, [filteredData, runeSymbol, exportToCSV, exportToJSON]);

  // Calculate stats
  const stats = useMemo(() => {
    const whales = enhancedData.filter(h => h.percentage > 1).length;
    const contracts = enhancedData.filter(h => h.isContract).length;
    const avgBalance = enhancedData.length > 0 
      ? enhancedData.reduce((sum, h) => sum + h.balance, 0) / enhancedData.length 
      : 0;
    const topHoldersPercentage = enhancedData.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);

    return {
      whales,
      contracts,
      avgBalance,
      topHoldersPercentage
    };
  }, [enhancedData]);

  if (!runeId) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50">
        <div className="text-center text-gray-400">
          Select a rune to view holder distribution
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {runeName} ({runeSymbol}) Holders
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Top holders and distribution analysis
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
              placeholder="Search by address..."
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

        {/* Holder Type Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: enhancedData.length },
            { key: 'whale', label: 'Whales', count: stats.whales },
            { key: 'retail', label: 'Retail', count: enhancedData.length - stats.whales - stats.contracts },
            { key: 'contracts', label: 'Contracts', count: stats.contracts }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleHolderTypeFilter(key as any)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                holderTypeFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total Holders</div>
          <div className="text-2xl font-bold text-white">{total.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Top 10 Hold</div>
          <div className="text-2xl font-bold text-white">{stats.topHoldersPercentage.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Avg Balance</div>
          <div className="text-2xl font-bold text-white">
            {stats.avgBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Whale Holders</div>
          <div className="text-2xl font-bold text-white">{stats.whales}</div>
        </div>
      </div>

      {/* Holder Distribution Chart */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Holder Distribution</h3>
        <div className="space-y-2">
          {[
            { label: 'Top 1-10', percentage: stats.topHoldersPercentage, color: 'bg-red-500' },
            { label: 'Top 11-50', percentage: enhancedData.slice(10, 50).reduce((sum, h) => sum + h.percentage, 0), color: 'bg-orange-500' },
            { label: 'Top 51-100', percentage: enhancedData.slice(50, 100).reduce((sum, h) => sum + h.percentage, 0), color: 'bg-yellow-500' },
            { label: 'Others', percentage: 100 - enhancedData.slice(0, 100).reduce((sum, h) => sum + h.percentage, 0), color: 'bg-green-500' }
          ].map(({ label, percentage, color }) => (
            <div key={label} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-400">{label}</div>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${color}`} 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="w-16 text-sm text-white text-right">{percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <BaseTable
        data={filteredData}
        columns={columns}
        loading={isLoading}
        error={error}
        sortConfig={filters.sortBy ? { key: filters.sortBy, direction: filters.sortOrder || 'desc' } : undefined}
        pagination={pagination}
        onSort={updateSort}
        onPageChange={goToPage}
        onExport={handleExport}
        emptyMessage="No holders found"
      />
    </div>
  );
};