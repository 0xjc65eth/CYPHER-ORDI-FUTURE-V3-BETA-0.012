/**
 * CYPHER ORDI FUTURE V4.0 - NEURAL NAVIGATION
 * Sistema de Navegação Ultra Moderno
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  RiDashboardLine, 
  RiBarChartLine, 
  RiBitCoinLine,
  RiNewspaperLine,
  RiWalletLine,
  RiQuestionLine,
  RiTeamLine,
  RiExchangeLine
} from 'react-icons/ri'
import { FaRobot, FaBrain, FaGem } from 'react-icons/fa'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  gradient: string
  description: string
  isNew?: boolean
}

export function ModernNavigation() {
  const pathname = usePathname()
  
  const mainNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: RiDashboardLine,
      gradient: 'from-purple-500 to-blue-500',
      description: 'Neural AI Analytics'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: RiBarChartLine,
      gradient: 'from-emerald-500 to-cyan-500',
      description: 'Advanced Market Data'
    },
    {
      name: 'Ordinals',
      href: '/ordinals',
      icon: FaGem,
      gradient: 'from-orange-500 to-yellow-500',
      description: 'NFT Collections',
      isNew: true
    },
    {
      name: 'Runes',
      href: '/runes',
      icon: FaRobot,
      gradient: 'from-pink-500 to-purple-500',
      description: 'Token Markets'
    },
    {
      name: 'Mining',
      href: '/miners',
      icon: RiBitCoinLine,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Network Mining'
    },
    {
      name: 'Trading',
      href: '/trading',
      icon: RiExchangeLine,
      gradient: 'from-cyan-500 to-blue-500',
      description: 'Smart Trading',
      isNew: true
    }
  ]
  const secondaryNavItems: NavItem[] = [
    {
      name: 'News',
      href: '/news',
      icon: RiNewspaperLine,
      gradient: 'from-gray-500 to-slate-500',
      description: 'Latest Updates'
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: RiWalletLine,
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Connect Wallet'
    },
    {
      name: 'Help',
      href: '/help',
      icon: RiQuestionLine,
      gradient: 'from-teal-500 to-emerald-500',
      description: 'Support Center'
    },
    {
      name: 'Community',
      href: '/community',
      icon: RiTeamLine,
      gradient: 'from-red-500 to-pink-500',
      description: 'Join Community'
    }
  ]

  return (
    <nav className="bg-gradient-to-br from-[#0a0118]/95 to-[#1a0b2e]/95 backdrop-blur-lg border-b border-purple-500/30">
      <div className="container mx-auto px-4">
        {/* Logo Section */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
              <FaBrain className="text-white text-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06D6A0] text-transparent bg-clip-text">
                CYPHER ORDI
              </h1>
              <p className="text-xs text-gray-400">Neural AI Platform</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-semibold">NEURAL ACTIVE</span>
          </div>
        </div>
        {/* Main Navigation */}
        <div className="pb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`
                    relative group px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }
                  `}>
                    <div className="flex items-center gap-3">
                      <Icon className={`text-lg ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {item.name}
                          </span>
                          {item.isNew && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${isActive ? 'text-gray-100' : 'text-gray-500'}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    {!isActive && (
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 
                        group-hover:opacity-20 rounded-xl transition-opacity duration-300
                      `} />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="flex flex-wrap gap-2">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`
                    px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white` 
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/40 hover:text-gray-300'
                    }
                  `}>
                    <div className="flex items-center gap-2">
                      <Icon className="text-sm" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}