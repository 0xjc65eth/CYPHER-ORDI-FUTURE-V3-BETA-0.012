'use client'

import { useHashrateData } from '@/hooks/useHashrateData'
import { DashboardCard } from '@/components/dashboard-card'
import { RiTimeLine, RiRefreshLine, RiLineChartLine, RiArrowUpSLine, RiArrowDownSLine, RiPieChartLine, RiDatabase2Line } from 'react-icons/ri'
import { useState, useEffect } from 'react'
import { LineChart, DonutChart } from '@tremor/react'

export function NetworkHashRateCard() {
  const [mounted, setMounted] = useState(false)
  const {
    isLoading,
    currentHashrate,
    hashrateChange,
    difficulty,
    estimatedRetargetDate,
    remainingBlocks,
    progressPercent,
    currentHeight,
    miningDistribution,
    lastUpdated
  } = useHashrateData()

  const [lastUpdatedDate, setLastUpdatedDate] = useState<Date | null>(null)
  const [timeAgo, setTimeAgo] = useState<string>('just now')

  // Evitar hidratação usando useEffect para renderizar apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update last updated time
  useEffect(() => {
    if (lastUpdated) {
      setLastUpdatedDate(new Date(lastUpdated))
    }
  }, [lastUpdated])

  // Update time ago string
  useEffect(() => {
    if (!lastUpdatedDate) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diffMs = now.getTime() - lastUpdatedDate.getTime()
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
  }, [lastUpdatedDate])

  // Generate chart data for visualization
  const chartData = [
    { date: '2024-01', 'Hash Rate': 350 },
    { date: '2024-02', 'Hash Rate': 380 },
    { date: '2024-03', 'Hash Rate': currentHashrate || 400 },
  ]

  // Format mining distribution data for the chart
  const miningDistributionData = mounted && miningDistribution?.length > 0
    ? miningDistribution.map(pool => ({
        name: pool.name,
        share: pool.share
      }))
    : [
        { name: "Foundry USA", share: 35.2 },
        { name: "AntPool", share: 18.7 },
        { name: "F2Pool", share: 14.3 },
        { name: "Binance Pool", share: 10.5 },
        { name: "ViaBTC", share: 8.2 }
      ]

  return (
    <DashboardCard title="Network Hash Rate" className="bg-gradient-to-br from-[#1A1A3A] to-[#2A2A5A] border-none shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <RiLineChartLine className="w-6 h-6 text-emerald-500 mr-2" />
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-8 w-32 bg-gray-700 animate-pulse rounded"></div>
                <RiRefreshLine className="w-5 h-5 text-blue-400 ml-2 animate-spin" />
              </div>
            ) : (
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white">
                  {mounted
                    ? `${currentHashrate ?? 0} EH/s`
                    : "0 EH/s" /* Valor fixo para SSR */
                  }
                </p>
                <div className={`ml-2 px-2 py-1 rounded text-xs font-bold flex items-center ${hashrateChange >= 0 ? 'bg-emerald-500/30 text-emerald-400' : 'bg-rose-500/30 text-rose-400'}`}>
                  {hashrateChange >= 0 ? (
                    <RiArrowUpSLine className="mr-1" />
                  ) : (
                    <RiArrowDownSLine className="mr-1" />
                  )}
                  {mounted ? `${Math.abs(hashrateChange).toFixed(2)}%` : "+5.2%"}
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-indigo-300 mt-1">Current Hash Rate</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1 animate-ping"></div>
            <span className="px-2 py-1 rounded bg-indigo-500/30 text-xs font-bold text-white border border-indigo-400">
              mempool.space API
            </span>
          </div>
          <div className="flex items-center mt-1">
            <RiTimeLine className="w-3 h-3 text-gray-400 mr-1" />
            <p className="text-xs text-gray-300">Updated {mounted ? timeAgo : "just now"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {mounted && (
            <div>
              <div className="flex items-center mb-2">
                <RiLineChartLine className="w-4 h-4 text-indigo-400 mr-2" />
                <p className="text-sm text-indigo-300">Hashrate Trend</p>
              </div>
              <div className="bg-indigo-500/5 p-2 rounded border border-indigo-500/20">
                <LineChart
                  data={chartData}
                  index="date"
                  categories={["Hash Rate"]}
                  colors={["emerald"]}
                  className="h-32"
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                  yAxisWidth={60}
                  valueFormatter={(value) => `${value} EH/s`}
                />
              </div>
            </div>
          )}

          <div className="mt-3 bg-indigo-500/10 p-3 rounded border border-indigo-500/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <RiDatabase2Line className="w-4 h-4 text-indigo-400 mr-2" />
                <p className="text-sm text-indigo-300">Current Block Height</p>
              </div>
              <p className="text-sm font-medium text-white">
                {mounted ? currentHeight.toLocaleString() : "840,000"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <RiPieChartLine className="w-4 h-4 text-indigo-400 mr-2" />
            <p className="text-sm text-indigo-300">Mining Distribution</p>
          </div>

          {mounted && (
            <div className="bg-indigo-500/5 p-2 rounded border border-indigo-500/20">
              <DonutChart
                data={miningDistributionData}
                category="share"
                index="name"
                valueFormatter={(value) => `${value}%`}
                colors={["emerald", "cyan", "indigo", "violet", "amber"]}
                className="h-40"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-indigo-500/10 p-3 rounded border border-indigo-500/20">
          <p className="text-xs text-indigo-300">Network Difficulty</p>
          <p className="text-lg font-medium text-white">
            {mounted
              ? `${(difficulty / 1e12).toFixed(2)} T`
              : "45.6 T" /* Valor fixo para SSR */
            }
          </p>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full">
            <div
              className="bg-indigo-500 h-2 rounded-full"
              style={{ width: mounted ? `${progressPercent}%` : "50%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {mounted ? `${remainingBlocks} blocks until adjustment` : "1,024 blocks until adjustment"}
          </p>
        </div>
        <div className="bg-indigo-500/10 p-3 rounded border border-indigo-500/20">
          <p className="text-xs text-indigo-300">Next Difficulty Adjustment</p>
          <p className="text-lg font-medium text-white">
            {mounted && estimatedRetargetDate
              ? new Date(estimatedRetargetDate).toLocaleDateString()
              : "2024-05-15" /* Valor fixo para SSR */
            }
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Expected {hashrateChange >= 0 ? 'increase' : 'decrease'} of {Math.abs(hashrateChange).toFixed(2)}%
          </p>
        </div>
      </div>
    </DashboardCard>
  )
}
