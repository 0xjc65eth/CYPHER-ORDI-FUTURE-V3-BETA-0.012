// components/Portfolio/PerpetualsPortfolio.jsx
import React, { useState, useEffect } from 'react';
import { HyperLiquidService } from '../../services/HyperLiquidService';

export const PerpetualsPortfolio = ({ wallet }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPnL, setTotalPnL] = useState(0);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const hlService = new HyperLiquidService();

  useEffect(() => {
    if (wallet?.address) {
      loadPositions();
    }
  }, [wallet]);

  const loadPositions = async () => {
    try {
      setError(null);
      const result = await hlService.getUserPositions(wallet.address);
      
      if (result.success) {
        const positionsWithPnL = result.data.map(pos => ({
          ...pos,
          pnl: calculatePnL(pos),
          value: Math.abs(pos.position?.szi || 0) * (pos.position?.entryPx || 0)
        }));
        
        setPositions(positionsWithPnL);
        setTotalPnL(positionsWithPnL.reduce((sum, pos) => sum + (pos.pnl || 0), 0));
      } else {
        setError(result.error || 'Erro ao carregar posições');
      }
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
      setError('Erro ao conectar com HyperLiquid');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculatePnL = (position) => {
    if (!position.position) return 0;
    
    const { szi, entryPx } = position.position;
    const currentPx = position.lastPx || entryPx;
    const isLong = szi > 0;
    
    if (isLong) {
      return szi * (currentPx - entryPx);
    } else {
      return Math.abs(szi) * (entryPx - currentPx);
    }
  };

  const closePosition = async (position) => {
    if (!window.confirm('Tem certeza que deseja fechar esta posição?')) return;
    
    try {
      const result = await hlService.placeOrder({
        asset: position.position.coin,
        isBuy: position.position.szi < 0,
        sz: Math.abs(position.position.szi),
        orderType: 'market',
        reduceOnly: true
      }, wallet.privateKey);
      
      if (result.success) {
        await loadPositions();
        alert('Posição fechada com sucesso!');
      } else {
        alert('Erro ao fechar posição: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao fechar posição:', error);
      alert('Erro ao fechar posição');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0.00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatCoin = (coin) => {
    return coin?.replace('-PERP', '') || '';
  };

  const getPositionSide = (szi) => {
    return szi > 0 ? 'LONG' : 'SHORT';
  };

  const getPnLClass = (pnl) => {
    return pnl >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="perpetuals-portfolio bg-gray-900 rounded-xl p-6">
      <div className="header flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="text-3xl mr-3">📈</span>
          Portfolio de Perpétuos
        </h2>
        
        <button
          onClick={() => {
            setRefreshing(true);
            loadPositions();
          }}
          disabled={refreshing}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {refreshing ? '🔄 Atualizando...' : '🔄 Atualizar'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="summary bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="stat text-center">
            <label className="text-gray-400 text-sm">Total de Posições</label>
            <span className="block text-2xl font-bold text-white">{positions.length}</span>
          </div>
          <div className="stat text-center">
            <label className="text-gray-400 text-sm">P&L Total</label>
            <span className={`block text-2xl font-bold ${getPnLClass(totalPnL)}`}>
              ${formatNumber(totalPnL)}
            </span>
          </div>
          <div className="stat text-center">
            <label className="text-gray-400 text-sm">Valor Total</label>
            <span className="block text-2xl font-bold text-white">
              ${formatNumber(positions.reduce((sum, pos) => sum + (pos.value || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nenhuma posição aberta</p>
          <p className="text-sm mt-2">Comece a operar perpétuos no HyperLiquid</p>
        </div>
      ) : (
        <div className="positions-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((pos, idx) => (
            <div key={idx} className="position-card bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-white">
                  {formatCoin(pos.position?.coin)}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  pos.position?.szi > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {getPositionSide(pos.position?.szi)}
                </span>
              </div>
              
              <div className="position-details space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tamanho:</span>
                  <span className="text-white font-medium">
                    {formatNumber(Math.abs(pos.position?.szi || 0))}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Preço de Entrada:</span>
                  <span className="text-white font-medium">
                    ${formatNumber(pos.position?.entryPx)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Preço Atual:</span>
                  <span className="text-white font-medium">
                    ${formatNumber(pos.lastPx)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">P&L:</span>
                  <span className={`font-bold ${getPnLClass(pos.pnl)}`}>
                    ${formatNumber(pos.pnl)}
                    <span className="text-xs ml-1">
                      ({pos.position?.entryPx ? 
                        ((pos.pnl / (Math.abs(pos.position.szi) * pos.position.entryPx)) * 100).toFixed(2) 
                        : '0.00'}%)
                    </span>
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => closePosition(pos)}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                Fechar Posição
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center text-gray-500 text-xs">
        <p>💡 Dados em tempo real do HyperLiquid • Atualize para ver as últimas cotações</p>
      </div>
    </div>
  );
};

export default PerpetualsPortfolio;