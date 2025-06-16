'use client';

import React from 'react';
import { QuickTradePanel } from '@/components/trading/QuickTradePanel';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 CYPHER ORDI FUTURE
          </h1>
          <p className="text-xl text-gray-400">
            Sistema QuickTrade Multi-DEX com Revenue Automático
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              ✅ Sistema Online
            </span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              💰 Revenue: 0.05%
            </span>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              🌐 8 Redes Ativas
            </span>
          </div>
        </div>

        {/* Quick Trade Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <QuickTradePanel />
          </div>
          
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">📊 Status do Sistema</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Redes Ativas:</span>
                  <span className="text-green-400 font-bold">8/8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DEXs Integradas:</span>
                  <span className="text-blue-400 font-bold">22+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de Serviço:</span>
                  <span className="text-orange-400 font-bold">0.05%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-bold">✅ Online</span>
                </div>
              </div>
            </div>

            {/* Revenue Info */}
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">💰 Revenue Model</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-300">
                  Cada transação processada gera <span className="text-green-400 font-bold">0.05%</span> de taxa de serviço.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume $100K/dia:</span>
                    <span className="text-green-400">$50/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume $1M/dia:</span>
                    <span className="text-green-400">$500/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume $10M/dia:</span>
                    <span className="text-green-400">$5K/dia</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallets */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">🏦 Carteiras de Revenue</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">EVM Networks:</p>
                  <p className="text-blue-400 font-mono break-all">
                    0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Solana:</p>
                  <p className="text-purple-400 font-mono break-all">
                    EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}