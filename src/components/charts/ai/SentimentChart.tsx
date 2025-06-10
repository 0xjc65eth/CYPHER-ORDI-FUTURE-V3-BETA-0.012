'use client';

// 📊 Sentiment Analysis Chart
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BaseChart } from '../base/BaseChart';

interface SentimentChartProps {
  bullish?: number;
  bearish?: number;
  neutral?: number;
  height?: number;
}

export function SentimentChart({ 
  bullish = 65,
  bearish = 25,
  neutral = 10,
  height = 300 
}: SentimentChartProps) {
  
  const data = [
    { name: 'Bullish', value: bullish, color: '#10b981' },
    { name: 'Bearish', value: bearish, color: '#ef4444' },
    { name: 'Neutral', value: neutral, color: '#6b7280' }
  ];

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-black/90 p-2 rounded border border-gray-600">
          <p className="text-white text-sm">{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseChart title="Sentiment do Mercado" height={height} data={data}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
      </PieChart>
    </BaseChart>
  );
}