import React, { useState } from 'react';
import { useLiquidityPools } from '../../../hooks/liquidity/useLiquidityPools';
import PoolStatsCard from './PoolStatsCard';
import PoolPairSelector from './PoolPairSelector';
import { FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';

const LiquidityPoolsPanel = () => {
  const { pools, loading, error, refetch } = useLiquidityPools();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [filterBy, setFilterBy] = useState('all');

  const filteredPools = pools
    .filter(pool => {
      const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'high-apy' && pool.apy > 50) ||
        (filterBy === 'high-tvl' && pool.tvl > 1000000);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return b.tvl - a.tvl;
        case 'apy':
          return b.apy - a.apy;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddLiquidity = (poolId) => {
    // Redirecionar para RunesDx.com
    window.open(`https://runesdx.com/pools/${poolId}/add`, '_blank');
  };

  const handleRemoveLiquidity = (poolId) => {
    // Redirecionar para RunesDx.com
    window.open(`https://runesdx.com/pools/${poolId}/remove`, '_blank');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Erro: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pools de Liquidez
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas posições de liquidez no RunesDX
          </p>
        </div>
        
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-4 h-4" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos os Pools</option>
              <option value="high-apy">Alto APY (>50%)</option>
              <option value="high-tvl">Alto TVL (>$1M)</option>
            </select>
          </div>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="tvl">Ordenar por TVL</option>
            <option value="apy">Ordenar por APY</option>
            <option value="volume">Ordenar por Volume</option>
            <option value="name">Ordenar por Nome</option>
          </select>
        </div>
      </div>

      {/* Seletor de Pares */}
      <PoolPairSelector />

      {/* Lista de Pools */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool) => (
            <PoolStatsCard
              key={pool.id}
              pool={pool}
              onAddLiquidity={() => handleAddLiquidity(pool.id)}
              onRemoveLiquidity={() => handleRemoveLiquidity(pool.id)}
            />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!loading && filteredPools.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">💧</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum pool encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tente ajustar os filtros de busca ou criar um novo pool
          </p>
        </div>
      )}

      {/* Total de Pools */}
      {!loading && pools.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredPools.length} de {pools.length} pools
        </div>
      )}
    </div>
  );
};

export default LiquidityPoolsPanel;