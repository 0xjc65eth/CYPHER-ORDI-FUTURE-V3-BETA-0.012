import React, { useState } from 'react';
import { useLiquidityAlerts } from '../../../hooks/liquidity/useImpermanentLoss';
import { FiAlertTriangle, FiTrendingUp, FiActivity, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

const LiquidityAlerts = ({ pools = [], userPositions = [] }) => {
  const { alerts, dismissAlert, getAlertIcon, getAlertColor, hasHighPriorityAlerts } = useLiquidityAlerts(pools, userPositions);
  const [isExpanded, setIsExpanded] = useState(hasHighPriorityAlerts);
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.priority === filter;
  });

  const handleAlertAction = (alert) => {
    switch (alert.action) {
      case 'add_liquidity':
        window.open(`https://runesdx.com/pools/${alert.pool.id}/add`, '_blank');
        break;
      case 'review_position':
        window.open(`https://runesdx.com/pools/${alert.position.poolId}`, '_blank');
        break;
      case 'monitor':
        // Apenas marcar como visto
        break;
      default:
        break;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'add_liquidity': return 'Adicionar Liquidez';
      case 'review_position': return 'Revisar Posição';
      case 'monitor': return 'Monitorar';
      default: return 'Ver Detalhes';
    }
  };

  const getAlertBackgroundColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getAlertTextColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-800 dark:text-red-200';
      case 'medium': return 'text-yellow-800 dark:text-yellow-200';
      case 'low': return 'text-blue-800 dark:text-blue-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getAlertIconColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className={`w-5 h-5 ${hasHighPriorityAlerts ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alertas de Liquidez
            </h3>
            {alerts.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                {alerts.length}
              </span>
            )}
          </div>
          
          {hasHighPriorityAlerts && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 animate-pulse">
              Atenção Requerida
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos</option>
            <option value="high">Alta Prioridade</option>
            <option value="medium">Média Prioridade</option>
            <option value="low">Baixa Prioridade</option>
          </select>

          {/* Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isExpanded ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {isExpanded && (
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum alerta encontrado para este filtro
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getAlertBackgroundColor(alert.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-xl">{getAlertIcon(alert.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${getAlertTextColor(alert.priority)}`}>
                          {alert.title}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${getAlertTextColor(alert.priority)} mb-3`}>
                        {alert.message}
                      </p>

                      {/* Alert Details */}
                      {alert.pool && (
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">TVL:</span>
                            <span className={`ml-2 font-medium ${getAlertTextColor(alert.priority)}`}>
                              ${alert.pool.tvl.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">APY:</span>
                            <span className={`ml-2 font-medium ${getAlertTextColor(alert.priority)}`}>
                              {alert.pool.apy.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {alert.position && (
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Valor:</span>
                            <span className={`ml-2 font-medium ${getAlertTextColor(alert.priority)}`}>
                              ${alert.position.value.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">IL:</span>
                            <span className={`ml-2 font-medium ${getAlertTextColor(alert.priority)}`}>
                              {alert.position.impermanentLoss.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAlertAction(alert)}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            alert.priority === 'high' 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : alert.priority === 'medium'
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <FiTrendingUp className="w-3 h-3" />
                          {getActionText(alert.action)}
                        </button>
                        
                        {alert.type === 'high-apy' && (
                          <button
                            onClick={() => window.open(`https://runesdx.com/pools/${alert.pool.id}`, '_blank')}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FiActivity className="w-3 h-3" />
                            Ver Pool
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissAlert(index)}
                    className={`flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${getAlertIconColor(alert.priority)}`}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {isExpanded && filteredAlerts.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? 's' : ''} 
              {filter !== 'all' && ` de ${filter === 'high' ? 'alta' : filter === 'medium' ? 'média' : 'baixa'} prioridade`}
            </span>
            
            <div className="flex items-center gap-4">
              <span className="text-red-600 dark:text-red-400">
                {alerts.filter(a => a.priority === 'high').length} alta
              </span>
              <span className="text-yellow-600 dark:text-yellow-400">
                {alerts.filter(a => a.priority === 'medium').length} média
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {alerts.filter(a => a.priority === 'low').length} baixa
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityAlerts;