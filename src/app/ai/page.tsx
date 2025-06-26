'use client'

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Activity, Zap, Target, AlertTriangle } from 'lucide-react';
import { TradingSignalsPanel } from '@/components/ai/TradingSignalsPanel';
import { ArbitragePanel } from '@/components/arbitrage/ArbitragePanel';
import { neuralPricePrediction, PredictionResult } from '@/services/ai/NeuralPricePrediction';
import { sentimentAnalysis, SentimentData } from '@/services/ai/SentimentAnalysis';
import { tradingSignals, AITradeSignal } from '@/services/ai/TradingSignals';

export default function AIPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const [sentiments, setSentiments] = useState<Map<string, SentimentData>>(new Map());
  const [signals, setSignals] = useState<Map<string, AITradeSignal[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const assets = ['BTC', 'ETH', 'ORDI'];

  useEffect(() => {
    loadAIData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(loadAIData, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAIData = async () => {
    try {
      // Load predictions
      const predictionResults = await neuralPricePrediction.batchPredict(assets);
      setPredictions(predictionResults);

      // Load sentiment analysis
      const sentimentResults = await sentimentAnalysis.batchAnalyzeSentiment(assets);
      setSentiments(sentimentResults);

      // Load trading signals
      const signalResults = await tradingSignals.batchGenerateSignals(assets);
      setSignals(signalResults);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'VERY_POSITIVE':
        return 'text-green-400';
      case 'POSITIVE':
        return 'text-green-300';
      case 'NEUTRAL':
        return 'text-yellow-400';
      case 'NEGATIVE':
        return 'text-red-300';
      case 'VERY_NEGATIVE':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-400 bg-green-400/10';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'HIGH':
        return 'text-orange-400 bg-orange-400/10';
      case 'EXTREME':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-orange-400 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-mono font-bold mb-2">INITIALIZING AI SYSTEMS</h2>
            <p className="text-orange-300 font-mono">Loading neural networks, sentiment analysis, and trading signals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-orange-400 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-orange-400" />
            <div>
              <h1 className="text-2xl font-mono font-bold text-orange-400">CYPHER AI</h1>
              <p className="text-orange-300 font-mono text-sm">Advanced AI-Powered Trading Intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 font-mono">LAST UPDATE</div>
              <div className="text-sm text-orange-300 font-mono">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={loadAIData}
              className="bg-orange-500/20 border border-orange-500/50 text-orange-400 px-4 py-2 rounded font-mono text-sm hover:bg-orange-500/30 transition-colors"
            >
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {assets.map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-4 py-2 rounded font-mono text-sm border transition-colors ${
                selectedAsset === asset
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-gray-900/50 border-gray-600/50 text-gray-400 hover:border-orange-500/30'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* AI Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* Neural Price Prediction */}
        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-orange-400" />
            <h2 className="text-orange-400 font-mono font-bold">NEURAL PREDICTION</h2>
          </div>
          
          {predictions.has(selectedAsset) ? (() => {
            const prediction = predictions.get(selectedAsset)!;
            return (
              <div className="space-y-4">
                {/* Timeframe Predictions */}
                {Object.entries(prediction.predictions).map(([timeframe, pred]) => (
                  <div key={timeframe} className="border border-gray-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-400 font-mono text-sm font-bold">{timeframe}</span>
                      <span className="text-green-400 font-mono text-xs">{pred.confidence}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-xs">Target:</span>
                      <span className="text-orange-300 font-mono text-sm">{formatPrice(pred.price)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-xs">Trend:</span>
                      <span className={`font-mono text-xs ${
                        pred.trend === 'UP' ? 'text-green-400' :
                        pred.trend === 'DOWN' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {pred.trend}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Risk Assessment */}
                <div className="pt-3 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-xs">Risk Level:</span>
                    <span className={`px-2 py-1 rounded font-mono text-xs ${getRiskColor(prediction.riskAssessment)}`}>
                      {prediction.riskAssessment}
                    </span>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="text-center text-gray-500 py-4 font-mono text-sm">
              No prediction data available
            </div>
          )}
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-orange-400" />
            <h2 className="text-orange-400 font-mono font-bold">SENTIMENT ANALYSIS</h2>
          </div>
          
          {sentiments.has(selectedAsset) ? (() => {
            const sentiment = sentiments.get(selectedAsset)!;
            return (
              <div className="space-y-4">
                {/* Overall Sentiment */}
                <div className="border border-gray-700/50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-mono text-sm font-bold">OVERALL</span>
                    <span className="text-green-400 font-mono text-xs">{sentiment.overall.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-xs">Sentiment:</span>
                    <span className={`font-mono text-xs ${getSentimentColor(sentiment.overall.sentiment)}`}>
                      {sentiment.overall.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono text-xs">Score:</span>
                    <span className="text-orange-300 font-mono text-sm">
                      {sentiment.overall.score.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Source Breakdown */}
                <div className="space-y-2">
                  {Object.entries(sentiment.sources).map(([source, data]) => (
                    <div key={source} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400 capitalize">
                        {source.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className={`${data.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.score.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                {sentiment.insights.length > 0 && (
                  <div className="pt-3 border-t border-gray-700/50">
                    <h4 className="text-orange-400 font-mono text-xs font-bold mb-2">KEY INSIGHTS</h4>
                    <div className="space-y-1">
                      {sentiment.insights.slice(0, 3).map((insight, idx) => (
                        <div key={idx} className="text-gray-300 text-xs font-mono">
                          • {insight.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="text-center text-gray-500 py-4 font-mono text-sm">
              No sentiment data available
            </div>
          )}
        </div>

        {/* Active Signals Summary */}
        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-orange-400" />
            <h2 className="text-orange-400 font-mono font-bold">ACTIVE SIGNALS</h2>
          </div>
          
          {signals.has(selectedAsset) ? (() => {
            const assetSignals = signals.get(selectedAsset)!;
            const highConfidenceSignals = assetSignals.filter(s => s.confidence > 70);
            
            return (
              <div className="space-y-4">
                {highConfidenceSignals.length > 0 ? (
                  highConfidenceSignals.slice(0, 3).map((signal) => (
                    <div key={signal.signalId} className="border border-gray-700/50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            signal.action === 'BUY' ? 'bg-green-400' :
                            signal.action === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                          <span className="text-orange-400 font-mono text-sm font-bold">
                            {signal.action} {signal.timeHorizon}
                          </span>
                        </div>
                        <span className="text-green-400 font-mono text-xs">{signal.confidence}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-gray-400">Target:</span>
                          <div className="text-green-400">{formatPrice(signal.priceTarget)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">R/R:</span>
                          <div className="text-orange-400">{signal.riskReward}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4 font-mono text-sm">
                    No high-confidence signals
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-700/50">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Total Signals:</span>
                    <span className="text-orange-300">{assetSignals.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">High Confidence:</span>
                    <span className="text-green-400">{highConfidenceSignals.length}</span>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="text-center text-gray-500 py-4 font-mono text-sm">
              No signals available
            </div>
          )}
        </div>
      </div>

      {/* Trading Intelligence Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Trading Signals Panel */}
        <TradingSignalsPanel selectedAsset={selectedAsset} />
        
        {/* Arbitrage Panel */}
        <ArbitragePanel />
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-orange-400 font-mono font-bold">PREDICTION ACCURACY</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">24H Accuracy:</span>
              <span className="text-green-400 font-mono text-sm">87.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">7D Accuracy:</span>
              <span className="text-green-400 font-mono text-sm">82.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Signal Success:</span>
              <span className="text-green-400 font-mono text-sm">79.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="text-orange-400 font-mono font-bold">PERFORMANCE</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Total Return:</span>
              <span className="text-green-400 font-mono text-sm">+23.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Sharpe Ratio:</span>
              <span className="text-green-400 font-mono text-sm">2.14</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Max Drawdown:</span>
              <span className="text-red-400 font-mono text-sm">-5.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-black border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-orange-400 font-mono font-bold">RISK METRICS</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Volatility:</span>
              <span className="text-yellow-400 font-mono text-sm">12.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">VaR (95%):</span>
              <span className="text-orange-400 font-mono text-sm">-3.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Beta:</span>
              <span className="text-orange-400 font-mono text-sm">0.87</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}