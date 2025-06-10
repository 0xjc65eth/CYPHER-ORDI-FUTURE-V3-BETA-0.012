// Sistema de Swap com Rotas Otimizadas
// Integração com 1inch, Jupiter e RunesDEX

export class SwapService {
  constructor() {
    this.oneInchAPI = 'https://api.1inch.dev/swap/v5.2';
    this.jupiterAPI = 'https://quote-api.jup.ag/v6';
    this.runesDexAPI = 'https://api.runesdex.com';
    
    // Chaves de API (usar variáveis de ambiente em produção)
    this.apiKey1Inch = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    this.cypherFeeRate = 0.0033; // 0.33% nossa taxa
    
    // Chains suportadas
    this.chains = {
      ethereum: 1,
      bsc: 56,
      polygon: 137,
      arbitrum: 42161,
      optimism: 10,
      base: 8453,
      solana: 'solana',
      bitcoin: 'bitcoin'
    };
  }

  async findBestRoute(fromToken, toToken, amount, chain, userAddress) {
    try {
      console.log('🔍 Buscando melhor rota para swap:', {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount,
        chain
      });

      const routes = [];

      // Bitcoin/Runes
      if (chain === 'bitcoin' || toToken.type === 'rune' || fromToken.type === 'rune') {
        const runesRoute = await this.getRunesRoute(fromToken, toToken, amount);
        if (runesRoute) routes.push(runesRoute);
      }

      // Solana
      if (chain === 'solana') {
        const jupiterRoute = await this.getJupiterRoute(fromToken, toToken, amount);
        if (jupiterRoute) routes.push(jupiterRoute);
      }

      // EVMs (Ethereum, Arbitrum, Polygon, etc)
      if (this.chains[chain] && typeof this.chains[chain] === 'number') {
        const oneInchRoute = await this.get1InchRoute(fromToken, toToken, amount, this.chains[chain]);
        if (oneInchRoute) routes.push(oneInchRoute);
      }

      // Encontrar melhor rota (maior output após fees)
      const bestRoute = this.selectBestRoute(routes);
      
      if (bestRoute) {
        bestRoute.userAddress = userAddress;
        bestRoute.timestamp = new Date().toISOString();
      }

      return bestRoute;
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      throw error;
    }
  }

  async getRunesRoute(fromToken, toToken, amount) {
    try {
      // Mock implementation para RunesDEX
      // Em produção, integrar com API real
      
      const mockResponse = {
        platform: 'RunesDEX',
        route: ['BTC', toToken.symbol],
        estimatedOutput: amount * 0.98, // 2% slippage simulado
        fee: amount * this.cypherFeeRate,
        gasEstimate: 0.0001, // Taxa de rede Bitcoin
        priceImpact: 0.5,
        slippage: 2.0,
        executionTime: '~10 min',
        confidence: 0.85
      };

      console.log('🟧 Rota RunesDEX encontrada:', mockResponse);
      return mockResponse;
    } catch (error) {
      console.error('Erro na rota RunesDEX:', error);
      return null;
    }
  }

