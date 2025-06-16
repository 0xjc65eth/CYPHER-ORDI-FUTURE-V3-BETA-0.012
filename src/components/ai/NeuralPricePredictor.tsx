'use client';

import { useState, useEffect } from 'react';
import { useNeuralPricePrediction } from '@/hooks/ai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Gerar dados históricos simulados
function generateHistoricalData(): number[][] {
  const data: number[][] = [];
  let basePrice = 58000;
  
  for (let i = 0; i < 60; i++) {
    const variation = (Math.random() - 0.5) * 1000;
    basePrice += variation;
    
    const high = basePrice + Math.random() * 500;
    const low = basePrice - Math.random() * 500;
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    const volume = 1000000000 + Math.random() * 500000000;
    
    data.push([open, high, low, close, volume]);
  }
  
  return data;
}

export function NeuralPricePredictor() {
  const { prediction, loading, predict } = useNeuralPricePrediction();
  const [historicalData] = useState(generateHistoricalData());
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Fazer previsão inicial
    predict(historicalData);
  }, [historicalData, predict]);

  useEffect(() => {
    if (prediction) {
      // Preparar dados para o gráfico
      const currentPrice = historicalData[historicalData.length - 1][3]; // Close price
      const data = [
        { time: 'Agora', price: currentPrice, type: 'actual' },
        { time: '6h', price: prediction.range.min + (prediction.range.max - prediction.range.min) * 0.3, type: 'predicted' },
        { time: '12h', price: prediction.range.min + (prediction.range.max - prediction.range.min) * 0.6, type: 'predicted' },
        { time: '24h', price: prediction.price, type: 'predicted', min: prediction.range.min, max: prediction.range.max }
      ];
      setChartData(data);
    }
  }, [prediction, historicalData]);

  const getTrendIcon = () => {
    if (!prediction) return null;
    const currentPrice = historicalData[historicalData.length - 1][3];
    
    if (prediction.price > currentPrice * 1.02) {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (prediction.price < currentPrice * 0.98) {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <Activity className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-orange-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-semibold text-orange-500">Neural Price Prediction</h2>
        {loading && <div className="ml-auto text-xs text-gray-400">Processando...</div>}
      </div>

      {prediction && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/40 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Previsão 24h</span>
                {getTrendIcon()}
              </div>
              <div className="text-2xl font-bold text-white">
                ${prediction.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(prediction.confidence * 100).toFixed(1)}% confiança
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Range Esperado</div>
              <div className="text-sm text-green-500">
                Max: ${prediction.range.max.toLocaleString()}
              </div>
              <div className="text-sm text-red-500">
                Min: ${prediction.range.min.toLocaleString()}
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Timeframe</div>
              <div className="text-xl font-semibold text-white">
                {prediction.timeframe}
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #f97316' }}
                  labelStyle={{ color: '#f97316' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#f97316" 
                  fill="#f97316" 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="max" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                />
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="mt-4 text-xs text-gray-500">
        * Previsões baseadas em LSTM neural network com 60 pontos históricos
      </div>
    </div>
  );
}