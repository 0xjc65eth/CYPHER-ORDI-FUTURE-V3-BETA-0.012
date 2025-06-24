'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BaseTable } from './BaseTable';
import { useRecentTransactionsTable, useTableExport } from '@/hooks/runes/useRunesTables';
import { TableColumn } from '@/types/runes-tables';

interface RecentTransactionsTableProps {
  className?: string;
  autoRefresh?: boolean;
  runeFilter?: string;
  onTransactionSelect?: (txHash: string) => void;
  onAddressSelect?: (address: string) => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  className,
  autoRefresh = true,
  runeFilter,
  onTransactionSelect,
  onAddressSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mint' | 'transfer' | 'burn' | 'trade'>('all');
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
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
  } = useRecentTransactionsTable({
    autoRefresh,
    refreshInterval: 15000 // 15 seconds for real-time feel
  });

  const { exportToCSV, exportToJSON } = useTableExport();

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      format: 'date',
      width: '120px'
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '80px'
    },
    {
      key: 'runeName',
      label: 'Rune',
      sortable: true,
      width: '120px'
    },
    {
      key: 'from',
      label: 'From',
      sortable: false,
      format: 'address',
      width: '120px'
    },
    {
      key: 'to',
      label: 'To',
      sortable: false,
      format: 'address',
      width: '120px'
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      format: 'number',
      align: 'right',
      width: '120px'
    },
    {
      key: 'value',
      label: 'Value (USD)',
      sortable: true,
      format: 'currency',
      align: 'right',
      width: '120px'
    },
    {
      key: 'fee',
      label: 'Fee (BTC)',
      sortable: true,
      align: 'right',
      width: '100px'
    },
    {
      key: 'txHash',
      label: 'Tx Hash',
      sortable: false,
      format: 'hash',
      width: '120px'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '80px'
    }
  ];

  // Enhanced data with computed fields and custom rendering
  const enhancedData = useMemo(() => {
    return data.map((tx) => ({
      ...tx,
      // Format fee in BTC
      fee: (tx.fee / 100000000).toFixed(8),
      // Add click handlers
      onTxClick: () => onTransactionSelect?.(tx.txHash),
      onFromClick: () => onAddressSelect?.(tx.from),
      onToClick: () => onAddressSelect?.(tx.to)
    }));
  }, [data, onTransactionSelect, onAddressSelect]);

  // Filter data based on type and timeframe
  const filteredData = useMemo(() => {
    let filtered = enhancedData;

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Apply rune filter if provided
    if (runeFilter) {
      filtered = filtered.filter(tx => 
        tx.runeName.toLowerCase().includes(runeFilter.toLowerCase()) ||
        tx.runeSymbol.toLowerCase().includes(runeFilter.toLowerCase())
      );
    }

    return filtered;
  }, [enhancedData, typeFilter, runeFilter]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    updateFilters({ search: term || undefined });
  }, [updateFilters]);

  // Handle type filter
  const handleTypeFilter = useCallback((filter: 'all' | 'mint' | 'transfer' | 'burn' | 'trade') => {
    setTypeFilter(filter);
  }, []);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTimeframe: '1h' | '24h' | '7d' | '30d') => {
    setTimeframe(newTimeframe);
    updateFilters({ timeframe: newTimeframe });
  }, [updateFilters]);

  // Handle export
  const handleExport = useCallback((config: any) => {
    const exportData = filteredData.map(row => ({
      timestamp: row.timestamp,
      type: row.type,
      rune: `${row.runeName} (${row.runeSymbol})`,
      from: row.from,
      to: row.to,
      amount: row.amount,
      value_usd: row.value,
      fee_btc: row.fee,
      tx_hash: row.txHash,
      status: row.status,
      block_height: row.blockHeight
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `runes-transactions-${timestamp}.${config.format}`;

    if (config.format === 'csv') {
      exportToCSV(exportData, filename);
    } else {
      exportToJSON(exportData, filename);
    }
  }, [filteredData, exportToCSV, exportToJSON]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const totalFees = filteredData.reduce((sum, tx) => sum + parseFloat(tx.fee), 0);
    const typeCount = {
      mint: filteredData.filter(tx => tx.type === 'mint').length,
      transfer: filteredData.filter(tx => tx.type === 'transfer').length,
      burn: filteredData.filter(tx => tx.type === 'burn').length,
      trade: filteredData.filter(tx => tx.type === 'trade').length
    };

    return {
      totalValue,
      totalFees,
      typeCount,
      avgValue: filteredData.length > 0 ? totalValue / filteredData.length : 0
    };
  }, [filteredData]);

  // Custom cell renderer for transaction type
  const renderTransactionType = useCallback((type: string) => {
    const colors = {
      mint: 'bg-green-500/20 text-green-400 border-green-500/30',
      transfer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      burn: 'bg-red-500/20 text-red-400 border-red-500/30',
      trade: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {type.toUpperCase()}
      </span>
    );
  }, []);

  // Custom cell renderer for status
  const renderStatus = useCallback((status: string) => {
    const colors = {
      confirmed: 'text-green-400',
      pending: 'text-yellow-400',
      failed: 'text-red-400'
    };

    return (
      <span className={colors[status as keyof typeof colors] || 'text-gray-400'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Recent Runes Transactions</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time activity across the Runes ecosystem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by transaction hash, address, or rune..."
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

        {/* Type Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: filteredData.length },
            { key: 'mint', label: 'Mint', count: stats.typeCount.mint },
            { key: 'transfer', label: 'Transfer', count: stats.typeCount.transfer },
            { key: 'trade', label: 'Trade', count: stats.typeCount.trade },
            { key: 'burn', label: 'Burn', count: stats.typeCount.burn }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleTypeFilter(key as any)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                typeFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {[
            { key: '1h', label: '1H' },
            { key: '24h', label: '24H' },
            { key: '7d', label: '7D' },
            { key: '30d', label: '30D' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTimeframeChange(key as any)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeframe === key
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
          <div className="text-sm text-gray-400">Total Transactions</div>
          <div className="text-2xl font-bold text-white">{filteredData.length.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total Value</div>
          <div className="text-2xl font-bold text-white">
            ${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Average Value</div>
          <div className="text-2xl font-bold text-white">
            ${stats.avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Total Fees</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalFees.toFixed(8)} BTC
          </div>
        </div>
      </div>

      {/* Transaction Activity Chart */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction Types Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.typeCount).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-gray-400 capitalize">{type}</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    type === 'mint' ? 'bg-green-500' :
                    type === 'transfer' ? 'bg-blue-500' :
                    type === 'trade' ? 'bg-purple-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(count / filteredData.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table with custom renderers */}
      <BaseTable
        data={filteredData.map(tx => ({
          ...tx,
          type: renderTransactionType(tx.type),
          status: renderStatus(tx.status)
        }))}
        columns={columns}
        loading={isLoading}
        error={error}
        sortConfig={filters.sortBy ? { key: filters.sortBy, direction: filters.sortOrder || 'desc' } : undefined}
        pagination={pagination}
        onSort={updateSort}
        onPageChange={goToPage}
        onExport={handleExport}
        emptyMessage="No transactions found"
      />
    </div>
  );
};