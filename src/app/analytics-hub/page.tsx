'use client'

import OnChainMetrics from '@/components/analytics/professional/OnChainMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  LineChart,
  PieChart,
  Zap,
  Users
} from 'lucide-react';

export default function AnalyticsHub() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Analytics Hub</h1>
          <p className="text-muted-foreground mt-2">
            Professional-grade on-chain metrics and market intelligence
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Activity className="h-4 w-4 mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bitcoin Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$62,450</div>
            <div className="flex items-center text-sm text-green-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.4%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.22T</div>
            <div className="text-sm text-muted-foreground mt-1">
              Rank #1
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.5B</div>
            <div className="flex items-center text-sm text-red-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              -5.2%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Network Hashrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450 EH/s</div>
            <div className="text-sm text-muted-foreground mt-1">
              ATH: 491 EH/s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="onchain" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="onchain" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            On-Chain
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="mining" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Mining
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onchain" className="space-y-4">
          <OnChainMetrics />
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Structure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced market microstructure analysis coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mining" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mining Economics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive mining profitability metrics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time social media sentiment tracking coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Market Dominance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Bitcoin</span>
                <span className="text-sm font-bold">48.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ethereum</span>
                <span className="text-sm font-bold">17.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Others</span>
                <span className="text-sm font-bold">34.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Funding Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Perpetual</span>
                <span className="text-sm font-bold text-green-500">+0.012%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Quarterly</span>
                <span className="text-sm font-bold text-green-500">+0.008%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bi-Quarterly</span>
                <span className="text-sm font-bold text-red-500">-0.002%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Addresses</span>
                <span className="text-sm font-bold">982K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transaction Count</span>
                <span className="text-sm font-bold">312K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transfer Volume</span>
                <span className="text-sm font-bold">$4.2B</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}