'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Star, TrendingUp } from 'lucide-react';

export default function AdvancedCharts() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-4 mb-6">
        <LineChart className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          ADVANCED CHARTS
        </h1>
      </div>
      
      <Card className="bg-black/50 border-yellow-500/30">
        <CardContent className="p-8 text-center">
          <Star className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Professional Charting Suite</h2>
          <p className="text-gray-400">TradingView-style charts with advanced indicators</p>
          <Badge className="mt-4 bg-yellow-500/20 border-yellow-500 text-yellow-400">
            Premium Feature
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}