  async getJupiterRoute(fromToken, toToken, amount) {
    try {
      const response = await fetch(`${this.jupiterAPI}/quote`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        params: {
          inputMint: fromToken.address,
          outputMint: toToken.address,
          amount: amount,
          slippageBps: 100 // 1%
        }
      });

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();

      const route = {
        platform: 'Jupiter',
        route: data.routePlan || [],
        estimatedOutput: data.outAmount,
        fee: amount * this.cypherFeeRate,
        priceImpact: data.priceImpactPct || 0,
        slippage: 1.0,
        executionTime: '~30 sec',
        confidence: 0.95,
        jupiter: data
      };

      console.log('🟣 Rota Jupiter encontrada:', route);
      return route;
    } catch (error) {
      console.error('Erro na rota Jupiter:', error);
      
      // Fallback com dados mock
      return {
        platform: 'Jupiter',
        route: [fromToken.symbol, toToken.symbol],
        estimatedOutput: amount * 0.995,
        fee: amount * this.cypherFeeRate,
        priceImpact: 0.2,
        slippage: 1.0,
        executionTime: '~30 sec',
        confidence: 0.8
      };
    }
  }

  async get1InchRoute(fromToken, toToken, amount, chainId) {
    try {
      const url = `${this.oneInchAPI}/${chainId}/quote`;
      const params = new URLSearchParams({
        src: fromToken.address,
        dst: toToken.address,
        amount: amount.toString(),
        includeGas: 'true'
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey1Inch}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status}`);
      }

      const data = await response.json();

      const route = {
        platform: '1inch',
        route: data.protocols || [],
        estimatedOutput: data.toAmount,
        fee: amount * this.cypherFeeRate,
        gas: data.estimatedGas,
        gasPrice: data.gasPrice,
        priceImpact: 0.3,
        slippage: 1.0,
        executionTime: '~1 min',
        confidence: 0.9,
        oneInch: data
      };

      console.log('🔵 Rota 1inch encontrada:', route);
      return route;
    } catch (error) {
      console.error('Erro na rota 1inch:', error);
      
      // Fallback com dados mock
      return {
        platform: '1inch',
        route: [fromToken.symbol, toToken.symbol],
        estimatedOutput: amount * 0.997,
        fee: amount * this.cypherFeeRate,
        gas: 150000,
        priceImpact: 0.2,
        slippage: 1.0,
        executionTime: '~1 min',
        confidence: 0.85
      };
    }
  }

  selectBestRoute(routes) {
    if (!routes || routes.length === 0) return null;

    // Calcular score para cada rota
    const scoredRoutes = routes.map(route => {
      const outputAfterFees = route.estimatedOutput - route.fee;
      const impactPenalty = route.priceImpact * 0.1;
      const confidenceBonus = route.confidence * 0.1;
      
      const score = outputAfterFees * (1 - impactPenalty + confidenceBonus);
      
      return {
        ...route,
        outputAfterFees,
        score
      };
    });

    // Ordenar por score e retornar o melhor
    scoredRoutes.sort((a, b) => b.score - a.score);
    
    console.log('🏆 Melhor rota selecionada:', scoredRoutes[0].platform);
    return scoredRoutes[0];
  }

  async executeSwap(route, userAddress) {
    try {
      console.log('🚀 Executando swap:', route.platform);

      // Registrar transação para cobrança da taxa
      await this.registerTransaction({
        user: userAddress,
        platform: route.platform,
        fromToken: route.route[0],
        toToken: route.route[route.route.length - 1],
        amount: route.estimatedOutput - route.outputAfterFees,
        fee: route.fee,
        timestamp: new Date().toISOString(),
        routeData: route
      });

      // Redirecionar para a DEX apropriada
      const redirectUrl = this.getRedirectUrl(route);
      
      // Abrir em nova aba
      if (typeof window !== 'undefined') {
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      }

      return {
        success: true,
        platform: route.platform,
        redirectUrl,
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Erro ao executar swap:', error);
      throw error;
    }
  }

  getRedirectUrl(route) {
    const urls = {
      'RunesDEX': 'https://runesdex.com/swap',
      'Jupiter': 'https://jup.ag',
      '1inch': 'https://app.1inch.io'
    };

    let baseUrl = urls[route.platform] || '#';
    
    // Adicionar parâmetros específicos se disponível
    if (route.platform === 'Jupiter' && route.jupiter) {
      baseUrl += `?inputMint=${route.jupiter.inputMint}&outputMint=${route.jupiter.outputMint}`;
    }

    return baseUrl;
  }

  async registerTransaction(transactionData) {
    try {
      // Salvar no localStorage para tracking
      if (typeof window !== 'undefined') {
        const transactions = JSON.parse(localStorage.getItem('cypher-transactions') || '[]');
        transactions.push(transactionData);
        
        // Manter apenas últimas 100 transações
        if (transactions.length > 100) {
          transactions.splice(0, transactions.length - 100);
        }
        
        localStorage.setItem('cypher-transactions', JSON.stringify(transactions));
      }

      // Em produção, enviar para backend para contabilização
      console.log('💰 Transação registrada:', {
        platform: transactionData.platform,
        fee: transactionData.fee,
        timestamp: transactionData.timestamp
      });

      return transactionData;
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      return null;
    }
  }

  getTransactionHistory() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cypher-transactions') || '[]');
    }
    return [];
  }

  getTotalFeesCollected() {
    const transactions = this.getTransactionHistory();
    return transactions.reduce((total, tx) => total + (tx.fee || 0), 0);
  }

  async getTokenList(chain) {
    // Lista de tokens populares por chain
    const tokenLists = {
      ethereum: [
        { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', name: 'Ethereum' },
        { symbol: 'USDC', address: '0xa0b86a33e6ba7870c2fb27e4c5c5d0d1e1dfa7dc', name: 'USD Coin' },
        { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', name: 'Tether' }
      ],
      solana: [
        { symbol: 'SOL', address: '11111111111111111111111111111111', name: 'Solana' },
        { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin' }
      ],
      bitcoin: [
        { symbol: 'BTC', address: 'bitcoin', name: 'Bitcoin', type: 'native' },
        { symbol: 'DOG•GO•TO•THE•MOON', name: 'DOG GO TO THE MOON', type: 'rune' },
        { symbol: 'UNCOMMON•GOODS', name: 'UNCOMMON GOODS', type: 'rune' }
      ]
    };

    return tokenLists[chain] || [];
  }

  formatAmount(amount, decimals = 8) {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  calculatePriceImpact(amountIn, amountOut, marketPrice) {
    const effectivePrice = amountOut / amountIn;
    return Math.abs((effectivePrice - marketPrice) / marketPrice) * 100;
  }
}

export default SwapService;