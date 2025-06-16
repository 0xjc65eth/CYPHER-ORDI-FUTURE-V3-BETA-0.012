'use client';

import React from 'react';
import { RunesAnalyticsDashboard } from '@/components/runes/RunesAnalyticsDashboard';

export default function RunesDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Runes Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analytics for all Bitcoin Runes tokens with real-time data, advanced charts, and comparison tools.
        </p>
      </div>
      
      <RunesAnalyticsDashboard
        defaultTab="overview"
        showAdvancedFeatures={true}
        className="max-w-7xl mx-auto"
      />
    </div>
  );
}