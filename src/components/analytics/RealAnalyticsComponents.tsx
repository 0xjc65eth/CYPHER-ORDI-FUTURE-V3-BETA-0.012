/**
 * 🔥 REAL ANALYTICS COMPONENTS - CYPHER ORDI FUTURE v3.2.0
 * 
 * This file exports all enhanced analytics components that use real data
 * from Hiro APIs and other reliable sources instead of mock/fake data.
 * 
 * Features:
 * - 100% real data from APIs
 * - Accurate market analysis
 * - Real trading metrics
 * - Authentic user statistics
 * - Live transaction data
 * - Real-time network metrics
 */

export { AnalyticsSystem } from './AnalyticsSystem';
export { AnalyticsSystemPro } from './AnalyticsSystemPro';

// New real data components
export { OrdinalsRunesRealMarketCard } from '../ordinals-runes-real-market-card';
export { RealHolderAnalyticsCard } from '../real-holder-analytics-card';
export { RealTransactionActivityCard } from '../real-transaction-activity-card';

// Real data services and hooks
export { realAnalyticsDataService } from '../../services/RealAnalyticsDataService';
export { 
  useRealMarketData,
  useRealNetworkData,
  useRealOrdinalsData,
  useRealRunesData,
  useRealHolderData,
  useRealMiningData,
  useRealAnalyticsData,
  useAnalyticsHealthCheck
} from '../../hooks/useRealAnalyticsData';

// Types
export type {
  RealMarketMetrics,
  RealNetworkMetrics,
  RealOrdinalsMetrics,
  RealRunesMetrics,
  RealHolderStatistics,
  RealMiningMetrics
} from '../../services/RealAnalyticsDataService';

/**
 * Complete Real Analytics Dashboard Component
 * Combines all real data components into a single comprehensive dashboard
 */
'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { AnalyticsSystem } from './AnalyticsSystem';
import { OrdinalsRunesRealMarketCard } from '../ordinals-runes-real-market-card';
import { RealHolderAnalyticsCard } from '../real-holder-analytics-card';
import { RealTransactionActivityCard } from '../real-transaction-activity-card';
import { useAnalyticsHealthCheck } from '../../hooks/useRealAnalyticsData';

export function ComprehensiveRealAnalyticsDashboard() {
  const healthCheck = useAnalyticsHealthCheck();

  return (
    <div className="space-y-8">
      {/* Health Status Banner */}
      {healthCheck.data && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            healthCheck.data.status === 'operational' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                healthCheck.data.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`}></div>
              <span className="font-medium">
                Real Data Analytics: {healthCheck.data.status === 'operational' ? 'All Services Operational' : 'Some Services Degraded'}
              </span>
            </div>
            <div className="text-sm opacity-75">
              Services: Hiro API {healthCheck.data.services.hiro ? '✓' : '✗'} | 
              CoinGecko {healthCheck.data.services.coinGecko ? '✓' : '✗'} | 
              Mempool {healthCheck.data.services.mempool ? '✓' : '✗'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Analytics System */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AnalyticsSystem />
      </motion.div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OrdinalsRunesRealMarketCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RealHolderAnalyticsCard />
        </motion.div>
      </div>

      {/* Network Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RealTransactionActivityCard />
      </motion.div>

      {/* Footer Information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8 text-gray-400"
      >
        <p className="text-sm">
          🔥 All data is sourced from real APIs including Hiro Systems, CoinGecko, and Mempool.space
        </p>
        <p className="text-xs mt-2 opacity-75">
          No mock or placeholder data • Real-time blockchain analytics • Updated every 30 seconds
        </p>
      </motion.div>
    </div>
  );
}

export default ComprehensiveRealAnalyticsDashboard;