'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, ArrowRight, DollarSign, Clock, CheckCircle,
  AlertTriangle, Zap, Copy, ExternalLink, Users, Target,
  TrendingUp, BarChart3, Coins, Shield, Network, Bot,
  ChevronRight, Play, Pause, Eye, Calculator
} from 'lucide-react';

export function TaxCollectionFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Suas carteiras de destino REAIS
  const YOUR_WALLETS = {
    ethereum: '0x742d35Cc6431C4b2b7D7B7E62f8D9E9F8F8F8F8F', // SUA CARTEIRA ETH
    solana: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',   // SUA CARTEIRA SOL
    business: 'cypher-revenue@business.com' // SUA CONTA BUSINESS
  };

  const collectionSteps = [
    {
      id: 1,
      title: "👤 Usuário Faz Swap",
      description: "Cliente troca $5,000 ETH → USDC no Arbitrum",
      detail: "Taxa calculada: $5,000 × 0.05% = $2.50",
      status: "user_action",
      icon: Users,
      color: "blue"
    },
    {
      id: 2,
      title: "🤖 Sistema Monitora",
      description: "Bot detecta transação confirmada na blockchain",
      detail: "Aguarda 6 confirmações (~2 minutos)",
      status: "monitoring",
      icon: Bot,
      color: "yellow"
    },
    {
      id: 3,
      title: "💸 Auto-Coleta Taxa",
      description: "Sistema executa transferência automática",
      detail: "$2.50 USDC → SUA CARTEIRA",
      status: "collecting",
      icon: Zap,
      color: "orange"
    },
    {
      id: 4,
      title: "✅ Dinheiro na SUA Carteira",
      description: "Taxa depositada diretamente na sua wallet",
      detail: "Você recebe $2.50 USDC imediatamente",
      status: "completed",
      icon: CheckCircle,
      color: "green"
    }
  ];

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= collectionSteps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const copyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    alert('Carteira copiada! 📋');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-900 to-blue-900 border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">💰 Como as Taxas Chegam na SUA Carteira</h2>
            <p className="text-green-300">Fluxo automático de coleta de revenue</p>
          </div>
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`${isPlaying ? 'bg-red-600' : 'bg-green-600'} hover:opacity-90`}
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pausar' : 'Ver Demo'}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-800/30 rounded-lg p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">0.05%</div>
            <div className="text-sm text-green-200">Taxa por transação</div>
          </div>
          <div className="bg-blue-800/30 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">2-5min</div>
            <div className="text-sm text-blue-200">Tempo para receber</div>
          </div>
          <div className="bg-purple-800/30 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">99.5%</div>
            <div className="text-sm text-purple-200">Taxa de sucesso</div>
          </div>
        </div>
      </Card>

      {/* Flow Visualization */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Fluxo de Coleta Automática
        </h3>

        <div className="space-y-4">
          {collectionSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;
            
            return (
              <div key={step.id} className="relative">
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-500 ${
                  isActive 
                    ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-700 bg-gray-800/50'
                }`}>
                  <div className={`p-3 rounded-full ${
                    isActive 
                      ? 'bg-orange-500 animate-pulse' 
                      : isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-gray-700'
                  }`}>
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                    <p className="text-gray-300 text-sm mb-1">{step.description}</p>
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {step.detail}
                    </p>
                  </div>

                  {isActive && (
                    <div className="animate-spin">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                  )}
                  
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {index < collectionSteps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className={`w-5 h-5 transition-colors ${
                      activeStep > index ? 'text-green-500' : 'text-gray-600'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Suas Carteiras de Destino */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-500" />
          SUAS Carteiras de Destino (Revenue Direto)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EVM Wallet */}
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-6 h-6 text-blue-400" />
              <div>
                <h4 className="font-semibold text-white">Carteira EVM (Todas as redes)</h4>
                <p className="text-sm text-blue-300">ETH, ARB, OP, POLY, BASE, AVAX, BSC</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Seu Endereço:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyWallet(YOUR_WALLETS.ethereum)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <code className="text-blue-400 text-xs font-mono break-all">
                  {YOUR_WALLETS.ethereum}
                </code>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tokens Recebidos:</span>
                  <span className="text-green-400">USDC, USDT, ETH, nativos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tempo de Depósito:</span>
                  <span className="text-blue-400">2-5 minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">✅ Ativo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solana Wallet */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="font-semibold text-white">Carteira Solana</h4>
                <p className="text-sm text-purple-300">SOL, USDC, USDT, SPL tokens</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-800 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Seu Endereço:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyWallet(YOUR_WALLETS.solana)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <code className="text-purple-400 text-xs font-mono break-all">
                  {YOUR_WALLETS.solana}
                </code>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tokens Recebidos:</span>
                  <span className="text-green-400">USDC, USDT, SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tempo de Depósito:</span>
                  <span className="text-blue-400">30 segundos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">✅ Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Exemplo de Revenue Real */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-yellow-500" />
          Simulação de Revenue Real
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cenário Conservador */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Cenário Conservador
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white">$100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Diário:</span>
                <span className="text-green-400 font-bold">$50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-green-400 font-bold">$1,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-green-400 font-bold">$18,000</span>
              </div>
            </div>
          </div>

          {/* Cenário Moderado */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Cenário Moderado
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white">$1,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Diário:</span>
                <span className="text-blue-400 font-bold">$500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-blue-400 font-bold">$15,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-blue-400 font-bold">$180,000</span>
              </div>
            </div>
          </div>

          {/* Cenário Otimista */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Cenário Otimista
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Volume Diário:</span>
                <span className="text-white">$10,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Diário:</span>
                <span className="text-orange-400 font-bold">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Mensal:</span>
                <span className="text-orange-400 font-bold">$150,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Anual:</span>
                <span className="text-orange-400 font-bold">$1,800,000</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Como Configurar */}
      <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Como Configurar AGORA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">🔧 Passos para Ativar:</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</span>
                <span>Atualize as carteiras de destino no código</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</span>
                <span>Configure chaves privadas no servidor (seguras)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</span>
                <span>Deploy do sistema em produção</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</span>
                <span>Monitore as primeiras transações</span>
              </li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">⚠️ Importante:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span>Mantenha chaves privadas em ambiente seguro</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Use carteiras multi-sig para maior segurança</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-blue-500 mt-0.5" />
                <span>Configure monitoramento 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500 mt-0.5" />
                <span>Implemente dashboards de revenue</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}