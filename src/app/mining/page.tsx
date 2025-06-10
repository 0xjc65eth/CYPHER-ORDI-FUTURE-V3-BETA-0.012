'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Cpu, Zap, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function MiningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Bitcoin Mining Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time mining statistics and profitability metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Network Hashrate</span>
            </div>
            <p className="text-2xl font-bold">742.21 EH/s</p>
            <p className="text-sm text-green-500">+2.3%</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Mining Difficulty</span>
            </div>
            <p className="text-2xl font-bold">106.28T</p>
            <p className="text-sm text-red-500">+3.1%</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Block Reward</span>
            </div>
            <p className="text-2xl font-bold">3.125 BTC</p>
            <p className="text-sm text-muted-foreground">~$331,625</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Next Halving</span>
            </div>
            <p className="text-2xl font-bold">1,458 days</p>
            <p className="text-sm text-muted-foreground">Block 1,050,000</p>
          </Card>
        </div>

        {/* Mining Pools */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Top Mining Pools</h2>
          <div className="space-y-4">
            {[
              { name: 'Foundry USA', hashrate: '31.2%', blocks: 195 },
              { name: 'AntPool', hashrate: '20.8%', blocks: 130 },
              { name: 'F2Pool', hashrate: '15.4%', blocks: 96 },
              { name: 'Binance Pool', hashrate: '12.1%', blocks: 76 },
              { name: 'ViaBTC', hashrate: '9.3%', blocks: 58 },
            ].map((pool, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{pool.name}</p>
                  <p className="text-sm text-muted-foreground">{pool.blocks} blocks (24h)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{pool.hashrate}</p>
                  <p className="text-sm text-muted-foreground">hashrate share</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Profitability Calculator */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Mining Profitability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Hashrate (TH/s)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Power Consumption (W)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                  placeholder="3250"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Electricity Cost ($/kWh)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                  placeholder="0.10"
                />
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold mb-4">Estimated Earnings</h3>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Revenue</span>
                <span className="font-medium">$8.42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Cost</span>
                <span className="font-medium">$7.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Profit</span>
                <span className="font-medium text-green-500">$0.62</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Monthly Profit</span>
                <span className="font-semibold text-lg">$18.60</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}