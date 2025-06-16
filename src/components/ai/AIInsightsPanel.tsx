'use client';

import { useCypherAI } from '@/hooks/ai';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIInsightsPanel() {
  const { insights, loading, initialized } = useCypherAI();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'price':
        return insights[0]?.prediction?.direction === 'up' ? 
          <TrendingUp className="w-5 h-5 text-green-500" /> : 
          <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'pattern':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Zap className="w-5 h-5 text-orange-500" />;
    }
  };

  if (!initialized) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-orange-500 animate-pulse" />
          <h2 className="text-xl font-semibold text-orange-500">CYPHER AI Insights</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          Inicializando sistema neural...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-orange-500">CYPHER AI Insights</h2>
        {loading && <div className="ml-auto text-xs text-gray-400">Analisando...</div>}
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aguardando dados do mercado para análise...
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-black/40 rounded-lg border border-gray-800"
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {insight.type} Analysis
                    </span>
                    <span className="text-xs text-gray-500">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{insight.reasoning}</p>
                  {insight.prediction && (
                    <div className="mt-2 text-xs text-orange-500">
                      Prediction: {JSON.stringify(insight.prediction)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Powered by TensorFlow.js</span>
          <span>Neural Network v3.0.0</span>
        </div>
      </div>
    </div>
  );
}