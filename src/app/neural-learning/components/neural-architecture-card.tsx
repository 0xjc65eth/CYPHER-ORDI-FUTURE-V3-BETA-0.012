'use client'

import React from 'react'
import { Card, Title, Text } from '@tremor/react'
import { RiFlowChart } from 'react-icons/ri'

export function NeuralArchitectureCard() {
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
          <RiFlowChart className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <Title className="text-white text-xl">Neural Architecture</Title>
      </div>

      <div className="space-y-4">
        <Text className="text-gray-400">
          The neural system uses a sophisticated architecture of interconnected neural networks.
        </Text>
        
        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
          <Text className="text-white font-medium">Neural Architecture Details</Text>
          <Text className="text-gray-400 text-sm mt-2">
            Placeholder for neural architecture details.
          </Text>
        </div>
      </div>
    </Card>
  )
}
