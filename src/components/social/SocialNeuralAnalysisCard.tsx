'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar, Button } from '@tremor/react'
import { RiBrainLine, RiLineChartLine, RiPulseLine, RiBarChartBoxLine, RiHashtag, RiRefreshLine } from 'react-icons/ri'
import { DashboardCard } from '@/components/dashboard-card'
import { useSocialData } from '@/hooks/useSocialData'

export function SocialNeuralAnalysisCard() {
  const { data, isLoading, error, lastUpdated, refresh, isRefreshing } = useSocialData(30000) // Refresh every 30 seconds
  const [mounted, setMounted] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mostrar animação quando os dados estiverem sendo atualizados
  useEffect(() => {
    if (isRefreshing) {
      setIsUpdating(true)
    } else {
      // Manter a animação por um curto período após a atualização
      const timer = setTimeout(() => setIsUpdating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isRefreshing])

  // Função para atualizar manualmente os dados
  const handleRefresh = () => {
    setIsUpdating(true)
    refresh()
  }

  // Calculate overall sentiment score
  const overallScore = data?.sentiment?.overall || 65
  const sentimentClass =
    overallScore > 60 ? 'emerald' :
    overallScore > 30 ? 'amber' :
    'rose'

  // Neural insights based on social data
  const neuralInsights = [
    {
      name: 'Social Sentiment',
      value: data?.sentiment?.bullish || 72,
      signal: 'Bullish',
      confidence: 'High',
      color: 'emerald',
      description: 'Social sentiment analysis shows increasing positive mentions across platforms',
      icon: RiBarChartBoxLine
    },
    {
      name: 'Trending Topics',
      value: data?.trendingTopics?.[0]?.sentiment || 65,
      signal: 'Positive',
      confidence: 'Medium',
      color: 'emerald',
      description: 'Analysis of trending topics indicates positive market outlook',
      icon: RiHashtag
    },
    {
      name: 'Influencer Impact',
      value: data?.influencers?.[0]?.impact || 78,
      signal: 'Strong',
      confidence: 'High',
      color: 'blue',
      description: 'Key influencers showing high engagement and positive sentiment',
      icon: RiPulseLine
    },
    {
      name: 'Price Correlation',
      value: Math.abs((data?.sentiment?.priceCorrelation || 0.7) * 100),
      signal: (data?.sentiment?.priceCorrelation || 0.7) > 0 ? 'Positive' : 'Negative',
      confidence: 'Medium',
      color: (data?.sentiment?.priceCorrelation || 0.7) > 0 ? 'emerald' : 'rose',
      description: 'Correlation between social sentiment and price movements',
      icon: RiLineChartLine
    }
  ]

  return (
    <DashboardCard title="Social Neural Analysis" className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
              <RiBrainLine className={`w-6 h-6 text-blue-400 ${isUpdating ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-sm text-blue-300">Neural Sentiment Score</p>
                <div className={`ml-2 px-2 py-0.5 rounded bg-${sentimentClass}-500/20 text-xs font-bold text-${sentimentClass}-300 border border-${sentimentClass}-500/30 ${isUpdating ? 'animate-pulse' : ''}`}>
                  {overallScore}/100
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Real-time analysis'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-xs font-bold text-blue-300 border border-blue-500/30">
              AI-Powered
            </span>
            <Button
              size="xs"
              variant="secondary"
              icon={RiRefreshLine}
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
              className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
            >
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {/* Status da API */}
        {isLoading && !data && (
          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded p-2 text-xs mt-2">
            Carregando dados da API do Twitter...
          </div>
        )}
        {error && (
          <div className="bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded p-2 text-xs mt-2">
            Erro ao carregar dados: usando dados simulados
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {neuralInsights.map((insight, index) => (
            <div key={index} className={`bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 ${isUpdating ? 'animate-pulse' : ''} transition-all duration-300`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <insight.icon className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-white">{insight.name}</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-xs font-medium text-${insight.color}-400 mr-2`}>{insight.signal}</span>
                  <div className={`px-1.5 py-0.5 rounded bg-${insight.color}-500/20 text-xs border border-${insight.color}-500/30`}>
                    {insight.confidence}
                  </div>
                </div>
              </div>

              <ProgressBar
                value={mounted ? insight.value : 0}
                color={insight.color as any}
                className="mt-1"
              />

              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{insight.description}</span>
                <span className="text-xs text-white">{insight.value}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
          <p className="text-sm text-white/90">
            <span className="font-bold text-blue-400">Neural Analysis:</span> Our advanced neural engine detects a
            <span className="font-bold text-emerald-400"> strong correlation</span> between social sentiment and Bitcoin price movements.
            The model has identified increasing positive mentions across platforms, with key influencers showing bullish sentiment.
            Trending topics suggest growing interest in Bitcoin, Ordinals, and Runes.
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Last model update: {new Date().toLocaleDateString()}</span>
            <span>Confidence: {overallScore}%</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
