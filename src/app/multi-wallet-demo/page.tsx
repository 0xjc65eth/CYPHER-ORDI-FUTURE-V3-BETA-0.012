/**
 * Multi-Wallet Demo Page
 * Demonstração completa do sistema de multi-wallet para Quick Trade
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Zap, 
  Info, 
  CheckCircle, 
  Star,
  Bitcoin,
  Network,
  Coins,
  ArrowRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Carrega componentes com AppKit dinamicamente, apenas no cliente
const EnhancedQuickTrade = dynamic(
  () => import('@/components/quick-trade/EnhancedQuickTrade'),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const MultiChainWallet = dynamic(
  () => import('@/components/wallet/MultiChainWallet'),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const MultiChainWalletButton = dynamic(
  () => import('@/components/wallet/MultiChainWalletButton'),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }
);

const MultiWalletDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Multi-Wallet Quick Trade System
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema avançado de trading que detecta automaticamente carteiras e otimiza 
            execução cross-chain para Bitcoin, Ethereum, Solana e outras redes.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Production Ready
            </Badge>
            <Badge className="bg-blue-600 text-white">
              <Star className="w-3 h-3 mr-1" />
              AGENT 7 Implementation
            </Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Bitcoin className="w-5 h-5" />
                <span>Bitcoin Wallets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">🟠 Unisat</span>
                  <Badge variant="outline">Recommended</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✖️ Xverse</span>
                  <Badge variant="outline">Mobile + Desktop</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🛢️ OYL</span>
                  <Badge variant="outline">Advanced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🪄 Magic Eden</span>
                  <Badge variant="outline">NFT Focus</Badge>
                </div>
              </div>
              <p className="text-xs text-orange-700 mt-3">
                Suporte completo para BTC, Ordinals, Runes e BRC-20 tokens
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Network className="w-5 h-5" />
                <span>EVM Networks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">🦊 MetaMask</span>
                  <Badge variant="outline">Most Popular</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🔗 WalletConnect</span>
                  <Badge variant="outline">Universal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🔵 Coinbase</span>
                  <Badge variant="outline">Institutional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🛡️ Trust Wallet</span>
                  <Badge variant="outline">Mobile-First</Badge>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                Ethereum, BSC, Arbitrum, Optimism, Polygon, Base, Avalanche
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Coins className="w-5 h-5" />
                <span>Solana Ecosystem</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">👻 Phantom</span>
                  <Badge variant="outline">Leading</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">☀️ Solflare</span>
                  <Badge variant="outline">Feature Rich</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">🎒 Backpack</span>
                  <Badge variant="outline">New Generation</Badge>
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-3">
                Native SOL and SPL token support with low fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Highlights */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🚀 Sistema de Auto-Detecção Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">Funcionalidades Avançadas:</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Detecção automática de carteiras instaladas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Recomendação inteligente por asset
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Switch automático de redes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Estado global compartilhado
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">Mapping Inteligente:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>BTC trades</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-mono">Bitcoin wallets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ETH/L2 trades</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-mono">EVM wallets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SOL trades</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-mono">Solana wallets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Runes trades</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-mono">Bitcoin wallets</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Chain Wallet Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-6 h-6 text-blue-500" />
                <span>Multi-Chain Wallet Interface</span>
              </CardTitle>
              <p className="text-gray-600">
                Interface completa com suporte a múltiplas redes e carteiras.
              </p>
            </CardHeader>
            <CardContent>
              <MultiChainWallet onBalanceUpdate={(balance) => console.log('Portfolio:', balance)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="w-6 h-6 text-green-500" />
                <span>Compact Wallet Button</span>
              </CardTitle>
              <p className="text-gray-600">
                Versão compacta com dropdown inteligente para navegação.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Compact Variant:</h5>
                <MultiChainWalletButton 
                  variant="compact"
                  showBalance={true}
                  showChainSwitcher={true}
                  showNetworkStatus={true}
                />
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Minimal Variant:</h5>
                <MultiChainWalletButton 
                  variant="minimal"
                  showNetworkStatus={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Trade Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span>Quick Trade Integration</span>
            </CardTitle>
            <p className="text-gray-600">
              Teste o sistema completo abaixo. O sistema detectará automaticamente suas carteiras 
              e recomendará a melhor opção para cada asset.
            </p>
          </CardHeader>
          <CardContent>
            <EnhancedQuickTrade />
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🏗️ Arquitetura Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="font-semibold">Core Components:</div>
                <ul className="list-disc list-inside space-y-1 text-gray-600 pl-4">
                  <li><code>MultiChainWallet.js</code> - Serviço principal</li>
                  <li><code>MultiChainWalletButton.tsx</code> - Interface UI</li>
                  <li><code>web3modal.config.ts</code> - Configuração Web3Modal</li>
                  <li><code>evmWalletConnect.ts</code> - Conectores EVM</li>
                  <li><code>solanaWalletConnect.ts</code> - Conectores Solana</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Performance & UX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="font-semibold">Otimizações:</div>
                <ul className="list-disc list-inside space-y-1 text-gray-600 pl-4">
                  <li>Conexão simultânea de múltiplas carteiras</li>
                  <li>Cache inteligente de detecções</li>
                  <li>Listeners otimizados para eventos</li>
                  <li>UI contextual por asset</li>
                  <li>Fallbacks para erros de conexão</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">Como usar:</div>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Selecione um asset no Quick Trade acima</li>
                <li>O sistema detectará automaticamente carteiras compatíveis</li>
                <li>Clique em "Auto-conectar" ou gerencie carteiras manualmente</li>
                <li>Execute trades com detecção automática da melhor rede</li>
                <li>Monitore múltiplas carteiras simultaneamente</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-gray-600">
            🤖 <strong>AGENT 7</strong> - Multi-Wallet Quick Trade System | 
            Implementação completa para CYPHER ORDI FUTURE
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiWalletDemoPage;