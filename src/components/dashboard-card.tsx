import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  className?: string
  headerRight?: React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  loading?: boolean
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'default'
}

export function DashboardCard({
  title,
  children,
  className,
  headerRight,
  subtitle,
  icon,
  footer,
  loading = false,
  colorScheme = 'default'
}: DashboardCardProps) {
  const getGradient = () => {
    switch (colorScheme) {
      case 'blue':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'purple':
        return 'from-purple-500/10 to-indigo-500/10 border-purple-500/20';
      case 'green':
        return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20';
      case 'orange':
        return 'from-orange-500/10 to-amber-500/10 border-orange-500/20';
      case 'pink':
        return 'from-pink-500/10 to-rose-500/10 border-pink-500/20';
      default:
        return 'from-slate-800 to-slate-900 border-slate-700/50';
    }
  };

  const getHeaderGradient = () => {
    switch (colorScheme) {
      case 'blue':
        return 'from-blue-600/20 to-cyan-600/20 border-blue-500/20';
      case 'purple':
        return 'from-purple-600/20 to-indigo-600/20 border-purple-500/20';
      case 'green':
        return 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20';
      case 'orange':
        return 'from-orange-600/20 to-amber-600/20 border-orange-500/20';
      case 'pink':
        return 'from-pink-600/20 to-rose-600/20 border-pink-500/20';
      default:
        return 'from-slate-800 to-slate-900 border-slate-700/50';
    }
  };

  const getTitleColor = () => {
    switch (colorScheme) {
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text';
      case 'purple':
        return 'bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text';
      case 'green':
        return 'bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text';
      case 'orange':
        return 'bg-gradient-to-r from-orange-400 to-amber-400 text-transparent bg-clip-text';
      case 'pink':
        return 'bg-gradient-to-r from-pink-400 to-rose-400 text-transparent bg-clip-text';
      default:
        return 'text-white';
    }
  };

  return (
    <div className={cn('rounded-xl border bg-gradient-to-br shadow-xl overflow-hidden transition-all',
      getGradient(),
      loading ? 'opacity-70' : 'opacity-100',
      className
    )}>
      <div className={cn('p-4 border-b bg-gradient-to-r', getHeaderGradient())}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-white">{icon}</div>}
            <div>
              <h2 className={cn('text-lg font-bold', getTitleColor())}>{title}</h2>
              {subtitle && <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      </div>

      <div className={cn('p-4 backdrop-blur-sm', loading ? 'animate-pulse' : '')}>
        {children}
      </div>

      {footer && (
        <div className="px-4 py-3 border-t border-slate-700/30 text-xs text-gray-300 bg-black/20 backdrop-blur-sm">
          {footer}
        </div>
      )}
    </div>
  )
}