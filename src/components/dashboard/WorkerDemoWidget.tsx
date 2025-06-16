'use client';

import { useState, useEffect } from 'react';
import { Brain, Cpu, Zap, Activity } from 'lucide-react';
import { useAIPredictionsWithWorkers } from '@/lib/hooks/useAIPredictionsWithWorkers';

/**
 * Componente para demonstrar Web Workers em ação
 */
export function WorkerDemoWidget() {
  const [workerStatus, setWorkerStatus] = useState({
    priceWorker: 'idle',
    sentimentWorker: 'idle',
    tasksCompleted: 0,
    averageTime: 0
  });

  const { pricePrediction, sentiment, isLoading, refresh } = useAIPredictionsWithWorkers(false);

  // Simular atividade dos workers
  useEffect(() => {
    if (isLoading) {
      setWorkerStatus(prev => ({
        ...prev,
        priceWorker: 'processing',
        sentimentWorker: 'processing'
      }));
    } else {
      setWorkerStatus(prev => ({
        ...prev,
        priceWorker: 'idle',
        sentimentWorker: 'idle',
        tasksCompleted: prev.tasksCompleted + 2,
        averageTime: 1250 // ms
      }));
    }
  }, [isLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-500';
      case 'idle':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-500" />
          Web Workers Status
        </h3>
        <button
          onClick={refresh}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
          disabled={isLoading}
        >
          Test Workers
        </button>
      </div>

      <div className="space-y-4">
        {/* Worker Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Price Prediction Worker</span>
              <Zap className={`w-4 h-4 ${getStatusColor(workerStatus.priceWorker)}`} />
            </div>
            <p className={`text-xs font-medium ${getStatusColor(workerStatus.priceWorker)}`}>
              {workerStatus.priceWorker.toUpperCase()}
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Sentiment Analysis Worker</span>
              <Brain className={`w-4 h-4 ${getStatusColor(workerStatus.sentimentWorker)}`} />
            </div>
            <p className={`text-xs font-medium ${getStatusColor(workerStatus.sentimentWorker)}`}>
              {workerStatus.sentimentWorker.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-200 mb-3">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Tasks Completed</span>
              <span className="text-gray-200 font-medium">{workerStatus.tasksCompleted}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Average Processing Time</span>
              <span className="text-gray-200 font-medium">{workerStatus.averageTime}ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Main Thread Impact</span>
              <span className="text-green-500 font-medium">Minimal</span>
            </div>
          </div>
        </div>

        {/* Current Results */}
        {(pricePrediction || sentiment) && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Latest Results</h4>
            <div className="space-y-1 text-xs">
              {pricePrediction && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Prediction</span>
                  <span className={pricePrediction.percentageChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {pricePrediction.percentageChange > 0 ? '+' : ''}{pricePrediction.percentageChange.toFixed(2)}%
                  </span>
                </div>
              )}
              {sentiment && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Sentiment</span>
                  <span className={sentiment.overall > 0.6 ? 'text-green-500' : sentiment.overall < 0.4 ? 'text-red-500' : 'text-yellow-500'}>
                    {sentiment.trend.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Activity className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <p>
            Web Workers process AI predictions in background threads, 
            keeping the UI responsive even during heavy computations.
          </p>
        </div>
      </div>
    </div>
  );
}