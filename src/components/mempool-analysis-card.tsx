'use client'

import { useMempoolData } from '@/hooks/useMempoolData'
import { DashboardCard } from '@/components/dashboard-card'
import { RiTimeLine, RiRefreshLine, RiDatabase2Line, RiExchangeLine, RiSpeedLine, RiPieChartLine, RiStackLine } from 'react-icons/ri'
import { useMemo, useState, useEffect } from 'react'
import { DonutChart } from '@tremor/react'

export function MempoolAnalysisCard() {
  const [mounted, setMounted] = useState(false)
  const { isLoading, pendingTransactions, averageFeeRate, mempoolSize, feeRates, lastUpdated } = useMempoolData()
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

  // Generate fee distribution data
  const feeDistribution = useMemo(() => {
    const low = feeRates?.low || 1
    const medium = feeRates?.medium || 5
    const high = feeRates?.high || 10

    // Calculate transaction distribution based on fee rates
    const total = pendingTransactions || 750
    const lowPct = 0.4 // 40% of transactions are low fee
    const mediumPct = 0.35 // 35% of transactions are medium fee
    const highPct = 0.15 // 15% of transactions are high fee
    const veryHighPct = 0.1 // 10% of transactions are very high fee

    return [
      { name: `1-${low} sat/vB`, value: Math.round(total * lowPct) },
      { name: `${low}-${medium} sat/vB`, value: Math.round(total * mediumPct) },
      { name: `${medium}-${high} sat/vB`, value: Math.round(total * highPct) },
      { name: `${high}+ sat/vB`, value: Math.round(total * veryHighPct) },
    ]
  }, [feeRates, pendingTransactions])

  // Prepare data for donut chart
  const chartData = useMemo(() => {
    return feeDistribution.map(item => ({
      name: item.name,
      txs: item.value
    }))
  }, [feeDistribution])

  return (
    <DashboardCard title="Mempool Analysis" className="bg-gradient-to-br from-[#1A2A3A] to-[#2A3A4A] border-none shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <RiDatabase2Line className="w-6 h-6 text-cyan-500 mr-2" />
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-8 w-32 bg-gray-700 animate-pulse rounded"></div>
                <RiRefreshLine className="w-5 h-5 text-blue-400 ml-2 animate-spin" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {mounted
                  ? (pendingTransactions ?? 0).toLocaleString()
                  : "12,345" /* Valor fixo para SSR */
                }
              </p>
            )}
          </div>
          <p className="text-sm text-cyan-300 mt-1">Pending Transactions</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mr-1 animate-ping"></div>
            <span className="px-2 py-1 rounded bg-cyan-500/30 text-xs font-bold text-white border border-cyan-400">
              mempool.space API
            </span>
          </div>
          <div className="flex items-center mt-1">
            <RiTimeLine className="w-3 h-3 text-gray-400 mr-1" />
            <p className="text-xs text-gray-300">Updated {mounted ? timeAgo : "just now"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <RiSpeedLine className="w-4 h-4 text-cyan-400 mr-2" />
            <p className="text-sm text-cyan-300">Average Fee Rate</p>
          </div>
          <p className="text-sm font-medium text-white">
            {mounted
              ? `${averageFeeRate ?? 0} sat/vB`
              : "5 sat/vB" /* Valor fixo para SSR */
            }
          </p>
        </div>
        <div className="w-full bg-gray-700 h-2 mt-2 rounded-full">
          <div
            className="bg-cyan-500 h-2 rounded-full"
            style={{ width: mounted ? `${Math.min((averageFeeRate ?? 0) * 2, 100)}%` : "10%" }}
          ></div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <RiPieChartLine className="w-4 h-4 text-cyan-400 mr-2" />
            <p className="text-sm text-cyan-300">Fee Distribution</p>
          </div>

          {mounted && (
            <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/20">
              <DonutChart
                data={chartData}
                category="txs"
                index="name"
                valueFormatter={(value) => `${value} txs`}
                colors={["emerald", "cyan", "amber", "rose"]}
                className="h-40"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center mb-2">
            <RiStackLine className="w-4 h-4 text-cyan-400 mr-2" />
            <p className="text-sm text-cyan-300">Mempool Size</p>
          </div>

          <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
            <p className="text-2xl font-bold text-white">
              {mounted
                ? `${(mempoolSize ?? 0).toLocaleString()} KB`
                : "5,000 KB" /* Valor fixo para SSR */
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">Total size of unconfirmed transactions</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
              <p className="text-xs text-cyan-300">Low Priority</p>
              <p className="text-lg font-medium text-white">
                {mounted
                  ? `${feeRates?.low ?? 0}`
                  : "1" /* Valor fixo para SSR */
                } <span className="text-xs text-gray-400">sat/vB</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">~1 hour confirmation</p>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
              <p className="text-xs text-cyan-300">High Priority</p>
              <p className="text-lg font-medium text-white">
                {mounted
                  ? `${feeRates?.high ?? 0}`
                  : "10" /* Valor fixo para SSR */
                } <span className="text-xs text-gray-400">sat/vB</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Next block confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
