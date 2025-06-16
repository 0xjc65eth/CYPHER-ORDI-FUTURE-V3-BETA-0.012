import { DashboardCard } from './dashboard-card'

function SocialMetricsCard({ data }: { data: any[] }) {
  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case 'Twitter':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          icon: 'T',
          border: 'border-blue-400/30',
          hover: 'hover:border-blue-400/50',
          shadow: 'shadow-blue-500/20'
        };
      case 'Reddit':
        return {
          bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          icon: 'R',
          border: 'border-orange-400/30',
          hover: 'hover:border-orange-400/50',
          shadow: 'shadow-orange-500/20'
        };
      case 'Telegram':
        return {
          bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
          icon: 'TG',
          border: 'border-cyan-400/30',
          hover: 'hover:border-cyan-400/50',
          shadow: 'shadow-cyan-500/20'
        };
      case 'Discord':
        return {
          bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
          icon: 'D',
          border: 'border-indigo-400/30',
          hover: 'hover:border-indigo-400/50',
          shadow: 'shadow-indigo-500/20'
        };
      case 'YouTube':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          icon: 'YT',
          border: 'border-red-400/30',
          hover: 'hover:border-red-400/50',
          shadow: 'shadow-red-500/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          icon: platform.charAt(0),
          border: 'border-gray-400/30',
          hover: 'hover:border-gray-400/50',
          shadow: 'shadow-gray-500/20'
        };
    }
  };

  const getSentimentColors = (sentiment: number) => {
    if (sentiment > 70) {
      return {
        bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        progressBg: 'bg-gradient-to-r from-green-500 to-emerald-500'
      };
    } else if (sentiment > 50) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        progressBg: 'bg-gradient-to-r from-yellow-500 to-amber-500'
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-rose-500/20 to-red-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        progressBg: 'bg-gradient-to-r from-rose-500 to-red-500'
      };
    }
  };

  return (
    <DashboardCard
      title="Platform Metrics"
      subtitle="Engagement across social platforms"
      colorScheme="blue"
      headerRight={
        <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 rounded-full text-xs flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Live Data
        </div>
      }
    >
      <div className="space-y-4">
        {data.map((platform, index) => {
          const colors = getPlatformColors(platform.platform);
          const sentimentColors = getSentimentColors(platform.sentiment);

          return (
            <div
              key={platform.platform}
              className={`p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border ${colors.border} ${colors.hover} rounded-xl transition-all ${colors.shadow} shadow-lg hover:shadow-xl`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                    {colors.icon}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{platform.platform}</p>
                    <p className="text-xs text-gray-300">
                      {platform.followers || platform.members || platform.subscribers} members
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 ${sentimentColors.bg} border ${sentimentColors.border} rounded-lg text-xs font-medium ${sentimentColors.text}`}>
                    {platform.sentiment}% sentiment
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-300 font-medium">Engagement</span>
                  <span className="text-xs text-white font-medium">{platform.engagement}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5 p-0.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      platform.engagement > 7 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      platform.engagement > 5 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      'bg-gradient-to-r from-yellow-500 to-amber-500'
                    }`}
                    style={{ width: `${platform.engagement * 10}%` }}
                  >
                    <div className="w-full h-full bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Active</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Growth</span>
                  </span>
                </div>
                <div className="text-gray-300">
                  Impact: <span className={sentimentColors.text}>
                    {platform.sentiment > 70 ? 'High' : platform.sentiment > 50 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-700/30 text-xs text-gray-300 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Data from 12+ social platforms
        </span>
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </DashboardCard>
  )
}

export { SocialMetricsCard }
