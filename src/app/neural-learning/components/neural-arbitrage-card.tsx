'use client'

import React, { useState } from 'react'
import { Card, Title, Text, Metric, Flex, Badge } from '@tremor/react'
import { RiLineChartLine, RiShieldCheckLine, RiErrorWarningLine, RiRefreshLine, RiArrowRightUpLine, RiArrowRightDownLine } from 'react-icons/ri'

// Simulated arbitrage opportunities with error correction
const arbitrageOpportunities = [
  {
    id: 'arb-1',
    type: 'Ordinals',
    collection: 'Bitcoin Puppets',
    buyMarket: 'Magic Eden',
    sellMarket: 'Gamma.io',
    buyPrice: 0.0325,
    sellPrice: 0.0412,
    profitMargin: 21.2,
    confidence: 92,
    timeWindow: '2-3 hours',
    corrected: true,
    originalProfitMargin: 26.8,
    correctionReason: 'Adjusted for Magic Eden 2.5% fee and Gamma.io 2% fee'
  },
  {
    id: 'arb-2',
    type: 'Runes',
    runeName: 'PEPE',
    buyMarket: 'Unisat',
    sellMarket: 'OKX',
    buyPrice: 0.00000215,
    sellPrice: 0.00000258,
    profitMargin: 15.3,
    confidence: 88,
    timeWindow: '1-2 hours',
    corrected: true,
    originalProfitMargin: 20.0,
    correctionReason: 'Adjusted for network fees and Unisat 1.5% transaction fee'
  },
  {
    id: 'arb-3',
    type: 'Ordinals',
    collection: 'OCM GENESIS',
    buyMarket: 'Gamma.io',
    sellMarket: 'Magic Eden',
    buyPrice: 0.185,
    sellPrice: 0.215,
    profitMargin: 11.8,
    confidence: 95,
    timeWindow: '3-4 hours',
    corrected: true,
    originalProfitMargin: 16.2,
    correctionReason: 'Adjusted for marketplace fees and transfer costs'
  }
]

// Simulated trade error corrections
const tradeCorrections = [
  {
    id: 'trade-1',
    type: 'SMC',
    asset: 'BTC/USD',
    field: 'stopLoss',
    oldValue: 58200,
    newValue: 61450,
    reason: 'Invalid stop loss below support level',
    severity: 'high',
    timestamp: new Date().toISOString()
  },
  {
    id: 'trade-2',
    type: 'Entry',
    asset: 'BTC/USD',
    field: 'entryPrice',
    oldValue: 65800,
    newValue: 65400,
    reason: 'Entry price adjusted to respect resistance level',
    severity: 'medium',
    timestamp: new Date().toISOString()
  },
  {
    id: 'trade-3',
    type: 'Target',
    asset: 'BTC/USD',
    field: 'takeProfit',
    oldValue: 72500,
    newValue: 71200,
    reason: 'Take profit adjusted to align with historical resistance',
    severity: 'medium',
    timestamp: new Date().toISOString()
  }
]

