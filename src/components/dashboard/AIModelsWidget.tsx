import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Activity, Clock } from 'lucide-react';
import { modelPersistence } from '@/lib/ai/persistence/modelPersistence';
import Link from 'next/link';

/**
 * Widget de Status dos Modelos de IA para o Dashboard
 */

interface ModelStatus {
  name: string;
  displayName: string;
  icon: React.ElementType;
  version?: string;
  lastTrained?: string;
  accuracy?: number;
  status: 'ready' | 'training' | 'not-trained';
}

export function AIModelsWidget() {
  const [models, setModels] = useState<ModelStatus[]>([]);

  useEffect(() => {
    loadModelStatus();
  }, []);

  const loadModelStatus = async () => {
    try {
      const modelList = await modelPersistence.listModels();
      
      const modelConfigs = [
        {
          name: 'price-predictor',
          displayName: 'Price Predictor',
          icon: TrendingUp,
        },
        {
          name: 'sentiment-analyzer',
          displayName: 'Sentiment Analyzer',
          icon: Activity,
        }
      ];
      
      const statusList = modelConfigs.map(config => {
        const modelData = modelList.find(m => m.name === config.name);
        
        return {
          ...config,
          version: modelData?.version || '1.0.0',
          lastTrained: modelData?.updatedAt?.toISOString() || new Date().toISOString(),
          accuracy: modelData?.accuracy || 0,
          status: modelData ? 'ready' : 'not-trained'
        } as ModelStatus;
      });
      
      setModels(statusList);
    } catch (error) {
      console.error('Erro ao carregar status dos modelos:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-500';
      case 'training':
        return 'text-yellow-500';
      case 'not-trained':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'training':
        return 'Training...';
      case 'not-trained':
        return 'Not Trained';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-500" />
          AI Models Status
        </h3>
        <Link 
          href="/training"
          className="text-sm text-orange-500 hover:text-orange-400"
        >
          Manage →
        </Link>
      </div>

      <div className="space-y-3">
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <div key={model.name} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">
                      {model.displayName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className={getStatusColor(model.status)}>
                        {getStatusText(model.status)}
                      </span>
                      {model.accuracy && (
                        <>
                          <span>•</span>
                          <span>{model.accuracy.toFixed(1)}% accuracy</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {model.lastTrained && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(model.lastTrained).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      v{model.version}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {models.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No models trained yet</p>
            <Link
              href="/training"
              className="text-orange-500 hover:text-orange-400 text-sm mt-2 inline-block"
            >
              Train your first model →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}