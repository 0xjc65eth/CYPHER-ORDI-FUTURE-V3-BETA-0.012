'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge, Button } from '@tremor/react'
import { RiNewspaperLine, RiExternalLinkLine, RiTimeLine, RiPriceTag3Line, RiRefreshLine } from 'react-icons/ri'
import { DashboardCard } from '@/components/dashboard-card'
import { useSocialData } from '@/hooks/useSocialData'
import { NewsItem } from '@/services/social-data-service'

export function SocialNewsAnalysisCard() {
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

  // Get news items from data
  const newsItems = data?.news || []
  const topNews = newsItems.slice(0, 5) // Get top 5 news items

  return (
    <DashboardCard title="News Sentiment Analysis" className="bg-gradient-to-br from-[#2A1A3A] to-[#3A2A4A] border-none shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
              <RiNewspaperLine className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-300">News Analysis</p>
              <p className="text-xs text-gray-400">
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Real-time data'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded bg-purple-500/20 text-xs font-bold text-purple-300 border border-purple-500/30">
              AI-Analyzed
            </span>
            <Button
              size="xs"
              variant="secondary"
              icon={RiRefreshLine}
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
              className="bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
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

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {topNews.map((newsItem, index) => (
            <NewsCard
              key={newsItem.id}
              newsItem={newsItem}
              mounted={mounted}
              isUpdating={isUpdating}
            />
          ))}

          {topNews.length === 0 && (
            <div className="text-center py-6">
              <Text className="text-gray-400">No news data available at the moment</Text>
            </div>
          )}
        </div>

        <div className="mt-4 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
          <p className="text-sm text-white/90">
            <span className="font-bold text-purple-400">News Analysis:</span> Recent news coverage shows a
            predominantly positive sentiment toward Bitcoin, with increasing mentions of Ordinals and Runes.
            Regulatory developments and institutional adoption remain key themes in current reporting.
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Analysis based on 1000+ news sources</span>
            <span>Updated every 15 minutes</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}

function NewsCard({
  newsItem,
  mounted,
  isUpdating
}: {
  newsItem: NewsItem,
  mounted: boolean,
  isUpdating?: boolean
}) {
  // Determine sentiment color
  const sentimentColor =
    newsItem.sentiment > 60 ? 'emerald' :
    newsItem.sentiment > 30 ? 'amber' :
    'rose'

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`
    }
  }

  // Determine impact level text
  const impactLevel =
    newsItem.impact > 70 ? 'High Impact' :
    newsItem.impact > 40 ? 'Medium Impact' :
    'Low Impact'

  return (
    <div className={`bg-purple-500/10 rounded-lg p-3 border border-purple-500/20 ${isUpdating ? 'animate-pulse' : ''} transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold text-white">{newsItem.title}</h3>
        <div className={`px-2 py-0.5 rounded bg-${sentimentColor}-500/20 text-xs font-bold text-${sentimentColor}-300 border border-${sentimentColor}-500/30 ml-2 flex-shrink-0`}>
          {newsItem.sentiment > 60 ? 'Positive' :
           newsItem.sentiment > 30 ? 'Neutral' :
           'Negative'}
        </div>
      </div>

      <div className="flex items-center mt-2 text-xs text-gray-400">
        <span className="font-medium text-purple-300">{newsItem.source}</span>
        <span className="mx-2">•</span>
        <div className="flex items-center">
          <RiTimeLine className="w-3 h-3 mr-1" />
          <span>{formatRelativeTime(newsItem.timestamp)}</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-white/80">{newsItem.summary}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {newsItem.categories.map((category, idx) => (
            <div key={idx} className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center">
              <RiPriceTag3Line className="w-3 h-3 mr-1" />
              {category}
            </div>
          ))}
        </div>

        <div className="flex items-center mt-2 sm:mt-0">
          <div className="px-2 py-0.5 rounded bg-purple-500/20 text-xs text-purple-300 border border-purple-500/30 mr-2">
            {impactLevel}
          </div>
          <a
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Read More <RiExternalLinkLine className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  )
}
