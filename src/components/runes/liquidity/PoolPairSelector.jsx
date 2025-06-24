import React, { useState, useMemo } from 'react';
import { useLiquidityPools } from '../../../hooks/liquidity/useLiquidityPools';
import { FiSearch, FiTrendingUp, FiDollarSign, FiPercent, FiExternalLink, FiStar, FiFilter } from 'react-icons/fi';

const PoolPairSelector = ({ onSelectPair, selectedPair }) => {
  const { pools, loading, error } = useLiquidityPools();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [filterBy, setFilterBy] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = (poolId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(poolId)) {
      newFavorites.delete(poolId);
    } else {
      newFavorites.add(poolId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritePoolPairs', JSON.stringify([...newFavorites]));
  };

  // Carregar favoritos salvos
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('favoritePoolPairs');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const filteredAndSortedPools = useMemo(() => {
    let filtered = pools.filter(pool => {
      const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pool.token0.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pool.token1.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'high-apy' && pool.apy > 50) ||
        (filterBy === 'high-tvl' && pool.tvl > 1000000) ||
        (filterBy === 'new' && isNewPool(pool)) ||
        (filterBy === 'stable' && isStablePair(pool));
      
      const matchesFavorites = !showFavorites || favorites.has(pool.id);
      
      return matchesSearch && matchesFilter && matchesFavorites;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return b.tvl - a.tvl;
        case 'apy':
          return b.apy - a.apy;
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pools, searchTerm, sortBy, filterBy, showFavorites, favorites]);

  const isNewPool = (pool) => {
    if (!pool.createdAt) return false;
    const createdDate = new Date(pool.createdAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > sevenDaysAgo;
  };

  const isStablePair = (pool) => {
    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'RUSD'];
    return stablecoins.includes(pool.token0.symbol) || stablecoins.includes(pool.token1.symbol);
  };

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

  const getPoolCategories = () => {
    const categories = {
      trending: pools.filter(p => p.volume24h > 100000).slice(0, 5),
      new: pools.filter(isNewPool).slice(0, 5),
      stable: pools.filter(isStablePair).slice(0, 5),
      highAPY: pools.filter(p => p.apy > 50).slice(0, 5)
    };
    return categories;
  };

  const categories = getPoolCategories();

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Erro ao carregar pares: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selecionar Par de Trading
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Escolha um par para visualizar detalhes ou adicionar liquidez
            </p>
          </div>
          
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              showFavorites 
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FiStar className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favoritos {showFavorites && `(${favorites.size})`}
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome do token ou símbolo..."
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
              <option value="all">Todos</option>
              <option value="high-apy">Alto APY</option>
              <option value="high-tvl">Alto TVL</option>
              <option value="new">Novos</option>
              <option value="stable">Stablecoins</option>
            </select>
          </div>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="tvl">TVL ↓</option>
            <option value="apy">APY ↓</option>
            <option value="volume">Volume ↓</option>
            <option value="newest">Mais Novos</option>
            <option value="name">Nome A-Z</option>
          </select>
        </div>
      </div>

      {/* Categorias Rápidas */}
      {!searchTerm && !showFavorites && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Categorias Populares
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Em Alta</h5>
              <div className="space-y-1">
                {categories.trending.slice(0, 3).map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => onSelectPair?.(pool)}
                    className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Novos</h5>
              <div className="space-y-1">
                {categories.new.slice(0, 3).map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => onSelectPair?.(pool)}
                    className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Estáveis</h5>
              <div className="space-y-1">
                {categories.stable.slice(0, 3).map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => onSelectPair?.(pool)}
                    className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Alto APY</h5>
              <div className="space-y-1">
                {categories.highAPY.slice(0, 3).map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => onSelectPair?.(pool)}
                    className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {pool.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Pares */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredAndSortedPools.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedPools.map((pool) => (
              <div
                key={pool.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  selectedPair?.id === pool.id ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' : ''
                }`}
                onClick={() => onSelectPair?.(pool)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex -space-x-1">
                      <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                        {pool.token0.symbol?.charAt(0) || 'T'}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                        {pool.token1.symbol?.charAt(0) || 'T'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {pool.name}
                        </h4>
                        {isNewPool(pool) && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                            Novo
                          </span>
                        )}
                        {favorites.has(pool.id) && (
                          <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fee: {formatPercentage(pool.fee)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FiDollarSign className="w-3 h-3" />
                        <span className="text-xs">TVL</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(pool.tvl)}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FiPercent className="w-3 h-3" />
                        <span className="text-xs">APY</span>
                      </div>
                      <p className={`font-medium ${getAPYColor(pool.apy)}`}>
                        {formatPercentage(pool.apy)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pool.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <FiStar className={`w-4 h-4 ${favorites.has(pool.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://runesdx.com/pools/${pool.id}`, '_blank');
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <FiExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum par encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>

      {/* Footer com informações */}
      {!loading && filteredAndSortedPools.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredAndSortedPools.length} de {pools.length} pares
            </span>
            <button
              onClick={() => window.open('https://runesdx.com/pools', '_blank')}
              className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline"
            >
              Ver todos no RunesDX
              <FiExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolPairSelector;