'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationIcons } from '@/lib/icons/icon-system'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  description?: string
  badge?: string
  badgeType?: 'success' | 'warning' | 'info' | 'new'
  isNew?: boolean
  isPro?: boolean
}

const navigationItems: NavItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    href: '/',
    icon: NavigationIcons['/'].icon,
    description: '📊 Professional Trading Terminal'
  },
  {
    id: 'cypher-ai',
    label: 'CYPHER AI',
    href: '/cypher-ai',
    icon: NavigationIcons['/cypher-ai'].icon,
    description: '🤖 Advanced AI Trading Intelligence',
    badge: 'PRO',
    badgeType: 'info',
    isPro: true
  },
  {
    id: 'trading-bot',
    label: 'Trading Bot',
    href: '/trading-bot',
    icon: NavigationIcons['/trading'].icon,
    description: '🤖 Bot de Trading Automático',
    badge: 'NEW',
    badgeType: 'new'
  },
  {
    id: 'arbitrage',
    label: 'Arbitrage',
    href: '/arbitrage',
    icon: NavigationIcons['/arbitrage'].icon,
    description: '💰 Cross-exchange opportunities',
    badge: 'LIVE',
    badgeType: 'success'
  },
  {
    id: 'market',
    label: 'Market',
    href: '/market',
    icon: NavigationIcons['/market'].icon,
    description: '📊 Live market data & analysis'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: '/portfolio',
    icon: NavigationIcons['/portfolio'].icon,
    description: '💼 Track your investments',
    badge: 'NEW',
    badgeType: 'new'
  },
  {
    id: 'ordinals',
    label: 'Ordinals',
    href: '/ordinals',
    icon: NavigationIcons['/ordinals'].icon,
    description: '🚀 Advanced Ordinals & BRC-20 Analysis',
    badge: 'PRO',
    badgeType: 'info',
    isPro: true
  },
  {
    id: 'runes',
    label: 'Runes',
    href: '/runes',
    icon: NavigationIcons['/runes'].icon,
    description: 'ᚱ Advanced Trading Terminal',
    badge: 'LIVE',
    badgeType: 'success'
  },
  {
    id: 'brc20',
    label: 'BRC-20',
    href: '/brc20',
    icon: NavigationIcons['/brc20'].icon,
    description: '🪙 BRC-20 token analytics'
  },
  {
    id: 'rare-sats',
    label: 'Rare Sats',
    href: '/rare-sats',
    icon: NavigationIcons['/rare-sats'].icon,
    description: '💎 Rare satoshi hunting'
  },
  {
    id: 'miners',
    label: 'Miners',
    href: '/miners',
    icon: NavigationIcons['/miners'].icon,
    description: '⛏️ Mining profitability & stats'
  },
  {
    id: 'neural',
    label: 'Neural Lab',
    href: '/neural',
    icon: NavigationIcons['/neural'].icon,
    description: '🧠 AI model training & testing',
    badge: 'BETA',
    badgeType: 'warning'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: NavigationIcons['/analytics'].icon,
    description: '📈 Glassnode-level On-Chain Data',
    badge: 'PRO',
    badgeType: 'info'
  },
  {
    id: 'trading',
    label: 'Trading',
    href: '/trading',
    icon: NavigationIcons['/trading'].icon,
    description: '🔧 Professional trading terminal'
  },
  {
    id: 'social',
    label: 'Social',
    href: '/social',
    icon: NavigationIcons['/social'].icon,
    description: '💬 Community & sentiment'
  },
  {
    id: 'training',
    label: 'Training',
    href: '/training',
    icon: NavigationIcons['/training'].icon,
    description: '📚 Learn AI trading strategies'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    href: '/integrations',
    icon: NavigationIcons['/integrations'].icon,
    description: '🔗 Connect exchanges & wallets'
  }
]

export function MainNavigation() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <nav className="bg-black border-b border-white/10 relative z-[9999] sticky top-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg" />
            <span className="text-xl font-bold text-white">CYPHER ORDI</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navigationItems.slice(0, 10).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-white/10 group flex-shrink-0",
                    isActive && "bg-white/10 text-orange-500"
                  )}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={(e) => {
                    console.log('🔥 NAVIGATION CLICK:', item.href, item.label);
                    console.log('🔥 Event details:', e);
                    console.log('🔥 Current path:', window.location.pathname);
                    console.log('🔥 Target:', e.target);
                    console.log('🔥 currentTarget:', e.currentTarget);
                    console.log('🔥 Event phase:', e.eventPhase);
                    console.log('🔥 Default prevented:', e.defaultPrevented);
                    // Forçar navegação se Next.js Link falhar
                    const href = e.currentTarget.getAttribute('href');
                    if (href && window.location.pathname !== href) {
                      console.log('🚀 Forcing navigation to:', href);
                      setTimeout(() => {
                        if (window.location.pathname === href) {
                          console.log('✅ Navigation successful via Next.js Link');
                        } else {
                          console.log('⚠️ Next.js Link failed, using window.location');
                          window.location.href = href;
                        }
                      }, 100);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-orange-500" : "text-white/70 group-hover:text-white"
                    )} />
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-orange-500" : "text-white/70 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                        item.badgeType === 'success' && "bg-green-500/20 text-green-400",
                        item.badgeType === 'warning' && "bg-yellow-500/20 text-yellow-400",
                        item.badgeType === 'info' && "bg-blue-500/20 text-blue-400",
                        item.badgeType === 'new' && "bg-purple-500/20 text-purple-400 animate-pulse"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Tooltip */}
                  {hoveredItem === item.id && item.description && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap z-50 shadow-xl">
                      {item.description}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-l border-t border-white/10 rotate-45" />
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                  )}
                </Link>
              )
            })}
            
            {/* More Menu */}
            <div className="relative">
              <button 
                className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                onMouseEnter={() => setHoveredItem('more')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="text-sm font-medium text-white/70 group-hover:text-white">More</span>
              </button>
              
              {hoveredItem === 'more' && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50">
                  {navigationItems.slice(10).map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors",
                          isActive && "bg-white/10"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-orange-500" : "text-white/70"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          isActive ? "text-orange-500" : "text-white/70"
                        )}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={cn(
                            "ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                            item.badgeType === 'success' && "bg-green-500/20 text-green-400",
                            item.badgeType === 'warning' && "bg-yellow-500/20 text-yellow-400",
                            item.badgeType === 'info' && "bg-blue-500/20 text-blue-400",
                            item.badgeType === 'new' && "bg-purple-500/20 text-purple-400"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-white/70 rounded-full" />
              <span className="w-full h-0.5 bg-white/70 rounded-full" />
              <span className="w-full h-0.5 bg-white/70 rounded-full" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  )
}