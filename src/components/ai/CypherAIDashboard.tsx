/**
 * 🤖 CYPHER AI Dashboard - Voice-Controlled Trading Interface
 * Simplified version with mock data for testing
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot, TrendingUp, TrendingDown, AlertTriangle, Play, Pause, StopCircle, Settings, Brain, Zap, Shield, Activity, Wallet } from 'lucide-react';
import { AIStatusCard } from './AIStatusCard';
import { VoiceCommandVisual } from './VoiceCommandVisual';
import { TradingSignals } from './TradingSignals';
import { PerformanceMetrics } from './PerformanceMetrics';
import BacktestingPanel from './BacktestingPanel';
import ExchangePanel from '../exchange/ExchangePanel';
import { useTradingEngine } from '@/hooks/useTradingEngine';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { useMultiAgentSystem } from '@/hooks/useMultiAgentSystem';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
}

export default function CypherAIDashboard({ className = '' }: { className?: string }) {
  // Integração com Trading Engine real
  const { isActive: engineActive, status, startEngine, stopEngine, createOrder } = useTradingEngine();
  const { price: bitcoinPrice, change24h, rawPrice, isConnected: priceConnected } = useBitcoinPrice();
  const { systemStatus, recentSignals, startSystem, stopSystem, emergencyStop } = useMultiAgentSystem();
  const { 
    isListening, 
    isSupported: voiceSupported, 
    transcript, 
    startListening, 
    stopListening, 
    parseCommand 
  } = useVoiceCommands({ language: 'pt-BR' });

  // Use real signals from multi-agent system or mock data
  const signals = recentSignals.length > 0 ? recentSignals : [
    {
      id: '1',
      timestamp: new Date(),
      symbol: 'BTC/USDT',
      action: 'BUY' as const,
      confidence: 0.85,
      price: bitcoinPrice || 43250,
      reasons: ['Strong support level detected', 'RSI oversold'],
      technicalIndicators: {
        rsi: 28,
        macd: 'Bullish',
        bollinger: 'Below MA',
        volume: 'High'
      }
    }
  ];

  // Performance data with real metrics
  const performanceData = [
    { date: 'Mon', profit: 2.3, trades: 12, winRate: 75 },
    { date: 'Tue', profit: 3.1, trades: 15, winRate: 80 },
    { date: 'Wed', profit: systemStatus?.performance.totalPnL || 2.8, trades: 10, winRate: 70 },
    { date: 'Thu', profit: 4.2, trades: 18, winRate: 83 },
    { date: 'Fri', profit: 5.1, trades: 22, winRate: systemStatus?.performance.winRate || 86 },
  ];

  // Process voice commands
  useEffect(() => {
    if (transcript) {
      const command = parseCommand(transcript);
      if (command) {
        processVoiceCommand(command);
      }
    }
  }, [transcript]);

  const processVoiceCommand = async (command: any) => {
    switch (command.action) {
      case 'start_trading':
        startSystem();
        break;
      case 'stop_trading':
        stopSystem();
        break;
      case 'emergency_stop':
        emergencyStop();
        break;
      case 'buy':
        if (command.asset === 'bitcoin' && bitcoinPrice) {
          try {
            await createOrder({
              symbol: 'BTC/USDT',
              side: 'BUY',
              type: 'MARKET',
              amount: 0.001,
              price: bitcoinPrice
            });
          } catch (error) {
            console.error('Erro ao executar ordem:', error);
          }
        }
        break;
      case 'sell':
        if (command.asset === 'bitcoin' && bitcoinPrice) {
          try {
            await createOrder({
              symbol: 'BTC/USDT',
              side: 'SELL',
              type: 'MARKET',
              amount: 0.001,
              price: bitcoinPrice
            });
          } catch (error) {
            console.error('Erro ao executar ordem:', error);
          }
        }
        break;
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Status */}
        <AIStatusCard
          isActive={systemStatus?.agents.AGENT_024.active || false}
          accuracy={systemStatus?.performance.winRate || 78.3}
          totalTrades={systemStatus?.agents.AGENT_025.totalExecutions || 156}
          profitability={systemStatus?.performance.totalPnL || 12.4}
          riskLevel={systemStatus?.systemHealth === 'CRITICAL' ? 'high' : systemStatus?.systemHealth === 'WARNING' ? 'medium' : 'low'}
        />

        {/* Engine Control */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Trading Engine</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className={`font-medium ${engineActive ? 'text-green-400' : 'text-red-400'}`}>
                {engineActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Posições Abertas</span>
              <span className="text-white">{status.openPositions}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Trades Hoje</span>
              <span className="text-white">{status.dailyTradeCount}/20</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => engineActive ? stopEngine() : startEngine()}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  engineActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {engineActive ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">24h Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Bitcoin</span>
              <div className="flex items-center space-x-2">
                {priceConnected && bitcoinPrice ? (
                  <>
                    <span className="text-white font-medium">
                      ${bitcoinPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">Conectando...</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit</span>
              <span className="text-green-400 font-medium">+5.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trades</span>
              <span className="text-white font-medium">22</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-white font-medium">86.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Command */}
        <VoiceCommandVisual
          isListening={isListening}
          isProcessing={false}
          transcript={transcript}
          confidence={0.9}
          onToggle={toggleVoice}
          isSupported={voiceSupported}
        />

        {/* Trading Signals */}
        <TradingSignals
          signals={signals.map(s => ({
            ...s,
            reason: s.reasons ? s.reasons.join('. ') : ''
          }))}
          onExecute={async (signal) => {
            if (signal.action === 'BUY' || signal.action === 'SELL') {
              try {
                await createOrder({
                  symbol: signal.symbol,
                  side: signal.action,
                  type: 'MARKET',
                  amount: 0.001,
                  price: signal.price
                });
              } catch (error) {
                console.error('Erro ao executar sinal:', error);
              }
            }
          }}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceMetrics
        data={performanceData}
        totalProfit={systemStatus?.performance.totalPnL || 17.5}
        avgWinRate={systemStatus?.performance.winRate || 78.8}
        bestDay={5.1}
      />

      {/* Backtesting Panel */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-500" />
          Backtesting Lab
        </h2>
        <BacktestingPanel />
      </div>

      {/* Exchange Panel */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-orange-500" />
          Exchange Integration
        </h2>
        <ExchangePanel />
      </div>
    </div>
  );
}
