'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { NeuralInsightsCard } from '@/components/neural-insights-card'
import { SmcAnalysisCard } from '@/components/smc-analysis-card'
import { MarketInsightsCard } from '@/components/market-insights-card'
import {
  AreaChart,
  BarChart,
  LineChart,
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  Grid,
  Col,
  Metric,
  Flex,
  ProgressBar,
  BadgeDelta,
  DeltaType,
  DonutChart,
  Legend,
  Color,
  BarList
} from '@tremor/react'
import { useMarketData } from '@/hooks/useMarketData'
import { useMempoolData } from '@/hooks/useMempoolData'
import { useMiningData } from '@/hooks/useMiningData'
import { RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri'
import Image from 'next/image'

const timeframes = ['24H', '7D', '30D', 'ALL']

const colors: Record<string, Color> = {
  primary: 'purple',
  secondary: 'violet',
  accent: 'indigo',
  neutral: 'slate',
  success: 'emerald',
  warning: 'amber',
  danger: 'rose'
} as const

const neuralInsights = [
  { name: 'Bullish Signal', value: 0.82, color: 'emerald' },
  { name: 'Bearish Signal', value: 0.18, color: 'rose' },
]

const smcAnalysis = [
  { name: 'Support', value: 63500, color: 'emerald' },
  { name: 'Resistance', value: 67000, color: 'rose' },
  { name: 'Pivot', value: 65000, color: 'violet' },
]

const inflowOutflow = [
  { date: '2024-04-01', inflow: 1200, outflow: 900 },
  { date: '2024-04-02', inflow: 1500, outflow: 1100 },
  { date: '2024-04-03', inflow: 900, outflow: 1300 },
  { date: '2024-04-04', inflow: 1700, outflow: 1400 },
]

const premiumBenefits = [
  'Advanced analytics & neural signals',
  'SMC & on-chain insights',
  'Unlimited alerts & notifications',
  'Priority support',
  'Exclusive premium content',
  'Early access to new features',
]

const premiumPlans = [
  {
    name: 'Basic',
    price: 19,
    color: 'from-[#34d399] to-[#10b981]',
    btc: 0.00028,
    features: [
      'Access to basic analytics',
      'Standard alerts',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: 55,
    color: 'from-[#6366F1] to-[#8B5CF6]',
    btc: 0.0008,
    features: [
      'Advanced analytics & neural signals',
      'SMC & on-chain insights',
      'Unlimited alerts & notifications',
      'Priority support',
      'Exclusive premium content',
      'Early access to new features',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    color: 'from-[#f59e42] to-[#fbbf24]',
    btc: 0.0029,
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'White-glove onboarding',
    ],
  },
]

const marketVariables = [
  { label: 'RSI', value: '62.3', color: 'violet' },
  { label: 'MACD', value: '+0.012', color: 'emerald' },
  { label: 'Fear & Greed', value: 'Greed', color: 'amber' },
  { label: 'Whale Activity', value: 'High', color: 'rose' },
  { label: 'Volume', value: '$2.1B', color: 'blue' },
  { label: 'Volatility', value: '3.8%', color: 'cyan' },
  { label: 'Liquidity', value: '$1.5B', color: 'indigo' },
]

const ordinalsOverview = {
  volume: 12000,
  topCollection: 'OCM Genesis',
  topSale: 8.2,
  marketCap: 320000,
  trend: '+12.5%',
}

const runesOverview = {
  volume: 8500,
  topToken: 'ORDI',
  topSale: 2.7,
  marketCap: 210000,
  trend: '+8.9%',
}

const ordinalsMarket = {
  volume: 14500,
  marketCap: 420000,
  topCollection: 'OCM Genesis',
  topSale: 12.3,
  holders: 3200,
  liquidity: 18000,
  trend: '+15.2%',
  neuralSignal: 'Long',
  confidence: 'High',
  rationale: 'Strong inflow, whale accumulation, and positive social sentiment detected by neural engine.',
  topCollections: [
    { name: 'OCM Genesis', volume: 4200, sales: 120, floor: 2.1 },
    { name: 'Bitcoin Frogs', volume: 3100, sales: 98, floor: 1.7 },
    { name: 'Ordinal Maxi Biz', volume: 2500, sales: 80, floor: 1.2 },
  ],
  salesHistory: [
    { date: '2024-04-01', sales: 80 },
    { date: '2024-04-02', sales: 95 },
    { date: '2024-04-03', sales: 110 },
    { date: '2024-04-04', sales: 120 },
  ],
  heatmap: [
    { hour: '00h', volume: 1200 },
    { hour: '06h', volume: 1800 },
    { hour: '12h', volume: 3200 },
    { hour: '18h', volume: 4300 },
  ],
  tradeOpportunities: [
    { signal: 'Buy', collection: 'OCM Genesis', confidence: 'High', rationale: 'Volume spike and strong neural buy signal.' },
    { signal: 'Watch', collection: 'Bitcoin Frogs', confidence: 'Medium', rationale: 'Increasing liquidity, but sentiment is mixed.' },
  ],
}

const runesMarket = {
  volume: 9800,
  marketCap: 250000,
  topToken: 'ORDI',
  topSale: 3.1,
  holders: 2100,
  liquidity: 12000,
  trend: '+9.8%',
  neuralSignal: 'Wait',
  confidence: 'Medium',
  rationale: 'Mixed on-chain signals, moderate inflow, and neutral sentiment.',
  topTokens: [
    { name: 'ORDI', volume: 4200, trades: 120, price: 0.0008 },
    { name: 'DOGI', volume: 2100, trades: 80, price: 0.0003 },
    { name: 'PEPE', volume: 1500, trades: 60, price: 0.0002 },
  ],
  tradesHistory: [
    { date: '2024-04-01', trades: 60 },
    { date: '2024-04-02', trades: 75 },
    { date: '2024-04-03', trades: 90 },
    { date: '2024-04-04', trades: 110 },
  ],
  heatmap: [
    { hour: '00h', volume: 800 },
    { hour: '06h', volume: 1200 },
    { hour: '12h', volume: 2100 },
    { hour: '18h', volume: 3200 },
  ],
  tradeOpportunities: [
    { signal: 'Buy', token: 'ORDI', confidence: 'High', rationale: 'Neural system detects strong inflow and positive momentum.' },
    { signal: 'Sell', token: 'DOGI', confidence: 'Medium', rationale: 'Decreasing volume and negative sentiment.' },
  ],
}

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24H')
  const miningData = useMiningData()

  const marketData = useMarketData()

  const mempoolData = useMempoolData()

  const deltaType: DeltaType = (marketData?.btcChange24h ?? 0) >= 0 ? "increase" : "decrease"
  const DeltaIcon = (marketData?.btcChange24h ?? 0) >= 0 ? RiArrowUpSLine : RiArrowDownSLine

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">
              DASHBOARD
            </h1>
            <h2 className="text-lg text-gray-300">Real-time Market Analysis</h2>
          </div>
          <TabGroup>
            <TabList variant="solid" className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
              {timeframes.map((tf) => (
                <Tab
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className="px-6 py-2 text-sm font-medium"
                >
                  {tf}
                </Tab>
              ))}
            </TabList>
          </TabGroup>
        </div>

        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-6">
          <Col>
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 shadow-xl">
              <Flex alignItems="start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <Text className="text-blue-300 font-medium">Bitcoin Price</Text>
                  </div>
                  <Metric className="text-white bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">${(marketData?.btcPrice ?? 0).toLocaleString()}</Metric>
                </div>
                <BadgeDelta deltaType={deltaType} className="flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                  <DeltaIcon className="w-4 h-4 mr-1" />
                  {(marketData?.btcChange24h ?? 0).toFixed(2)}%
                </BadgeDelta>
              </Flex>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 mt-6">
                <AreaChart
                  className="h-48"
                  data={[
                    { date: '2024-01', value: 42000 },
                    { date: '2024-02', value: 45000 },
                    { date: '2024-03', value: 68000 },
                    { date: '2024-04', value: 65000 },
                  ]}
                  index="date"
                  categories={['value']}
                  colors={["blue"]}
                  showAnimation
                  showLegend={false}
                  showGridLines={false}
                  showXAxis={true}
                  showYAxis={true}
                  yAxisWidth={65}
                  curveType="natural"
                  valueFormatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  CoinMarketCap API
                </span>
              </div>
            </Card>
          </Col>

          <Col>
            <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <Title className="text-white font-bold">Mempool Analysis</Title>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  Live Data
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
                <Flex className="mb-2">
                  <Text className="text-purple-300 font-medium">Pending Transactions</Text>
                  <Text className="text-white font-bold">{(mempoolData?.pendingTransactions ?? 0).toLocaleString()}</Text>
                </Flex>
                <ProgressBar
                  value={75}
                  color="purple"
                  className="mt-2 h-2.5 rounded-full"
                />
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 mt-4">
                <DonutChart
                  className="h-48"
                  data={[
                    { name: '1-2 sat/vB', value: 150 },
                    { name: '2-5 sat/vB', value: 300 },
                    { name: '5-10 sat/vB', value: 200 },
                    { name: '10+ sat/vB', value: 100 },
                  ]}
                  category="value"
                  index="name"
                  colors={["purple", "indigo", "violet", "slate"]}
                  showAnimation
                  showTooltip
                  valueFormatter={(value: number) => `${value} txs`}
                />
                <Legend
                  className="mt-3"
                  categories={['1-2 sat/vB', '2-5 sat/vB', '5-10 sat/vB', '10+ sat/vB']}
                  colors={["purple", "indigo", "violet", "slate"]}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  mempool.space API
                </span>
              </div>
            </Card>
          </Col>

          <Col>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <Title className="text-white font-bold">Network Hash Rate</Title>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Real-time
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 mb-4">
                <Flex className="mb-2">
                  <div>
                    <Text className="text-emerald-300 font-medium">Current Hash Rate</Text>
                    <Metric className="text-white bg-gradient-to-r from-emerald-400 to-green-400 text-transparent bg-clip-text">{(miningData?.hashRate ?? 0).toLocaleString()} EH/s</Metric>
                  </div>
                  <BadgeDelta deltaType="increase" className="self-end px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                    +5.2%
                  </BadgeDelta>
                </Flex>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <LineChart
                  className="h-48"
                  data={[
                    { date: '2024-01', hashrate: 400 },
                    { date: '2024-02', hashrate: 420 },
                    { date: '2024-03', hashrate: 450 },
                    { date: '2024-04', hashrate: 470 },
                  ]}
                  index="date"
                  categories={['hashrate']}
                  colors={["emerald"]}
                  showAnimation
                  showLegend={false}
                  showGridLines={false}
                  curveType="monotone"
                  valueFormatter={(value: number) => `${value} EH/s`}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </Card>
          </Col>
        </Grid>

        <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
          <Col>
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 shadow-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <Title className="text-white font-bold">Neural Network Insights</Title>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <BarList data={neuralInsights} valueFormatter={(number: number) => `${(number * 100).toFixed(0)}%`} />
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Text className="text-sm text-white/90">Our neural engine currently detects a <b className="text-emerald-400">bullish</b> bias. Signals are updated in real time based on on-chain and market data.</Text>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 shadow-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <Title className="text-white font-bold">SMC Analysis</Title>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <BarList data={smcAnalysis} valueFormatter={(number: number) => `$${number.toLocaleString()}`} />
              </div>
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <Text className="text-sm text-white/90">Key support, resistance, and pivot levels for strategic trading decisions.</Text>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 shadow-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <Title className="text-white font-bold">Inflow / Outflow</Title>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <BarChart
                  className="h-48"
                  data={inflowOutflow}
                  index="date"
                  categories={["inflow", "outflow"]}
                  colors={["emerald", "rose"]}
                  showAnimation
                  showLegend
                  showGridLines={false}
                />
              </div>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Text className="text-sm text-white/90">Track exchange inflows and outflows to anticipate market moves.</Text>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <Title className="text-white font-bold">Decision Variables & Insights</Title>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <ul className="space-y-2 text-white/90 text-sm">
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Funding Rate:</span>
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium">+0.012%</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Open Interest:</span>
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium">$1.2B</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Long/Short Ratio:</span>
                    <span className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 font-medium">1.8</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Volatility Index:</span>
                    <span className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 font-medium">3.2%</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Social Sentiment:</span>
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium">Positive</span>
                  </li>
                  <li className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span>Network Health:</span>
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium">Strong</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Text className="text-sm text-white/90">These variables help you make smarter, data-driven trading decisions.</Text>
              </div>
            </Card>
          </Col>
        </Grid>

        <Grid numItems={1} numItemsSm={2} className="gap-6">
          <Col>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Title className="text-white font-bold">Market Analysis</Title>
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  CoinMarketCap API
                </div>
              </div>
              <Grid numItems={2} className="gap-4 mt-4">
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <Text className="text-amber-300 font-medium">24h Volume</Text>
                  </div>
                  <Metric className="text-white">${(marketData?.volume24h ?? 0).toLocaleString()}</Metric>
                  <div className="w-full bg-slate-800/50 h-2.5 mt-2 rounded-full p-0.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '65%' }}>
                      <div className="w-full h-full bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <Text className="text-amber-300 font-medium">Market Cap</Text>
                  </div>
                  <Metric className="text-white">${(marketData?.marketCap ?? 0).toLocaleString()}</Metric>
                  <div className="w-full bg-slate-800/50 h-2.5 mt-2 rounded-full p-0.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '80%' }}>
                      <div className="w-full h-full bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </Card>
              </Grid>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Market Trends
                  </p>
                </div>
                <AreaChart
                  className="h-64"
                  data={[
                    { date: '2024-01', volume: 30000000000 },
                    { date: '2024-02', volume: 35000000000 },
                    { date: '2024-03', volume: 40000000000 },
                    { date: '2024-04', volume: 38000000000 },
                  ]}
                  index="date"
                  categories={['volume']}
                  colors={["amber"]}
                  showAnimation
                  showLegend={false}
                  showGridLines={false}
                  valueFormatter={(number: number) =>
                    `$${Intl.NumberFormat('us').format(number).toString()}B`
                  }
                />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Data from CoinMarketCap API
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </Card>
          </Col>

          <Col>
            <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Title className="text-white font-bold">Network Health</Title>
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  mempool.space API
                </div>
              </div>
              <Grid numItems={2} className="gap-4 mt-4">
                <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <Text className="text-purple-300 font-medium">Block Time</Text>
                  </div>
                  <Metric className="text-white">{(miningData?.blockTime ?? 0).toLocaleString()} min</Metric>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                      <span className="text-xs font-medium text-emerald-400">
                        Healthy
                      </span>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <Text className="text-purple-300 font-medium">Difficulty</Text>
                  </div>
                  <Metric className="text-white">{(miningData?.difficulty ?? 0).toLocaleString()} T</Metric>
                  <div className="w-full bg-slate-800/50 h-2.5 mt-2 rounded-full p-0.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: '78%' }}>
                      <div className="w-full h-full bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                </Card>
              </Grid>
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-purple-300 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    Difficulty Trend
                  </p>
                </div>
                <LineChart
                  className="h-64"
                  data={[
                    { date: '2024-01', difficulty: 55 },
                    { date: '2024-02', difficulty: 58 },
                    { date: '2024-03', difficulty: 62 },
                    { date: '2024-04', difficulty: 65 },
                  ]}
                  index="date"
                  categories={['difficulty']}
                  colors={["purple"]}
                  showAnimation
                  showLegend={false}
                  showGridLines={false}
                  valueFormatter={(number: number) => `${number}T`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <Text className="text-blue-300 font-medium">Current Block</Text>
                  </div>
                  <Metric className="text-white">842,567</Metric>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <Text className="text-emerald-300 font-medium">Mempool</Text>
                  </div>
                  <Metric className="text-white">12,345 txs</Metric>
                </Card>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Data from mempool.space API
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </Card>
          </Col>
        </Grid>

        <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
          <Col>
            <Card className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white border-none shadow-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Coluna de métricas principais */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Title className="text-white text-2xl">Ordinals Market</Title>
                    <span className="ml-2 px-2 py-1 rounded bg-emerald-500 text-xs font-bold animate-pulse">Atualização em tempo real</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="block text-xs text-white/70">Volume</span>
                      <span className="text-lg font-bold text-emerald-300">{(ordinalsMarket.volume ?? 0).toLocaleString()} BTC</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Market Cap</span>
                      <span className="text-lg font-bold text-blue-300">${(ordinalsMarket.marketCap ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Holders</span>
                      <span className="text-lg font-bold text-pink-300">{(ordinalsMarket.holders ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Liquidity</span>
                      <span className="text-lg font-bold text-cyan-300">{(ordinalsMarket.liquidity ?? 0).toLocaleString()} BTC</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Trend</span>
                      <span className="text-lg font-bold text-emerald-400">{(ordinalsMarket.trend ?? '')}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Top Sale</span>
                      <span className="text-lg font-bold text-amber-300">{(ordinalsMarket.topSale ?? 0).toLocaleString()} BTC</span>
                    </div>
                  </div>
                </div>
                {/* Coluna de gráficos */}
                <div className="flex-1 space-y-4">
                  <BarChart
                    className="h-28"
                    data={ordinalsMarket.topCollections}
                    index="name"
                    categories={["volume"]}
                    colors={["emerald"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                    valueFormatter={(v: number) => `${v} BTC`}
                  />
                  <LineChart
                    className="h-24"
                    data={ordinalsMarket.salesHistory}
                    index="date"
                    categories={["sales"]}
                    colors={["amber"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                  />
                  <BarChart
                    className="h-16"
                    data={ordinalsMarket.heatmap}
                    index="hour"
                    categories={["volume"]}
                    colors={["violet"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                  />
                </div>
                {/* Coluna de insights neurais */}
                <div className="flex-1 space-y-2">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981]">
                    <span className="font-bold text-lg">Neural Trade Insight:</span>
                    <span className="ml-2 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold">{(ordinalsMarket.neuralSignal ?? '')}</span>
                    <span className="ml-2 px-2 py-1 rounded bg-emerald-400 text-white text-xs">{(ordinalsMarket.confidence ?? '')} Confidence</span>
                    <p className="mt-2 text-white/90 text-sm">{(ordinalsMarket.rationale ?? '')}</p>
                    <ul className="mt-2 space-y-1 text-white/90 text-xs">
                      {ordinalsMarket.tradeOpportunities?.map((op, idx) => (
                        <li key={idx}><b>{op.signal}</b> {op.collection} <span className="text-emerald-200">({op.confidence})</span>: {op.rationale}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-gradient-to-br from-[#f59e42] to-[#fbbf24] text-white border-none shadow-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Coluna de métricas principais */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Title className="text-white text-2xl">Runes Market</Title>
                    <span className="ml-2 px-2 py-1 rounded bg-yellow-400 text-xs font-bold animate-pulse">Atualização em tempo real</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="block text-xs text-white/70">Volume</span>
                      <span className="text-lg font-bold text-emerald-300">{(runesMarket.volume ?? 0).toLocaleString()} BTC</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Market Cap</span>
                      <span className="text-lg font-bold text-blue-300">${(runesMarket.marketCap ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Holders</span>
                      <span className="text-lg font-bold text-pink-300">{(runesMarket.holders ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Liquidity</span>
                      <span className="text-lg font-bold text-cyan-300">{(runesMarket.liquidity ?? 0).toLocaleString()} BTC</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Trend</span>
                      <span className="text-lg font-bold text-emerald-400">{(runesMarket.trend ?? '')}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-white/70">Top Sale</span>
                      <span className="text-lg font-bold text-amber-300">{(runesMarket.topSale ?? 0).toLocaleString()} BTC</span>
                    </div>
                  </div>
                </div>
                {/* Coluna de gráficos */}
                <div className="flex-1 space-y-4">
                  <BarChart
                    className="h-28"
                    data={runesMarket.topTokens}
                    index="name"
                    categories={["volume"]}
                    colors={["emerald"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                    valueFormatter={(v: number) => `${v} BTC`}
                  />
                  <LineChart
                    className="h-24"
                    data={runesMarket.tradesHistory}
                    index="date"
                    categories={["trades"]}
                    colors={["amber"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                  />
                  <BarChart
                    className="h-16"
                    data={runesMarket.heatmap}
                    index="hour"
                    categories={["volume"]}
                    colors={["violet"]}
                    showAnimation
                    showLegend={false}
                    showGridLines={false}
                  />
                </div>
                {/* Coluna de insights neurais */}
                <div className="flex-1 space-y-2">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#f43f5e] to-[#fbbf24]">
                    <span className="font-bold text-lg">Neural Trade Insight:</span>
                    <span className="ml-2 px-3 py-1 rounded-full bg-yellow-600 text-white font-bold">{(runesMarket.neuralSignal ?? '')}</span>
                    <span className="ml-2 px-2 py-1 rounded bg-yellow-400 text-white text-xs">{(runesMarket.confidence ?? '')} Confidence</span>
                    <p className="mt-2 text-white/90 text-sm">{(runesMarket.rationale ?? '')}</p>
                    <ul className="mt-2 space-y-1 text-white/90 text-xs">
                      {runesMarket.tradeOpportunities?.map((op, idx) => (
                        <li key={idx}><b>{op.signal}</b> {op.token} <span className="text-yellow-200">({op.confidence})</span>: {op.rationale}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-gradient-to-br from-[#f43f5e] to-[#fbbf24] text-white border-none shadow-xl">
              <Title className="text-white">Market Variables</Title>
              <ul className="mt-4 space-y-2 text-white/90 text-sm">
                {marketVariables.map((v, i) => (
                  <li key={i} className={`font-bold text-${v.color}-400`}>{v.label}: <span className={`text-${v.color}-300`}>{(v.value ?? '')}</span></li>
                ))}
              </ul>
              <Text className="mt-4 text-xs text-white/70">Expanded market variables for deeper analysis and smarter decisions.</Text>
            </Card>
          </Col>
        </Grid>
      </div>

      <div className="container mx-auto py-12 px-4 flex flex-col items-center">
        <Title className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#8B5CF6] text-transparent bg-clip-text">Choose Your Premium Plan</Title>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
          {premiumPlans.map((plan, i) => (
            <div
              key={i}
              className={`flex-1 rounded-2xl p-8 shadow-2xl bg-gradient-to-br ${plan.color} ${plan.highlight ? 'scale-105 border-4 border-emerald-400' : ''} transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(139,92,246,0.5)]`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-extrabold mb-4">${plan.price}<span className="text-lg font-medium">/mo</span></div>
              <div className="text-md font-mono mb-2 text-emerald-100">{plan.btc} BTC</div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-white"></span>{f}</li>
                ))}
              </ul>
              <a
                href={`bitcoin:bc1q3ghzvpp0l74q3ntu8actyt0qcvl2u273flg5rs?amount=${plan.btc}&label=Cypher%20${plan.name}%20Plan`}
          target="_blank"
          rel="noopener noreferrer"
                className="w-full block py-2 rounded-lg bg-white text-black font-bold text-center hover:bg-opacity-90 transition mt-2 shadow-lg hover:shadow-xl"
              >
                Subscribe
              </a>
            </div>
          ))}
        </div>
    </div>
    </main>
  )
}
