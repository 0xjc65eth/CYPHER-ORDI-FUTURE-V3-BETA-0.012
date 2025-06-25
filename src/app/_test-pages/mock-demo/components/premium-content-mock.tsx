'use client'

import React from 'react'
import { Card, Title, Text } from '@tremor/react'

export function PremiumContentMock() {
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <Title className="text-white text-xl mb-4">Premium Content (Mock)</Title>
      <div className="space-y-4">
        <Text className="text-gray-400">
          This is a mock of premium content that would be shown to users who have connected their wallet and own specific NFTs.
        </Text>
        <div className="bg-[#F7931A]/10 p-4 rounded-lg border border-[#F7931A]/20">
          <Text className="text-white font-medium">Premium Analysis</Text>
          <Text className="text-gray-400 text-sm mt-2">
            This section would contain premium analysis and insights.
          </Text>
        </div>
      </div>
    </Card>
  )
}