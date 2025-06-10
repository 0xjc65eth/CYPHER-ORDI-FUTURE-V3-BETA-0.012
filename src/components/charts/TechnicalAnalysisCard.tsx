'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target } from 'lucide-react';

export const TechnicalAnalysisCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const indicators = [
    { name: 'RSI (14)', value: '68.5', color: 'text-yellow-400' },
    { name: 'MACD', value: 'Bullish', color: 'text-green-400' },
    { name: 'MA (20)', value: '$66,789', color: 'text-green-400' },
    { name: 'Bollinger', value: 'Upper', color: 'text-red-400' }
  ];

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Technical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{indicator.name}</span>
              <span className={`text-sm font-medium ${indicator.color}`}>
                {indicator.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Overall Signal</span>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-semibold">BULLISH</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysisCard;