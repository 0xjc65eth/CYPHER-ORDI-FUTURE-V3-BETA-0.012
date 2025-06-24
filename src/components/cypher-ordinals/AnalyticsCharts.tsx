'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function AnalyticsCharts() {
  const volumeData = [
    { date: '2024-01-01', ordinals: 120, brc20: 340 },
    { date: '2024-01-02', ordinals: 180, brc20: 290 },
    { date: '2024-01-03', ordinals: 150, brc20: 420 },
    { date: '2024-01-04', ordinals: 220, brc20: 380 },
    { date: '2024-01-05', ordinals: 190, brc20: 450 },
  ]

  const rarityData = [
    { name: 'Common', value: 65, color: '#8B5CF6' },
    { name: 'Uncommon', value: 20, color: '#10B981' },
    { name: 'Rare', value: 10, color: '#F59E0B' },
    { name: 'Epic', value: 4, color: '#EF4444' },
    { name: 'Legendary', value: 1, color: '#F97316' }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-500" />
        Analytics e Visualizações
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Volume de Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Area type="monotone" dataKey="ordinals" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="brc20" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Distribuição de Raridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}