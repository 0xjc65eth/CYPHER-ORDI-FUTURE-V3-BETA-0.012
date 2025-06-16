'use client'

import React, { useState, useEffect } from 'react'
import { Card, Title, Text, Metric, Flex, ProgressBar, AreaChart } from '@tremor/react'
import {
  RiBrainLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiTimeLine,
  RiRefreshLine,
  RiDatabase2Line,
  RiPulseLine,
  RiLineChartLine,
  RiRobot2Line,
  RiCloudLine,
  RiTerminalBoxLine,
  RiInformationLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiFilterLine
} from 'react-icons/ri'

// Simulated learning progress data
const learningStages = [
  'data_collection',
  'preprocessing',
  'training',
  'validation',
  'insight_generation',
  'correction'
]

// Learning progress history data
const learningProgressHistory = [
  { date: '2024-04-01', progress: 65, accuracy: 78 },
  { date: '2024-04-02', progress: 72, accuracy: 81 },
  { date: '2024-04-03', progress: 78, accuracy: 83 },
  { date: '2024-04-04', progress: 85, accuracy: 86 },
  { date: '2024-04-05', progress: 92, accuracy: 89 },
  { date: '2024-04-06', progress: 95, accuracy: 91 }
]

// Simulated auto-correction data
const autoCorrections = [
  {
    id: 'market-price-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    dataType: 'Market',
    field: 'btcPrice',
    oldValue: 68452,
    newValue: 65789,
    confidence: 92,
    source: 'Anomaly Detection',
    explanation: 'Detected abnormal price variation of 22.5% in less than an hour. Value corrected based on adjacent data points.',
    modelId: 'price-prediction',
    status: 'applied',
    impact: 'high'
  },
  {
    id: 'ordinals-volume-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    dataType: 'Ordinals',
    field: 'volume24h',
    oldValue: 1250000,
    newValue: 850000,
    confidence: 88,
    source: 'Pattern Recognition',
    explanation: 'Detected abnormal volume spike of 320% in less than 2 hours. Value corrected based on historical patterns.',
    modelId: 'ordinals-analysis',
    status: 'applied',
    impact: 'medium'
  },
  {
    id: 'runes-mintrate-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    dataType: 'Runes',
    field: 'mintRate',
    oldValue: 0.0025,
    newValue: 0.0018,
    confidence: 85,
    source: 'Statistical Analysis',
    explanation: 'Detected abnormal mint rate variation of 550% in less than 3 hours. Value corrected based on adjacent data points.',
    modelId: 'runes-analysis',
    status: 'applied',
    impact: 'medium'
  },
  {
    id: 'arbitrage-opportunity-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    dataType: 'Arbitrage',
    field: 'profitMargin',
    oldValue: 28.5,
    newValue: 12.3,
    confidence: 94,
    source: 'Cross-Market Analysis',
    explanation: 'Corrected profit margin calculation by including previously omitted marketplace fees and transfer costs.',
    modelId: 'arbitrage-detection',
    status: 'applied',
    impact: 'high'
  },
  {
    id: 'smc-support-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    dataType: 'SMC',
    field: 'supportLevel',
    oldValue: 59800,
    newValue: 61250,
    confidence: 91,
    source: 'Market Structure Analysis',
    explanation: 'Recalculated support level based on recent price action and order book depth.',
    modelId: 'smc-analysis',
    status: 'applied',
    impact: 'high'
  }
]

// Neural system metrics data
const neuralSystemMetrics = {
  accuracy: 91.7,
  precision: 93.2,
  recall: 89.5,
  f1Score: 91.3,
  dataPoints: 1250000,
  modelsCount: 8,
  lastFullTraining: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  predictionSuccess: 87.4,
  anomalyDetection: 94.2,
  cloudSyncStatus: 'Synced',
  lastCloudSync: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
}

