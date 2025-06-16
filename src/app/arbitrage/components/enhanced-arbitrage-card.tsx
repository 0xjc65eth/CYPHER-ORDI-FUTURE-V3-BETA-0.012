'use client'

import React from 'react'
import { Card, Title, Text } from '@tremor/react'

export function EnhancedArbitrageCard() {
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <Title className="text-white text-xl mb-4">Arbitrage Opportunities</Title>
      <div className="space-y-4">
        <Text className="text-gray-400">
          Arbitrage opportunities will be displayed here. This is a placeholder component.
        </Text>
        <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
          <Text className="text-white font-medium">Under Development</Text>
          <Text className="text-gray-400 text-sm mt-2">
            This feature is currently under development. Check back later for real-time arbitrage opportunities.
          </Text>
        </div>
      </div>
    </Card>
  )
}
