import React, { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiActivity, FiPercent, FiExternalLink, FiInfo } from 'react-icons/fi';
import { usePoolStats } from '../../../hooks/liquidity/useLiquidityPools';

const PoolStatsCard = ({ pool, onAddLiquidity, onRemoveLiquidity }) => {
  const { stats, loading: statsLoading } = usePoolStats(pool.id);
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (value) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getAPYColor = (apy) => {
    if (apy >= 100) return 'text-green-600 dark:text-green-400';
    if (apy >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const calculateImpermanentLoss = (priceChange) => {
    // Fórmula simplificada de impermanent loss
    const ratio = Math.abs(priceChange) / 100;
    return (2 * Math.sqrt(1 + ratio) / (1 + ratio) - 1) * 100;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {/* Token Icons - placeholder */}
              <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                {pool.token0.symbol?.charAt(0) || 'T'}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                {pool.token1.symbol?.charAt(0) || 'T'}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {pool.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fee: {formatPercentage(pool.fee)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiInfo className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiDollarSign className="w-3 h-3" />
              <span className="text-xs uppercase tracking-wide">TVL</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(pool.tvl)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiPercent className="w-3 h-3" />
              <span className="text-xs uppercase tracking-wide">APY</span>
            </div>
            <p className={`text-lg font-semibold ${getAPYColor(pool.apy)}`}>
              {formatPercentage(pool.apy)}
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiActivity className="w-3 h-3" />
              <span className="text-xs uppercase tracking-wide">Volume 24h</span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(pool.volume24h)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiTrendingUp className="w-3 h-3" />
              <span className="text-xs uppercase tracking-wide">Liquidez</span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(pool.liquidity)}
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        {showDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reserve {pool.token0.symbol}:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {pool.reserve0.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reserve {pool.token1.symbol}:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {pool.reserve1.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Preço Atual:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {pool.price.toFixed(6)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">IL Estimado:</span>
                <p className="font-medium text-red-600 dark:text-red-400">
                  -{calculateImpermanentLoss(5).toFixed(2)}%
                </p>
              </div>
            </div>

            {statsLoading && (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={onAddLiquidity}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FiTrendingUp className="w-4 h-4" />
            Adicionar Liquidez
            <FiExternalLink className="w-3 h-3 opacity-70" />
          </button>
          
          <button
            onClick={onRemoveLiquidity}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <FiTrendingUp className="w-4 h-4 transform rotate-180" />
            Remover Liquidez
            <FiExternalLink className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* APY Badge */}
      {pool.apy >= 50 && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Alto APY
          </span>
        </div>
      )}
    </div>
  );
};

export default PoolStatsCard;