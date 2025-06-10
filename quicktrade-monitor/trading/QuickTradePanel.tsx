'use client';

import React, { useState, useEffect } from 'react';

// Declarações de tipos para carteiras Web3
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
    };
  }
}
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpDown, Zap, ExternalLink, AlertTriangle, CheckCircle,
  TrendingUp, Coins, Clock, Shield, Target, BarChart3, Loader2,
  RefreshCw, Eye, DollarSign, Fuel, Network, ChevronDown,
  Info, Star, Sparkles, Activity, Calculator, Wallet
} from 'lucide-react';
import { FeeExplanationModal } from './FeeExplanationModal';

interface ExchangeQuote {
  name: string;
  network: 'ethereum' | 'arbitrum' | 'optimism' | 'polygon' | 'base' | 'avalanche' | 'bsc' | 'solana';
  price: number;
  liquidityUSD: number;
  estimatedGas: number;
  gasUSD: number;
  slippage: number;
  route: string[];
  confidence: number;
  url: string;
}

interface QuickTradeAnalysis {
  fromToken: string;
  toToken: string;
  amount: number;
  bestExchange: ExchangeQuote;
  allQuotes: ExchangeQuote[];
  serviceFee: {
    percentage: number;
    amountUSD: number;
    totalCost: number;
  };
  totalTransactionCost: number;
  estimatedOutput: number;
  priceImpact: number;
  savings: number;
}

// Tokens suportados por rede
const SUPPORTED_TOKENS = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', price: 2850 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6c...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2...', price: 1 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542...', price: 43000 },
    { symbol: 'UNI', name: 'Uniswap Token', address: '0x1f9840a85d5a...', price: 7.5 }
  ],
  arbitrum: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', price: 2850 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xFF970A61A04b...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C...', price: 1 },
    { symbol: 'ARB', name: 'Arbitrum Token', address: '0x912CE59144191C...', price: 1.2 },
    { symbol: 'GMX', name: 'GMX Token', address: '0xfc5A1A6EB076a...', price: 45 }
  ],
  optimism: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', price: 2850 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x7F5c764cBc14f...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x94b008aA00579...', price: 1 },
    { symbol: 'OP', name: 'Optimism Token', address: '0x4200000000000...', price: 2.3 },
    { symbol: 'VELO', name: 'Velodrome Token', address: '0x3c8B650257cFb...', price: 0.15 }
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', address: 'native', price: 0.8 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c9...', price: 1 },
    { symbol: 'WETH', name: 'Wrapped Ethereum', address: '0x7ceB23fD6bC0a...', price: 2850 },
    { symbol: 'QUICK', name: 'QuickSwap Token', address: '0x831753DD7087C...', price: 0.045 }
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', price: 2850 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eD...', price: 1 },
    { symbol: 'USDbC', name: 'USD Base Coin', address: '0xd9aAEc86B65D8...', price: 1 },
    { symbol: 'AERO', name: 'Aerodrome Token', address: '0x940181a94A35A...', price: 0.85 }
  ],
  avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', address: 'native', price: 25 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x9702230A8Ea53...', price: 1 },
    { symbol: 'JOE', name: 'TraderJoe Token', address: '0x6e84a6216eA6d...', price: 0.35 },
    { symbol: 'PNG', name: 'Pangolin Token', address: '0x60781C2586D6...', price: 0.12 }
  ],
  bsc: [
    { symbol: 'BNB', name: 'Binance Coin', address: 'native', price: 320 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059...', price: 1 },
    { symbol: 'CAKE', name: 'PancakeSwap Token', address: '0x0E09FaBB73Bd3...', price: 2.1 },
    { symbol: 'BSW', name: 'Biswap Token', address: '0x965F527D9159d...', price: 0.08 }
  ],
  solana: [
    { symbol: 'SOL', name: 'Solana', address: 'native', price: 95 },
    { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqS...', price: 1 },
    { symbol: 'USDT', name: 'Tether USD', address: 'Es9vMFrzaCER...', price: 1 },
    { symbol: 'RAY', name: 'Raydium', address: '4k3Dyjzvzp8e...', price: 2.1 },
    { symbol: 'ORCA', name: 'Orca', address: 'orcaEKTdK7LKz...', price: 1.8 }
  ]
};

const exchangeLogos = {
  'UNISWAP': '🦄',
  'SUSHISWAP': '🍣',
  '1INCH': '🔮',
  'CAMELOT': '⚔️',
  'GMX': '📈',
  'VELODROME': '🏎️',
  'BEETHOVEN_X': '🎼',
  'QUICKSWAP': '⚡',
  'AERODROME': '✈️',
  'BASESWAP': '🔵',
  'TRADERJOE': '☕',
  'PANGOLIN': '🐧',
  'PANCAKESWAP': '🥞',
  'BISWAP': '🔄',
  'JUPITER': '🪐',
  'ORCA': '🐋',
  'RAYDIUM': '⚡'
};

const networkColors = {
  ethereum: 'border-blue-500 bg-blue-500/10',
  arbitrum: 'border-blue-400 bg-blue-400/10',
  optimism: 'border-red-500 bg-red-500/10',
  polygon: 'border-purple-600 bg-purple-600/10',
  base: 'border-blue-600 bg-blue-600/10',
  avalanche: 'border-red-600 bg-red-600/10',
  bsc: 'border-yellow-500 bg-yellow-500/10',
  solana: 'border-purple-500 bg-purple-500/10'
};

// Exchanges suportadas por rede (definição no frontend)
const SUPPORTED_EXCHANGES = {
  ethereum: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'SUSHISWAP', logo: '🍣' },
    { name: '1INCH', logo: '🔮' }
  ],
  arbitrum: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'SUSHISWAP', logo: '🍣' },
    { name: 'CAMELOT', logo: '⚔️' },
    { name: 'GMX', logo: '📈' }
  ],
  optimism: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'VELODROME', logo: '🏎️' },
    { name: 'BEETHOVEN_X', logo: '🎼' }
  ],
  polygon: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'QUICKSWAP', logo: '⚡' },
    { name: 'SUSHISWAP', logo: '🍣' }
  ],
  base: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'AERODROME', logo: '✈️' },
    { name: 'BASESWAP', logo: '🔵' }
  ],
  avalanche: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'TRADERJOE', logo: '☕' },
    { name: 'PANGOLIN', logo: '🐧' }
  ],
  bsc: [
    { name: 'UNISWAP', logo: '🦄' },
    { name: 'PANCAKESWAP', logo: '🥞' },
    { name: 'BISWAP', logo: '🔄' }
  ],
  solana: [
    { name: 'JUPITER', logo: '🪐' },
    { name: 'ORCA', logo: '🐋' },
    { name: 'RAYDIUM', logo: '⚡' }
  ]
};

