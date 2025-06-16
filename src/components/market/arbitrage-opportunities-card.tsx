'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Badge, Metric } from '@tremor/react'
import { RiExchangeDollarLine, RiRefreshLine, RiArrowRightLine, RiExternalLinkLine, RiTimeLine, RiPercentLine } from 'react-icons/ri'
import Link from 'next/link'

interface ArbitrageOpportunity {
  id: string
  type: 'ordinals' | 'runes'
  name: string
  symbol: string
  buyExchange: string
  buyPrice: number
  buyLink: string
  sellExchange: string
  sellPrice: number
  sellLink: string
  profitPercentage: number
  estimatedFees: number
  netProfit: number
  volume24h: number
  timeDetected: Date
  difficulty: 'easy' | 'medium' | 'hard'
}

export function ArbitrageOpportunitiesCard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [filter, setFilter] = useState<'all' | 'ordinals' | 'runes'>('all')

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
    
    // Simulated arbitrage opportunities data
    const simulatedOpportunities: ArbitrageOpportunity[] = [
      {
        id: 'arb-1',
        type: 'ordinals',
        name: 'Bitcoin Puppets',
        symbol: 'BTCP',
        buyExchange: 'Magic Eden',
        buyPrice: 0.175,
        buyLink: 'https://magiceden.io/ordinals/marketplace/bitcoin-puppets',
        sellExchange: 'Gamma.io',
        sellPrice: 0.192,
        sellLink: 'https://gamma.io/ordinals/collections/bitcoin-puppets',
        profitPercentage: 9.7,
        estimatedFees: 0.002,
        netProfit: 0.015,
        volume24h: 125000,
        timeDetected: new Date(Date.now() - 25 * 60000), // 25 minutes ago
        difficulty: 'easy'
      },
      {
        id: 'arb-2',
        type: 'runes',
        name: 'PEPE',
        symbol: 'PEPE',
        buyExchange: 'RuneAlpha',
        buyPrice: 0.00000115,
        buyLink: 'https://runealpha.xyz/rune/PEPE',
        sellExchange: 'Unisat',
        sellPrice: 0.00000132,
        sellLink: 'https://unisat.io/market/rune/PEPE',
        profitPercentage: 14.8,
        estimatedFees: 0.00000005,
        netProfit: 0.00000012,
        volume24h: 345000,
        timeDetected: new Date(Date.now() - 12 * 60000), // 12 minutes ago
        difficulty: 'medium'
      },
      {
        id: 'arb-3',
        type: 'ordinals',
        name: 'Taproot Wizards',
        symbol: 'WIZARDS',
        buyExchange: 'Ordinals Market',
        buyPrice: 1.75,
        buyLink: 'https://ordinals.market/collection/taproot-wizards',
        sellExchange: 'Magic Eden',
        sellPrice: 1.85,
        sellLink: 'https://magiceden.io/ordinals/marketplace/taproot-wizards',
        profitPercentage: 5.7,
        estimatedFees: 0.015,
        netProfit: 0.085,
        volume24h: 156000,
        timeDetected: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        difficulty: 'medium'
      },
      {
        id: 'arb-4',
        type: 'runes',
        name: 'MEME',
        symbol: 'MEME',
        buyExchange: 'Unisat',
        buyPrice: 0.00000078,
        buyLink: 'https://unisat.io/market/rune/MEME',
        sellExchange: 'OKX',
        sellPrice: 0.00000092,
        sellLink: 'https://www.okx.com/web3/marketplace/runes/MEME',
        profitPercentage: 17.9,
        estimatedFees: 0.00000004,
        netProfit: 0.0000001,
        volume24h: 285000,
        timeDetected: new Date(Date.now() - 8 * 60000), // 8 minutes ago
        difficulty: 'hard'
      },
      {
        id: 'arb-5',
        type: 'ordinals',
        name: 'Bitcoin Frogs',
        symbol: 'FROGS',
        buyExchange: 'Gamma.io',
        buyPrice: 0.088,
        buyLink: 'https://gamma.io/ordinals/collections/bitcoin-frogs',
        sellExchange: 'Magic Eden',
        sellPrice: 0.095,
        sellLink: 'https://magiceden.io/ordinals/marketplace/bitcoin-frogs',
        profitPercentage: 8.0,
        estimatedFees: 0.001,
        netProfit: 0.006,
        volume24h: 78500,
        timeDetected: new Date(Date.now() - 35 * 60000), // 35 minutes ago
        difficulty: 'easy'
      },
    ]
    
    setOpportunities(simulatedOpportunities)
  }, [])

  // Refresh data
  const refreshData = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
      
      // Update one opportunity to simulate real-time changes
      setOpportunities(prev => {
        const updated = [...prev]
        const randomIndex = Math.floor(Math.random() * updated.length)
        const randomProfit = (Math.random() * 5) + 5
        
        updated[randomIndex] = {
          ...updated[randomIndex],
          profitPercentage: randomProfit,
          netProfit: updated[randomIndex].buyPrice * (randomProfit / 100),
          timeDetected: new Date()
        }
        
        return updated
      })
    }, 1000)
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins} min ago`
    } else {
      return `${Math.floor(diffMins / 60)} hr ago`
    }
  }

  // Format price based on value
  const formatPrice = (price: number) => {
    if (price < 0.00001) {
      return price.toFixed(8)
    }
    if (price < 0.01) {
      return price.toFixed(6)
    }
    if (price < 1) {
      return price.toFixed(4)
    }
    return price.toFixed(3)
  }

  // Filter opportunities
  const filteredOpportunities = filter === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.type === filter)

  // Return null during SSR to avoid hydration issues
  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiExchangeDollarLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Arbitrage Opportunities</Title>
            <Text className="text-xs text-gray-400">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </Text>
          </div>
        </div>
        <button 
          onClick={refreshData}
          className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
          disabled={isLoading}
        >
          <RiRefreshLine className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs rounded-full ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-500/20 text-gray-300 hover:bg-blue-500/30'
          } transition-colors`}
        >
          All Opportunities
        </button>
        <button
          onClick={() => setFilter('ordinals')}
          className={`px-3 py-1 text-xs rounded-full ${
            filter === 'ordinals' 
              ? 'bg-purple-500 text-white' 
              : 'bg-blue-500/20 text-gray-300 hover:bg-blue-500/30'
          } transition-colors`}
        >
          Ordinals
        </button>
        <button
          onClick={() => setFilter('runes')}
          className={`px-3 py-1 text-xs rounded-full ${
            filter === 'runes' 
              ? 'bg-amber-500 text-white' 
              : 'bg-blue-500/20 text-gray-300 hover:bg-blue-500/30'
          } transition-colors`}
        >
          Runes
        </button>
      </div>

      {/* Opportunities list */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-8 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Text className="text-gray-400">No arbitrage opportunities found</Text>
          </div>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <div 
              key={opportunity.id} 
              className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center">
                    <Text className="text-white font-medium">{opportunity.name}</Text>
                    <Badge 
                      className="ml-2" 
                      color={opportunity.type === 'ordinals' ? 'purple' : 'amber'} 
                      size="xs"
                    >
                      {opportunity.symbol}
                    </Badge>
                    <Badge 
                      className="ml-2" 
                      color={
                        opportunity.profitPercentage > 15 ? 'emerald' : 
                        opportunity.profitPercentage > 8 ? 'blue' : 
                        'gray'
                      } 
                      size="xs"
                    >
                      <div className="flex items-center">
                        <RiPercentLine className="mr-0.5" />
                        {opportunity.profitPercentage.toFixed(1)}% Profit
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <div className="flex items-center mr-3">
                      <RiTimeLine className="mr-1" />
                      {formatTimeAgo(opportunity.timeDetected)}
                    </div>
                    <div>
                      Difficulty: 
                      <span className={
                        opportunity.difficulty === 'easy' ? ' text-emerald-400' : 
                        opportunity.difficulty === 'medium' ? ' text-amber-400' : 
                        ' text-rose-400'
                      }>
                        {' '}{opportunity.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge 
                  color={opportunity.type === 'ordinals' ? 'purple' : 'amber'}
                >
                  {opportunity.type === 'ordinals' ? 'Ordinals' : 'Runes'}
                </Badge>
              </div>

              <div className="flex items-center justify-between bg-blue-500/5 rounded-lg p-3 mb-3">
                <div>
                  <Text className="text-xs text-gray-400">Buy on {opportunity.buyExchange}</Text>
                  <div className="flex items-center">
                    <Metric className="text-white text-lg">{formatPrice(opportunity.buyPrice)} BTC</Metric>
                    <Link 
                      href={opportunity.buyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center text-xs"
                    >
                      Buy <RiExternalLinkLine className="ml-1" />
                    </Link>
                  </div>
                </div>
                <RiArrowRightLine className="text-gray-400 mx-2" />
                <div className="text-right">
                  <Text className="text-xs text-gray-400">Sell on {opportunity.sellExchange}</Text>
                  <div className="flex items-center justify-end">
                    <Metric className="text-white text-lg">{formatPrice(opportunity.sellPrice)} BTC</Metric>
                    <Link 
                      href={opportunity.sellLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center text-xs"
                    >
                      Sell <RiExternalLinkLine className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text className="text-gray-400 text-xs">Est. Net Profit</Text>
                  <Text className="text-emerald-400 font-medium">{formatPrice(opportunity.netProfit)} BTC</Text>
                </div>
                <div>
                  <Text className="text-gray-400 text-xs">Est. Fees</Text>
                  <Text className="text-white">{formatPrice(opportunity.estimatedFees)} BTC</Text>
                </div>
                <div>
                  <Text className="text-gray-400 text-xs">24h Volume</Text>
                  <Text className="text-white">{(opportunity.volume24h / 1000).toFixed(1)}K BTC</Text>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
        <Text className="text-xs text-rose-300 font-bold">RISK DISCLAIMER:</Text>
        <Text className="text-xs text-gray-400 mt-1">
          Arbitrage opportunities come with risks including price slippage, transaction delays, and market volatility.
          Estimated profits are based on current market conditions and may change rapidly. Always verify prices before executing trades.
          Transaction fees and network congestion may impact profitability.
        </Text>
      </div>
    </Card>
  )
}

export default ArbitrageOpportunitiesCard
