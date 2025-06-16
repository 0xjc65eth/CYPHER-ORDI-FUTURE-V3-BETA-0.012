'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart } from '@tremor/react'
import { RiArrowUpCircleLine, RiArrowDownCircleLine } from 'react-icons/ri'

export function InflowOutflowChartCard() {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate realistic inflow/outflow data
  const inflowOutflowData = useMemo(() => {
    const dates = ['2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05', '2024-04-06', '2024-04-07']

    // Realistic data pattern with a trend
    const baseInflow = 1200
    const baseOutflow = 1000
    const trendFactor = 50 // Increasing trend

    return dates.map((date, index) => {
      // Create a realistic pattern with some randomness but a clear trend
      const dayFactor = index * trendFactor
      const inflow = baseInflow + dayFactor + Math.floor(Math.random() * 200)
      const outflow = baseOutflow + (dayFactor * 0.8) + Math.floor(Math.random() * 180)

      return { date, inflow, outflow }
    })
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  }

  // Calculate net inflow/outflow
  const netFlow = useMemo(() => {
    if (!inflowOutflowData || inflowOutflowData.length === 0) return 0;

    const lastDay = inflowOutflowData[inflowOutflowData.length - 1];
    return lastDay.inflow - lastDay.outflow;
  }, [inflowOutflowData]);

  // Calculate 7-day trend
  const weeklyTrend = useMemo(() => {
    if (!inflowOutflowData || inflowOutflowData.length < 2) return 0;

    const firstDay = inflowOutflowData[0];
    const lastDay = inflowOutflowData[inflowOutflowData.length - 1];

    const firstNetFlow = firstDay.inflow - firstDay.outflow;
    const lastNetFlow = lastDay.inflow - lastDay.outflow;

    return ((lastNetFlow - firstNetFlow) / Math.abs(firstNetFlow)) * 100;
  }, [inflowOutflowData]);

  return (
    <div className="bg-gradient-to-br from-[#1A1A3A] to-[#2A2A5A] border border-blue-500/20 rounded-lg overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h3 className="text-white font-medium">Bitcoin Ecosystem Insights - Inflow/Outflow</h3>
        </div>
        <div className="px-2 py-1 rounded-lg bg-blue-500/20 text-xs font-bold text-blue-300 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-1"></span>
          Live Data
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <RiArrowUpCircleLine className="w-4 h-4 text-emerald-400 mr-1" />
              <span className="text-xs text-emerald-300 font-medium">Exchange Inflow</span>
            </div>
            <div className="text-xl font-bold text-white">{inflowOutflowData[inflowOutflowData.length - 1]?.inflow.toLocaleString() || '0'} BTC</div>
            <div className="text-xs text-emerald-300 mt-1">Last 24 hours</div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <RiArrowDownCircleLine className="w-4 h-4 text-rose-400 mr-1" />
              <span className="text-xs text-rose-300 font-medium">Exchange Outflow</span>
            </div>
            <div className="text-xl font-bold text-white">{inflowOutflowData[inflowOutflowData.length - 1]?.outflow.toLocaleString() || '0'} BTC</div>
            <div className="text-xs text-rose-300 mt-1">Last 24 hours</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-xs text-blue-300 font-medium">Net Flow</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-bold ${netFlow >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {netFlow >= 0 ? 'Net Inflow' : 'Net Outflow'}
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-xl font-bold text-white">{Math.abs(netFlow).toLocaleString()} BTC</div>
            <div className={`ml-2 text-sm ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend.toFixed(1)}% 7d
            </div>
          </div>
        </div>

        {mounted ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-indigo-500/10 rounded-lg"></div>
            <BarChart
              className="h-64"
              data={inflowOutflowData}
              index="date"
              categories={["inflow", "outflow"]}
              colors={["emerald", "rose"]}
              showAnimation
              showLegend
              valueFormatter={(value) => `${value.toLocaleString()} BTC`}
              showGridLines={false}
              yAxisWidth={48}
              customTooltip={(props) => {
                const { payload, active } = props
                if (!active || !payload) return null

                const date = payload[0]?.payload?.date
                const inflow = payload[0]?.value
                const outflow = payload[1]?.value
                const netFlow = inflow - outflow

                return (
                  <div className="bg-slate-800 p-3 border border-slate-700 rounded-lg shadow-lg">
                    <div className="text-white text-xs font-medium mb-2">{formatDate(date)}</div>
                    <div className="flex items-center text-xs text-emerald-400 mb-1">
                      <RiArrowUpCircleLine className="w-3 h-3 mr-1" />
                      <span>Inflow: {inflow?.toLocaleString()} BTC</span>
                    </div>
                    <div className="flex items-center text-xs text-rose-400 mb-1">
                      <RiArrowDownCircleLine className="w-3 h-3 mr-1" />
                      <span>Outflow: {outflow?.toLocaleString()} BTC</span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-slate-700">
                      <div className="flex items-center text-xs font-medium">
                        <span className="mr-1">Net:</span>
                        <span className={netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {netFlow >= 0 ? '+' : ''}{netFlow?.toLocaleString()} BTC
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </div>
        ) : (
          <div className="h-64 bg-slate-800/50 animate-pulse rounded-lg"></div>
        )}

        <div className="mt-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-blue-300 font-medium">Neural Analysis</span>
          </div>
          <p className="text-sm text-white">
            {netFlow >= 0
              ? `Current net inflow of ${netFlow.toLocaleString()} BTC indicates accumulation by institutional investors. This typically precedes bullish price action.`
              : `Current net outflow of ${Math.abs(netFlow).toLocaleString()} BTC suggests distribution phase. Exercise caution as this may lead to short-term price pressure.`
            }
          </p>
        </div>
      </div>
    </div>
  )
}
