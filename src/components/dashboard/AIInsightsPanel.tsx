'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, Shield, ChevronRight } from 'lucide-react';
import { useNeuralPredictions } from '@/hooks/useNeuralPredictions';
import { useSentimentAnalysis } from '@/hooks/ai/useSentimentAnalysis';
import { useTradingOpportunities } from '@/hooks/useTradingOpportunities';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';

interface Prediction {
  asset: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  priceTarget?: number;
  supportLevel?: number;
  resistanceLevel?: number;
}

interface Opportunity {
  id: string;
  type: 'arbitrage' | 'trend' | 'breakout' | 'reversal';
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  potentialProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
}

export function AIInsightsPanel() {
  const { predictions, loading: predictionsLoading } = useNeuralPredictions();
  const { sentiment, loading: sentimentLoading } = useSentimentAnalysis();
  const { opportunities, loading: oppsLoading } = useTradingOpportunities();
  const { assessment, loading: riskLoading } = useRiskAssessment();

  const [expandedSection, setExpandedSection] = useState<string | null>('predictions');

  const getPredictionColor = (prediction: string): string => {
    switch (prediction) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'buy': return 'bg-green-500';
      case 'sell': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const sections = [
    {
      id: 'predictions',
      title: 'Neural Network Predictions',
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      badge: predictions.length,
      loading: predictionsLoading
    },
    {
      id: 'sentiment',
      title: 'Sentiment Analysis',
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      badge: sentiment?.score && sentiment.score > 0.1 ? 'Bullish' : sentiment?.score && sentiment.score < -0.1 ? 'Bearish' : 'Neutral',
      loading: sentimentLoading
    },
    {
      id: 'opportunities',
      title: 'Trading Opportunities',
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      badge: opportunities.filter(o => o.confidence > 0.7).length,
      loading: oppsLoading
    },
    {
      id: 'risk',
      title: 'Risk Assessment',
      icon: <Shield className="w-5 h-5 text-red-500" />,
      badge: assessment?.overallRisk || 'Medium',
      loading: riskLoading
    }
  ];

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AI Insights</h2>
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
            Powered by Neural Networks
          </Badge>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-gray-800 rounded-lg overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-4 bg-gray-800/30 hover:bg-gray-800/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="text-white font-medium">{section.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {section.loading ? (
                    <span className="text-gray-400 text-sm">Loading...</span>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {section.badge}
                    </Badge>
                  )}
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSection === section.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedSection === section.id && (
                <div className="p-4 bg-gray-800/20">
                  {/* Neural Network Predictions */}
                  {section.id === 'predictions' && !predictionsLoading && (
                    <div className="space-y-3">
                      {predictions.slice(0, 5).map((pred, index) => (
                        <div key={index} className="p-3 bg-gray-800/40 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">{pred.asset}</span>
                              <span className={`text-sm font-medium ${getPredictionColor(pred.prediction)}`}>
                                {pred.prediction.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">{pred.timeframe}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Confidence</span>
                              <div className="flex items-center gap-2">
                                <Progress value={pred.confidence * 100} className="w-20 h-2" />
                                <span className="text-gray-300">{(pred.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            {pred.priceTarget && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Target</span>
                                <span className="text-green-400">${pred.priceTarget.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sentiment Analysis */}
                  {section.id === 'sentiment' && !sentimentLoading && sentiment && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                          <p className="text-3xl font-bold text-green-500">{sentiment.score > 0 ? Math.round(sentiment.score * 100) : 0}%</p>
                          <p className="text-sm text-gray-400">Bullish</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                          <p className="text-3xl font-bold text-yellow-500">{Math.round(sentiment.confidence * 100)}%</p>
                          <p className="text-sm text-gray-400">Neutral</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                          <p className="text-3xl font-bold text-red-500">{sentiment.score < 0 ? Math.round(Math.abs(sentiment.score) * 100) : 0}%</p>
                          <p className="text-sm text-gray-400">Bearish</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-800/40 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Key Drivers</p>
                        <div className="flex flex-wrap gap-2">
                          {sentiment.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trading Opportunities */}
                  {section.id === 'opportunities' && !oppsLoading && (
                    <div className="space-y-3">
                      {opportunities
                        .filter(opp => opp.confidence > 0.7)
                        .slice(0, 3)
                        .map((opp) => (
                          <div key={opp.id} className="p-3 bg-gray-800/40 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Target className="w-4 h-4 text-yellow-500" />
                                <span className="text-white font-medium">{opp.asset}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getActionColor(opp.action)} text-white`}
                                >
                                  {opp.action.toUpperCase()}
                                </Badge>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getRiskColor(opp.riskLevel)}`}
                              >
                                {opp.riskLevel} risk
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-400">Entry</p>
                                <p className="text-white">${opp.entryPrice.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Target</p>
                                <p className="text-green-400">${opp.targetPrice.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Stop Loss</p>
                                <p className="text-red-400">${opp.stopLoss.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Potential</p>
                                <p className="text-green-400">+{opp.potentialProfit.toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {section.id === 'risk' && !riskLoading && assessment && (
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-800/40 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400">Overall Market Risk</span>
                          <Badge 
                            variant="secondary" 
                            className={getRiskColor(assessment.overallRisk)}
                          >
                            {assessment.overallRisk}
                          </Badge>
                        </div>
                        <Progress value={assessment.riskScore} className="h-2 mb-2" />
                        <p className="text-xs text-gray-400">{assessment.riskScore}% risk level</p>
                      </div>
                      <div className="space-y-2">
                        {assessment.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
                            <span className="text-sm text-gray-300">{factor.name}</span>
                            <div className="flex items-center gap-2">
                              {factor.impact === 'negative' ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Shield className="w-4 h-4 text-green-500" />
                              )}
                              <span className="text-sm text-gray-400">{factor.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}