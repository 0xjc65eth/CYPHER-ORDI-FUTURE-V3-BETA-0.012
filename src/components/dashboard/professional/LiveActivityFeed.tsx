'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Fish, Hash, Coins, Zap, AlertCircle, TrendingUp } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'whale' | 'inscription' | 'rune' | 'market' | 'alert';
  timestamp: Date;
  title: string;
  description: string;
  value?: string;
  txHash?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');

  // Simulate real-time updates
  useEffect(() => {
    const generateActivity = (): ActivityItem => {
      const types = ['whale', 'inscription', 'rune', 'market', 'alert'];
      const type = types[Math.floor(Math.random() * types.length)] as ActivityItem['type'];
      
      const templates = {
        whale: {
          title: 'Whale Movement Detected',
          description: `${(Math.random() * 1000 + 100).toFixed(0)} BTC moved`,
          value: `$${(Math.random() * 50000000 + 5000000).toFixed(0)}`
        },
        inscription: {
          title: 'Large Inscription Minted',
          description: `Inscription #${Math.floor(Math.random() * 1000000 + 50000000)}`,
          value: `${(Math.random() * 10 + 0.1).toFixed(2)} BTC`
        },
        rune: {
          title: 'Rune Activity',
          description: `${Math.floor(Math.random() * 100000)} RUNES minted`,
          value: `Floor: ${(Math.random() * 0.1).toFixed(4)} BTC`
        },
        market: {
          title: 'Market Alert',
          description: 'Significant volume spike detected',
          value: `+${(Math.random() * 100 + 50).toFixed(0)}%`
        },
        alert: {
          title: 'Price Alert Triggered',
          description: `BTC crossed $${Math.floor(Math.random() * 5000 + 60000)}`,
          value: 'Target reached'
        }
      };

      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        timestamp: new Date(),
        ...templates[type],
        txHash: Math.random().toString(36).substr(2, 64),
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };
    };

    // Initial activities
    setActivities(Array.from({ length: 10 }, generateActivity));

    // Add new activity every 3-5 seconds
    const interval = setInterval(() => {
      setActivities(prev => [generateActivity(), ...prev.slice(0, 49)]);
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'whale': return <Fish className="w-4 h-4" />;
      case 'inscription': return <Hash className="w-4 h-4" />;
      case 'rune': return <Coins className="w-4 h-4" />;
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'whale': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'inscription': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'rune': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'market': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'alert': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <Card className="bg-gray-900 border-gray-800 p-4 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Live Activity Feed
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700"
          >
            <option value="all">All Events</option>
            <option value="whale">Whales</option>
            <option value="inscription">Inscriptions</option>
            <option value="rune">Runes</option>
            <option value="market">Market</option>
            <option value="alert">Alerts</option>
          </select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                      {activity.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">HIGH</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                    {activity.txHash && (
                      <p className="text-xs text-gray-600 mt-1 font-mono truncate">
                        {activity.txHash.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {activity.value && (
                    <p className="text-sm font-medium text-white">{activity.value}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Activity Stats */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">Events/min</div>
            <div className="text-sm font-bold text-white">12</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Whales (24h)</div>
            <div className="text-sm font-bold text-blue-500">45</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Alerts</div>
            <div className="text-sm font-bold text-yellow-500">8</div>
          </div>
        </div>
      </div>
    </Card>
  );
}