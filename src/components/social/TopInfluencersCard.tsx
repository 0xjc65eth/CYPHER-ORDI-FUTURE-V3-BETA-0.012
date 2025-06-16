'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar, Button } from '@tremor/react'
import { RiUserStarLine, RiTwitterLine, RiRedditLine, RiYoutubeLine, RiTelegramLine, RiRefreshLine } from 'react-icons/ri'
import { DashboardCard } from '@/components/dashboard-card'
import { useSocialData } from '@/hooks/useSocialData'
import { InfluencerData } from '@/services/social-data-service'

export function TopInfluencersCard() {
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

  // Get influencers from data and sort by impact
  const influencers = data?.influencers || []
  const topInfluencers = influencers.slice(0, 5) // Get top 5 influencers

  // Platform icons mapping
  const platformIcons = {
    'Twitter': RiTwitterLine,
    'Reddit': RiRedditLine,
    'YouTube': RiYoutubeLine,
    'Telegram': RiTelegramLine,
    // Default to Twitter icon if platform not found
    'default': RiTwitterLine
  }

  return (
    <DashboardCard title="Top Influencers" className="bg-gradient-to-br from-[#1A2A3A] to-[#2A3A4A] border-none shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3 border border-cyan-500/30">
              <RiUserStarLine className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-300">Influence Analysis</p>
              <p className="text-xs text-gray-400">
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Real-time data'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 rounded bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              Impact Score
            </span>
            <Button
              size="xs"
              variant="secondary"
              icon={RiRefreshLine}
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={isRefreshing}
              className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
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

        <div className="space-y-4">
          {topInfluencers.map((influencer, index) => (
            <InfluencerCard
              key={index}
              influencer={influencer}
              rank={index + 1}
              mounted={mounted}
              platformIcons={platformIcons}
              isUpdating={isUpdating}
            />
          ))}

          {topInfluencers.length === 0 && (
            <div className="text-center py-6">
              <Text className="text-gray-400">No influencer data available at the moment</Text>
            </div>
          )}
        </div>

        <div className="mt-4 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-white/90">
            <span className="font-bold text-cyan-400">Influence Analysis:</span> Key influencers are showing
            predominantly positive sentiment toward Bitcoin, with increasing mentions of Ordinals and Runes.
            Their combined reach exceeds 5M followers, with engagement rates above industry average.
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>Analysis based on 100+ top crypto influencers</span>
            <span>Updated hourly</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}

function InfluencerCard({
  influencer,
  rank,
  mounted,
  platformIcons,
  isUpdating
}: {
  influencer: InfluencerData,
  rank: number,
  mounted: boolean,
  platformIcons: Record<string, any>,
  isUpdating?: boolean
}) {
  // Get the appropriate icon for the platform
  const PlatformIcon = platformIcons[influencer.platform] || platformIcons.default

  // Determine sentiment color
  const sentimentColor =
    influencer.sentiment > 60 ? 'emerald' :
    influencer.sentiment > 30 ? 'amber' :
    'rose'

  // Format followers count
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

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

  return (
    <div className={`bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20 ${isUpdating ? 'animate-pulse' : ''} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center font-bold text-lg text-white">
          {rank}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="font-bold text-white">{influencer.name}</span>
                <div className="flex items-center ml-2 text-gray-400">
                  <PlatformIcon className="w-3 h-3 mr-1" />
                  <span className="text-xs">{influencer.handle}</span>
                </div>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span>{formatFollowers(influencer.followers)} followers</span>
                <span className="mx-2">•</span>
                <span>{influencer.engagement}% engagement</span>
              </div>
            </div>

            <div className="px-2 py-0.5 rounded bg-cyan-500/20 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              Impact: {influencer.impact}/100
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Sentiment</span>
              <span className={`text-xs font-medium text-${sentimentColor}-400`}>
                {influencer.sentiment > 60 ? 'Bullish' :
                 influencer.sentiment > 30 ? 'Neutral' :
                 'Bearish'}
              </span>
            </div>
            <ProgressBar
              value={mounted ? influencer.sentiment : 0}
              color={sentimentColor as any}
              className="mt-1"
            />
          </div>

          {influencer.recentPost && (
            <div className="mt-2 text-xs">
              <div className="p-2 rounded bg-gray-800/50 border border-gray-700/50">
                <p className="text-white/90">{influencer.recentPost}</p>
                <p className="text-gray-400 mt-1 text-right">
                  {formatRelativeTime(influencer.postTimestamp)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
