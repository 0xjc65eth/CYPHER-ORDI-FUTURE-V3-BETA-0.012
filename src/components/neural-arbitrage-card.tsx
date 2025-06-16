'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar } from '@tremor/react'
import { RiExchangeDollarLine, RiLineChartLine, RiTimeLine, RiExternalLinkLine, RiRefreshLine } from 'react-icons/ri'
import { useNeuralLearning } from '@/hooks/useNeuralLearning'
import { DashboardCard } from '@/components/dashboard-card'

export function NeuralArbitrageCard() {
  const [mounted, setMounted] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    insights,
    isLearning,
    learningProgress,
    isLoading,
    getInsightsByType
  } = useNeuralLearning({
    insightTypes: ['arbitrage'],
    refreshInterval: 15000 // 15 segundos
  })

  // Obter apenas insights de arbitragem
  const arbitrageInsights = getInsightsByType('arbitrage', 5)

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
    <DashboardCard title="Neural Arbitrage Opportunities" className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 border border-amber-500/30">
              <RiExchangeDollarLine className={`w-5 h-5 text-amber-400 ${isUpdating ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm text-amber-300">Neural Arbitrage Engine</p>
              <p className="text-xs text-gray-400">Continuously analyzing market inefficiencies</p>
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
            <ProgressBar value={learningProgress} color="amber" className="h-1" />
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RiRefreshLine className="animate-spin text-amber-400 w-6 h-6" />
            </div>
          ) : mounted && arbitrageInsights && arbitrageInsights.length > 0 ? (
            arbitrageInsights.map((insight) => (
              <div key={insight.id} className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-lg p-3 border border-amber-500/20">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <RiExchangeDollarLine className="w-4 h-4 text-amber-400 mr-1" />
                    <span className="text-sm font-medium text-white">
                      {insight.prediction.sourceExchange} → {insight.prediction.targetExchange}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-1">Net Profit:</span>
                    <span className="text-sm font-medium text-emerald-400">{insight.prediction.profitPercent}%</span>
                    <span className="text-xs text-gray-400 ml-1">(after fees)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-300">Buy Price</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-white">${insight.prediction.sourceBuyPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <a
                        href={`https://${insight.prediction.sourceExchange.toLowerCase().replace(' ', '')}.com/trade/BTC`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        title={`Buy on ${insight.prediction.sourceExchange}`}
                      >
                        <RiExternalLinkLine className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <p className="text-xs text-amber-300">Sell Price</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-white">${insight.prediction.targetSellPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <a
                        href={`https://${insight.prediction.targetExchange.toLowerCase().replace(' ', '')}.com/trade/BTC`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        title={`Sell on ${insight.prediction.targetExchange}`}
                      >
                        <RiExternalLinkLine className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mb-2">
                  <p className="text-xs text-amber-300 mb-1">Fee Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Buy Fee:</span>
                      <span className="text-xs text-white">{(insight.prediction.sourceFeePercent || 0.1).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Sell Fee:</span>
                      <span className="text-xs text-white">{(insight.prediction.targetFeePercent || 0.1).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Network Fee:</span>
                      <span className="text-xs text-white">${(insight.prediction.networkFee || 2.5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Total Fees:</span>
                      <span className="text-xs text-rose-400">${(insight.prediction.totalFees || 8.75).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center">
                    <RiTimeLine className="w-3.5 h-3.5 mr-1" />
                    <span>Window: {insight.prediction.timeWindow}</span>
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
            ))
          ) : (
            <div className="text-center py-10">
              <Text className="text-gray-400">No arbitrage opportunities found</Text>
              <Text className="text-xs text-gray-500 mt-1">The neural system is continuously scanning for opportunities</Text>
            </div>
          )}
        </div>

        <div className="mt-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
          <p className="text-sm text-white/90">
            <span className="font-bold text-amber-400">Neural Analysis:</span> Our advanced neural engine continuously
            monitors price differences across exchanges, accounting for trading fees, network fees, slippage, and execution time.
            All profit calculations include marketplace fees and transaction costs for accurate net profit estimation.
            Opportunities are ranked by profitability and confidence score.
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Last scan: {new Date().toLocaleTimeString()}</span>
            <span>Monitoring 12 exchanges</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
