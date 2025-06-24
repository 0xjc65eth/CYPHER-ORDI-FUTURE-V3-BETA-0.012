'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface RunesMarketOverviewCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trendIcon?: LucideIcon;
  subtitle?: string;
  index?: number;
}

export function RunesMarketOverviewCard({
  icon: Icon,
  title,
  value,
  change,
  changeType = 'neutral',
  trendIcon: TrendIcon,
  subtitle,
  index = 0
}: RunesMarketOverviewCardProps) {
  const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIconColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-900/80 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4 hover:bg-gray-900/90 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-orange-400" />
          <span className="text-sm text-gray-400">{title}</span>
        </div>
        {TrendIcon && (
          <TrendIcon className={`w-4 h-4 ${getTrendIconColor(changeType)}`} />
        )}
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">
        {value}
      </div>
      
      {change && (
        <div className={`text-xs mt-1 ${getChangeColor(changeType)}`}>
          {change}
        </div>
      )}
      
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}

export default RunesMarketOverviewCard;