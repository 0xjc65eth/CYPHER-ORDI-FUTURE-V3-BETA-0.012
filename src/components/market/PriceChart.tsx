'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { devLogger } from '@/lib/logger';

interface PriceChartProps {
  symbol?: string;
}

export function PriceChart({ symbol = 'BTC' }: PriceChartProps) {
  const [interval, setInterval] = useState<'1h' | '1d'>('1h');
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    devLogger.log('CHART', `Loading ${symbol} price chart`);
    
    // Generate mock data
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: 65000 + Math.sin(i / 3) * 1000 + Math.random() * 500,
      sma20: 64900 + Math.sin(i / 3) * 900,
      sma50: 64800 + Math.sin(i / 3) * 800,
    }));
    
    setData(mockData);
    devLogger.progress('Price Chart', 50);
  }, [symbol, interval]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{symbol}/USD Price</CardTitle>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={interval === '1h' ? 'default' : 'outline'}
              onClick={() => setInterval('1h')}
            >
              1H
            </Button>
            <Button 
              size="sm" 
              variant={interval === '1d' ? 'default' : 'outline'}
              onClick={() => setInterval('1d')}
            >
              1D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f97316"
              fillOpacity={1}
              
              strokeWidth={2}
            />
            <Line type="monotone" dataKey="sma20" stroke="#3b82f6" dot={false} />
            <Line type="monotone" dataKey="sma50" stroke="#a855f7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
