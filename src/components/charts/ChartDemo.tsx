'use client';

// 📊 Chart Demo Component - Demonstra todos os charts da biblioteca
import { BitcoinPriceChart, VolumeChart, NeuralPredictionChart, SentimentChart } from '../charts';

export function ChartDemo() {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          📊 CYPHER Charts Library v3.0.0
        </h1>
        <p className="text-gray-400">
          Biblioteca completa de gráficos com Recharts para análise Bitcoin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitcoin Price Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Bitcoin Price Chart</h3>
          <BitcoinPriceChart showIndicators={true} />
        </div>

        {/* Volume Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Volume Chart</h3>
          <VolumeChart />
        </div>

        {/* Neural Prediction Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Neural Prediction</h3>
          <NeuralPredictionChart confidence={0.87} />
        </div>

        {/* Sentiment Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
          <SentimentChart bullish={68} bearish={22} neutral={10} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-semibold mb-2">📋 Status da Implementação:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-green-500">✅ Base Charts</div>
          <div className="text-green-500">✅ Bitcoin Charts</div>
          <div className="text-green-500">✅ AI Charts</div>
          <div className="text-green-500">✅ Trading Charts</div>
        </div>
      </div>
    </div>
  );
}