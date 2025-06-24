import React, { useState, useEffect } from 'react';
import {
  LiquidityDashboard,
  LiquidityAlerts,
  ImpermanentLossCalculator,
  useLiquidityPools,
  useUserLiquidity,
  useLiquidityAlerts
} from './index';

/**
 * Exemplo completo de como usar o sistema de liquidez
 * Este componente demonstra todas as funcionalidades principais
 */
const LiquidityExample = () => {
  // Estado para simular conexão de carteira
  const [userAddress, setUserAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  // Hooks para dados de liquidez
  const { pools, loading: poolsLoading } = useLiquidityPools();
  const { positions, loading: positionsLoading } = useUserLiquidity(userAddress);
  const { alerts } = useLiquidityAlerts(pools, positions);

  // Simular conexão de carteira
  const connectWallet = async () => {
    setIsConnecting(true);
    
    // Simular processo de conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Endereço de exemplo
    setUserAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setUserAddress(null);
  };

  // Views disponíveis
  const views = [
    { id: 'dashboard', name: 'Dashboard', description: 'Visão geral completa' },
    { id: 'calculator', name: 'Calculadora IL', description: 'Calcular Impermanent Loss' },
    { id: 'alerts', name: 'Alertas', description: 'Oportunidades e avisos' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de Exemplo */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Sistema de Liquidez RunesDX
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Exemplo de integração completa com todas as funcionalidades
                </p>
              </div>

              {/* Conexão de Carteira */}
              <div className="flex items-center gap-4">
                {!userAddress ? (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Conectando...
                      </>
                    ) : (
                      'Conectar Carteira'
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Desconectar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{view.name}</span>
                  <span className="text-xs text-gray-400 mt-1">{view.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Status Bar */}
      {(poolsLoading || positionsLoading) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">
                Carregando dados {poolsLoading ? 'dos pools' : 'das posições'}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alertas no topo */}
      {alerts.length > 0 && activeView === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <LiquidityAlerts pools={pools} userPositions={positions} />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <LiquidityDashboard userAddress={userAddress} />
            
            {/* Estatísticas de exemplo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Total de Pools
                </h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {pools.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pools disponíveis para liquidez
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Suas Posições
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {positions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Posições ativas de liquidez
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Alertas Ativos
                </h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {alerts.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Oportunidades detectadas
                </p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'calculator' && (
          <ImpermanentLossCalculator />
        )}

        {activeView === 'alerts' && (
          <div className="space-y-6">
            <LiquidityAlerts pools={pools} userPositions={positions} />
            
            {/* Exemplo de alertas customizados */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configurações de Alertas
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Alerta de APY Alto
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar quando APY > 50%
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Alerta de Impermanent Loss
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar quando IL > 5%
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Oportunidades de Arbitragem
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar sobre diferenças de preço > 2%
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer de exemplo */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de Liquidez integrado ao RunesDX - Exemplo de implementação
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a
                href="https://runesdx.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Visitar RunesDX
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Documentação
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiquidityExample;