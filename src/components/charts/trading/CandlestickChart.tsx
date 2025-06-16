'use client';

// 📊 Volume Chart para análise de trading
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BaseChart } from '../base/BaseChart';

interface VolumeChartProps {
  data?: any[];
  height?: number;
}

export function VolumeChart({ data, height = 300 }: VolumeChartProps) {
  // Generate mock volume data
  const volumeData = data || Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    volume: Math.floor(Math.random() * 1000000 + 500000),
    buyVolume: Math.floor(Math.random() * 600000 + 200000),
    sellVolume: Math.floor(Math.random() * 400000 + 100000),
  }));

  return (
    <BaseChart title="Volume de Negociação" height={height} data={volumeData}>
      <BarChart data={volumeData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="time" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
          labelStyle={{ color: '#888' }}
        />
        <Bar dataKey="buyVolume" stackId="a" fill="#10b981" />
        <Bar dataKey="sellVolume" stackId="a" fill="#ef4444" />
      </BarChart>
    </BaseChart>
  );
}