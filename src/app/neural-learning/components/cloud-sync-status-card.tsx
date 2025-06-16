'use client'

import React from 'react'
import { Card, Title, Text, Metric, Flex, ProgressBar } from '@tremor/react'
import { RiCloudLine } from 'react-icons/ri'

export function CloudSyncStatusCard() {
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
          <RiCloudLine className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <Title className="text-white text-xl">Cloud Sync Status</Title>
      </div>

      <div className="space-y-4">
        <div>
          <Flex>
            <Text className="text-gray-400">Sync Status</Text>
            <Text className="text-emerald-400 font-medium">Connected</Text>
          </Flex>
          <Flex className="mt-2">
            <Text className="text-gray-400">Last Sync</Text>
            <Text className="text-white">5 minutes ago</Text>
          </Flex>
        </div>

        <div>
          <Text className="text-gray-400 mb-2">Storage Usage</Text>
          <ProgressBar value={42} color="indigo" className="mt-2" />
          <Flex className="mt-1">
            <Text className="text-xs text-gray-500">4.2 GB / 10 GB</Text>
            <Text className="text-xs text-gray-500">42%</Text>
          </Flex>
        </div>

        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
          <Text className="text-white font-medium">Cloud Storage Details</Text>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <Text className="text-xs text-gray-400">Models</Text>
              <Metric className="text-white text-lg">2.1 GB</Metric>
            </div>
            <div>
              <Text className="text-xs text-gray-400">Training Data</Text>
              <Metric className="text-white text-lg">1.8 GB</Metric>
            </div>
            <div>
              <Text className="text-xs text-gray-400">Predictions</Text>
              <Metric className="text-white text-lg">0.2 GB</Metric>
            </div>
            <div>
              <Text className="text-xs text-gray-400">Other</Text>
              <Metric className="text-white text-lg">0.1 GB</Metric>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
