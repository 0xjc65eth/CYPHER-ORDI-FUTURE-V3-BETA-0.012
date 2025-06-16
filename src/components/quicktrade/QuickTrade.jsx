// components/QuickTrade/QuickTrade.jsx
import React, { useState, useEffect } from 'react';
import { SwapService } from '../../services/SwapService';

export const QuickTrade = ({ wallet }) => {
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState(null);
  
  const swapService = new SwapService();

  useEffect(() => {
    loadTokens();
  }, [wallet]);

  const loadTokens = async () => {
    if (!wallet?.chain) return;
    
    try {
      const tokenList = await swapService.getTokenList(wallet.chain);
      setTokens(tokenList);
      
      // Set default tokens
      if (tokenList.length >= 2) {
        setFromToken(tokenList[0]);
        setToToken(tokenList[1]);
      }
    } catch (error) {
      console.error('Erro ao carregar tokens:', error);
    }
  };

  const handleSearch = async () => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bestRoute = await swapService.findBestRoute(
        fromToken,
        toToken,
        parseFloat(amount),
        wallet.chain,
        wallet.address
      );
      
      if (bestRoute) {
        setRoutes([bestRoute]);
        setSelectedRoute(bestRoute);
      } else {
        setError('Nenhuma rota encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar rotas:', error);
      setError('Erro ao buscar rotas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedRoute) return;
    
    try {
      const result = await swapService.executeSwap(selectedRoute, wallet.address);
      
      if (result.success) {
        // Reset form
        setAmount('');
        setRoutes([]);
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error('Erro ao executar swap:', error);
      setError('Erro ao executar swap');
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setRoutes([]);
    setSelectedRoute(null);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(num);
  };

  return (
    <div className="quick-trade bg-gray-900 rounded-xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="text-3xl mr-3">⚡</span>
        Quick Trade
      </h3>
      
      <div className="trade-inputs space-y-4">
        {/* From Token */}
        <div className="token-select bg-gray-800 rounded-lg p-4">
          <label className="text-gray-400 text-sm mb-2 block">De:</label>
          <div className="flex items-center gap-3">
            <select 
              value={fromToken?.symbol || ''} 
              onChange={(e) => {
                const token = tokens.find(t => t.symbol === e.target.value);
                setFromToken(token);
              }}
              className="bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-gray-700 text-white text-xl rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button 
            onClick={swapTokens}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-all duration-200 hover:rotate-180"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="token-select bg-gray-800 rounded-lg p-4">
          <label className="text-gray-400 text-sm mb-2 block">Para:</label>
          <div className="flex items-center gap-3">
            <select 
              value={toToken?.symbol || ''} 
              onChange={(e) => {
                const token = tokens.find(t => t.symbol === e.target.value);
                setToToken(token);
              }}
              className="bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            
            <div className="flex-1 bg-gray-700 text-gray-400 text-xl rounded px-4 py-2">
              {selectedRoute ? formatNumber(selectedRoute.estimatedOutput) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Search Button */}
      <button 
        onClick={handleSearch} 
        disabled={loading || !fromToken || !toToken || !amount}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Buscando...
          </div>
        ) : (
          'Buscar Melhor Rota'
        )}
      </button>

      {/* Route Info */}
      {selectedRoute && (
        <div className="route-info mt-6 bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-lg font-bold text-white">Melhor Rota Encontrada:</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Plataforma:</span>
              <p className="text-white font-medium">{selectedRoute.platform}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Você receberá:</span>
              <p className="text-green-400 font-medium">
                {formatNumber(selectedRoute.estimatedOutput)} {toToken?.symbol}
              </p>
            </div>
            
            <div>
              <span className="text-gray-400">Taxa Cypher (0.33%):</span>
              <p className="text-yellow-400 font-medium">
                {formatNumber(selectedRoute.fee)} {fromToken?.symbol}
              </p>
            </div>
            
            <div>
              <span className="text-gray-400">Impacto no Preço:</span>
              <p className="text-white font-medium">
                {selectedRoute.priceImpact?.toFixed(2)}%
              </p>
            </div>
            
            <div>
              <span className="text-gray-400">Tempo Estimado:</span>
              <p className="text-white font-medium">{selectedRoute.executionTime}</p>
            </div>
            
            <div>
              <span className="text-gray-400">Confiança:</span>
              <p className="text-white font-medium">
                {(selectedRoute.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleExecute} 
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Executar Swap
          </button>
        </div>
      )}
      
      {/* Info Footer */}
      <div className="mt-6 text-center text-gray-500 text-xs">
        <p>💡 Dica: Sempre verifique o impacto no preço antes de executar grandes trades</p>
      </div>
    </div>
  );
};

export default QuickTrade;