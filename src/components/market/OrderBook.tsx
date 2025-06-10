'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  percentage: number;
}

export function OrderBook() {
  // Mock data - integrar com API real depois
  const bids: OrderBookEntry[] = [
    { price: 64950, amount: 0.5, total: 32475, percentage: 80 },
    { price: 64940, amount: 0.3, total: 19482, percentage: 60 },
    { price: 64930, amount: 0.8, total: 51944, percentage: 100 },
    { price: 64920, amount: 0.2, total: 12984, percentage: 40 },
    { price: 64910, amount: 0.4, total: 25964, percentage: 70 },
  ];

  const asks: OrderBookEntry[] = [
    { price: 65010, amount: 0.3, total: 19503, percentage: 60 },
    { price: 65020, amount: 0.5, total: 32510, percentage: 80 },
    { price: 65030, amount: 0.2, total: 13006, percentage: 40 },
    { price: 65040, amount: 0.7, total: 45528, percentage: 90 },
    { price: 65050, amount: 0.9, total: 58545, percentage: 100 },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-green-500">Bids</h3>
            <div className="space-y-1">
              {bids.map((bid, i) => (
                <OrderBookRow key={i} entry={bid} type="bid" />
              ))}
            </div>
          </div>
          
          <div className="py-2 text-center">
            <p className="text-2xl font-bold">$65,000</p>
            <p className="text-sm text-muted-foreground">Last Price</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 text-red-500">Asks</h3>
            <div className="space-y-1">
              {asks.map((ask, i) => (
                <OrderBookRow key={i} entry={ask} type="ask" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function OrderBookRow({ entry, type }: { entry: OrderBookEntry; type: 'bid' | 'ask' }) {
  return (
    <div className="relative flex items-center justify-between text-xs">
      <div
        className={`absolute inset-0 ${
          type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}
        style={{ width: `${entry.percentage}%` }}
      />
      <span className="relative z-10">${entry.price.toLocaleString()}</span>
      <span className="relative z-10">{entry.amount} BTC</span>
      <span className="relative z-10 text-muted-foreground">
        ${entry.total.toLocaleString()}
      </span>
    </div>
  );
}
