import { DashboardCard } from './dashboard-card'

function CommunityGrowthCard() {
  return (
    <DashboardCard
      title="Community Growth"
      subtitle="Monthly growth across platforms"
      colorScheme="orange"
      headerRight={
        <div className="flex items-center gap-2">
          <select className="bg-slate-800/80 border border-orange-500/30 text-gray-200 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500/50">
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
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
                <div>300,000</div>
                <div>250,000</div>
                <div>200,000</div>
                <div>150,000</div>
                <div>100,000</div>
                <div>50,000</div>
                <div>0</div>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-16 right-0 flex justify-between text-xs text-gray-300">
                <div>Jan</div>
                <div>Feb</div>
                <div>Mar</div>
                <div>Apr</div>
                <div>May</div>
              </div>

              {/* Grid lines */}
              <div className="absolute left-16 right-0 top-0 bottom-15 flex flex-col justify-between">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border-b border-dashed border-slate-700/50 w-full h-0"></div>
                ))}
              </div>

              {/* Vertical grid lines */}
              <div className="absolute left-16 right-0 top-0 bottom-15 flex justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-l border-dashed border-slate-700/50 h-full w-0"></div>
                ))}
              </div>

              {/* This would be replaced with actual chart bars */}
              <div className="absolute left-16 right-0 bottom-15 flex justify-between items-end h-[calc(100%-15px)]">
                {/* Jan */}
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md h-[30%] shadow-lg shadow-orange-500/20"></div>
                  <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md h-[25%] shadow-lg shadow-blue-500/20"></div>
                </div>

                {/* Feb */}
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md h-[40%] shadow-lg shadow-orange-500/20"></div>
                  <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md h-[35%] shadow-lg shadow-blue-500/20"></div>
                </div>

                {/* Mar */}
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md h-[50%] shadow-lg shadow-orange-500/20"></div>
                  <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md h-[45%] shadow-lg shadow-blue-500/20"></div>
                </div>

                {/* Apr */}
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md h-[60%] shadow-lg shadow-orange-500/20"></div>
                  <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md h-[50%] shadow-lg shadow-blue-500/20"></div>
                </div>

                {/* May */}
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md h-[70%] shadow-lg shadow-orange-500/20"></div>
                  <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md h-[60%] shadow-lg shadow-blue-500/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-orange-500 to-orange-400"></div>
              <span className="text-gray-300">Total Community</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 to-blue-400"></div>
              <span className="text-gray-300">Active Users</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-3 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-300">Total Members</div>
                <div className="text-xl font-bold text-white">1,245,320</div>
              </div>
            </div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +12.3% from last month
            </div>
          </div>

          <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-3 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-300">Active Members</div>
                <div className="text-xl font-bold text-white">342,890</div>
              </div>
            </div>
            <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +8.7% from last month
            </div>
          </div>

          <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-3 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-300">Engagement Rate</div>
                <div className="text-xl font-bold text-white">27.5%</div>
              </div>
            </div>
            <div className="text-xs text-rose-500 flex items-center gap-1 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              -1.2% from last month
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Data from all platforms combined
        </span>
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </DashboardCard>
  )
}

export { CommunityGrowthCard }
