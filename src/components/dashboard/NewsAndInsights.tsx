'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, TrendingUp, Sparkles, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { useBitcoinNews } from '@/hooks/useBitcoinNews';
import { useOrdinalsActivity } from '@/hooks/useOrdinalsActivity';
import { useHotMints } from '@/hooks/useHotMints';
import { useRareSatsDiscoveries } from '@/hooks/useRareSatsDiscoveries';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  url: string;
  category: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface ActivityItem {
  id: string;
  type: 'sale' | 'mint' | 'discovery' | 'listing';
  title: string;
  description: string;
  timestamp: Date;
  value?: string;
  rarity?: string;
}

export function NewsAndInsights() {
  const { news, loading: newsLoading } = useBitcoinNews();
  const { activity: ordinalsActivity, loading: ordinalsLoading } = useOrdinalsActivity();
  const { mints: hotMints, loading: mintsLoading } = useHotMints();
  const { discoveries: rareSats, loading: rareSatsLoading } = useRareSatsDiscoveries();

  const [activeTab, setActiveTab] = useState<'news' | 'activity'>('news');

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getSentimentColor = (sentiment?: string): string => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500 bg-green-500/10';
      case 'bearish': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'mint': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'discovery': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const combinedActivity = [
    ...ordinalsActivity.map(item => ({ ...item, category: 'ordinals' })),
    ...hotMints.map(mint => ({
      id: mint.id,
      type: 'mint' as const,
      title: `Hot Mint: ${mint.name}`,
      description: `${mint.totalSupply} items • ${mint.mintedCount} minted`,
      timestamp: mint.timestamp,
      value: `${mint.price} BTC`,
      category: 'mints'
    })),
    ...rareSats.map(discovery => ({
      id: discovery.id,
      type: 'discovery' as const,
      title: `Rare Sats Found: ${discovery.type}`,
      description: discovery.description,
      timestamp: discovery.timestamp,
      rarity: discovery.rarity,
      category: 'raresats'
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* News Feed */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-semibold text-white">Bitcoin News</h3>
            </div>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              Live Feed
            </Badge>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {newsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading news...</div>
            ) : (
              news.slice(0, 10).map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-400">{item.source}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{formatTimeAgo(item.timestamp)}</span>
                    {item.sentiment && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                          {item.sentiment}
                        </span>
                      </>
                    )}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-purple-500" />
              <h3 className="text-xl font-semibold text-white">Market Activity</h3>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant="secondary" 
                className="bg-purple-500/10 text-purple-500 cursor-pointer"
                onClick={() => setActiveTab('activity')}
              >
                All
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-orange-500/10 text-orange-500 cursor-pointer"
              >
                Ordinals
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-green-500/10 text-green-500 cursor-pointer"
              >
                Runes
              </Badge>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {ordinalsLoading || mintsLoading || rareSatsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading activity...</div>
            ) : (
              combinedActivity.slice(0, 15).map((item) => (
                <div key={item.id} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getActivityIcon(item.type)}</div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{item.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">{formatTimeAgo(item.timestamp)}</span>
                        {'value' in item && item.value && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-green-400 font-medium">{item.value}</span>
                          </>
                        )}
                        {'rarity' in item && item.rarity && (
                          <>
                            <span className="text-gray-500">•</span>
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
                              {item.rarity}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}