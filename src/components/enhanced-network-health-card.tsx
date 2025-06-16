'use client'

import { useState, useEffect } from 'react'
import { DashboardCard } from '@/components/dashboard-card'
import { RiTimeLine, RiRefreshLine, RiLineChartLine, RiArrowUpSLine, RiArrowDownSLine, RiPieChartLine, RiDatabase2Line } from 'react-icons/ri'
import { LineChart, DonutChart } from '@tremor/react'

export function EnhancedNetworkHealthCard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [networkData, setNetworkData] = useState({
    blockTime: 9.8,
    difficulty: 78.3,
    hashRate: 540.2,
    blockHeight: 842567,
    mempool: 12345,
    lastUpdated: new Date()
  })
  const [timeAgo, setTimeAgo] = useState<string>('just now')

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Update time ago string
  useEffect(() => {
    if (!mounted) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diffMs = now.getTime() - networkData.lastUpdated.getTime()
      const diffSec = Math.floor(diffMs / 1000)

      if (diffSec < 10) {
        setTimeAgo('just now')
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec} seconds ago`)
      } else if (diffSec < 3600) {
        const diffMin = Math.floor(diffSec / 60)
        setTimeAgo(`${diffMin} minute${diffMin > 1 ? 's' : ''} ago`)
      } else {
        const diffHour = Math.floor(diffSec / 3600)
        setTimeAgo(`${diffHour} hour${diffHour > 1 ? 's' : ''} ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000)
    return () => clearInterval(interval)
  }, [mounted, networkData.lastUpdated])

  // Generate chart data for visualization
  const difficultyChartData = [
    { date: '2024-01', 'Difficulty': 55 },
    { date: '2024-02', 'Difficulty': 65 },
    { date: '2024-03', 'Difficulty': 70 },
    { date: '2024-04', 'Difficulty': 75 },
    { date: '2024-05', 'Difficulty': 78 },
  ]

  // Mining pool distribution data
  const miningPoolData = [
    { name: "Foundry USA", share: 35.2 },
    { name: "AntPool", share: 18.7 },
    { name: "F2Pool", share: 14.3 },
    { name: "Binance Pool", share: 10.5 },
    { name: "ViaBTC", share: 8.2 },
    { name: "Others", share: 13.1 }
  ]

  return (
    <DashboardCard 
      title="Network Health" 
      subtitle="Bitcoin network performance metrics"
      colorScheme="purple"
      className="shadow-xl"
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mr-3">
              <RiDatabase2Line className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              {isLoading ? (
                <>
                  <div className="flex items-center">
                    <div className="h-8 w-32 bg-slate-700/50 animate-pulse rounded"></div>
                    <RiRefreshLine className="w-5 h-5 text-purple-400 ml-2 animate-spin" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
                      {mounted ? networkData.blockTime : "0"} min
                    </p>
                    <div className="flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                      <span className="text-xs font-medium text-emerald-400">
                        Healthy
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">Average Block Time</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              mempool.space API
            </span>
          </div>
          <div className="flex items-center mt-2">
            <RiTimeLine className="w-3.5 h-3.5 text-purple-400 mr-1.5" />
            <p className="text-xs text-gray-300">Updated {mounted ? timeAgo : "just now"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 rounded-xl border border-purple-500/30 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-purple-300 font-medium">Network Difficulty</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-white">
              {mounted ? networkData.difficulty : "0"} T
            </p>
            <div className="flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <RiArrowUpSLine className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                +3.2%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800/50 h-2.5 mt-2 rounded-full p-0.5">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: '78%' }}>
              <div className="w-full h-full bg-white/30 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-1">Next adjustment in 1,024 blocks</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 rounded-xl border border-purple-500/30 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
              <RiLineChartLine className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xs text-purple-300 font-medium">Hash Rate</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-white">
              {mounted ? networkData.hashRate : "0"} EH/s
            </p>
            <div className="flex items-center px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <RiArrowUpSLine className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                +5.7%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800/50 h-2.5 mt-2 rounded-full p-0.5">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: '85%' }}>
              <div className="w-full h-full bg-white/30 rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-1">All-time high: 580 EH/s</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-purple-300 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Difficulty Trend
            </p>
          </div>
          
          {mounted && (
            <LineChart
              data={difficultyChartData}
              index="date"
              categories={["Difficulty"]}
              colors={["purple"]}
              className="h-40"
              showLegend={false}
              showXAxis={true}
              showYAxis={true}
              yAxisWidth={40}
              valueFormatter={(value) => `${value}T`}
            />
          )}
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-purple-300 font-medium flex items-center gap-2">
              <RiPieChartLine className="h-4 w-4" />
              Mining Distribution
            </p>
          </div>
          
          {mounted && (
            <DonutChart
              data={miningPoolData}
              category="share"
              index="name"
              valueFormatter={(value) => `${value}%`}
              colors={["purple", "indigo", "violet", "blue", "cyan", "slate"]}
              className="h-40"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/30 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <p className="text-xs text-blue-300 font-medium">Current Block Height</p>
          </div>
          <p className="text-lg font-bold text-white">
            {mounted ? networkData.blockHeight.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Last block mined 2 minutes ago
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-4 rounded-xl border border-emerald-500/30 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xs text-emerald-300 font-medium">Mempool Size</p>
          </div>
          <p className="text-lg font-bold text-white">
            {mounted ? networkData.mempool.toLocaleString() : "0"} txs
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Average fee: 25 sat/vB
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
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
    </DashboardCard>
  )
}
