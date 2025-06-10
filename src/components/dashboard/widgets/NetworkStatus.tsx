'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { StatusIndicator, ProgressBar, DashboardColors } from '@/components/dashboard/professional/DashboardEnhancements';
import { DashboardIcons } from '@/lib/icons/icon-system';
import { useMempoolData } from '@/hooks/useMempoolData';
import { useNetworkHealth } from '@/hooks/analytics/useNetworkHealth';
import { Database, Gauge, Network } from 'lucide-react';

export function NetworkStatus() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: mempool } = useMempoolData();
  const { data: networkHealth } = useNetworkHealth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const metrics = [
    {
      label: 'Block Height',
      value: mempool?.blockHeight?.toLocaleString() || '821,435',
      icon: DashboardIcons.blockchain.icon,
      color: DashboardColors.primary
    },
    {
      label: 'Mempool Size',
      value: `${mempool?.size || 142} MB`,
      progress: (mempool?.size || 142) / 300,
      color: DashboardColors.warning
    },
    {
      label: 'Hash Rate',
      value: `${networkHealth?.networkCapacity || 525.8} EH/s`,
      change: 5.2,
      color: DashboardColors.success
    },
    {
      label: 'Difficulty',
      value: mempool?.difficulty || '72.01T',
      change: 3.1,
      color: DashboardColors.info
    }
  ];

  if (!isMounted) {
    return (
      <Card className="bg-gray-900 border-gray-800 p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white flex items-center">
            <Network className="w-4 h-4 mr-1.5 text-blue-500" />
            Network Status
          </h4>
        </div>
        <div className="h-32 bg-gray-800/50 rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 p-4 hover:bg-gray-900/70 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <DashboardIcons.networkStatus.icon 
            className="w-4 h-4 mr-2" 
            style={{ color: DashboardIcons.networkStatus.color }} 
          />
          Network Status
        </h3>
        <StatusIndicator status="online" />
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {metric.icon && React.createElement(metric.icon, { 
                  className: "w-4 h-4", 
                  style: { color: metric.color } 
                })}
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">{metric.value}</span>
                {metric.change !== undefined && (
                  <span className={`text-xs ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
            </div>
            {metric.progress !== undefined && (
              <ProgressBar 
                value={metric.progress * 100} 
                color={metric.color}
                showPercentage={false}
                className="mt-1"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Next Block</span>
          <span className="text-gray-400 font-mono">~9:42</span>
        </div>
      </div>
    </Card>
  );
}