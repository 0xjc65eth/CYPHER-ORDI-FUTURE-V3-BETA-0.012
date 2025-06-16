'use client'

import { Card, Title, Text, Flex, ProgressBar } from '@tremor/react'
import { RiFlowChart, RiCodeSSlashLine, RiRobot2Line, RiLightbulbFlashLine } from 'react-icons/ri'

export function NeuralArchitectureCard() {
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
          <RiFlowChart className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <Title className="text-white text-xl">Neural System Architecture</Title>
      </div>

      <div className="space-y-6">
        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20 shadow-md">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
              <RiCodeSSlashLine className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <Text className="text-sm font-medium text-white">Technical Architecture</Text>
          </div>
          
          <Text className="text-sm text-white/90 mb-3">
            Our neural system is built on a multi-layered architecture designed for Bitcoin ecosystem analysis:
          </Text>
          
          <div className="space-y-3">
            <div>
              <Flex className="mb-1">
                <Text className="text-xs text-white/90">Data Ingestion Layer</Text>
                <Text className="text-xs text-[#8B5CF6]">98% Complete</Text>
              </Flex>
              <ProgressBar value={98} color="indigo" className="h-1.5" />
              <Text className="text-xs text-white/70 mt-1">
                Collects and normalizes data from blockchain, markets, and social platforms
              </Text>
            </div>
            
            <div>
              <Flex className="mb-1">
                <Text className="text-xs text-white/90">Processing Layer</Text>
                <Text className="text-xs text-[#8B5CF6]">92% Complete</Text>
              </Flex>
              <ProgressBar value={92} color="indigo" className="h-1.5" />
              <Text className="text-xs text-white/70 mt-1">
                Cleans, transforms, and prepares data for neural network consumption
              </Text>
            </div>
            
            <div>
              <Flex className="mb-1">
                <Text className="text-xs text-white/90">Neural Network Layer</Text>
                <Text className="text-xs text-[#8B5CF6]">85% Complete</Text>
              </Flex>
              <ProgressBar value={85} color="indigo" className="h-1.5" />
              <Text className="text-xs text-white/70 mt-1">
                Multiple specialized networks for different analysis domains
              </Text>
            </div>
            
            <div>
              <Flex className="mb-1">
                <Text className="text-xs text-white/90">Insight Generation Layer</Text>
                <Text className="text-xs text-[#8B5CF6]">78% Complete</Text>
              </Flex>
              <ProgressBar value={78} color="indigo" className="h-1.5" />
              <Text className="text-xs text-white/70 mt-1">
                Transforms neural outputs into actionable insights and visualizations
              </Text>
            </div>
          </div>
        </div>
        
        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20 shadow-md">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
              <RiRobot2Line className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <Text className="text-sm font-medium text-white">Neural Network Types</Text>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1D2235] p-3 rounded-lg border border-[#8B5CF6]/10">
              <Text className="text-xs font-medium text-[#8B5CF6] mb-1">Convolutional Networks</Text>
              <Text className="text-xs text-white/70">
                For pattern recognition in price charts and market structures
              </Text>
            </div>
            
            <div className="bg-[#1D2235] p-3 rounded-lg border border-[#8B5CF6]/10">
              <Text className="text-xs font-medium text-[#8B5CF6] mb-1">Recurrent Networks</Text>
              <Text className="text-xs text-white/70">
                For time-series analysis and sequence prediction
              </Text>
            </div>
            
            <div className="bg-[#1D2235] p-3 rounded-lg border border-[#8B5CF6]/10">
              <Text className="text-xs font-medium text-[#8B5CF6] mb-1">Transformer Models</Text>
              <Text className="text-xs text-white/70">
                For social sentiment analysis and context understanding
              </Text>
            </div>
            
            <div className="bg-[#1D2235] p-3 rounded-lg border border-[#8B5CF6]/10">
              <Text className="text-xs font-medium text-[#8B5CF6] mb-1">Reinforcement Learning</Text>
              <Text className="text-xs text-white/70">
                For optimizing trading strategies and decision making
              </Text>
            </div>
          </div>
        </div>
        
        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20 shadow-md">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
              <RiLightbulbFlashLine className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <Text className="text-sm font-medium text-white">System Capabilities</Text>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Real-time data processing and analysis</Text>
            </div>
            
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Automated pattern recognition in market structures</Text>
            </div>
            
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Predictive analytics for price movements and trends</Text>
            </div>
            
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Sentiment analysis from social media and news sources</Text>
            </div>
            
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Arbitrage opportunity detection across marketplaces</Text>
            </div>
            
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mr-2"></div>
              <Text className="text-xs text-white/90">Continuous learning and model improvement</Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
