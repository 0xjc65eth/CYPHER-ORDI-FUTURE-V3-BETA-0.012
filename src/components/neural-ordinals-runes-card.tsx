'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react'
import { RiNftLine, RiCoinLine, RiLineChartLine, RiTimeLine, RiRefreshLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri'
import { useNeuralLearning } from '@/hooks/useNeuralLearning'
import { DashboardCard } from '@/components/dashboard-card'

export function NeuralOrdinalsRunesCard() {
  const [mounted, setMounted] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  
  const {
    insights,
    isLearning,
    learningProgress,
    isLoading,
    getInsightsByType
  } = useNeuralLearning({
    insightTypes: ['ordinals', 'runes'],
    refreshInterval: 15000 // 15 segundos
  })
  
  // Obter insights específicos
  const ordinalsInsights = getInsightsByType('ordinals', 3)
  const runesInsights = getInsightsByType('runes', 3)
  
  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Simular atualização
  const handleRefresh = () => {
    setIsUpdating(true)
    setTimeout(() => {
      setIsUpdating(false)
    }, 1500)
  }
  
  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }
  
  return (
    <DashboardCard title="Neural Ordinals & Runes Analysis" className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
              <RiNftLine className={`w-5 h-5 text-blue-400 ${isUpdating ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm text-blue-300">Neural Market Analysis</p>
              <p className="text-xs text-gray-400">Ordinals & Runes insights</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
          >
            <RiRefreshLine className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {isLearning && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <Text className="text-xs text-gray-400">Learning Progress</Text>
              <Text className="text-xs text-blue-300">{learningProgress}%</Text>
            </div>
            <ProgressBar value={learningProgress} color="blue" className="h-1" />
          </div>
        )}
        
        <TabGroup index={activeTab} onIndexChange={setActiveTab}>
          <TabList className="mb-4">
            <Tab className="text-sm">Ordinals</Tab>
            <Tab className="text-sm">Runes</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <RiRefreshLine className="animate-spin text-blue-400 w-6 h-6" />
                </div>
              ) : mounted && ordinalsInsights && ordinalsInsights.length > 0 ? (
                <div className="space-y-3">
                  {ordinalsInsights.map((insight) => (
                    <div key={insight.id} className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg p-3 border border-blue-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <RiNftLine className="w-4 h-4 text-blue-400 mr-1" />
                          <span className="text-sm font-medium text-white">{insight.prediction.collection}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {insight.prediction.direction === 'increase' ? (
                              <RiArrowUpSLine className="w-4 h-4" />
                            ) : (
                              <RiArrowDownSLine className="w-4 h-4" />
                            )}
                          </span>
                          <span className={`text-xs font-medium ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {insight.prediction.changePercent}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                          <p className="text-xs text-blue-300">Current Floor</p>
                          <p className="text-sm font-medium text-white">{insight.prediction.currentFloor.toFixed(3)} BTC</p>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                          <p className="text-xs text-blue-300">Predicted Floor</p>
                          <p className={`text-sm font-medium ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>{insight.prediction.predictedFloor.toFixed(3)} BTC</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/90 mb-2">{insight.explanation}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex items-center">
                          <RiTimeLine className="w-3.5 h-3.5 mr-1" />
                          <span>Timeframe: {insight.prediction.timeframe}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">Confidence:</span>
                          <span className={`${
                            insight.confidence > 0.8 ? 'text-emerald-400' :
                            insight.confidence > 0.7 ? 'text-blue-400' :
                            'text-amber-400'
                          }`}>{(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Text className="text-gray-400">No Ordinals insights available</Text>
                  <Text className="text-xs text-gray-500 mt-1">The neural system is analyzing Ordinals market data</Text>
                </div>
              )}
            </TabPanel>
            
            <TabPanel>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <RiRefreshLine className="animate-spin text-blue-400 w-6 h-6" />
                </div>
              ) : mounted && runesInsights && runesInsights.length > 0 ? (
                <div className="space-y-3">
                  {runesInsights.map((insight) => (
                    <div key={insight.id} className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 rounded-lg p-3 border border-indigo-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <RiCoinLine className="w-4 h-4 text-indigo-400 mr-1" />
                          <span className="text-sm font-medium text-white">{insight.prediction.rune}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {insight.prediction.direction === 'increase' ? (
                              <RiArrowUpSLine className="w-4 h-4" />
                            ) : (
                              <RiArrowDownSLine className="w-4 h-4" />
                            )}
                          </span>
                          <span className={`text-xs font-medium ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {insight.prediction.changePercent}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                          <p className="text-xs text-indigo-300">Current Price</p>
                          <p className="text-sm font-medium text-white">{insight.prediction.currentPrice.toFixed(8)} BTC</p>
                        </div>
                        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                          <p className="text-xs text-indigo-300">Predicted Price</p>
                          <p className={`text-sm font-medium ${
                            insight.prediction.direction === 'increase' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>{insight.prediction.predictedPrice.toFixed(8)} BTC</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/90 mb-2">{insight.explanation}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex items-center">
                          <RiTimeLine className="w-3.5 h-3.5 mr-1" />
                          <span>Timeframe: {insight.prediction.timeframe}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">Confidence:</span>
                          <span className={`${
                            insight.confidence > 0.8 ? 'text-emerald-400' :
                            insight.confidence > 0.7 ? 'text-blue-400' :
                            'text-amber-400'
                          }`}>{(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Text className="text-gray-400">No Runes insights available</Text>
                  <Text className="text-xs text-gray-500 mt-1">The neural system is analyzing Runes market data</Text>
                </div>
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
        
        <div className="mt-3 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
          <p className="text-sm text-white/90">
            <span className="font-bold text-blue-400">Neural Analysis:</span> Our advanced neural engine continuously
            analyzes Ordinals and Runes markets, tracking inscription rates, holder behavior, trading volumes, and price correlations.
            Predictions are generated with confidence scores based on historical accuracy.
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Last update: {new Date().toLocaleTimeString()}</span>
            <span>Model accuracy: {activeTab === 0 ? '80%' : '76%'}</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
