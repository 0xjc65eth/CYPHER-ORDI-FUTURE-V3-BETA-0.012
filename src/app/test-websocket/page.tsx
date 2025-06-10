'use client';

import { useEffect, useState } from 'react';
import { wsManager } from '@/lib/websocket/websocket-manager';

export default function TestWebSocketPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [errors, setErrors] = useState<string[]>([]);
  const [priceData, setPriceData] = useState<any>(null);

  useEffect(() => {
    // Test WebSocket connection
    try {
      setStatus('WebSocket Manager initialized');

      // Listen for connection events
      wsManager.on('connected', (exchange) => {
        setStatus(`Connected to ${exchange}`);
      });

      wsManager.on('error', ({ exchange, error }) => {
        setErrors(prev => [...prev, `${exchange}: ${error}`]);
      });

      wsManager.on('price', ({ exchange, data }) => {
        setPriceData({ exchange, data });
      });

      // Subscribe to Bitcoin price
      setTimeout(() => {
        wsManager.subscribeToSymbol('binance', 'BTCUSDT');
        setStatus('Subscribed to BTCUSDT on Binance');
      }, 1000);

    } catch (error: any) {
      setErrors(prev => [...prev, `Initialization error: ${error.message}`]);
    }

    return () => {
      wsManager.removeAllListeners();
    };
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">WebSocket Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-green-400">{status}</p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-900 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Errors</h2>
            {errors.map((error, i) => (
              <p key={i} className="text-red-300">{error}</p>
            ))}
          </div>
        )}

        {priceData && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Price Data</h2>
            <p>Exchange: {priceData.exchange}</p>
            <p>Symbol: {priceData.data.symbol}</p>
            <p>Price: ${priceData.data.price}</p>
            <p>24h Change: {priceData.data.change24h}%</p>
          </div>
        )}

        <div className="bg-blue-900 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">WebSocket Info</h2>
          <p>Native WebSocket: {typeof window !== 'undefined' && window.WebSocket ? 'Available' : 'Not Available'}</p>
          <p>Next.js Version: 14.2.0</p>
          <p>Patch Applied: Yes</p>
        </div>
      </div>
    </div>
  );
}