'use client';

import React, { useState, useEffect } from 'react';
import { UniversalChart } from '@/components/charts/UniversalChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ChartDebugPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dataTest, setDataTest] = useState<any>(null);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  useEffect(() => {
    // Check browser info
    setBrowserInfo(`${navigator.userAgent}`);
    
    // Test API
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('/api/binance/klines?symbol=BTCUSDT&interval=1h&limit=10');
      const data = await response.json();
      setDataTest(data);
      setApiStatus(data.success ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
      console.error('API test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">🔍 Chart Debug Tool</h1>
        
        {/* System Info */}
        <Card className="p-6 bg-gray-800 space-y-4">
          <h2 className="text-xl font-semibold">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Browser:</p>
              <p className="font-mono text-xs">{browserInfo}</p>
            </div>
            
            <div>
              <p className="text-gray-400">API Status:</p>
              <p className={`font-semibold ${
                apiStatus === 'online' ? 'text-green-500' : 
                apiStatus === 'offline' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {apiStatus === 'checking' ? 'Checking...' : apiStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {dataTest && (
            <div>
              <p className="text-gray-400">Sample Data Points:</p>
              <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto">
                {JSON.stringify(dataTest.data?.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Chart Test Grid */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Universal Chart (Auto-fallback)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">BTC/USDT - Dynamic Mode</p>
                <UniversalChart 
                  symbol="BTCUSDT" 
                  interval="1h"
                  defaultMode="dynamic"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">ETH/USDT - Simple Mode</p>
                <UniversalChart 
                  symbol="ETHUSDT" 
                  interval="1h"
                  defaultMode="simple"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Different Timeframes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">5 Minutes</p>
                <UniversalChart 
                  symbol="BTCUSDT" 
                  interval="5m"
                  height={300}
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">15 Minutes</p>
                <UniversalChart 
                  symbol="BTCUSDT" 
                  interval="15m"
                  height={300}
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">1 Hour</p>
                <UniversalChart 
                  symbol="BTCUSDT" 
                  interval="1h"
                  height={300}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Other Pairs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalChart symbol="SOLUSDT" interval="15m" />
              <UniversalChart symbol="BNBUSDT" interval="15m" />
            </div>
          </section>
        </div>

        {/* Actions */}
        <Card className="p-6 bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Debug Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Reload Page
            </Button>
            <Button 
              onClick={() => localStorage.clear()}
              variant="outline"
            >
              Clear Cache
            </Button>
            <Button 
              onClick={testAPI}
              variant="outline"
            >
              Retest API
            </Button>
            <Button 
              onClick={() => console.log('Chart debug info:', { apiStatus, dataTest })}
              variant="outline"
            >
              Log Debug Info
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}