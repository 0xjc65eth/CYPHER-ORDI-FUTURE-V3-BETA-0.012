'use client';

import React, { useState, useCallback } from 'react';
import { TableFilters } from '@/types/runes-tables';

interface AdvancedFiltersProps {
  filters: TableFilters;
  onFiltersChange: (filters: Partial<TableFilters>) => void;
  onReset: () => void;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback((key: keyof TableFilters, value: any) => {
    onFiltersChange({ [key]: value });
  }, [onFiltersChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    onReset();
    setIsExpanded(false);
  }, [onReset]);

  return (
    <div className={`bg-gray-800/50 border border-gray-700/50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm">{isExpanded ? 'Hide' : 'Show'} Filters</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Price (USD)
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={filters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Price (USD)
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={filters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="1000000"
              />
            </div>
          </div>

          {/* Market Cap Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Market Cap (USD)
              </label>
              <input
                type="number"
                min="0"
                value={filters.minMarketCap || ''}
                onChange={(e) => handleInputChange('minMarketCap', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Market Cap (USD)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxMarketCap || ''}
                onChange={(e) => handleInputChange('maxMarketCap', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="1000000000"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Market Cap Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Micro Cap (<$1M)', min: 0, max: 1000000 },
                { label: 'Small Cap ($1M-$10M)', min: 1000000, max: 10000000 },
                { label: 'Mid Cap ($10M-$100M)', min: 10000000, max: 100000000 },
                { label: 'Large Cap ($100M-$1B)', min: 100000000, max: 1000000000 },
                { label: 'Mega Cap (>$1B)', min: 1000000000, max: undefined }
              ].map(({ label, min, max }) => (
                <button
                  key={label}
                  onClick={() => {
                    handleInputChange('minMarketCap', min);
                    handleInputChange('maxMarketCap', max);
                  }}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors text-gray-300 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'marketCap'}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="marketCap">Market Cap</option>
                <option value="price">Price</option>
                <option value="priceChange24h">24h Change</option>
                <option value="volume24h">24h Volume</option>
                <option value="holders">Holders</option>
                <option value="supply">Supply</option>
                <option value="name">Name</option>
                <option value="createdAt">Creation Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="desc">Descending (High to Low)</option>
                <option value="asc">Ascending (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Results Per Page */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Results Per Page
              </label>
              <select
                value={filters.limit || 50}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Period
              </label>
              <select
                value={filters.timeframe || '24h'}
                onChange={(e) => handleInputChange('timeframe', e.target.value as '1h' | '24h' | '7d' | '30d')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="pt-4 border-t border-gray-700/50">
            <div className="text-sm font-medium text-gray-300 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value === undefined || value === null || value === '') return null;
                
                let displayValue = value.toString();
                if (key.includes('Price') || key.includes('MarketCap')) {
                  displayValue = `$${parseFloat(value.toString()).toLocaleString()}`;
                }
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  >
                    {key}: {displayValue}
                    <button
                      onClick={() => handleInputChange(key as keyof TableFilters, undefined)}
                      className="ml-1 hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {Object.values(filters).every(v => v === undefined || v === null || v === '') && (
                <span className="text-sm text-gray-400">No active filters</span>
              )}
            </div>
          </div>

          {/* Apply/Reset Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-300"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};