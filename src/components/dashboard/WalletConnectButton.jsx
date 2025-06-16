import React, { useState, useEffect, useCallback } from 'react';
import { BitcoinWalletConnect } from '../../services/BitcoinWalletConnect';

const WalletConnectButton = ({ onConnect, className = '' }) => {
  // Estados principais
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const [walletService] = useState(new BitcoinWalletConnect());

  // Estado de loading para dados individuais
  const [loadingStates, setLoadingStates] = useState({
    balance: false,
    ordinals: false,
    runes: false
  });

  // Verificar conexão existente ao montar
  useEffect(() => {
    checkExistingConnection();
  }, [checkExistingConnection]);

  const checkExistingConnection = useCallback(async () => {
    try {
      const storedData = walletService.getStoredWalletData();
      if (storedData && storedData.connected) {
        setWalletData(storedData);
        setIsConnected(true);
        
        // Callback para parent component
        if (onConnect) {
          onConnect(storedData);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conexão existente:', error);
    }
  }, [walletService, onConnect]);

  // Busca paralela de dados da carteira
  const fetchWalletDataParallel = useCallback(async () => {
    if (!walletService.isConnected()) return;

    try {
      setLoadingStates({
        balance: true,
        ordinals: true,
        runes: true
      });

      // Executar buscas em paralelo
      const [balance, ordinals, runes] = await Promise.allSettled([
        walletService.getBalance(),
        walletService.getOrdinals(),
        walletService.getRunes()
      ]);

      const newWalletData = {
        addresses: walletService.getAddresses(),
        balance: balance.status === 'fulfilled' ? balance.value : { total: 0, confirmed: 0, unconfirmed: 0 },
        ordinals: ordinals.status === 'fulfilled' ? ordinals.value : [],
        runes: runes.status === 'fulfilled' ? runes.value : [],
        timestamp: new Date().toISOString(),
        connected: true,
        loadErrors: {
          balance: balance.status === 'rejected' ? balance.reason : null,
          ordinals: ordinals.status === 'rejected' ? ordinals.reason : null,
          runes: runes.status === 'rejected' ? runes.reason : null
        }
      };

      setWalletData(newWalletData);
      
      // Callback para parent component
      if (onConnect) {
        onConnect(newWalletData);
      }

    } catch (error) {
      console.error('Erro ao buscar dados da carteira:', error);
      setError('Erro ao carregar dados da carteira');
    } finally {
      setLoadingStates({
        balance: false,
        ordinals: false,
        runes: false
      });
    }
  }, [walletService, onConnect]);

  // Conectar carteira
  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await walletService.connect();
      
      if (result.success) {
        setIsConnected(true);
        
        // Buscar dados da carteira em paralelo
        await fetchWalletDataParallel();
      }
      
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro ao conectar carteira';
      
      if (error.message.includes('Nenhuma carteira')) {
        errorMessage = 'Nenhuma carteira Bitcoin detectada. Instale Xverse ou Unisat.';
      } else if (error.message.includes('cancelada')) {
        errorMessage = 'Conexão cancelada pelo usuário';
      } else if (error.message.includes('rejeitada')) {
        errorMessage = 'Conexão rejeitada. Tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [walletService, fetchWalletDataParallel]);

  // Desconectar carteira
  const handleDisconnect = useCallback(() => {
    walletService.disconnect();
    setIsConnected(false);
    setWalletData(null);
    setError(null);
  }, [walletService]);

  // Refresh dos dados
  const handleRefresh = useCallback(async () => {
    if (isConnected) {
      await fetchWalletDataParallel();
    }
  }, [isConnected, fetchWalletDataParallel]);

  // Formatação de valores Bitcoin
  const formatBtcValue = (satoshis) => {
    if (!satoshis) return '0.00000000';
    return (satoshis / 100000000).toFixed(8);
  };

  // Formato abreviado para valores grandes
  const formatCompactValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
  };

  // Renderização condicional baseada no estado
  if (isConnected && walletData) {
    return (
      <div className={`wallet-connect-button connected ${className}`}>
        {/* Header da carteira conectada */}
        <div className="wallet-header bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold text-lg">Carteira Conectada</h3>
                <p className="text-green-100 text-sm truncate max-w-32">
                  {walletData.addresses?.payment?.slice(0, 8)}...{walletData.addresses?.payment?.slice(-6)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={Object.values(loadingStates).some(loading => loading)}
                className="p-2 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <svg className={`w-4 h-4 ${Object.values(loadingStates).some(loading => loading) ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleDisconnect}
                className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                title="Desconectar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Informações da carteira */}
        <div className="wallet-info bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700">
          {/* Saldo Bitcoin */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Bitcoin</h4>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatBtcValue(walletData.balance?.total)} BTC
                  </span>
                  {loadingStates.balance && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {walletData.balance?.unconfirmed > 0 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {formatBtcValue(walletData.balance.unconfirmed)} BTC não confirmado
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Confirmado: {formatBtcValue(walletData.balance?.confirmed)}
                </div>
              </div>
            </div>
          </div>

          {/* Grid responsivo para Ordinals e Runes */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Ordinals */}
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordinals</h4>
                {loadingStates.ordinals && (
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {formatCompactValue(walletData.ordinals?.length || 0)}
                </span>
                <span className="text-xs text-gray-500">NFTs</span>
              </div>
              {walletData.loadErrors?.ordinals && (
                <p className="text-xs text-red-500 mt-1">Erro ao carregar</p>
              )}
            </div>

            {/* Runes */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Runes</h4>
                {loadingStates.runes && (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {formatCompactValue(walletData.runes?.length || 0)}
                </span>
                <span className="text-xs text-gray-500">Tokens</span>
              </div>
              {walletData.loadErrors?.runes && (
                <p className="text-xs text-red-500 mt-1">Erro ao carregar</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer com timestamp */}
        <div className="wallet-footer bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Última atualização: {new Date(walletData.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className={`wallet-connect-button error ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro de Conexão
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado inicial/desconectado
  return (
    <div className={`wallet-connect-button disconnected ${className}`}>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-center space-x-3">
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Conectar Carteira Bitcoin</span>
            </>
          )}
        </div>
      </button>
      
      {/* Informações sobre carteiras suportadas */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Carteiras suportadas:
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Xverse</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Unisat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectButton;