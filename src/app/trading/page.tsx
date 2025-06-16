/**
 * 📈 TRADING PAGE - CYPHER AI v3.0
 * Página principal do sistema de trading automatizado
 */

import React from 'react';
import { TradingEngineController } from '@/components/trading/TradingEngineController';

import { TopNavLayout } from '@/components/layout/TopNavLayout';

export default function TradingPage() {
  return (
    <TopNavLayout>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 CYPHER AI Trading System
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced automated trading with AI and voice commands
          </p>
        </div>

        <TradingEngineController />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Learning</h3>
              <p className="text-gray-400 text-sm">
                Continuous learning with TensorFlow.js.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Commands</h3>
              <p className="text-gray-400 text-sm">
                Natural language trading in Portuguese.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-gray-400 text-sm">
                Intelligent risk management with Kelly Criterion.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </TopNavLayout>
  );
}