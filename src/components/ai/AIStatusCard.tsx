/**
 * 🤖 AI Trading Status Card
 * Shows real-time AI trading engine status
 */

'use client';

import React from 'react';
import { Bot, Activity, Zap, Shield, TrendingUp } from 'lucide-react';

interface AIStatusCardProps {
  isActive: boolean;
  accuracy: number;
  totalTrades: number;
  profitability: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function AIStatusCard({ 
  isActive, 
  accuracy, 
  totalTrades, 
  profitability,
  riskLevel 
}: AIStatusCardProps) {
  const riskColors = {
    low: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    high: 'text-red-400 bg-red-400/10'
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-gray-700'}`}>
            <Bot className={`w-6 h-6 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">CYPHER AI Engine</h3>
            <p className="text-sm text-gray-400">
              Status: <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </p>
          </div>
        </div>
        {isActive && <Activity className="w-5 h-5 text-green-400 animate-pulse" />}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Accuracy</span>
          </div>
          <p className="text-xl font-bold text-white">{accuracy.toFixed(1)}%</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total Trades</span>
          </div>
          <p className="text-xl font-bold text-white">{totalTrades}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Profitability</span>
          </div>
          <p className={`text-xl font-bold ${profitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitability >= 0 ? '+' : ''}{profitability.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Risk Level</span>
          </div>
          <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${riskColors[riskLevel]}`}>
            {riskLevel.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
