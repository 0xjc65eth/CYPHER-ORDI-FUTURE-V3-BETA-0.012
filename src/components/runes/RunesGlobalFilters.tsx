'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  SortAsc,
  SortDesc,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';
import { useRunesFilters } from '@/contexts/RunesTerminalContext';

export function RunesGlobalFilters() {
  const { filters, setFilters, resetFilters, hasFiltersApplied } = useRunesFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (value: string) => {
    setFilters({ search: value });
  };

  const handleTimeframeChange = (timeframe: typeof filters.timeframe) => {
    setFilters({ timeframe });
  };

  const handleSortChange = (sortBy: typeof filters.sortBy, sortOrder?: typeof filters.sortOrder) => {
    setFilters({ 
      sortBy, 
      ...(sortOrder && { sortOrder })
    });
  };

  const handleCategoryChange = (category: typeof filters.category) => {
    setFilters({ category });
  };

  const formatNumber = (value: number): string => {
    if (value === 0) return '0';
    if (value === Infinity) return '∞';
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🎯' },
    { id: 'meme', name: 'Meme Coins', icon: '🐕' },
    { id: 'utility', name: 'Utility', icon: '⚡' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'defi', name: 'DeFi', icon: '💰' },
    { id: 'art', name: 'Art & NFTs', icon: '🎨' }
  ];

  const sortOptions = [
    { id: 'marketCap', name: 'Market Cap', icon: DollarSign },
    { id: 'volume', name: 'Volume', icon: BarChart3 },
    { id: 'change', name: 'Price Change', icon: TrendingUp },
    { id: 'holders', name: 'Holders', icon: Users },
    { id: 'name', name: 'Name', icon: Zap }
  ];

  const timeframes = [
    { id: '1h', name: '1H' },
    { id: '24h', name: '24H' },
    { id: '7d', name: '7D' },
    { id: '30d', name: '30D' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 mb-6"
    >
      {/* Quick Filters Row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search runes..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Timeframe */}
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => handleTimeframeChange(tf.id as any)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filters.timeframe === tf.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf.name}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
            showAdvanced || hasFiltersApplied
              ? 'bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasFiltersApplied && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              ON
            </span>
          )}
        </button>

        {/* Reset Filters */}
        {hasFiltersApplied && (
          <button
            onClick={resetFilters}
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id as any)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded transition-colors text-sm ${
                        filters.category === cat.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <div className="space-y-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded transition-colors text-sm ${
                        filters.sortBy === option.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.name}</span>
                      </div>
                      {filters.sortBy === option.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSortChange(
                              option.id as any,
                              filters.sortOrder === 'asc' ? 'desc' : 'asc'
                            );
                          }}
                          className="ml-2"
                        >
                          {filters.sortOrder === 'asc' ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Market Cap Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400">Min Value</label>
                    <input
                      type="number"
                      value={filters.minValue || ''}
                      onChange={(e) => setFilters({ minValue: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Max Value</label>
                    <input
                      type="number"
                      value={filters.maxValue === Infinity ? '' : filters.maxValue}
                      onChange={(e) => setFilters({ maxValue: Number(e.target.value) || Infinity })}
                      placeholder="∞"
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Active Filters
                </label>
                <div className="bg-gray-800 rounded-lg p-3 text-sm">
                  <div className="space-y-1 text-gray-400">
                    <div>Category: <span className="text-white">{filters.category}</span></div>
                    <div>Sort: <span className="text-white">{filters.sortBy} ({filters.sortOrder})</span></div>
                    <div>Range: <span className="text-white">{formatNumber(filters.minValue)} - {formatNumber(filters.maxValue)}</span></div>
                    {filters.search && (
                      <div>Search: <span className="text-white">"{filters.search}"</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RunesGlobalFilters;