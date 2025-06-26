// 📊 CYPHER ORDI FUTURE - Dashboard Principal
'use client';

import { useState, useEffect } from 'react';
import { useMultiCryptoRealTimePrice } from '@/hooks/useRealTimePrice';

export default function SystemDashboard() {
  const [systemStatus, setSystemStatus] = useState({
    ordi: 'online',
    ai: 'online',
    sync: 'partial'
  });

  const { prices, loading, error } = useMultiCryptoRealTimePrice();

  // Update sync status based on real-time data
  useEffect(() => {
    const hasData = Object.keys(prices).length > 0;
    setSystemStatus(prev => ({
      ...prev,
      sync: hasData ? 'online' : 'partial'
    }));
  }, [prices]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const symbol = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'text-green-400' : 'text-red-400';
    return <span className={color}>{symbol}{change.toFixed(2)}%</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        🚀 CYPHER ORDI FUTURE v3.0
      </h1>
      
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">Status</h2>
          <p>ORDI: ✅ {systemStatus.ordi}</p>
          <p>AI: ✅ {systemStatus.ai}</p>
          <p>Sync: {systemStatus.sync === 'online' ? '✅' : '⚠️'} {systemStatus.sync}</p>
          <p className="text-sm text-gray-400 mt-2">
            CoinMarketCap: {loading ? '🔄' : error ? '❌' : '✅'} 
            {loading ? ' Loading...' : error ? ' Error' : ' Connected'}
          </p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Trading</h2>
          <p>Grid Bot: 🔴 Offline</p>
          <p>Arbitragem: {Object.keys(prices).length > 0 ? '🟢' : '🟡'} 
            {Object.keys(prices).length > 0 ? ' Active' : ' Scanning'}</p>
          <p>P&L: <span className="text-green-400">+$0.00</span></p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-400">AI</h2>
          <p>LSTM: 🟢 Ready</p>
          <p>Voice: 🟡 Training</p>
          <p>Auto: 🔴 Disabled</p>
        </div>
      </div>

      {/* Real-Time Market Data */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-orange-400">📈 Live Market Data</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading real-time prices...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">❌ Error loading market data</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && Object.keys(prices).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(prices).map((price) => (
              <div key={price.symbol} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{price.symbol}</h3>
                  <span className="text-xs text-gray-400">
                    {price.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-orange-400">
                    {formatPrice(price.price)}
                  </p>
                  
                  <p className="text-sm">
                    24h: {formatChange(price.change24h)}
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    Vol: ${(price.volume24h / 1000000).toFixed(1)}M
                  </p>
                  
                  <p className="text-xs text-gray-400">
                    MCap: ${(price.marketCap / 1000000000).toFixed(2)}B
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && Object.keys(prices).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No market data available</p>
          </div>
        )}
      </div>
    </div>
  );
}