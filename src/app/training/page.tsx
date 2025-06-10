'use client';

import { useState } from 'react';
import { 
  Brain, 
  Upload, 
  Download, 
  PlayCircle, 
  BarChart3, 
  Trash2, 
  Settings,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useModelTraining } from '@/lib/hooks/useModelTraining';
import { devLogger } from '@/lib/logger';
import { TopNavLayout } from '@/components/layout/TopNavLayout';

export default function TrainingPage() {
  const {
    status,
    models,
    trainingResults,
    trainModel,
    runBacktest,
    exportModel,
    importModel,
    startAutoTraining,
    cleanupOldModels
  } = useModelTraining();

  const [selectedModel, setSelectedModel] = useState<string>('price-predictor');
  const [autoTrainingInterval, setAutoTrainingInterval] = useState<number>(24);

  // Handler para upload de arquivo
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importModel(file);
      } catch (error) {
        console.error('Erro ao importar modelo:', error);
      }
    }
  };

  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          CYPHER AI Training Center
        </h1>
        <p className="text-gray-400">
          Treine e gerencie modelos de IA para análise de Bitcoin
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controles de Treinamento */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-500" />
              Model Training Control
            </h2>

            <div className="space-y-4">
              {/* Seleção de Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Selecionar Modelo
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-orange-500"
                  disabled={status.isTraining}
                >
                  <option value="price-predictor">Price Predictor (LSTM)</option>
                  <option value="sentiment-analyzer">Sentiment Analyzer</option>
                </select>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => trainModel(selectedModel)}
                  disabled={status.isTraining}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {status.isTraining ? 'Treinando...' : 'Iniciar Treinamento'}
                </button>

                <button
                  onClick={() => runBacktest(selectedModel)}
                  disabled={status.isTraining || !models.find(m => m.name === selectedModel)?.currentVersion}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Run Backtest
                </button>

                <button
                  onClick={() => exportModel(selectedModel)}
                  disabled={!models.find(m => m.name === selectedModel)?.currentVersion}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Model
                </button>

                <label className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Model
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Progress Bar */}
              {status.isTraining && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Treinando {status.currentModel}</span>
                    <span>{status.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Training Logs */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Training Logs
            </h2>

            <div className="bg-gray-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {status.logs.length === 0 ? (
                <p className="text-gray-500">Aguardando atividade...</p>
              ) : (
                status.logs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Training Results */}
          {trainingResults.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Training Results
              </h2>

              <div className="space-y-3">
                {trainingResults.map((result, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-100">
                          Model Training Complete
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {result.epochs} epochs • {(result.trainingTime / 1000).toFixed(1)}s
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">
                          {result.accuracy.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">accuracy</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                      <div>
                        <p className="text-xs text-gray-400">Loss</p>
                        <p className="text-sm font-medium text-gray-200">
                          {result.loss.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Accuracy</p>
                        <p className="text-sm font-medium text-gray-200">
                          {(result.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Lateral - 1/3 */}
        <div className="space-y-6">
          {/* Model Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Model Status
            </h2>

            <div className="space-y-4">
              {models.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Nenhum modelo treinado ainda
                </p>
              ) : (
                models.map((model) => (
                  <div key={model.name} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-gray-100 mb-2">
                      {model.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        Version: <span className="text-gray-200">
                          {model.currentVersion || 'Not trained'}
                        </span>
                      </p>
                      {model.lastTrained && (
                        <p className="text-gray-400">
                          Last trained: <span className="text-gray-200">
                            {new Date(model.lastTrained).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                      {model.metrics && (
                        <p className="text-gray-400">
                          Accuracy: <span className="text-green-500">
                            {model.metrics.accuracy.toFixed(1)}%
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Auto-Training Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Auto-Training
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Intervalo (horas)
                </label>
                <input
                  type="number"
                  value={autoTrainingInterval}
                  onChange={(e) => setAutoTrainingInterval(Number(e.target.value))}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={() => startAutoTraining(autoTrainingInterval)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Ativar Auto-Training
              </button>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              Maintenance
            </h2>

            <button
              onClick={() => {
                if (confirm('Remover modelos com mais de 30 dias?')) {
                  cleanupOldModels(30);
                }
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Modelos Antigos
            </button>
          </div>
        </div>
      </div>
      </div>
    </TopNavLayout>
  );
}