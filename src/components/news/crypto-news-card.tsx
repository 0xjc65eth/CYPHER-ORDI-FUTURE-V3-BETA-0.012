'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge } from '@tremor/react'
import { RiNewspaperLine, RiTimeLine, RiArrowRightLine, RiArrowUpSLine, RiArrowDownSLine, RiRefreshLine } from 'react-icons/ri'
import { useCryptoNews } from '@/hooks/useCryptoNews'
import { NewsItem } from '@/app/api/crypto-news/route'

export function CryptoNewsCard() {
  const { news, isLoading, error, lastUpdated, refresh } = useCryptoNews(300000) // Refresh every 5 minutes
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get all unique categories from news
  const allCategories = Array.from(
    new Set(
      news.flatMap(item => item.categories)
    )
  ).sort();

  // Filter news by active category
  const filteredNews = activeCategory
    ? news.filter(item => item.categories.includes(activeCategory))
    : news;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hr ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Return null during SSR to avoid hydration issues
  if (!mounted) return null;

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiNewspaperLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Crypto News</Title>
            <Text className="text-xs text-gray-400">
              {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading...'}
            </Text>
          </div>
        </div>
        <button
          onClick={() => refresh()}
          className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
          disabled={isLoading}
        >
          <RiRefreshLine className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-blue-500/20">
        <Badge
          color={activeCategory === null ? "blue" : "gray"}
          className="cursor-pointer"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Badge>
        {allCategories.map(category => (
          <Badge
            key={category}
            color={activeCategory === category ? "blue" : "gray"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* News items */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {isLoading && news.length === 0 ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-blue-500/10 rounded-lg p-4">
                <div className="h-4 bg-blue-500/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-blue-500/20 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-blue-500/20 rounded w-full mb-1"></div>
                <div className="h-3 bg-blue-500/20 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <Text className="text-rose-400">Error loading news: {error.message}</Text>
            <button
              onClick={() => refresh()}
              className="mt-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-6">
            <Text className="text-gray-400">No news available for this category</Text>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div key={item.id} className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-blue-300 transition-colors"
                >
                  {item.title}
                </a>
                <Badge
                  color={
                    item.sentiment === 'positive' ? 'emerald' :
                    item.sentiment === 'negative' ? 'rose' :
                    'blue'
                  }
                  className="ml-2 whitespace-nowrap"
                >
                  {item.sentiment === 'positive' ? (
                    <div className="flex items-center">
                      <RiArrowUpSLine className="mr-1" />
                      Bullish
                    </div>
                  ) : item.sentiment === 'negative' ? (
                    <div className="flex items-center">
                      <RiArrowDownSLine className="mr-1" />
                      Bearish
                    </div>
                  ) : (
                    'Neutral'
                  )}
                </Badge>
              </div>

              <Text className="text-sm text-gray-300 line-clamp-2 mb-2">
                {item.description}
              </Text>

              <div className="flex justify-between items-center text-xs text-gray-400">
                <div className="flex items-center">
                  <span className="mr-2">{item.source}</span>
                  <span className="flex items-center">
                    <RiTimeLine className="mr-1" />
                    {formatDate(item.publishedAt)}
                  </span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Read more
                  <RiArrowRightLine className="ml-1" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
