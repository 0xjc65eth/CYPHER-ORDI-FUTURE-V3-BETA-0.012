'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function DualModePage() {
  const [ordiStatus, setOrdiStatus] = useState('idle');
  const [aiStatus, setAiStatus] = useState('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const sendCommand = async (service: 'ordi' | 'ai', command: string) => {
    try {
      const res = await fetch(`/api/${service}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();
      setLogs(prev => [...prev, `[${service.toUpperCase()}] ${command}: ${data.status}`]);
    } catch (error) {
      setLogs(prev => [...prev, `[ERROR] ${error}`]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center gradient-text">
        CYPHER DUAL MODE
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-blue-500/50 bg-black/50">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">CYPHER ORDI</h2>
          <div className="space-y-4">
            <button onClick={() => sendCommand('ordi', 'START_TRADING')}
              className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
              Start Trading
            </button>
            <button onClick={() => sendCommand('ordi', 'SCAN_ARBITRAGE')}
              className="w-full px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">
              Scan Arbitrage
            </button>
          </div>
        </Card>

        <Card className="p-6 border-green-500/50 bg-black/50">
          <h2 className="text-2xl font-bold mb-4 text-green-400">CYPHER AI</h2>
          <div className="space-y-4">
            <button onClick={() => sendCommand('ai', 'ANALYZE_MARKET')}
              className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-700">
              Analyze Market
            </button>
            <button onClick={() => sendCommand('ai', 'AUTO_TRADE')}
              className="w-full px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700">
              Auto Trade
            </button>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-4 bg-black/50">
        <h3 className="text-lg font-bold mb-2">Logs</h3>
        <div className="h-40 overflow-y-auto bg-gray-900 p-2 rounded text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-300">{log}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}