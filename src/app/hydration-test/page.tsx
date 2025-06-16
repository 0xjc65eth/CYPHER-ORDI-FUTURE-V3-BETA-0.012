'use client';

import React from 'react';
import { SafeTradingTerminal } from '@/components/trading/SafeTradingTerminal';
import { SafeWalletConnector } from '@/components/wallet/SafeWalletConnector';
import { FinalChart } from '@/components/charts/FinalChart';
import { useErrorMonitor } from '@/lib/monitoring/errorMonitor';
import { useSafePrice } from '@/hooks/useSafePrice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function HydrationTestPage() {
  const { 
    errors, 
    hydrationErrors, 
    walletErrors, 
    healthReport, 
    clearErrors 
  } = useErrorMonitor();

  const { formattedPrice, isLoading, hydrated } = useSafePrice('BTCUSDT');

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">
          🧪 Hydration & Error Testing
        </h1>

        {/* Health Status */}
        <Card className="p-6 bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">System Health</h2>
            <div className={`flex items-center gap-2 ${
              healthReport.status === 'healthy' ? 'text-green-500' :
              healthReport.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {healthReport.status === 'healthy' && <CheckCircle className="w-5 h-5" />}
              {healthReport.status === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {healthReport.status === 'critical' && <XCircle className="w-5 h-5" />}
              <span className="font-semibold capitalize">{healthReport.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-white">{healthReport.healthScore}/100</p>
            </div>
            <div>
              <p className="text-gray-400">Total Errors</p>
              <p className="text-2xl font-bold text-white">{healthReport.totalErrors}</p>
            </div>
            <div>
              <p className="text-gray-400">Hydration Errors</p>
              <p className="text-2xl font-bold text-red-400">{healthReport.errorsByType.hydration}</p>
            </div>
            <div>
              <p className="text-gray-400">Recent Errors</p>
              <p className="text-2xl font-bold text-yellow-400">{healthReport.recentErrors}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={clearErrors}
              variant="outline"
              size="sm"
            >
              Clear Errors
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Reload Page
            </Button>
          </div>
        </Card>

        {/* Price Test (Hydration Sensitive) */}
        <Card className="p-6 bg-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            Price Display Test (Hydration Sensitive)
          </h2>
          <div className="space-y-2">
            <p className="text-gray-400">
              Este componente testa se valores dinâmicos causam erros de hidratação
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">BTC Price:</span>
              <span className="text-2xl font-bold text-white" suppressHydrationWarning>
                {formattedPrice}
              </span>
              <span className={`text-sm ${hydrated ? 'text-green-500' : 'text-yellow-500'}`}>
                {hydrated ? '✅ Hydrated' : '⏳ Loading'}
              </span>
            </div>
          </div>
        </Card>

        {/* Component Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Connector */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Wallet Connector Test
            </h2>
            <SafeWalletConnector />
          </div>

          {/* Trading Terminal */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Trading Terminal Test
            </h2>
            <SafeTradingTerminal 
              symbol="BTCUSDT"
              onTrade={(action, amount) => 
                console.log(`Trade: ${action} ${amount}`)
              }
            />
          </div>
        </div>

        {/* Chart Test */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Chart Test
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinalChart symbol="BTCUSDT" interval="1h" />
            <FinalChart symbol="ETHUSDT" interval="15m" />
          </div>
        </div>

        {/* Error Log */}
        {errors.length > 0 && (
          <Card className="p-6 bg-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Errors ({errors.length})
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.slice(0, 10).map((error, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded border-l-4 text-sm ${
                    error.type === 'hydration' ? 'bg-red-900/20 border-red-500' :
                    error.type === 'wallet' ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-gray-900/20 border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-white">
                      {error.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{error.message}</p>
                  {error.metadata && (
                    <details className="mt-2">
                      <summary className="text-gray-400 cursor-pointer">
                        Metadata
                      </summary>
                      <pre className="text-xs text-gray-500 mt-1 overflow-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-blue-900/20 border border-blue-500">
          <h2 className="text-xl font-semibold text-blue-400 mb-3">
            Test Instructions
          </h2>
          <ol className="space-y-2 text-blue-200 text-sm">
            <li>1. Observe se aparecem erros de hidratação no console</li>
            <li>2. Teste conectar diferentes carteiras</li>
            <li>3. Verifique se os preços carregam sem causar mismatch</li>
            <li>4. Monitore a seção de erros acima</li>
            <li>5. Use F12 para verificar o console do navegador</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}