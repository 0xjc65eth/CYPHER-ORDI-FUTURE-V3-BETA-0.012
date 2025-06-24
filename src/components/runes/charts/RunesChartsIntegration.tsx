'use client';

import React, { useState, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

import { RunesAdvancedChartsSection } from './RunesAdvancedChartsSection';
import { 
  runesChartsSWRConfig, 
  generateMockPriceData, 
  generateMockVolumeData,
  generateMockDepthData,
  generateMockHoldersData 
} from './swr-config';

interface RunesChartsIntegrationProps {
  runeId?: string;
  useMockData?: boolean;
  className?: string;
}

// Mock API implementation for development/demo
const mockAPIEndpoints = {
  price: generateMockPriceData(),
  volume: generateMockVolumeData(),
  orderbook: { bids: [], asks: [] }, // Will be processed by hooks
  holders: generateMockHoldersData(),
};

// Enhanced fetcher with mock data support
const createFetcher = (useMockData: boolean) => async (url: string) => {
  if (useMockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Parse URL to determine endpoint
    const urlPath = new URL(url, 'http://localhost').pathname;
    const segments = urlPath.split('/');
    const endpoint = segments[segments.length - 1];
    
    // Handle query parameters for orderbook
    if (endpoint === 'orderbook') {
      const depthData = generateMockDepthData();
      const bids = depthData.filter(item => item.bidSize > 0)
        .map(item => ({ price: item.price, size: item.bidSize }));
      const asks = depthData.filter(item => item.askSize > 0)
        .map(item => ({ price: item.price, size: item.askSize }));
      
      return { bids, asks };
    }
    
    // Return mock data based on endpoint
    const mockData = mockAPIEndpoints[endpoint as keyof typeof mockAPIEndpoints];
    if (mockData) {
      return mockData;
    }
    
    throw new Error(`Mock endpoint not found: ${endpoint}`);
  }
  
  // Real API call
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const RunesChartsIntegration: React.FC<RunesChartsIntegrationProps> = ({
  runeId = 'demo-rune-id',
  useMockData = true,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setConnectionStatus(useMockData ? 'connected' : 'connecting');
    }, 1500);

    return () => clearTimeout(timer);
  }, [useMockData]);

  // SWR configuration with mock data support
  const swrConfig = {
    ...runesChartsSWRConfig,
    fetcher: createFetcher(useMockData),
    // Reduce refresh interval for demo mode
    refreshInterval: useMockData ? 10000 : 5000,
  };

  if (!isLoaded) {
    return (
      <div className="min-h-96 bg-black rounded-lg border border-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Activity className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Initializing Advanced Charts</h3>
          <p className="text-gray-400 text-sm">
            Loading Bloomberg Terminal interface...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <SWRConfig value={swrConfig}>
      <div className={`bg-black rounded-lg border border-gray-800 overflow-hidden ${className}`}>
        {/* Status Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-white font-semibold">Runes Advanced Analytics</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">
                    {useMockData ? 'DEMO MODE' : 'LIVE DATA'}
                  </span>
                </>
              )}
              
              {connectionStatus === 'connecting' && (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400 text-xs font-medium">CONNECTING</span>
                </>
              )}
              
              {connectionStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-xs font-medium">CONNECTION ERROR</span>
                </>
              )}
            </div>
          </div>
          
          {useMockData && (
            <div className="mt-2 text-xs text-gray-500">
              Using simulated market data for demonstration. Real-time integration available in production.
            </div>
          )}
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RunesAdvancedChartsSection
            runeId={runeId}
            enableFullscreen={true}
          />
        </motion.div>

        {/* Footer Info */}
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium text-gray-400">Data Sources:</span>
              {useMockData ? ' Simulated Market Data' : ' Real-time APIs, WebSocket Streams'}
            </div>
            <div>
              <span className="font-medium text-gray-400">Update Frequency:</span>
              {useMockData ? ' Every 10 seconds' : ' Every 2-5 seconds'}
            </div>
            <div>
              <span className="font-medium text-gray-400">Last Update:</span>
              {' '}{new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </SWRConfig>
  );
};