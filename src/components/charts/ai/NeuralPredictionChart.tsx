'use client';

// 📊 Neural Prediction Chart com intervalos de confiança
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BaseChart } from '../base/BaseChart';

interface NeuralPredictionChartProps {
  predictions?: any[];
  confidence?: number;
  height?: number;
}

export function NeuralPredictionChart({ 
  predictions, 
  confidence = 0.85,
  height = 400 
}: NeuralPredictionChartProps) {
  
  // Generate mock prediction data
  const predictionData = predictions || Array.from({ length: 24 }, (_, i) => {
    const basePrice = 65000 + Math.sin(i / 6) * 1000;
    const confidenceInterval = 500 * (1 - confidence);
    
    return {
      time: `${i}h`,
      actual: i < 12 ? basePrice + (Math.random() - 0.5) * 200 : null,
      predicted: basePrice,
      upperBound: basePrice + confidenceInterval,
      lowerBound: basePrice - confidenceInterval,
      confidence: confidence * 100
    };
  });

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 p-3 rounded border border-gray-600">
          <p className="text-white text-sm">{`Tempo: ${label}`}</p>
          <p className="text-green-500">{`Previsão: $${data.predicted?.toFixed(2)}`}</p>
          <p className="text-blue-500">{`Confiança: ${data.confidence}%`}</p>
          {data.actual && (
            <p className="text-orange-500">{`Real: $${data.actual.toFixed(2)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <BaseChart title="Previsão Neural - Próximas 24h" height={height} data={predictionData}>
      <LineChart data={predictionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="time" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip content={customTooltip} />
        <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
        <Line type="monotone" dataKey="upperBound" stroke="#6b7280" strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="lowerBound" stroke="#6b7280" strokeWidth={1} dot={false} />
      </LineChart>
    </BaseChart>
  );
}