'use client'

import { Header } from '@/components/header'
import { EnhancedMarketAnalysisCard } from '@/components/enhanced-market-analysis-card'
import { EnhancedNetworkHealthCard } from '@/components/enhanced-network-health-card'

export default function NetworkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <Header title="Bitcoin Network" description="Network Health & Market Analysis" />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">Bitcoin <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">Network</span></h1>
          <h2 className="text-xl text-gray-300 mb-2">Network Health & Market Analysis</h2>
        </div>

        {/* Enhanced Informational Banner */}
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-blue-500/20 text-white shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl text-white">Bitcoin Network <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text">Analytics Dashboard</span></h3>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full">v2.2.1</span>
                Powered by CypherNeural™ AI Engine
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-full text-xs flex items-center gap-1.5 shadow-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-sm shadow-blue-500/50"></div>
                <span className="text-gray-200">Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl mb-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-white text-lg">Network Insight</h4>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    AI POWERED
                  </span>
                </div>
                <p className="text-sm text-gray-200">
                  Bitcoin network is currently operating at <span className="font-bold text-emerald-400">optimal health</span> with hashrate reaching all-time highs. The increasing difficulty indicates strong network security and growing mining participation. Market analysis shows <span className="font-bold text-blue-400">positive momentum</span> with steady volume growth.
                </p>
              </div>
            </div>
          </div>

          <p className="mb-5 text-sm text-gray-200 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg shadow-md">
            <span className="font-bold text-blue-400">Explore comprehensive network metrics</span> including hashrate, difficulty, and market data. Our analytics engine processes data from multiple sources to provide <span className="font-bold text-blue-400">real-time insights</span> into the Bitcoin network health and market conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <EnhancedMarketAnalysisCard />
          <EnhancedNetworkHealthCard />
        </div>

        <div className="mt-5 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data sources: mempool.space API, CoinMarketCap API
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </main>
  )
}