export function NeuralArbitrageCard() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [showCorrectionDetails, setShowCorrectionDetails] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)

  const handleOpportunityClick = (opportunity: any) => {
    setSelectedOpportunity(opportunity)
    setShowCorrectionDetails(true)
  }

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
            <RiLineChartLine className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <Title className="text-white text-xl">Neural Arbitrage & Trade Analysis</Title>
        </div>

        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium ${activeTab === 'opportunities' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
            onClick={() => setActiveTab('opportunities')}
          >
            Arbitrage
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium ${activeTab === 'corrections' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
            onClick={() => setActiveTab('corrections')}
          >
            Trade Corrections
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'opportunities' ? (
          <>
            <div className="flex justify-between items-center">
              <Text className="text-gray-400">
                The neural system continuously analyzes price differences across markets to identify arbitrage opportunities.
              </Text>
              <div className="flex items-center text-xs text-emerald-400">
                <RiShieldCheckLine className="mr-1" />
                <Text className="text-emerald-400">Auto-corrected for fees</Text>
              </div>
            </div>

            {showCorrectionDetails && selectedOpportunity ? (
              <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-2 border border-[#8B5CF6]/30">
                      <RiShieldCheckLine className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <Text className="text-white font-medium">{selectedOpportunity.type} Arbitrage Correction Details</Text>
                      <Text className="text-xs text-gray-400">{selectedOpportunity.collection || selectedOpportunity.runeName}</Text>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowCorrectionDetails(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg mb-3">
                  <Text className="text-white text-sm font-medium mb-2">Profit Margin Correction</Text>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-500/20 p-2 rounded">
                      <Text className="text-xs text-gray-400">Original Calculation:</Text>
                      <Text className="text-red-300 font-medium">{selectedOpportunity.originalProfitMargin}% profit</Text>
                    </div>
                    <div className="bg-emerald-500/20 p-2 rounded">
                      <Text className="text-xs text-gray-400">Corrected Calculation:</Text>
                      <Text className="text-emerald-300 font-medium">{selectedOpportunity.profitMargin}% profit</Text>
                    </div>
                  </div>
                </div>

                <div className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <Text className="text-white text-sm font-medium mb-2">Correction Explanation</Text>
                  <Text className="text-gray-300 text-xs">{selectedOpportunity.correctionReason}</Text>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <Text className="text-xs text-gray-400">Buy Market:</Text>
                      <Text className="text-white text-sm">{selectedOpportunity.buyMarket} @ {selectedOpportunity.buyPrice} BTC</Text>
                    </div>
                    <div>
                      <Text className="text-xs text-gray-400">Sell Market:</Text>
                      <Text className="text-white text-sm">{selectedOpportunity.sellMarket} @ {selectedOpportunity.sellPrice} BTC</Text>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-3 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30"
                  onClick={() => setShowCorrectionDetails(false)}
                >
                  <RiRefreshLine className="mr-1" />
                  Return to Opportunities List
                </button>
              </div>
            ) : (
              <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
                <div className="flex justify-between items-center mb-3">
                  <Text className="text-white font-medium">Arbitrage Opportunities</Text>
                  <Badge color="indigo" className="bg-[#8B5CF6]/20 text-[#8B5CF6]">Auto-corrected</Badge>
                </div>

                <div className="space-y-3">
                  {arbitrageOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="bg-[#8B5CF6]/20 p-3 rounded-lg cursor-pointer hover:bg-[#8B5CF6]/30 transition-colors"
                      onClick={() => handleOpportunityClick(opportunity)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${opportunity.confidence > 90 ? 'bg-emerald-400' : 'bg-amber-400'} mr-2`}></div>
                          <Text className="text-white text-sm font-medium">
                            {opportunity.type}: {opportunity.collection || opportunity.runeName}
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <RiShieldCheckLine className="text-emerald-400 w-3 h-3 mr-1" />
                          <Text className="text-xs text-emerald-400">Corrected</Text>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <Text className="text-xs text-gray-400">Profit Margin</Text>
                          <div className="flex items-center">
                            <Metric className="text-white text-lg">{opportunity.profitMargin}%</Metric>
                            <div className="ml-1 text-xs text-red-400 line-through">{opportunity.originalProfitMargin}%</div>
                          </div>
                        </div>
                        <div>
                          <Text className="text-xs text-gray-400">Confidence</Text>
                          <Metric className="text-white text-lg">{opportunity.confidence}%</Metric>
                        </div>
                        <div>
                          <Text className="text-xs text-gray-400">Time Window</Text>
                          <Text className="text-white text-sm">{opportunity.timeWindow}</Text>
                        </div>
                      </div>

                      <div className="flex justify-between mt-2 text-xs">
                        <div className="flex items-center text-blue-400">
                          <RiArrowRightDownLine className="mr-1" />
                          <Text className="text-blue-400">Buy: {opportunity.buyMarket}</Text>
                        </div>
                        <div className="flex items-center text-green-400">
                          <RiArrowRightUpLine className="mr-1" />
                          <Text className="text-green-400">Sell: {opportunity.sellMarket}</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
            <div className="flex justify-between items-center mb-3">
              <Text className="text-white font-medium">Trade Setup Corrections</Text>
              <div className="flex items-center text-xs text-[#8B5CF6]">
                <RiShieldCheckLine className="mr-1" />
                <Text className="text-[#8B5CF6]">{tradeCorrections.length} corrections applied</Text>
              </div>
            </div>

            <div className="space-y-3">
              {tradeCorrections.map((correction) => (
                <div key={correction.id} className="bg-[#8B5CF6]/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${correction.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'} mr-2`}></div>
                      <Text className="text-white text-sm font-medium">
                        {correction.type}: {correction.asset} {correction.field}
                      </Text>
                    </div>
                    <Badge
                      color={correction.severity === 'high' ? 'red' : 'amber'}
                      className={`${correction.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}
                    >
                      {correction.severity} priority
                    </Badge>
                  </div>

                  <Text className="text-xs text-gray-300 mb-2">{correction.reason}</Text>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-500/20 p-2 rounded">
                      <Text className="text-gray-400">Old Value:</Text>
                      <Text className="text-red-300 font-medium">{correction.oldValue}</Text>
                    </div>
                    <div className="bg-emerald-500/20 p-2 rounded">
                      <Text className="text-gray-400">New Value:</Text>
                      <Text className="text-emerald-300 font-medium">{correction.newValue}</Text>
                    </div>
                  </div>

                  <Text className="text-xs text-gray-400 mt-2">
                    Corrected: {new Date(correction.timestamp).toLocaleTimeString()}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
