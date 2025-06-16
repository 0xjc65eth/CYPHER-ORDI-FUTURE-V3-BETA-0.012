'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { devLogger } from '@/lib/logger';

interface VolumeData {
  time: string;
  volume: number;
  price: number;
  color: string;
}

export function VolumeChart() {
  devLogger.log('CHART', 'Volume Chart component rendered');
  
  // Mock data - integrar com API real depois
  const data: VolumeData[] = Array.from({ length: 24 }, (_, i) => {
    const prevPrice = 65000 + Math.random() * 1000;
    const currentPrice = 65000 + Math.random() * 1000;
    
    return {
      time: `${i}:00`,
      volume: Math.random() * 10000000 + 5000000,
      price: currentPrice,
      color: currentPrice > prevPrice ? '#22c55e' : '#ef4444',
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.time}</p>
          <p className="text-sm">
            Volume: ${(payload[0].value / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-muted-foreground">
            Price: ${payload[0].payload.price.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>24h Volume Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
