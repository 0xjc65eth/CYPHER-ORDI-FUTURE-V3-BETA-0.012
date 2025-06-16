/**
 * 📊 Advanced Metrics Component
 * Displays detailed trading metrics
 */

'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Activity, PieChart as PieChartIcon } from 'lucide-react';

export default function AdvancedMetrics() {
  const performanceData = [
    { month: 'Jan', profit: 8.2, loss: -2.1 },
    { month: 'Feb', profit: 12.5, loss: -3.2 },
    { month: 'Mar', profit: 15.3, loss: -1.8 },
    { month: 'Apr', profit: 10.7, loss: -2.5 },
    { month: 'May', profit: 18.9, loss: -1.2 },
  ];

  const assetAllocation = [
    { name: 'Bitcoin', value: 45, color: '#f7931a' },
    { name: 'Ethereum', value: 30, color: '#627eea' },
    { name: 'Others', value: 15, color: '#00d4aa' },
    { name: 'Stablecoins', value: 10, color: '#26a17b' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-400">Total Profit</span>
          </div>
          <p className="text-2xl font-bold text-white">$125,430</p>
          <p className="text-sm text-green-400">+23.5%</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">Total Trades</span>
          </div>
          <p className="text-2xl font-bold text-white">1,248</p>
          <p className="text-sm text-gray-400">Last 30 days</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">78.3%</p>
          <p className="text-sm text-yellow-400">Above average</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">Sharpe Ratio</span>
          </div>
          <p className="text-2xl font-bold text-white">2.45</p>
          <p className="text-sm text-purple-400">Excellent</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly P&L</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="profit" fill="#10b981" />
                <Bar dataKey="loss" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute">
              <p className="text-2xl font-bold text-white text-center">100%</p>
              <p className="text-sm text-gray-400 text-center">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
