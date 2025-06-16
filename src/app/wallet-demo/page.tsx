'use client'

import React from 'react'
import { BitcoinWalletManager } from '@/components/wallet/BitcoinWalletManager'
import { VoiceCommands } from '@/components/ai/VoiceCommands'

export default function WalletDemoPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 CYPHER ORDI MELHORIAS IMPLEMENTADAS
          </h1>
          <p className="text-gray-400 text-lg">
            Bitcoin Wallets + Voice AI + DeFi Trading System
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bitcoin Wallet Manager */}
          <BitcoinWalletManager />
          
          {/* Voice Commands */}
          <VoiceCommands />
        </div>
        
        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">
              ✅ Implementado: BigInt Fix
            </h3>
            <p className="text-gray-400">
              Polyfill completo para resolver erros "Cannot mix BigInt and other types"
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">
              ✅ Implementado: Wallet Manager
            </h3>
            <p className="text-gray-400">
              Sistema completo para conexão de carteiras Bitcoin (Xverse, Unisat, etc.)
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">
              ✅ Implementado: Voice AI
            </h3>
            <p className="text-gray-400">
              Comandos de voz para trading, carteiras e análise de mercado
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            🔧 Problemas Resolvidos:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">BigInt Math.pow errors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">Hydration mismatch errors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">LaserEyes import conflicts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">Favicon 500 errors</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">CSS syntax errors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">Environment validation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">Missing exports fixed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="text-white">TypeScript errors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}