import { DashboardCard } from './dashboard-card'

function SentimentTrendCard() {
  return (
    <DashboardCard
      title="Sentiment Trend"
      subtitle="Market sentiment analysis over time"
      colorScheme="green"
      headerRight={
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Neural Analysis
          </div>
        </div>
      }
    >
      <div className="h-[250px] relative">
        {/* This would be replaced with a real chart component */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
            <div className="relative h-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-300">
                <div>100</div>
                <div>75</div>
                <div>50</div>
                <div>25</div>
                <div>0</div>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-300">
                <div>Jan</div>
                <div>Feb</div>
                <div>Mar</div>
                <div>Apr</div>
                <div>May</div>
              </div>

              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-15 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-b border-dashed border-slate-700/50 w-full h-0"></div>
                ))}
              </div>

              {/* Vertical grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-15 flex justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-l border-dashed border-slate-700/50 h-full w-0"></div>
                ))}
              </div>

              {/* This would be replaced with actual chart lines */}
              <div className="absolute left-10 right-0 top-0 bottom-15 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Bullish line with glow effect */}
                  <filter id="glow-green">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <path
                    d="M0,80 C50,60 100,50 150,40 C200,30 250,20 300,15 C350,10 400,10 400,10"
                    fill="none"
                    stroke="url(#gradient-green)"
                    strokeWidth="3"
                    filter="url(#glow-green)"
                  />
                  <defs>
                    <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Neutral line with glow effect */}
                  <filter id="glow-yellow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <path
                    d="M0,120 C50,110 100,100 150,90 C200,80 250,70 300,60 C350,50 400,40 400,40"
                    fill="none"
                    stroke="url(#gradient-yellow)"
                    strokeWidth="3"
                    filter="url(#glow-yellow)"
                  />
                  <defs>
                    <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>

                  {/* Bearish line with glow effect */}
                  <filter id="glow-red">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <path
                    d="M0,150 C50,155 100,160 150,165 C200,170 250,175 300,180 C350,185 400,185 400,185"
                    fill="none"
                    stroke="url(#gradient-red)"
                    strokeWidth="3"
                    filter="url(#glow-red)"
                  />
                  <defs>
                    <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <span className="text-gray-300">Bullish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"></div>
              <span className="text-gray-300">Neutral</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"></div>
              <span className="text-gray-300">Bearish</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-green-500/20 rounded-xl p-3 hover:border-green-500/40 transition-colors">
            <div className="text-xs text-gray-300 mb-1">Current Bullish</div>
            <div className="text-xl font-bold text-green-400">78.5%</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +2.3% from last week
            </div>
          </div>
          <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-3 hover:border-yellow-500/40 transition-colors">
            <div className="text-xs text-gray-300 mb-1">Current Neutral</div>
            <div className="text-xl font-bold text-yellow-400">15.2%</div>
            <div className="text-xs text-rose-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              -1.8% from last week
            </div>
          </div>
          <div className="bg-slate-800/50 border border-rose-500/20 rounded-xl p-3 hover:border-rose-500/40 transition-colors">
            <div className="text-xs text-gray-300 mb-1">Current Bearish</div>
            <div className="text-xl font-bold text-rose-400">6.3%</div>
            <div className="text-xs text-rose-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              -0.5% from last week
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Neural system analysis
        </span>
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </DashboardCard>
  )
}

export { SentimentTrendCard }
