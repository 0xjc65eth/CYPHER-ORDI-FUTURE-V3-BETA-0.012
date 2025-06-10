'use client';

import { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { devLogger } from '@/lib/logger';
import { MessageCircle, TrendingUp, Hash } from 'lucide-react';

export default function SocialPage() {
  const [socialData, setSocialData] = useState({
    sentiment: { overall: 72, bullish: 65, bearish: 25, neutral: 10 },
    trending: ['#Bitcoin', '#BTC', '#HODL', '#Web3', '#Ordinals'],
    recentPosts: [
      {
        id: 1,
        author: 'cryptowhale',
        content: 'Bitcoin looking strong! 📈',
        likes: 1234,
        retweets: 567,
        time: '2h ago',
        avatar: '🐋'
      }
    ],
    socialMetrics: { influencerActivity: 78, mediaAttention: 85 }
  });

  useEffect(() => {
    devLogger.log('SOCIAL', 'Loading social data');
    devLogger.progress('Social Page', 100);
  }, []);

  return (
    <TopNavLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Social Sentiment</h1>
          <p className="text-gray-400">Análise de sentimento do mercado em tempo real</p>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-500">Bullish</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">{socialData.sentiment.bullish}%</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-red-500">Bearish</h3>
              <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />
            </div>
            <div className="text-3xl font-bold text-white">{socialData.sentiment.bearish}%</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-400">Neutral</h3>
              <Hash className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-white">{socialData.sentiment.neutral}%</div>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Trending Topics</h2>
          <div className="flex flex-wrap gap-2">
            {socialData.trending.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}