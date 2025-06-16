import React, { useState, useEffect, useMemo } from 'react';

// Interfaces para type safety
interface AggregatorFee {
  amount: number;
  percentage: number;
}

interface ExchangeFee {
  amount: number;
  percentage: number;
}

interface TradingRoute {
  id: string;
  exchange: string;
  aggregatorFee?: AggregatorFee | number; // Permite ambos os tipos
  exchangeFee?: ExchangeFee | number;
  estimatedTime: string;
  slippage: number;
  gasEstimate?: number;
  priceImpact?: number;
  outputAmount?: number;
}

interface SuperQuickTradeProps {
  // Definir props se necessário
}

const SuperQuickTrade: React.FC<SuperQuickTradeProps> = () => {
  const [selectedRoute, setSelectedRoute] = useState<TradingRoute | null>(null);
  const [routes, setRoutes] = useState<TradingRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data para evitar erros
  const mockRoutes: TradingRoute[] = [
    {
      id: '1',
      exchange: 'Uniswap V3',
      aggregatorFee: { amount: 1.25, percentage: 0.2 },
      exchangeFee: { amount: 3.50, percentage: 0.3 },
      estimatedTime: '~15 seconds',
      slippage: 0.5,
      gasEstimate: 45,
      priceImpact: 0.12,
      outputAmount: 1247.85
    },
    {
      id: '2',
      exchange: 'SushiSwap',
      aggregatorFee: { amount: 1.10, percentage: 0.2 },
      exchangeFee: { amount: 4.20, percentage: 0.35 },
      estimatedTime: '~20 seconds',
      slippage: 0.3,
      gasEstimate: 52,
      priceImpact: 0.18,
      outputAmount: 1244.32
    }
  ];

  useEffect(() => {
    // Inicializar com dados mock para evitar crashes
    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
  }, []);

  // Função helper para formatar taxas com validação
  const formatFee = (fee: AggregatorFee | ExchangeFee | number | undefined, fallback: string = '0.00'): string => {
    try {
      if (fee === undefined || fee === null) {
        return fallback;
      }

      if (typeof fee === 'number') {
        return fee.toFixed(2);
      }

      if (typeof fee === 'object' && fee.amount !== undefined) {
        return fee.amount.toFixed(2);
      }

      return fallback;
    } catch (error) {
      console.error('Error formatting fee:', error);
      return fallback;
    }
  };

  // Função helper para obter percentual da taxa
  const getFeePercentage = (fee: AggregatorFee | ExchangeFee | number | undefined): number => {
    try {
      if (fee === undefined || fee === null) {
        return 0;
      }

      if (typeof fee === 'number') {
        return 0.2; // Default percentage
      }

      if (typeof fee === 'object' && fee.percentage !== undefined) {
        return fee.percentage;
      }

      return 0;
    } catch (error) {
      console.error('Error getting fee percentage:', error);
      return 0;
    }
  };

  // Memoizar cálculos para performance
  const calculatedValues = useMemo(() => {
    if (!selectedRoute) {
      return {
        aggregatorFeeFormatted: '0.00',
        exchangeFeeFormatted: '0.00',
        totalFees: '0.00',
        aggregatorPercentage: 0.2,
        exchangePercentage: 0.3
      };
    }

    const aggregatorFeeFormatted = formatFee(selectedRoute.aggregatorFee);
    const exchangeFeeFormatted = formatFee(selectedRoute.exchangeFee);
    const aggregatorPercentage = getFeePercentage(selectedRoute.aggregatorFee);
    const exchangePercentage = getFeePercentage(selectedRoute.exchangeFee);
    
    const totalFeesNum = parseFloat(aggregatorFeeFormatted) + parseFloat(exchangeFeeFormatted);
    const totalFees = totalFeesNum.toFixed(2);

    return {
      aggregatorFeeFormatted,
      exchangeFeeFormatted,
      totalFees,
      aggregatorPercentage,
      exchangePercentage
    };
  }, [selectedRoute]);

  const handleRouteSelection = (route: TradingRoute) => {
    try {
      setError(null);
      setSelectedRoute(route);
    } catch (error) {
      console.error('Error selecting route:', error);
      setError('Failed to select trading route');
    }
  };

  // Error boundary interno
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button 
          onClick={() => setError(null)}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <span className="sr-only">Dismiss</span>
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6">Super Quick Trade</h3>
      
      {/* Route Selection */}
      <div className="space-y-3 mb-6">
        {routes.map((route) => (
          <div
            key={route.id}
            onClick={() => handleRouteSelection(route)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedRoute?.id === route.id
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-white font-medium">{route.exchange}</span>
                <span className="text-gray-400 text-sm ml-2">{route.estimatedTime}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  ${formatFee(route.outputAmount, '0.00')}
                </div>
                <div className="text-gray-400 text-sm">
                  Gas: ${formatFee(route.gasEstimate, '0')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fee Breakdown - Seção corrigida */}
      {selectedRoute && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-medium mb-3">Fee Breakdown</h4>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Aggregator Fee ({calculatedValues.aggregatorPercentage}%)
            </span>
            <span className="text-white">
              ${calculatedValues.aggregatorFeeFormatted}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              {selectedRoute.exchange} Fee ({calculatedValues.exchangePercentage}%)
            </span>
            <span className="text-white">
              ${calculatedValues.exchangeFeeFormatted}
            </span>
          </div>
          
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Fees</span>
              <span className="text-white font-medium">
                ${calculatedValues.totalFees}
              </span>
            </div>
          </div>

          {/* Informações adicionais com validação */}
          {selectedRoute.slippage !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Slippage</span>
              <span className="text-white">{selectedRoute.slippage}%</span>
            </div>
          )}

          {selectedRoute.priceImpact !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={`${selectedRoute.priceImpact > 1 ? 'text-red-400' : 'text-green-400'}`}>
                {selectedRoute.priceImpact.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <span className="text-gray-400 text-sm mt-2">Loading routes...</span>
        </div>
      )}

      {/* Action Button */}
      <button 
        disabled={!selectedRoute || loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Processing...' : 'Execute Trade'}
      </button>
    </div>
  );
};

export default SuperQuickTrade;