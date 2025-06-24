import React, { useState } from 'react';
import { useUserLiquidity, useArbitrageOpportunities } from '../../../hooks/liquidity/useUserLiquidity';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent, FiAlertTriangle, FiEye, FiEyeOff, FiExternalLink } from 'react-icons/fi';

const UserLiquidityPositions = ({ userAddress }) => {
  const { positions, totalValue, loading, error, refetch } = useUserLiquidity(userAddress);
  const { opportunities } = useArbitrageOpportunities();
  const [showDetails, setShowDetails] = useState({});
  const [hideSmallPositions, setHideSmallPositions] = useState(false);

  const toggleDetails = (positionId) => {
    setShowDetails(prev => ({
      ...prev,
      [positionId]: !prev[positionId]
    }));
  };

  const formatCurrency = (value) => {
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getImpermanentLossColor = (loss) => {
    if (loss > 10) return 'text-red-600 dark:text-red-400';
    if (loss > 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const filteredPositions = positions.filter(position => 
    !hideSmallPositions || position.value >= 100
  );

  const totalFeesEarned = positions.reduce((sum, pos) => sum + pos.feesEarned, 0);
  const totalImpermanentLoss = positions.reduce((sum, pos) => sum + pos.impermanentLoss, 0) / positions.length;

  if (!userAddress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Conecte sua carteira
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Para visualizar suas posições de liquidez, conecte uma carteira Bitcoin
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-red-900 dark:text-red-100">Erro ao carregar posições</h3>
        </div>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Minhas Posições de Liquidez
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {positions.length} posição{positions.length !== 1 ? 'ões' : ''} ativa{positions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHideSmallPositions(!hideSmallPositions)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {hideSmallPositions ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
              {hideSmallPositions ? 'Mostrar Todas' : 'Ocultar Pequenas'}
            </button>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <FiDollarSign className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Valor Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalValue)}
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <FiTrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Taxas Ganhas</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(totalFeesEarned)}
            </p>
          </div>

          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <FiPercent className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">IL Médio</span>
            </div>
            <p className={`text-2xl font-bold ${getImpermanentLossColor(Math.abs(totalImpermanentLoss))}`}>
              {formatPercentage(totalImpermanentLoss)}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas de Arbitragem */}
      {opportunities.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FiAlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Oportunidades de Arbitragem Detectadas
            </h3>
          </div>
          <div className="space-y-2">
            {opportunities.slice(0, 3).map((opp, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-orange-800 dark:text-orange-200">
                  {opp.pair} - Diferença de {formatPercentage(opp.priceDiff)}
                </span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  +{formatCurrency(opp.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Posições */}
      {filteredPositions.length > 0 ? (
        <div className="space-y-4">
          {filteredPositions.map((position) => (
            <div 
              key={position.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header da Posição */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                        {position.token0.symbol?.charAt(0) || 'T'}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                        {position.token1.symbol?.charAt(0) || 'T'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {position.poolName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Participação: {formatPercentage(position.share * 100)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleDetails(position.id)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showDetails[position.id] ? 'Ocultar' : 'Detalhes'}
                  </button>
                </div>

                {/* Stats da Posição */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valor</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(position.value)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Taxas Ganhas</span>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(position.feesEarned)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Impermanent Loss</span>
                    <p className={`text-lg font-semibold ${getImpermanentLossColor(Math.abs(position.impermanentLoss))}`}>
                      {formatPercentage(position.impermanentLoss)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Liquidez</span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {position.liquidity.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {showDetails[position.id] && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tokens Depositados</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">{position.token0.symbol}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {position.token0Amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">{position.token1.symbol}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {position.token1Amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Histórico</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Criado em:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(position.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Dias Ativos:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {Math.floor((Date.now() - new Date(position.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`https://runesdx.com/pools/${position.poolId}/add`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    Adicionar
                    <FiExternalLink className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`https://runesdx.com/pools/${position.poolId}/remove`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FiTrendingDown className="w-4 h-4" />
                    Remover
                    <FiExternalLink className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`https://runesdx.com/pools/${position.poolId}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Ver Pool
                    <FiExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💧</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma posição de liquidez
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comece fornecendo liquidez em pools do RunesDX para ganhar taxas
          </p>
          <button
            onClick={() => window.open('https://runesdx.com/pools', '_blank')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Explorar Pools
            <FiExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserLiquidityPositions;