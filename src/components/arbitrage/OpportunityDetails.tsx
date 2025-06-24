'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  BarChart3,
  Brain,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArbitrageOpportunity } from '@/hooks/useArbitrage';

interface OpportunityDetailsProps {
  opportunity: ArbitrageOpportunity | null;
  onClose: () => void;
}

export default function OpportunityDetails({ opportunity, onClose }: OpportunityDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'execution'>('overview');

  if (!opportunity) return null;

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'BTC') {
      return `₿${value.toFixed(8)}`;
    } else if (currency === 'USD') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${value.toFixed(6)} ${currency}`;
  };

  const getRiskColor = (spread: number) => {
    if (spread >= 20) return 'text-red-400';
    if (spread >= 15) return 'text-orange-400';
    if (spread >= 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const executionSteps = [
    { step: 1, title: 'Verificar liquidez', status: 'completed' },
    { step: 2, title: 'Executar compra', status: 'pending' },
    { step: 3, title: 'Transferir ativo', status: 'pending' },
    { step: 4, title: 'Executar venda', status: 'pending' },
    { step: 5, title: 'Confirmar lucro', status: 'pending' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-orange-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className={`${
                  opportunity.type === 'ordinals' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                  opportunity.type === 'runes' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                  'bg-blue-500/20 border-blue-500 text-blue-400'
                } border`}>
                  {opportunity.type.toUpperCase()}
                </Badge>
                <h2 className="text-2xl font-bold text-white">{opportunity.symbol}</h2>
              </div>
              <div className="text-gray-400">
                <span className="text-sm">{opportunity.name}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'analysis', label: 'Análise IA', icon: Brain },
              { id: 'execution', label: 'Execução', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-800/50 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-400">{opportunity.spread.toFixed(2)}%</div>
                          <div className="text-sm text-gray-400">Spread</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">
                            {formatCurrency(opportunity.potentialProfit, opportunity.baseCurrency)}
                          </div>
                          <div className="text-sm text-gray-400">Lucro Potencial</div>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${getConfidenceColor(opportunity.confidence)}`}>
                            {opportunity.confidence.toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-400">Confiança</div>
                        </div>
                        <Target className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Comparison */}
                <Card className="bg-black/50 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400">Comparação de Preços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Buy Side */}
                      <div className="space-y-3">
                        <h4 className="text-green-400 font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Comprar em {opportunity.buySource}
                        </h4>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-400 font-mono">
                            {formatCurrency(opportunity.buyPrice, opportunity.baseCurrency)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Volume: {opportunity.volume24h ? formatCurrency(opportunity.volume24h, 'USD') : 'N/A'}
                          </div>
                          <Button
                            size="sm"
                            className="mt-2 bg-green-600 hover:bg-green-700"
                            onClick={() => window.open(opportunity.buyLink, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver Oferta
                          </Button>
                        </div>
                      </div>

                      {/* Sell Side */}
                      <div className="space-y-3">
                        <h4 className="text-red-400 font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 rotate-180" />
                          Vender em {opportunity.sellSource}
                        </h4>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                          <div className="text-2xl font-bold text-red-400 font-mono">
                            {formatCurrency(opportunity.sellPrice, opportunity.baseCurrency)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Liquidez: {opportunity.liquidity}%
                          </div>
                          <Button
                            size="sm"
                            className="mt-2 bg-red-600 hover:bg-red-700"
                            onClick={() => window.open(opportunity.sellLink, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver Oferta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-gray-300 text-sm">Informações do Mercado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cap. de Mercado:</span>
                        <span className="text-white font-mono">
                          {opportunity.marketCap ? formatCurrency(opportunity.marketCap, 'USD') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Última Atualização:</span>
                        <span className="text-white font-mono">
                          {new Date(opportunity.lastUpdated).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo de Ativo:</span>
                        <Badge className="bg-gray-700 text-gray-300">
                          {opportunity.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-gray-300 text-sm">Avaliação de Risco</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nível de Spread:</span>
                        <span className={`font-semibold ${getRiskColor(opportunity.spread)}`}>
                          {opportunity.spread >= 20 ? 'Muito Alto' :
                           opportunity.spread >= 15 ? 'Alto' :
                           opportunity.spread >= 10 ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liquidez:</span>
                        <span className={`font-semibold ${
                          opportunity.liquidity >= 80 ? 'text-green-400' :
                          opportunity.liquidity >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {opportunity.liquidity >= 80 ? 'Alta' :
                           opportunity.liquidity >= 50 ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confiança:</span>
                        <span className={`font-semibold ${getConfidenceColor(opportunity.confidence)}`}>
                          {opportunity.confidence.toFixed(0)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* AI Analysis */}
                <Card className="bg-gray-800/50 border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Análise CYPHER AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">
                        {opportunity.aiAnalysis || 'A análise de IA detectou esta oportunidade com base em discrepâncias de preços entre as exchanges. O algoritmo neural considera fatores como volatilidade histórica, padrões de liquidez e movimentos de mercado para calcular a probabilidade de sucesso desta arbitragem.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-800/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Riscos Identificados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Risco de Liquidez</div>
                          <div className="text-xs text-gray-400">
                            Liquidez {opportunity.liquidity < 50 ? 'baixa' : 'adequada'} pode impactar a execução
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Volatilidade</div>
                          <div className="text-xs text-gray-400">
                            Preços podem variar durante a execução da arbitragem
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Taxas de Rede</div>
                          <div className="text-xs text-gray-400">
                            Taxas de transação podem reduzir a margem de lucro
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Fatores Positivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Spread Atrativo</div>
                          <div className="text-xs text-gray-400">
                            Diferença de {opportunity.spread.toFixed(1)}% oferece boa margem
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Exchanges Confiáveis</div>
                          <div className="text-xs text-gray-400">
                            {opportunity.buySource} e {opportunity.sellSource} são plataformas estabelecidas
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">Volume Adequado</div>
                          <div className="text-xs text-gray-400">
                            Volume de 24h suporta a transação planejada
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'execution' && (
              <div className="space-y-6">
                {/* Execution Plan */}
                <Card className="bg-gray-800/50 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Plano de Execução
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {executionSteps.map((step, index) => (
                        <div key={step.step} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step.status === 'completed' ? 'bg-green-500 text-white' :
                            step.status === 'pending' ? 'bg-gray-600 text-gray-300' :
                            'bg-orange-500 text-white'
                          }`}>
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${
                              step.status === 'completed' ? 'text-green-400' :
                              step.status === 'pending' ? 'text-gray-400' :
                              'text-orange-400'
                            }`}>
                              {step.title}
                            </div>
                          </div>
                          <div>
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : step.status === 'pending' ? (
                              <Clock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Execution Warning */}
                <Card className="bg-yellow-900/20 border-yellow-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-yellow-400 mb-1">Aviso Importante</div>
                        <div className="text-sm text-yellow-200">
                          Esta é uma demonstração. A execução real de arbitragem requer conexão com exchanges, 
                          capital suficiente e análise detalhada de riscos. Sempre faça sua própria pesquisa 
                          antes de executar qualquer estratégia de trading.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Última atualização: {new Date(opportunity.lastUpdated).toLocaleString()}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">
                Monitorar Oportunidade
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}