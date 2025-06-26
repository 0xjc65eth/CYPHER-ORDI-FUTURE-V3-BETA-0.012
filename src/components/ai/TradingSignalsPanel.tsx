'use client'

import React, { useState, useEffect } from 'react';
import { tradingSignals, AITradeSignal, SignalAlert } from '@/services/ai/TradingSignals';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, Target, Shield, Activity } from 'lucide-react';

interface TradingSignalsPanelProps {
  selectedAsset?: string;
  className?: string;
}

export function TradingSignalsPanel({ selectedAsset, className = '' }: TradingSignalsPanelProps) {
  const [signals, setSignals] = useState<AITradeSignal[]>([]);
  const [alerts, setAlerts] = useState<SignalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'signals' | 'alerts' | 'history'>('signals');
  const [selectedSignal, setSelectedSignal] = useState<AITradeSignal | null>(null);

  useEffect(() => {
    // Subscribe to signal alerts
    const unsubscribe = tradingSignals.subscribeToAlerts((alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20 alerts
    });

    // Load initial signals
    loadSignals();

    // Set up real-time updates
    const interval = setInterval(loadSignals, 30000); // Update every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [selectedAsset]);

  const loadSignals = async () => {
    try {
      const activeSignals = selectedAsset 
        ? tradingSignals.getSignalsForAsset(selectedAsset)
        : tradingSignals.getActiveSignals();
      
      setSignals(activeSignals.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Failed to load trading signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: AITradeSignal['action']) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'HOLD':
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getActionColor = (action: AITradeSignal['action']) => {
    switch (action) {
      case 'BUY':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'HOLD':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getUrgencyColor = (urgency: AITradeSignal['urgency']) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW':
        return 'text-green-400 bg-green-500/20';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-black border border-orange-500/30 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-orange-400 font-mono">Loading AI Signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black border border-orange-500/30 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-orange-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h2 className="text-orange-400 font-mono font-bold">AI TRADING SIGNALS</h2>
            {selectedAsset && (
              <span className="text-orange-300 font-mono text-sm">• {selectedAsset}</span>
            )}
          </div>
          <div className="flex space-x-1">
            {['signals', 'alerts', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 text-xs font-mono uppercase border rounded ${
                  activeTab === tab
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                    : 'bg-gray-900/50 text-gray-400 border-gray-600/50 hover:border-orange-500/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'signals' && (
          <div className="space-y-3">
            {signals.length === 0 ? (
              <div className="text-center text-gray-500 py-8 font-mono">
                No active signals
              </div>
            ) : (
              signals.map((signal) => (
                <div
                  key={signal.signalId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-orange-500/50 ${
                    selectedSignal?.signalId === signal.signalId
                      ? 'border-orange-500/50 bg-orange-500/5'
                      : 'border-gray-700/50'
                  }`}
                  onClick={() => setSelectedSignal(selectedSignal?.signalId === signal.signalId ? null : signal)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${getActionColor(signal.action)}`}>
                        {getActionIcon(signal.action)}
                        <span className="font-mono text-sm font-bold">{signal.action}</span>
                      </div>
                      <span className="text-orange-400 font-mono font-bold">{signal.asset}</span>
                      <span className="text-gray-400 font-mono text-sm">{signal.timeHorizon}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${getUrgencyColor(signal.urgency)}`}>
                        {signal.urgency}
                      </span>
                      <span className="text-green-400 font-mono text-sm font-bold">
                        {signal.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-gray-400">Target:</span>
                      <div className="text-green-400">{formatPrice(signal.priceTarget)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Stop Loss:</span>
                      <div className="text-red-400">{formatPrice(signal.stopLoss)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">R/R:</span>
                      <div className="text-orange-400">{signal.riskReward}</div>
                    </div>
                  </div>

                  {selectedSignal?.signalId === signal.signalId && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Technical Factors */}
                        <div>
                          <h4 className="text-orange-400 font-mono text-sm font-bold mb-2">TECHNICAL</h4>
                          <ul className="space-y-1">
                            {signal.reasoning.technicalFactors.map((factor, idx) => (
                              <li key={idx} className="text-gray-300 text-xs font-mono">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Fundamental Factors */}
                        <div>
                          <h4 className="text-orange-400 font-mono text-sm font-bold mb-2">FUNDAMENTAL</h4>
                          <ul className="space-y-1">
                            {signal.reasoning.fundamentalFactors.map((factor, idx) => (
                              <li key={idx} className="text-gray-300 text-xs font-mono">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Sentiment Factors */}
                        <div>
                          <h4 className="text-orange-400 font-mono text-sm font-bold mb-2">SENTIMENT</h4>
                          <ul className="space-y-1">
                            {signal.reasoning.sentimentFactors.map((factor, idx) => (
                              <li key={idx} className="text-gray-300 text-xs font-mono">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center space-x-4 text-xs font-mono">
                          <span className="text-gray-400">
                            Expected Return: <span className="text-green-400">{signal.expectedReturn}%</span>
                          </span>
                          <span className="text-gray-400">
                            Risk: <span className={`${
                              signal.reasoning.riskAssessment === 'LOW' ? 'text-green-400' :
                              signal.reasoning.riskAssessment === 'MEDIUM' ? 'text-yellow-400' :
                              signal.reasoning.riskAssessment === 'HIGH' ? 'text-orange-400' : 'text-red-400'
                            }`}>{signal.reasoning.riskAssessment}</span>
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs font-mono">
                          {formatTime(signal.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center text-gray-500 py-8 font-mono">
                No recent alerts
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3 ${
                    alert.severity === 'CRITICAL' ? 'border-red-500/50 bg-red-500/5' :
                    alert.severity === 'WARNING' ? 'border-orange-500/50 bg-orange-500/5' :
                    'border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'CRITICAL' ? 'text-red-400' :
                        alert.severity === 'WARNING' ? 'text-orange-400' :
                        'text-yellow-400'
                      }`} />
                      <span className="font-mono text-sm">{alert.message}</span>
                    </div>
                    <span className="text-gray-500 text-xs font-mono">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {tradingSignals.getSignalHistory(20).map((signal) => (
              <div
                key={signal.signalId}
                className="border border-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getActionColor(signal.action)}`}>
                      {getActionIcon(signal.action)}
                      <span className="font-mono text-xs">{signal.action}</span>
                    </div>
                    <span className="text-orange-400 font-mono text-sm">{signal.asset}</span>
                    <span className="text-gray-400 font-mono text-xs">{signal.timeHorizon}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-mono text-xs">
                      {signal.confidence}%
                    </span>
                    <span className="text-gray-500 text-xs font-mono">
                      {formatTime(signal.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}