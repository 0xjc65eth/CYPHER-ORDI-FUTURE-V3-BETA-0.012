'use client'

import { PremiumContent } from './premium-content'

export function PremiumExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Standard Content</h2>
        <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212]">
          <h3 className="text-lg font-medium mb-2">Bitcoin Market Overview</h3>
          <p className="text-gray-400 mb-4">
            Basic market data and trends available to all users.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#1D1D1D] rounded-md">
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-medium">$63,245</p>
            </div>
            <div className="p-3 bg-[#1D1D1D] rounded-md">
              <p className="text-xs text-gray-500">24h Change</p>
              <p className="text-lg font-medium text-green-500">+2.4%</p>
            </div>
            <div className="p-3 bg-[#1D1D1D] rounded-md">
              <p className="text-xs text-gray-500">Volume</p>
              <p className="text-lg font-medium">$32.8B</p>
            </div>
            <div className="p-3 bg-[#1D1D1D] rounded-md">
              <p className="text-xs text-gray-500">Market Cap</p>
              <p className="text-lg font-medium">$1.24T</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Premium Content</h2>
        <PremiumContent>
          <div className="relative p-6 border border-[#8B5CF6]/30 rounded-lg bg-[#121212]">
            <h3 className="text-lg font-medium mb-2">Advanced Market Insights</h3>
            <p className="text-gray-400 mb-4">
              Exclusive premium data and advanced analytics.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                <p className="text-xs text-[#8B5CF6]">Whale Activity</p>
                <p className="text-lg font-medium">Accumulating</p>
                <p className="text-xs text-gray-500">+12.3% in 24h</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                <p className="text-xs text-[#8B5CF6]">Sentiment</p>
                <p className="text-lg font-medium">Extremely Bullish</p>
                <p className="text-xs text-gray-500">92/100 index</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                <p className="text-xs text-[#8B5CF6]">Price Prediction</p>
                <p className="text-lg font-medium text-green-500">$72,500</p>
                <p className="text-xs text-gray-500">30-day forecast</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                <p className="text-xs text-[#8B5CF6]">Arbitrage</p>
                <p className="text-lg font-medium">3.2% Opportunity</p>
                <p className="text-xs text-gray-500">Binance → Coinbase</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
              <p className="text-xs text-[#8B5CF6] mb-1">Neural Analysis</p>
              <p className="text-sm text-white/90">
                Our neural network predicts a <span className="text-green-500 font-medium">strong bullish trend</span> over the next 7 days with 89% confidence. Key indicators include increased institutional buying, positive on-chain metrics, and favorable technical patterns.
              </p>
            </div>
          </div>
        </PremiumContent>
      </div>
    </div>
  )
}