const networkLabels = {
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  polygon: 'Polygon',
  base: 'Base',
  avalanche: 'Avalanche',
  bsc: 'BSC',
  solana: 'Solana'
};

export function QuickTradePanel() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'polygon' | 'base' | 'avalanche' | 'bsc' | 'solana'>('ethereum');
  const [analysis, setAnalysis] = useState<QuickTradeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'analyzing' | 'results' | 'processing' | 'redirecting'>('input');
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [showFeeModal, setShowFeeModal] = useState(false);

  const availableTokens = SUPPORTED_TOKENS[network];

  // Conectar carteira EVM (MetaMask, WalletConnect, etc.)
  const connectEVMWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('🦊 Detectado MetaMask/EVM wallet');
        
        // Requisitar acesso à carteira
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setUserAddress(address);
          console.log('✅ Carteira EVM conectada:', address);
          
          // Verificar/trocar rede se necessário
          await switchToNetwork(network);
        }
      } else {
        // Fallback: redirecionar para MetaMask
        alert('MetaMask não detectado! Instale MetaMask ou cole seu endereço manualmente.');
        window.open('https://metamask.io/', '_blank');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar carteira EVM:', error);
      alert('Erro ao conectar carteira. Tente colar seu endereço manualmente.');
    }
  };

  // Conectar carteira Solana (Phantom, Solflare, etc.)
  const connectSolanaWallet = async () => {
    try {
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        console.log('👻 Detectado Phantom wallet');
        
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        setUserAddress(address);
        console.log('✅ Carteira Solana conectada:', address);
      } else {
        // Fallback: redirecionar para Phantom
        alert('Phantom não detectado! Instale Phantom ou cole seu endereço manualmente.');
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('❌ Erro ao conectar carteira Solana:', error);
      alert('Erro ao conectar carteira. Tente colar seu endereço manualmente.');
    }
  };

  // Trocar para rede correta
  const switchToNetwork = async (targetNetwork: string) => {
    const networkConfig = {
      ethereum: { chainId: '0x1' },
      arbitrum: { chainId: '0xa4b1' },
      optimism: { chainId: '0xa' },
      polygon: { chainId: '0x89' },
      base: { chainId: '0x2105' },
      avalanche: { chainId: '0xa86a' },
      bsc: { chainId: '0x38' }
    };

    try {
      const config = networkConfig[targetNetwork as keyof typeof networkConfig];
      if (config && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainId }]
        });
        console.log(`✅ Trocou para rede ${targetNetwork}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao trocar rede:', error);
      // Usuário pode continuar mesmo na rede errada
    }
  };

  const analyzeTradeOpportunity = async () => {
    console.log('🔍 Iniciando análise otimizada...', { fromToken, toToken, amount, network });
    
    if (!amount || parseFloat(amount) < 10) {
      alert('Valor mínimo de $10 requerido');
      return;
    }

    if (!userAddress) {
      alert('Por favor, insira o endereço da sua carteira');
      return;
    }

    setLoading(true);
    setStep('analyzing');

    try {
      console.log('📡 Enviando requisição para API otimizada...');
      
      // Use the optimized analysis endpoint
      const response = await fetch('/api/quicktrade/analyze/optimized', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount: parseFloat(amount),
          network,
          userAddress,
          slippagePreference: 0.5,
          speedPreference: 'standard'
        })
      });

      console.log('📨 Resposta recebida:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Dados otimizados recebidos:', data);
      
      if (data.success) {
        // Transform optimized data to legacy format for compatibility
        const transformedData = transformOptimizedData(data.data);
        setAnalysis(transformedData);
        setStep('results');
        console.log('🎉 Análise otimizada completa!', {
          performance: data.performance,
          confidence: data.data.confidence,
          bestDEX: data.data.bestRoute.dexPath[0]
        });
      } else {
        console.error('❌ Erro na resposta:', data.error);
        alert('Erro na análise: ' + data.error);
        setStep('input');
      }
    } catch (error) {
      console.error('💥 Erro na análise:', error);
      
      // Fallback to original API if optimized fails
      console.log('🔄 Tentando API original como fallback...');
      try {
        const fallbackResponse = await fetch('/api/quicktrade/analyze', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            fromToken,
            toToken,
            amount: parseFloat(amount),
            network
          })
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            setAnalysis(fallbackData.data);
            setStep('results');
            console.log('✅ Fallback bem-sucedido');
            return;
          }
        }
      } catch (fallbackError) {
        console.error('💥 Fallback também falhou:', fallbackError);
      }
      
      alert(`Erro na comunicação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  // Transform optimized data format to legacy format for UI compatibility
  const transformOptimizedData = (optimizedData: any): QuickTradeAnalysis => {
    const bestRoute = optimizedData.bestRoute;
    const gasEstimates = optimizedData.gasEstimates;
    
    return {
      fromToken,
      toToken,
      amount: parseFloat(amount),
      bestExchange: {
        name: bestRoute.dexPath[0],
        network: network as any,
        price: parseFloat(bestRoute.totalAmountOut) / parseFloat(amount),
        liquidityUSD: bestRoute.liquidityScore,
        estimatedGas: parseFloat(gasEstimates.gasLimit),
        gasUSD: gasEstimates.totalCostUSD,
        slippage: bestRoute.slippage,
        route: bestRoute.dexPath,
        confidence: optimizedData.confidence,
        url: `https://app.uniswap.org/#/swap?inputCurrency=${fromToken}&outputCurrency=${toToken}`
      },
      allQuotes: optimizedData.allRoutes.map((route: any) => ({
        name: route.dexPath[0],
        network: network as any,
        price: parseFloat(route.totalAmountOut) / parseFloat(amount),
        liquidityUSD: route.liquidityScore,
        estimatedGas: parseFloat(route.estimatedGas),
        gasUSD: 5, // Mock gas cost
        slippage: route.slippage,
        route: route.dexPath,
        confidence: route.confidence,
        url: `https://app.uniswap.org/#/swap?inputCurrency=${fromToken}&outputCurrency=${toToken}`
      })),
      serviceFee: {
        percentage: optimizedData.serviceFee.percentage * 100,
        amountUSD: optimizedData.serviceFee.amountUSD,
        totalCost: optimizedData.totalCosts.total.costUSD
      },
      totalTransactionCost: optimizedData.totalCosts.total.costUSD,
      estimatedOutput: parseFloat(optimizedData.expectedOutput.amount),
      priceImpact: bestRoute.totalPriceImpact,
      savings: 0 // Will be calculated
    };
  };

  const executeTradeRedirect = async () => {
    if (!analysis || !userAddress) {
      alert('Conecte sua carteira primeiro');
      return;
    }

    setProcessing(true);
    setStep('processing');

    try {
      const response = await fetch('/api/quicktrade/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: Date.now().toString(),
          userAddress,
          selectedExchange: analysis.bestExchange.name,
          network,
          fromToken,
          toToken,
          amount: analysis.amount,
          acceptedFee: analysis.serviceFee.amountUSD
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('redirecting');
        
        // Aguardar 3 segundos antes do redirect
        setTimeout(() => {
          window.open(data.data.redirectUrl, '_blank');
          setStep('input');
          setAnalysis(null);
          setAmount('');
        }, 3000);
      } else {
        alert('Erro no processamento: ' + data.error);
        setStep('results');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro no processamento do trade');
      setStep('results');
    } finally {
      setProcessing(false);
    }
  };

  const resetTrade = () => {
    setStep('input');
    setAnalysis(null);
    setAmount('');
    setLoading(false);
    setProcessing(false);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <div>
    <Card className="bg-gray-900 border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Trade</h2>
              <p className="text-sm text-gray-400">Melhor execução cross-DEX</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">
              0.05% Fee
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFeeModal(true)}
              className="text-green-400 hover:text-green-300 p-1"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Network Selector - Scrollable Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Select Network</h3>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(networkLabels) as Array<keyof typeof networkLabels>).map((net) => (
              <Button
                key={net}
                variant={network === net ? 'default' : 'outline'}
                onClick={() => {
                  setNetwork(net);
                  // Reset tokens when changing network
                  const tokens = SUPPORTED_TOKENS[net];
                  setFromToken(tokens[0].symbol);
                  setToToken(tokens[1].symbol);
                }}
                className={`text-xs p-2 h-auto ${network === net ? networkColors[net] : 'border-gray-600'}`}
              >
                <div className="text-center">
                  <Network className="w-3 h-3 mx-auto mb-1" />
                  <div>{networkLabels[net]}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-6">
            {/* Token Selection */}
            <div className="space-y-4">
              {/* From Token */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Você paga</span>
                  <span className="text-sm text-gray-400">
                    Balance: {availableTokens.find(t => t.symbol === fromToken)?.price || 0} {fromToken}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="bg-gray-700 rounded px-3 py-2 text-white border border-gray-600"
                  >
                    {availableTokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {amount && (
                  <div className="text-sm text-gray-400 mt-1">
                    ≈ ${(parseFloat(amount) * (availableTokens.find(t => t.symbol === fromToken)?.price || 0)).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapTokens}
                  className="rounded-full p-2 border-gray-600 hover:bg-gray-700"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Você recebe</span>
                  <span className="text-sm text-gray-400">
                    Balance: 0.00 {toToken}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-2xl font-bold text-gray-500">
                    {amount ? (parseFloat(amount) * 0.998).toFixed(4) : '0.0'}
                  </div>
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="bg-gray-700 rounded px-3 py-2 text-white border border-gray-600"
                  >
                    {availableTokens.filter(t => t.symbol !== fromToken).map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-white">Conectar Carteira Real</span>
              </div>
              
              {!userAddress ? (
                <div className="space-y-3">
                  {network === 'solana' ? (
                    <Button
                      onClick={connectSolanaWallet}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Conectar Phantom/Solflare
                    </Button>
                  ) : (
                    <Button
                      onClick={connectEVMWallet}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Conectar MetaMask/WalletConnect
                    </Button>
                  )}
                  
                  <div className="text-xs text-gray-400 text-center">
                    Ou cole seu endereço manualmente:
                  </div>
                  
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder={network === 'solana' 
                      ? 'Cole seu endereço Solana aqui...' 
                      : 'Cole seu endereço EVM aqui...'
                    }
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm border border-gray-600 font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">✅ Carteira Conectada</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserAddress('')}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Desconectar
                    </Button>
                  </div>
                  <div className="bg-gray-700 rounded p-2 font-mono text-xs text-white break-all">
                    {userAddress}
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <Button
              onClick={analyzeTradeOpportunity}
              disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 10 || !userAddress}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analisar Melhor Execução
            </Button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="text-center py-8">
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <BarChart3 className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analisando DEXs</h3>
              <p className="text-gray-400 mb-4">Encontrando a melhor execução para seu trade</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando liquidez em {SUPPORTED_EXCHANGES[network]?.length || 0} exchanges...
                </div>
                <Progress value={65} className="w-full max-w-xs mx-auto" />
              </div>
            </div>
          </div>
        )}

        {step === 'results' && analysis && (
          <div className="space-y-6">
            {/* Best Exchange Card */}
            <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {exchangeLogos[analysis.bestExchange.name as keyof typeof exchangeLogos]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{analysis.bestExchange.name}</h3>
                    <p className="text-sm text-green-400">Melhor execução encontrada</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  {analysis.bestExchange.confidence.toFixed(0)}% Conf.
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Preço de Execução</div>
                  <div className="text-xl font-bold text-white">
                    ${analysis.bestExchange.price.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Você Recebe</div>
                  <div className="text-xl font-bold text-green-400">
                    {analysis.estimatedOutput.toFixed(4)} {toToken}
                  </div>
                </div>
              </div>
            </Card>

            {/* Cost Breakdown */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Detalhamento de Custos
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor da Transação:</span>
                  <span className="text-white">${analysis.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de Rede:</span>
                  <span className="text-white">${analysis.bestExchange.gasUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa Quick Trade (0.05%):</span>
                  <span className="text-orange-400">${analysis.serviceFee.amountUSD.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slippage Estimado:</span>
                  <span className="text-yellow-400">{analysis.bestExchange.slippage.toFixed(2)}%</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Custo Total:</span>
                  <span className="text-white">${analysis.totalTransactionCost.toFixed(2)}</span>
                </div>
                {analysis.savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Economia vs Pior Opção:</span>
                    <span>${analysis.savings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* All Quotes */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Todas as Cotações
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllQuotes(!showAllQuotes)}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllQuotes ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              
              {showAllQuotes && (
                <div className="space-y-2">
                  {analysis.allQuotes.map((quote, index) => (
                    <div key={quote.name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {exchangeLogos[quote.name as keyof typeof exchangeLogos]}
                        </span>
                        <div>
                          <div className="font-medium text-white">{quote.name}</div>
                          <div className="text-xs text-gray-400">
                            Liquidez: ${(quote.liquidityUSD / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">${quote.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">
                          Gas: ${quote.gasUSD.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetTrade}
                className="flex-1 border-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nova Análise
              </Button>
              <Button
                onClick={executeTradeRedirect}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Executar em {analysis.bestExchange.name}
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-green-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <Shield className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Processando Trade</h3>
            <p className="text-gray-400">Configurando redirecionamento seguro...</p>
          </div>
        )}

        {step === 'redirecting' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Redirecionando...</h3>
            <p className="text-gray-400 mb-4">
              Abrindo {analysis?.bestExchange.name} em nova aba
            </p>
            <div className="bg-blue-900/50 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-left">
                  <p className="text-blue-200 text-sm font-medium mb-1">Próximos Passos:</p>
                  <ol className="text-blue-200 text-sm space-y-1">
                    <li>1. Complete sua transação na exchange</li>
                    <li>2. Nossa taxa será coletada automaticamente</li>
                    <li>3. Você receberá confirmação por email</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">CYPHER Quick Trade</span>
          </div>
          <p className="text-xs text-gray-400">
            Sistema de intermediação inteligente que encontra a melhor execução cross-DEX.
            Taxa de serviço transparente de 0.05% sobre o valor da transação.
          </p>
        </div>
      </div>
    </Card>

    {/* Fee Explanation Modal */}
    <FeeExplanationModal 
      isOpen={showFeeModal} 
      onClose={() => setShowFeeModal(false)} 
    />
    </div>
  );
}