'use client';

import React, { useState } from 'react';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { SimpleChart } from '@/components/charts/SimpleChart';

export default function TestChartPage() {
  const [chartType, setChartType] = useState<'enhanced' | 'simple'>('simple');

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Chart Test Page</h1>
      
      <div className="mb-6">
        <button
          onClick={() => setChartType('simple')}
          className={`px-4 py-2 mr-2 rounded ${chartType === 'simple' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Simple Chart (Recharts)
        </button>
        <button
          onClick={() => setChartType('enhanced')}
          className={`px-4 py-2 rounded ${chartType === 'enhanced' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Enhanced Chart (Lightweight Charts)
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {chartType === 'enhanced' ? (
          <>
            <div>
              <h2 className="text-xl text-white mb-4">Bitcoin/USDT - 1 Hour (Enhanced)</h2>
              <EnhancedChart symbol="BTCUSDT" interval="1h" />
            </div>
            
            <div>
              <h2 className="text-xl text-white mb-4">Ethereum/USDT - 15 Minutes (Enhanced)</h2>
              <EnhancedChart symbol="ETHUSDT" interval="15m" />
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl text-white mb-4">Bitcoin/USDT - 1 Hour (Simple)</h2>
              <SimpleChart symbol="BTCUSDT" interval="1h" />
            </div>
            
            <div>
              <h2 className="text-xl text-white mb-4">Ethereum/USDT - 15 Minutes (Simple)</h2>
              <SimpleChart symbol="ETHUSDT" interval="15m" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}