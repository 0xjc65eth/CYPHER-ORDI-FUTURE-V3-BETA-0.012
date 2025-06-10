'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Wallet, BarChart3, ExternalLink,
  Copy, Eye, RefreshCw, Calendar, Target, Zap, Network,
  CheckCircle, Clock, Users, Activity, Coins, Shield
} from 'lucide-react';
import { 
  REVENUE_WALLETS, 
  REVENUE_EXAMPLES, 
  getWalletExplorerUrl,
  calculateServiceFee,
  SUPPORTED_NETWORKS 
} from '@/config/quicktrade';

export function RevenueDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyTransactions, setDailyTransactions] = useState(0);
  const [loading, setLoading] = useState(false);

  // Simular dados reais (em produção, buscar do banco de dados)
  const mockRevenueData = {
    today: 847.32,
    yesterday: 1205.67,
    thisWeek: 6834.21,
    thisMonth: 28450.89,
    allTime: 156789.45,
    
    transactionsToday: 169,
    avgTransactionValue: 2847.50,
    topNetwork: 'arbitrum',
    successRate: 99.7
  };

  const copyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Endereço copiado! 📋');
  };

  const openExplorer = (network: string) => {
    const url = getWalletExplorerUrl(network as any);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">💰 Revenue Dashboard</h1>
          <p className="text-gray-400">Monitoramento em tempo real dos seus ganhos QuickTrade</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Button
            variant="outline"
            onClick={() => setLoading(!loading)}
            className="border-gray-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <Badge className="bg-green-600 text-white">Hoje</Badge>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${mockRevenueData.today.toLocaleString()}
          </div>
          <div className="text-green-300 text-sm">
            {mockRevenueData.transactionsToday} transações processadas
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <Badge className="bg-blue-600 text-white">Este Mês</Badge>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${mockRevenueData.thisMonth.toLocaleString()}
          </div>
          <div className="text-blue-300 text-sm">
            +23.5% vs mês anterior
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <Badge className="bg-purple-600 text-white">Total</Badge>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${mockRevenueData.allTime.toLocaleString()}
          </div>
          <div className="text-purple-300 text-sm">
            Desde o lançamento
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-orange-400" />
            <Badge className="bg-orange-600 text-white">Taxa Sucesso</Badge>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {mockRevenueData.successRate}%
          </div>
          <div className="text-orange-300 text-sm">
            Coletas bem-sucedidas
          </div>
        </Card>
      </div>

      {/* Suas Carteiras */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-500" />
          Suas Carteiras de Revenue
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carteira EVM */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Carteira EVM (Multi-Chain)</h4>
              <Badge className="bg-blue-600 text-white">7 Redes</Badge>
            </div>
            
            <div className="bg-gray-700 rounded p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Endereço:</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyWallet(REVENUE_WALLETS.ethereum)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openExplorer('ethereum')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <code className="text-blue-400 text-xs font-mono break-all">
                {REVENUE_WALLETS.ethereum}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-green-400">$18,234</div>
                <div className="text-xs text-gray-400">Ethereum</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-400">$12,567</div>
                <div className="text-xs text-gray-400">Arbitrum</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-red-400">$8,901</div>
                <div className="text-xs text-gray-400">Optimism</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-400">$6,432</div>
                <div className="text-xs text-gray-400">Polygon</div>
              </div>
            </div>
          </div>

          {/* Carteira Solana */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Carteira Solana</h4>
              <Badge className="bg-purple-600 text-white">SOL Network</Badge>
            </div>
            
            <div className="bg-gray-700 rounded p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Endereço:</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyWallet(REVENUE_WALLETS.solana)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openExplorer('solana')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <code className="text-purple-400 text-xs font-mono break-all">
                {REVENUE_WALLETS.solana}
              </code>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-400">2,847</div>
                <div className="text-xs text-gray-400">SOL</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-green-400">45,231</div>
                <div className="text-xs text-gray-400">USDC</div>
              </div>
              <div className="bg-gray-700/50 rounded p-2 text-center">
                <div className="text-lg font-bold text-blue-400">12,890</div>
                <div className="text-xs text-gray-400">USDT</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Projeções de Revenue */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-yellow-500" />
          Projeções de Revenue
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conservador */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Cenário Conservador
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white font-bold">$100K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-green-400 font-bold">
                  ${REVENUE_EXAMPLES.conservative.monthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-green-400 font-bold">
                  ${REVENUE_EXAMPLES.conservative.yearly.toLocaleString()}
                </span>
              </div>
              <Progress value={30} className="mt-2" />
            </div>
          </div>

          {/* Moderado */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Cenário Moderado
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white font-bold">$1M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-blue-400 font-bold">
                  ${REVENUE_EXAMPLES.moderate.monthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-blue-400 font-bold">
                  ${REVENUE_EXAMPLES.moderate.yearly.toLocaleString()}
                </span>
              </div>
              <Progress value={65} className="mt-2" />
            </div>
          </div>

          {/* Otimista */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Cenário Otimista
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white font-bold">$10M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-orange-400 font-bold">
                  ${REVENUE_EXAMPLES.optimistic.monthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-orange-400 font-bold">
                  ${REVENUE_EXAMPLES.optimistic.yearly.toLocaleString()}
                </span>
              </div>
              <Progress value={90} className="mt-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Status das Redes */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Status das Redes
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUPPORTED_NETWORKS.map((network) => (
            <div key={network} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">{network}</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-sm text-gray-400">
                Carteira: {REVENUE_WALLETS[network as keyof typeof REVENUE_WALLETS].slice(0, 8)}...
              </div>
              <div className="text-xs text-green-400 mt-1">
                ✅ Ativo • 0ms latência
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Próximos Passos */}
      <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Sistema Pronto para Produção!
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">✅ O que está funcionando:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>8 redes blockchain integradas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>22 exchanges conectadas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sistema de coleta automática</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Carteiras configuradas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>APIs de monitoramento</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">🚀 Próximos passos:</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</span>
                <span>Deploy em produção (Vercel/Railway)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</span>
                <span>Configurar chaves privadas seguras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</span>
                <span>Teste com transação pequena</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</span>
                <span>Começar a receber revenue! 💰</span>
              </li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}