// Logs de aprendizado em tempo real
const realTimeLearningLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 minute ago
    level: 'info',
    model: 'price-prediction',
    message: 'Training batch completed: 5000 samples processed',
    details: 'Loss: 0.0023, Accuracy: 92.7%',
    stage: 'training'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 minutes ago
    level: 'success',
    model: 'ordinals-analysis',
    message: 'Model weights updated successfully',
    details: 'Performance improved by 2.3%',
    stage: 'training'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    level: 'warning',
    model: 'arbitrage-detection',
    message: 'Potential data drift detected',
    details: 'Monitoring for further anomalies',
    stage: 'validation'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 minutes ago
    level: 'info',
    model: 'smc-analysis',
    message: 'New market structure patterns identified',
    details: 'Adding 3 new features to model',
    stage: 'data_collection'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 minutes ago
    level: 'error',
    model: 'runes-analysis',
    message: 'Inconsistent data detected in Runes volume',
    details: 'Auto-correction initiated',
    stage: 'correction'
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    level: 'success',
    model: 'runes-analysis',
    message: 'Auto-correction completed successfully',
    details: 'Data integrity restored',
    stage: 'correction'
  },
  {
    id: 'log-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 minutes ago
    level: 'info',
    model: 'cloud-sync',
    message: 'Syncing model weights to Degoo cloud storage',
    details: '8 models, 1.2GB of data',
    stage: 'cloud_sync'
  },
  {
    id: 'log-8',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(), // 22 minutes ago
    level: 'success',
    model: 'cloud-sync',
    message: 'Cloud sync completed successfully',
    details: 'All models available for offline learning',
    stage: 'cloud_sync'
  },
  {
    id: 'log-9',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
    level: 'info',
    model: 'insight-generation',
    message: 'Generating new market insights',
    details: 'Processing recent price action and on-chain data',
    stage: 'insight_generation'
  },
  {
    id: 'log-10',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    level: 'success',
    model: 'insight-generation',
    message: '12 new insights generated',
    details: '5 high confidence, 7 medium confidence',
    stage: 'insight_generation'
  }
]

export function NeuralLearningStatusCard() {
  const [activeTab, setActiveTab] = useState('progress')
  const [progress, setProgress] = useState(95)
  const [currentStage, setCurrentStage] = useState('training')
  const [completedTasks, setCompletedTasks] = useState(15)
  const [totalTasks, setTotalTasks] = useState(20)
  const [currentTask, setCurrentTask] = useState('Training neural models with latest data')
  const [corrections, setCorrections] = useState(autoCorrections)
  const [logs, setLogs] = useState(realTimeLearningLogs)
  const [stageProgress, setStageProgress] = useState({
    data_collection: 100,
    preprocessing: 100,
    training: 92,
    validation: 85,
    insight_generation: 78,
    correction: 100
  })
  const [isAutoCorrectRunning, setIsAutoCorrectRunning] = useState(false)
  const [newLogCount, setNewLogCount] = useState(0)

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Função para gerar um novo log aleatório
  const generateRandomLog = () => {
    const models = ['price-prediction', 'ordinals-analysis', 'runes-analysis', 'arbitrage-detection', 'smc-analysis', 'cloud-sync', 'insight-generation'];
    const levels = ['info', 'success', 'warning', 'error'];
    const stages = [...learningStages, 'cloud_sync'];

    const levelWeights = { info: 0.6, success: 0.2, warning: 0.15, error: 0.05 };
    const randomLevel = () => {
      const rand = Math.random();
      let cumulativeWeight = 0;
      for (const [level, weight] of Object.entries(levelWeights)) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) return level;
      }
      return 'info';
    };

    const level = randomLevel();
    const model = models[Math.floor(Math.random() * models.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];

    // Mensagens específicas baseadas no nível e modelo
    let message = '';
    let details = '';

    if (level === 'info') {
      if (model === 'price-prediction') {
        message = 'Training batch completed';
        details = `Loss: ${(Math.random() * 0.01).toFixed(4)}, Accuracy: ${(85 + Math.random() * 10).toFixed(1)}%`;
      } else if (model === 'cloud-sync') {
        message = 'Syncing model weights to Degoo cloud storage';
        details = `${Math.floor(Math.random() * 10)} models, ${(Math.random() * 2).toFixed(1)}GB of data`;
      } else {
        message = 'Processing new market data';
        details = `${Math.floor(Math.random() * 5000)} samples analyzed`;
      }
    } else if (level === 'success') {
      if (model === 'ordinals-analysis' || model === 'runes-analysis') {
        message = 'Model weights updated successfully';
        details = `Performance improved by ${(Math.random() * 5).toFixed(1)}%`;
      } else if (model === 'cloud-sync') {
        message = 'Cloud sync completed successfully';
        details = 'All models available for offline learning';
      } else {
        message = 'Feature extraction completed';
        details = `${Math.floor(Math.random() * 10) + 1} new features identified`;
      }
    } else if (level === 'warning') {
      if (model === 'arbitrage-detection') {
        message = 'Potential data drift detected';
        details = 'Monitoring for further anomalies';
      } else {
        message = 'Unusual pattern detected';
        details = 'Adjusting model parameters to compensate';
      }
    } else if (level === 'error') {
      if (model === 'runes-analysis') {
        message = 'Inconsistent data detected in Runes volume';
        details = 'Auto-correction initiated';
      } else {
        message = 'Training interrupted';
        details = 'Insufficient data quality, retrying with filtered dataset';
      }
    }

    return {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      model,
      message,
      details,
      stage,
      isNew: true
    };
  };

  // Simulate progress updates and add new logs
  useEffect(() => {
    const interval = setInterval(() => {
      // Update progress
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 5)
        return newProgress > 100 ? 100 : newProgress
      })

      // Update completed tasks
      setCompletedTasks(prev => {
        const newCompleted = prev + (Math.random() > 0.7 ? 1 : 0)
        return newCompleted > totalTasks ? totalTasks : newCompleted
      })

      // Update stage progress
      setStageProgress(prev => {
        const updatedProgress = { ...prev }
        const randomStage = learningStages[Math.floor(Math.random() * learningStages.length)]
        updatedProgress[randomStage as keyof typeof updatedProgress] = Math.min(100, updatedProgress[randomStage as keyof typeof updatedProgress] + Math.floor(Math.random() * 5))
        return updatedProgress
      })

      // Add new log with 70% probability
      if (Math.random() < 0.7) {
        const newLog = generateRandomLog();
        setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep only the last 50 logs
        setNewLogCount(prev => prev + 1);

        // Reset new log indicator after 5 seconds
        setTimeout(() => {
          setLogs(prev =>
            prev.map(log =>
              log.id === newLog.id ? { ...log, isNew: false } : log
            )
          );
        }, 5000);
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [totalTasks])

  // Função para gerar um log manualmente
  const generateManualLog = (level, message, details, model = 'manual-input') => {
    const newLog = {
      id: `log-manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      model,
      message,
      details,
      stage: 'manual_input',
      isNew: true
    };

    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    setNewLogCount(prev => prev + 1);

    // Reset new log indicator after 5 seconds
    setTimeout(() => {
      setLogs(prev =>
        prev.map(log =>
          log.id === newLog.id ? { ...log, isNew: false } : log
        )
      );
    }, 5000);

    return newLog;
  };

  // Function to run auto-correction
  const runAutoCorrection = () => {
    setIsAutoCorrectRunning(true)
    setCurrentStage('correction')
    setCurrentTask('Autonomously correcting inconsistent data')
    setProgress(45)

    // Adicionar log de início da correção
    generateManualLog(
      'warning',
      'Auto-correction process initiated',
      'Scanning for data inconsistencies across all models',
      'auto-correction'
    );

    // Simulate adding a new correction after a delay
    setTimeout(() => {
      const newCorrection = {
        id: `trade-setup-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataType: 'Trade',
        field: 'stopLoss',
        oldValue: 58200,
        newValue: 61450,
        confidence: 96,
        source: 'SMC Analysis',
        explanation: 'Corrected invalid stop loss value that was below support level. New value aligned with nearest valid support.',
        modelId: 'smc-analysis',
        status: 'applied',
        impact: 'critical'
      }

      setCorrections(prev => [newCorrection, ...prev])
      setCurrentStage('training')
      setCurrentTask('Training neural models with latest data')
      setProgress(82)
      setIsAutoCorrectRunning(false)

      // Adicionar log de conclusão da correção
      generateManualLog(
        'success',
        'Auto-correction process completed',
        'Found and fixed 1 critical issue in SMC stop loss values',
        'auto-correction'
      );
    }, 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
            <RiBrainLine className="w-5 h-5 text-[#8B5CF6] animate-pulse" />
          </div>
          <div>
            <Title className="text-white text-xl">Neural Learning System</Title>
            <Text className="text-xs text-gray-400">
              Real-time learning in progress • Last update: {formatDate(neuralSystemMetrics.lastFullTraining)}
            </Text>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6]/20 to-indigo-500/20 border border-[#8B5CF6]/30 text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
          Live Learning
        </div>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'progress' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
          onClick={() => setActiveTab('progress')}
        >
          <div className="flex items-center">
            <RiPulseLine className="mr-1.5" />
            Learning Progress
          </div>
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'logs' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'} relative`}
          onClick={() => {
            setActiveTab('logs');
            setNewLogCount(0);
          }}
        >
          <div className="flex items-center">
            <RiTerminalBoxLine className="mr-1.5" />
            Real-time Logs
          </div>
          {newLogCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">
              {newLogCount > 9 ? '9+' : newLogCount}
            </div>
          )}
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'metrics' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
          onClick={() => setActiveTab('metrics')}
        >
          <div className="flex items-center">
            <RiLineChartLine className="mr-1.5" />
            System Metrics
          </div>
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium ${activeTab === 'corrections' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
          onClick={() => setActiveTab('corrections')}
        >
          <div className="flex items-center">
            <RiRobot2Line className="mr-1.5" />
            Auto-Corrections
          </div>
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <Text className="text-xs text-gray-400">Overall Learning Progress</Text>
          <Text className="text-xs text-[#8B5CF6]">{progress}%</Text>
        </div>
        <ProgressBar value={progress} color="indigo" className="h-1.5" />
      </div>

      <div className="space-y-4">
        {activeTab === 'progress' && (
          <>
            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <div className="flex items-center justify-between mb-3">
                <Text className="text-white font-medium">{currentTask}</Text>
                <div className="flex items-center text-xs text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
                  <Text>Active</Text>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {learningStages.map(stage => (
                  <div key={stage} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Text className="text-xs text-gray-400 capitalize">{stage.replace('_', ' ')}</Text>
                      <Text className="text-xs text-white">{stageProgress[stage]}%</Text>
                    </div>
                    <ProgressBar
                      value={stageProgress[stage]}
                      color={currentStage === stage ? "indigo" : "slate"}
                      className="h-1"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400 mb-1">Tasks Completed</Text>
                  <div className="flex items-end">
                    <Metric className="text-white text-lg">{completedTasks}</Metric>
                    <Text className="text-xs text-gray-400 ml-1 mb-0.5">/ {totalTasks}</Text>
                  </div>
                </div>

                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400 mb-1">Estimated Completion</Text>
                  <div className="flex items-center">
                    <RiTimeLine className="text-[#8B5CF6] mr-1" />
                    <Text className="text-white text-sm">~{Math.ceil((totalTasks - completedTasks) * 2.5)} min</Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <Text className="text-white font-medium mb-3">Learning Progress History</Text>
              <AreaChart
                className="h-40"
                data={learningProgressHistory}
                index="date"
                categories={["progress", "accuracy"]}
                colors={["indigo", "emerald"]}
                showAnimation
                showLegend
                showGridLines={false}
                valueFormatter={(value) => `${value}%`}
              />
              <div className="mt-2 text-xs text-gray-400 flex justify-between">
                <span>Data points: {neuralSystemMetrics.dataPoints.toLocaleString()}</span>
                <span>Models: {neuralSystemMetrics.modelsCount}</span>
              </div>
            </div>

            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <div className="flex items-center mb-2">
                <RiCloudLine className="w-4 h-4 text-[#8B5CF6] mr-2" />
                <Text className="text-white font-medium">Cloud Sync Status</Text>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${neuralSystemMetrics.cloudSyncStatus === 'Synced' ? 'bg-emerald-400' : 'bg-amber-400'} mr-2`}></div>
                  <Text className={`text-sm ${neuralSystemMetrics.cloudSyncStatus === 'Synced' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {neuralSystemMetrics.cloudSyncStatus}
                  </Text>
                </div>
                <Text className="text-xs text-gray-400">Last sync: {formatDate(neuralSystemMetrics.lastCloudSync)}</Text>
              </div>
              <Text className="text-xs text-gray-400 mt-2">
                Neural learning continues 24/7 via Degoo cloud storage integration, even when your device is offline.
              </Text>
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <>
            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <RiTerminalBoxLine className="text-[#8B5CF6] mr-2" />
                  <Text className="text-white font-medium">Real-time Learning Logs</Text>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="flex items-center px-2 py-1 rounded text-xs bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30"
                    onClick={() => setLogs(prev => prev.filter(log => !log.isNew))}
                  >
                    <RiFilterLine className="mr-1" />
                    <span>Filter</span>
                  </button>
                  <button
                    className="flex items-center px-2 py-1 rounded text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                    onClick={() => setLogs([])}
                  >
                    <RiCloseCircleLine className="mr-1" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`bg-[#8B5CF6]/20 p-3 rounded-lg transition-all duration-300 ${
                      log.isNew ? 'border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        {log.level === 'info' && <RiInformationLine className="w-4 h-4 text-blue-400 mr-2" />}
                        {log.level === 'success' && <RiCheckLine className="w-4 h-4 text-emerald-400 mr-2" />}
                        {log.level === 'warning' && <RiErrorWarningLine className="w-4 h-4 text-amber-400 mr-2" />}
                        {log.level === 'error' && <RiCloseCircleLine className="w-4 h-4 text-rose-400 mr-2" />}
                        <Text className="text-white text-sm font-medium">{log.message}</Text>
                      </div>
                      <div className="flex items-center">
                        <Text className="text-xs text-gray-400">{formatDate(log.timestamp)}</Text>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className={`px-2 py-0.5 rounded text-xs mr-2 ${
                          log.level === 'info' ? 'bg-blue-500/20 text-blue-300' :
                          log.level === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.level === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {log.level}
                        </div>
                        <div className="px-2 py-0.5 rounded text-xs bg-[#8B5CF6]/30 text-[#8B5CF6]">
                          {log.model}
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded text-xs bg-slate-700/50 text-gray-300">
                        {log.stage.replace('_', ' ')}
                      </div>
                    </div>

                    {log.details && (
                      <Text className="text-xs text-gray-300 mt-1 bg-slate-800/50 p-2 rounded">
                        {log.details}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20 mt-4">
              <div className="flex justify-between items-center mb-2">
                <Text className="text-white font-medium">Log Statistics</Text>
                <div className="flex items-center text-xs text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
                  <Text>Active Logging</Text>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                  <Text className="text-xs text-gray-400">Info</Text>
                  <div className="flex items-center">
                    <Text className="text-blue-300 font-medium">{logs.filter(log => log.level === 'info').length}</Text>
                    {logs.some(log => log.level === 'info' && log.isNew) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-1.5 animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                  <Text className="text-xs text-gray-400">Success</Text>
                  <div className="flex items-center">
                    <Text className="text-emerald-300 font-medium">{logs.filter(log => log.level === 'success').length}</Text>
                    {logs.some(log => log.level === 'success' && log.isNew) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5 animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30">
                  <Text className="text-xs text-gray-400">Warning</Text>
                  <div className="flex items-center">
                    <Text className="text-amber-300 font-medium">{logs.filter(log => log.level === 'warning').length}</Text>
                    {logs.some(log => log.level === 'warning' && log.isNew) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1.5 animate-pulse"></div>
                    )}
                  </div>
                </div>
                <div className="bg-rose-500/20 p-2 rounded-lg border border-rose-500/30">
                  <Text className="text-xs text-gray-400">Error</Text>
                  <div className="flex items-center">
                    <Text className="text-rose-300 font-medium">{logs.filter(log => log.level === 'error').length}</Text>
                    {logs.some(log => log.level === 'error' && log.isNew) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 ml-1.5 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
                <span>Total logs: {logs.length}</span>
                <span>Last activity: {logs.length > 0 ? formatDate(logs[0].timestamp) : 'N/A'}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'metrics' && (
          <>
            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <Text className="text-white font-medium mb-3">Neural System Performance</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Accuracy</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.accuracy}%</Metric>
                  <div className="w-full bg-slate-800/50 h-1.5 mt-2 rounded-full">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-indigo-500"
                         style={{ width: `${neuralSystemMetrics.accuracy}%` }}>
                    </div>
                  </div>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Precision</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.precision}%</Metric>
                  <div className="w-full bg-slate-800/50 h-1.5 mt-2 rounded-full">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-indigo-500"
                         style={{ width: `${neuralSystemMetrics.precision}%` }}>
                    </div>
                  </div>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Recall</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.recall}%</Metric>
                  <div className="w-full bg-slate-800/50 h-1.5 mt-2 rounded-full">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-indigo-500"
                         style={{ width: `${neuralSystemMetrics.recall}%` }}>
                    </div>
                  </div>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">F1 Score</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.f1Score}%</Metric>
                  <div className="w-full bg-slate-800/50 h-1.5 mt-2 rounded-full">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-indigo-500"
                         style={{ width: `${neuralSystemMetrics.f1Score}%` }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <Text className="text-white font-medium mb-3">Advanced Metrics</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Prediction Success</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.predictionSuccess}%</Metric>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Anomaly Detection</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.anomalyDetection}%</Metric>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Data Points</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.dataPoints.toLocaleString()}</Metric>
                </div>
                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-xs text-gray-400">Active Models</Text>
                  <Metric className="text-white text-lg">{neuralSystemMetrics.modelsCount}</Metric>
                </div>
              </div>
            </div>

            <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
              <Text className="text-white font-medium mb-2">System Activity</Text>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-[#8B5CF6]/20 rounded-lg">
                  <div className="flex items-center">
                    <RiDatabase2Line className="text-[#8B5CF6] mr-2" />
                    <Text className="text-sm text-white">Last Full Training</Text>
                  </div>
                  <Text className="text-xs text-gray-400">{formatDate(neuralSystemMetrics.lastFullTraining)}</Text>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#8B5CF6]/20 rounded-lg">
                  <div className="flex items-center">
                    <RiCloudLine className="text-[#8B5CF6] mr-2" />
                    <Text className="text-sm text-white">Last Cloud Sync</Text>
                  </div>
                  <Text className="text-xs text-gray-400">{formatDate(neuralSystemMetrics.lastCloudSync)}</Text>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'corrections' && (
          <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <RiRobot2Line className="text-[#8B5CF6] mr-2" />
                <Text className="text-white font-medium">Autonomous Corrections</Text>
              </div>
              <div className="flex items-center text-xs text-[#8B5CF6]">
                <RiCheckboxCircleLine className="mr-1" />
                <Text className="text-[#8B5CF6]">{corrections.length} corrections applied</Text>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {corrections.map((correction) => (
                <div key={correction.id} className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        correction.impact === 'critical' ? 'bg-rose-400' :
                        correction.impact === 'high' ? 'bg-amber-400' :
                        'bg-emerald-400'
                      } mr-2`}></div>
                      <Text className="text-white text-sm font-medium">{correction.dataType} {correction.field}</Text>
                    </div>
                    <div className="flex items-center">
                      <Text className="text-xs text-gray-400 mr-2">{formatDate(correction.timestamp)}</Text>
                      <div className={`px-1.5 py-0.5 rounded text-xs ${
                        correction.confidence > 90 ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {correction.confidence}%
                      </div>
                    </div>
                  </div>

                  <Text className="text-xs text-gray-300 mb-2">{correction.explanation}</Text>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-500/20 p-2 rounded">
                      <Text className="text-gray-400">Old Value:</Text>
                      <Text className="text-red-300 font-medium">{correction.oldValue}</Text>
                    </div>
                    <div className="bg-emerald-500/20 p-2 rounded">
                      <Text className="text-gray-400">New Value:</Text>
                      <Text className="text-emerald-300 font-medium">{correction.newValue}</Text>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                    <span>Source: {correction.source}</span>
                    <span>Model: {correction.modelId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
              isAutoCorrectRunning
                ? 'bg-amber-500/20 text-amber-300 opacity-50 cursor-not-allowed'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            }`}
            onClick={runAutoCorrection}
            disabled={isAutoCorrectRunning}
          >
            {isAutoCorrectRunning ? (
              <>
                <RiRefreshLine className="mr-1.5 animate-spin" />
                Running Correction...
              </>
            ) : (
              <>
                <RiAlertLine className="mr-1.5" />
                Run Auto-Correction
              </>
            )}
          </button>

          <button
            className="flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30"
            onClick={() => {
              setProgress(Math.floor(Math.random() * 30) + 70)
              setCompletedTasks(Math.floor(Math.random() * 5) + 15)
            }}
          >
            <RiRefreshLine className="mr-1.5" />
            Refresh Status
          </button>
        </div>
      </div>
    </Card>
  )
}
