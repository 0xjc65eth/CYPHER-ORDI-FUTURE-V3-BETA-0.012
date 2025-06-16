'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar, DonutChart } from '@tremor/react'
import { RiEmotionLine, RiTimeLine, RiTwitterLine, RiRedditLine, RiGlobalLine, RiNewspaperLine } from 'react-icons/ri'

export function MarketSentimentCard() {
  const [mounted, setMounted] = useState(false)
  
  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for market sentiment
  const sentimentData = {
    overall: 72, // 0-100 scale
    sources: [
      { name: 'Social Media', value: 68, icon: RiTwitterLine },
      { name: 'News', value: 74, icon: RiNewspaperLine },
      { name: 'Reddit', value: 65, icon: RiRedditLine },
      { name: 'Trading Forums', value: 81, icon: RiGlobalLine },
    ],
    emotions: [
      { name: 'Greed', value: 65 },
      { name: 'Fear', value: 20 },
      { name: 'Neutral', value: 15 },
    ],
    keywords: [
      { word: 'bullish', count: 1250, sentiment: 'positive' },
      { word: 'bearish', count: 450, sentiment: 'negative' },
      { word: 'rally', count: 980, sentiment: 'positive' },
      { word: 'dump', count: 320, sentiment: 'negative' },
      { word: 'moon', count: 780, sentiment: 'positive' },
      { word: 'crash', count: 290, sentiment: 'negative' },
      { word: 'hodl', count: 1100, sentiment: 'positive' },
      { word: 'sell', count: 520, sentiment: 'negative' },
    ],
    timeUpdated: new Date().toISOString()
  }

  // Get sentiment category based on score
  const getSentimentCategory = (score: number) => {
    if (score >= 80) return { text: 'Extreme Greed', color: 'emerald' }
    if (score >= 65) return { text: 'Greed', color: 'emerald' }
    if (score >= 55) return { text: 'Optimism', color: 'emerald' }
    if (score >= 45) return { text: 'Neutral', color: 'blue' }
    if (score >= 35) return { text: 'Caution', color: 'amber' }
    if (score >= 20) return { text: 'Fear', color: 'rose' }
    return { text: 'Extreme Fear', color: 'rose' }
  }

  const sentimentCategory = getSentimentCategory(sentimentData.overall)

  // Sort keywords by count
  const sortedKeywords = [...sentimentData.keywords].sort((a, b) => b.count - a.count)

  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#2A2A3A] to-[#3A3A4A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
            <RiEmotionLine className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Market Sentiment</Title>
            <Text className="text-xs text-gray-400">
              Aggregated from social media, news, and forums
            </Text>
          </div>
        </div>
        <div className="flex items-center">
          <RiTimeLine className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs text-gray-400">Updated: {new Date(sentimentData.timeUpdated).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="mb-2">
            <Text className="text-sm text-gray-400">Overall Sentiment</Text>
            <div className="flex items-center">
              <Text className="text-2xl font-bold text-white">{sentimentData.overall}/100</Text>
              <Text className={`ml-2 text-sm font-medium text-${sentimentCategory.color}-400`}>
                {sentimentCategory.text}
              </Text>
            </div>
          </div>
          
          <ProgressBar 
            value={sentimentData.overall} 
            color={sentimentCategory.color as any} 
            className="mt-1" 
          />
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sentimentData.sources.map((source, index) => (
              <div key={index} className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
                <div className="flex items-center mb-1">
                  <source.icon className="w-3 h-3 text-purple-400 mr-1" />
                  <Text className="text-xs text-gray-300">{source.name}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-bold text-white">{source.value}/100</Text>
                  <Text className={`text-xs text-${getSentimentCategory(source.value).color}-400`}>
                    {getSentimentCategory(source.value).text}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Text className="text-sm text-gray-400 mb-2">Emotion Distribution</Text>
          <DonutChart
            data={sentimentData.emotions}
            category="value"
            index="name"
            colors={["emerald", "rose", "blue"]}
            showAnimation={true}
            showTooltip={true}
            showLabel={false}
            className="h-40"
          />
        </div>
      </div>

      <div className="mt-4">
        <Text className="text-sm text-gray-400 mb-2">Trending Keywords</Text>
        <div className="flex flex-wrap gap-2">
          {sortedKeywords.map((keyword, index) => (
            <div 
              key={index} 
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                keyword.sentiment === 'positive' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              #{keyword.word} ({keyword.count})
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
