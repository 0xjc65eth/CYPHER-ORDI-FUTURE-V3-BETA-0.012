'use client';

// 📊 Bitcoin Price Chart
import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Line, LineChart } from 'recharts';
import { BaseChart } from '../base/BaseChart';
import { Button } from '@/components/ui/button';
import { generateMockData } from '../utils/chartUtils';
import { ChartTimeframe } from '../types/chartTypes';

interface BitcoinPriceChartProps {
  showIndicators?: boolean;
  height?: number;
  className?: string;
}

export function BitcoinPriceChart({
  showIndicators = true,
  height = 400,
  className
}: BitcoinPriceChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1d');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const mockData = generateMockData(24, 65000, 0.02);
    setData(mockData.map(item => ({
      time: new Date(item.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      price: item.price,
      sma20: item.price * (1 + (Math.random() - 0.5) * 0.01),
    })));
  }, [timeframe]);

  const TimeframeButtons = () => (
    <div className="flex gap-1 mb-4">
      {(['1h', '4h', '1d', '1w'] as ChartTimeframe[]).map((tf) => (
        <Button 
          key={tf}
          size="sm" 
          variant={timeframe === tf ? 'default' : 'outline'}
          onClick={() => setTimeframe(tf)}
        >
          {tf.toUpperCase()}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={className}>
      <TimeframeButtons />
      <BaseChart
        title="Bitcoin Price (USD)"
        height={height}
        data={data}
      >        <LineChart data={data}>
          <defs>
            <linearGradient id="colorBitcoin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
            labelStyle={{ color: '#888' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            fillOpacity={1}
            
            strokeWidth={2}
          />
          {showIndicators && (
            <Line type="monotone" dataKey="sma20" stroke="#3b82f6" dot={false} />
          )}
        </LineChart>
      </BaseChart>
    </div>
  );
}