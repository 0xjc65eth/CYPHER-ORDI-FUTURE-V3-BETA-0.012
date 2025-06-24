import React, { useState } from 'react';
import LiquidityPoolsPanel from './LiquidityPoolsPanel';
import UserLiquidityPositions from './UserLiquidityPositions';
import PoolPairSelector from './PoolPairSelector';
import { FiDroplet, FiUser, FiTrendingUp, FiActivity } from 'react-icons/fi';

const LiquidityDashboard = ({ userAddress }) => {
  const [activeTab, setActiveTab] = useState('pools');
  const [selectedPair, setSelectedPair] = useState(null);

  const tabs = [
    {
      id: 'pools',
      name: 'Pools de Liquidez',
      icon: FiDroplet,
      description: 'Visualizar e gerenciar pools disponíveis'
    },
    {
      id: 'positions',
      name: 'Minhas Posições',
      icon: FiUser,
      description: 'Suas posições de liquidez ativas'
    },
    {
      id: 'selector',
      name: 'Explorar Pares',
      icon: FiTrendingUp,
      description: 'Encontrar novos pares para trading'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setActiveTab('pools'); // Redireciona para a aba de pools com o par selecionado
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Liquidez RunesDX
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Gerencie suas posições de liquidez e explore oportunidades de yield farming
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FiActivity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Integrado com RunesDX
                  </span>
                </div>
                
                {userAddress && (
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`${
                    isActive
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'pools' && (
            <LiquidityPoolsPanel selectedPair={selectedPair} />
          )}
          
          {activeTab === 'positions' && (
            <UserLiquidityPositions userAddress={userAddress} />
          )}
          
          {activeTab === 'selector' && (
            <PoolPairSelector 
              onSelectPair={handlePairSelect}
              selectedPair={selectedPair}
            />
          )}
        </div>
      </div>

      {/* Quick Actions Sidebar */}
      <div className="fixed right-4 bottom-4 space-y-3 z-50">
        <button
          onClick={() => window.open('https://runesdx.com', '_blank')}
          className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
        >
          <FiTrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Ir para RunesDX</span>
        </button>
        
        <button
          onClick={() => handleTabChange('positions')}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FiUser className="w-4 h-4" />
          <span className="text-sm font-medium">Minhas Posições</span>
        </button>
      </div>

      {/* Selected Pair Info */}
      {selectedPair && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-40">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Par Selecionado
            </h4>
            <button
              onClick={() => setSelectedPair(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-orange-500 border border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                {selectedPair.token0.symbol?.charAt(0) || 'T'}
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-500 border border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold">
                {selectedPair.token1.symbol?.charAt(0) || 'T'}
              </div>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedPair.name}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">TVL:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                ${selectedPair.tvl.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">APY:</span>
              <p className="font-medium text-green-600 dark:text-green-400">
                {selectedPair.apy.toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => window.open(`https://runesdx.com/pools/${selectedPair.id}`, '_blank')}
              className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Ver no RunesDX
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityDashboard;