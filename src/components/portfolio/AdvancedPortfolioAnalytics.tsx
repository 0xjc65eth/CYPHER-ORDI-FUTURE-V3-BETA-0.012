'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, DollarSign, TrendingUp } from 'lucide-react';

export const AdvancedPortfolioAnalytics: React.FC<{ className?: string }> = ({ className = '' }) => {
  const portfolioData = [
    { name: 'Bitcoin', value: 33617.28, change: 1245.67, icon: '₿' },
    { name: 'NodeMonkes', value: 8947.32, change: -234.56, icon: '🖼️' },
    { name: 'Dog Rune', value: 5678.90, change: 456.78, icon: '⚡' },
    { name: 'Rare Sats', value: 3234.12, change: 123.45, icon: '💎' }
  ];

  const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = portfolioData.reduce((sum, asset) => sum + asset.change, 0);

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-400" />
          Portfolio Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">${totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Total Value</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">+${totalChange.toFixed(2)}</p>
            <p className="text-xs text-gray-400">24h Change</p>
          </div>
        </div>        <div className="space-y-2">
          {portfolioData.map((asset, index) => (
            <div key={index} className="flex justify-between p-2 bg-gray-900 rounded">
              <div className="flex items-center space-x-2">
                <span>{asset.icon}</span>
                <span className="text-white text-sm">{asset.name}</span>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">${asset.value.toLocaleString()}</p>
                <p className={`text-xs ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPortfolioAnalytics;