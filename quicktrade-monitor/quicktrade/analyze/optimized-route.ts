import { NextRequest, NextResponse } from 'next/server';
import { optimizedQuickTradeAggregator } from '@/src/services/optimizedQuickTrade';
import { quickTradeCache } from '@/src/lib/cache/advancedQuickTradeCache';
import { quickTradeErrorHandler } from '@/src/lib/errorHandling/quickTradeErrorHandler';
import { advancedRouteOptimizer } from '@/src/lib/routing/advancedRouteOptimizer';
import { realTimeGasEstimator } from '@/src/lib/gasEstimation/realTimeGasEstimator';
import { quickTradeAnalytics } from '@/src/lib/analytics/quickTradeAnalytics';

interface OptimizedAnalysisRequest {
  fromToken: string;
  toToken: string;
  amount: number;
  network: string;
  userAddress?: string;
  slippagePreference?: number;
  speedPreference?: 'slow' | 'standard' | 'fast' | 'instant';
}

interface OptimizedAnalysisResponse {
  success: boolean;
  data?: {
    bestRoute: any;
    allRoutes: any[];
    gasEstimates: any;
    marketAnalysis: any;
    riskAssessment: any;
    serviceFee: any;
    totalCosts: any;
    expectedOutput: any;
    confidence: number;
    recommendedActions: string[];
    analytics: any;
  };
  error?: string;
  performance?: {
    totalTime: number;
    cacheHits: number;
    operationsExecuted: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<OptimizedAnalysisResponse>> {
  const startTime = performance.now();
  const timerId = quickTradeAnalytics.startTimer('analyze_request', {
    endpoint: '/api/quicktrade/analyze/optimized'
  });

  try {
    // Parse and validate request
    const body: OptimizedAnalysisRequest = await request.json();
    const { fromToken, toToken, amount, network, userAddress, slippagePreference, speedPreference } = body;

    // Input validation
    const validationErrors = validateAnalysisRequest(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }

    console.log('🚀 Starting optimized QuickTrade analysis', {
      fromToken,
      toToken,
      amount,
      network,
      userAddress: userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'none'
    });

    // Check cache first
    const cacheKey = `optimized_analysis:${fromToken}:${toToken}:${amount}:${network}`;
    const cachedResult = await quickTradeCache.getAnalytics(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < 30000) { // 30 second cache
      console.log('📦 Returning cached analysis result');
      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        performance: {
          totalTime: performance.now() - startTime,
          cacheHits: 1,
          operationsExecuted: 0
        }
      });
    }

    // Prepare token objects
    const tokenIn = createTokenObject(fromToken, network);
    const tokenOut = createTokenObject(toToken, network);
    const amountIn = amount.toString();

    // Execute optimized analysis pipeline
    const analysisResult = await quickTradeErrorHandler.executeWithRetry(
      () => performOptimizedAnalysis(tokenIn, tokenOut, amountIn, network, {
        slippagePreference,
        speedPreference,
        userAddress
      }),
      {
        operation: 'optimized_analysis',
        chainId: network,
        attempt: 0,
        timestamp: Date.now(),
        metadata: {
          fromToken,
          toToken,
          amount
        }
      }
    );

    // Cache the result
    await quickTradeCache.cacheAnalytics(cacheKey, {
      data: analysisResult,
      timestamp: Date.now()
    });

    const totalTime = quickTradeAnalytics.endTimer(timerId, 'analyze_request', {
      network,
      success: 'true'
    });

    // Record analytics
    quickTradeAnalytics.recordTrade({
      tradeId: `analysis_${Date.now()}`,
      userAddress: userAddress || 'anonymous',
      fromToken,
      toToken,
      amountIn,
      amountOut: analysisResult.expectedOutput.amount,
      network,
      dex: analysisResult.bestRoute.dexPath[0],
      gasUsed: analysisResult.gasEstimates.estimatedGas,
      gasCostUSD: analysisResult.gasEstimates.totalCostUSD,
      feeAmountUSD: analysisResult.serviceFee.amountUSD,
      priceImpact: analysisResult.bestRoute.totalPriceImpact,
      slippage: analysisResult.bestRoute.slippage,
      executionTime: totalTime,
      routeHops: analysisResult.bestRoute.steps.length,
      success: true,
      timestamp: Date.now()
    });

    console.log('✅ Optimized analysis completed', {
      bestDEX: analysisResult.bestRoute.dexPath[0],
      expectedOutput: analysisResult.expectedOutput.amount,
      confidence: analysisResult.confidence,
      totalTime: totalTime.toFixed(2)
    });

    return NextResponse.json({
      success: true,
      data: analysisResult,
      performance: {
        totalTime,
        cacheHits: 0,
        operationsExecuted: 1
      }
    });

  } catch (error) {
    console.error('❌ Optimized analysis failed:', error);
    
    quickTradeAnalytics.recordError('analyze_request', error as Error, {
      network: request.nextUrl.searchParams.get('network') || 'unknown'
    });

    quickTradeAnalytics.endTimer(timerId, 'analyze_request', {
      success: 'false'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      performance: {
        totalTime: performance.now() - startTime,
        cacheHits: 0,
        operationsExecuted: 0
      }
    }, { status: 500 });
  }
}

async function performOptimizedAnalysis(
  tokenIn: any,
  tokenOut: any,
  amountIn: string,
  network: string,
  preferences: {
    slippagePreference?: number;
    speedPreference?: 'slow' | 'standard' | 'fast' | 'instant';
    userAddress?: string;
  }
): Promise<any> {
  const chainId = getChainId(network);
  
  // Step 1: Get optimized routes with advanced route optimizer
  console.log('🔍 Finding optimal routes...');
  const routeTimerId = quickTradeAnalytics.startTimer('route_optimization');
  
  const optimalRoutes = await advancedRouteOptimizer.findOptimalRoutes(
    tokenIn,
    tokenOut,
    amountIn,
    chainId
  );
  
  quickTradeAnalytics.endTimer(routeTimerId, 'route_optimization');
  
  if (optimalRoutes.length === 0) {
    throw new Error('No viable routes found for this trade');
  }

  const bestRoute = optimalRoutes[0];
  
  // Step 2: Get enhanced quotes for top routes
  console.log('💰 Getting enhanced quotes...');
  const quoteTimerId = quickTradeAnalytics.startTimer('quote_enhancement');
  
  const enhancedQuotes = await optimizedQuickTradeAggregator.getBestQuote(
    tokenIn,
    tokenOut,
    amountIn,
    chainId
  );
  
  quickTradeAnalytics.endTimer(quoteTimerId, 'quote_enhancement');

  // Step 3: Get real-time gas estimates
  console.log('⛽ Calculating gas estimates...');
  const gasTimerId = quickTradeAnalytics.startTimer('gas_estimation');
  
  const gasEstimates = await realTimeGasEstimator.estimateGas(
    bestRoute.dexPath[0],
    bestRoute.dexPath,
    chainId,
    preferences.speedPreference || 'standard'
  );
  
  quickTradeAnalytics.endTimer(gasTimerId, 'gas_estimation');

  // Step 4: Perform market analysis
  console.log('📊 Analyzing market conditions...');
  const marketAnalysis = await analyzeMarketConditions(
    tokenIn,
    tokenOut,
    amountIn,
    network,
    optimalRoutes
  );

  // Step 5: Risk assessment
  console.log('🛡️ Assessing trade risks...');
  const riskAssessment = await assessTradeRisks(
    bestRoute,
    gasEstimates,
    marketAnalysis,
    preferences
  );

  // Step 6: Calculate comprehensive costs
  const totalCosts = calculateTotalCosts(
    enhancedQuotes.serviceFee,
    gasEstimates,
    bestRoute
  );

  // Step 7: Generate recommendations
  const recommendedActions = generateRecommendations(
    bestRoute,
    gasEstimates,
    marketAnalysis,
    riskAssessment
  );

  // Step 8: Calculate final confidence score
  const confidence = calculateOverallConfidence(
    bestRoute,
    gasEstimates,
    marketAnalysis,
    riskAssessment
  );

  return {
    bestRoute,
    allRoutes: optimalRoutes.slice(0, 5), // Top 5 routes
    gasEstimates,
    marketAnalysis,
    riskAssessment,
    serviceFee: enhancedQuotes.serviceFee,
    totalCosts,
    expectedOutput: {
      amount: bestRoute.totalAmountOut,
      amountUSD: parseFloat(bestRoute.totalAmountOut) * getTokenPrice(tokenOut.symbol)
    },
    confidence,
    recommendedActions,
    analytics: enhancedQuotes.analytics
  };
}

async function analyzeMarketConditions(
  tokenIn: any,
  tokenOut: any,
  amountIn: string,
  network: string,
  routes: any[]
): Promise<any> {
  const networkStatus = realTimeGasEstimator.getNetworkStatus(getChainId(network));
  
  return {
    networkCongestion: networkStatus?.networkCongestion || 50,
    liquidityDepth: routes.reduce((sum, route) => sum + route.liquidityScore, 0) / routes.length,
    priceVolatility: calculatePriceVolatility(tokenIn, tokenOut),
    marketTrend: await getMarketTrend(tokenIn.symbol, tokenOut.symbol),
    competitionLevel: routes.length,
    optimalTiming: assessOptimalTiming(networkStatus),
    recommendations: []
  };
}

async function assessTradeRisks(
  route: any,
  gasEstimates: any,
  marketAnalysis: any,
  preferences: any
): Promise<any> {
  const risks = [];
  let riskLevel = 'low';

  // Price impact risk
  if (route.totalPriceImpact > 5) {
    risks.push('High price impact (>5%)');
    riskLevel = 'high';
  } else if (route.totalPriceImpact > 2) {
    risks.push('Moderate price impact (>2%)');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Gas cost risk
  if (gasEstimates.totalCostUSD > 50) {
    risks.push('High gas costs (>$50)');
    riskLevel = 'high';
  }

  // Network congestion risk
  if (marketAnalysis.networkCongestion > 80) {
    risks.push('High network congestion');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Liquidity risk
  if (route.liquidityScore < 100000) {
    risks.push('Low liquidity pool');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  // Route complexity risk
  if (route.steps.length > 2) {
    risks.push('Complex multi-hop route');
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  return {
    level: riskLevel,
    score: calculateRiskScore(risks.length, route, gasEstimates),
    factors: risks,
    mitigation: generateRiskMitigation(risks),
    recommendation: risks.length === 0 ? 'Proceed with trade' : 'Review risks carefully'
  };
}

function calculateTotalCosts(serviceFee: any, gasEstimates: any, route: any): any {
  const gasCostUSD = gasEstimates.totalCostUSD;
  const serviceFeeUSD = serviceFee.amountUSD;
  const slippageCostUSD = parseFloat(route.totalAmountOut) * (route.slippage / 100) * getTokenPrice('ETH');
  
  return {
    gasEstimate: {
      limit: gasEstimates.gasLimit,
      price: gasEstimates.gasPrice,
      costUSD: gasCostUSD
    },
    serviceFee: {
      percentage: serviceFee.percentage,
      amountUSD: serviceFeeUSD
    },
    slippageCost: {
      percentage: route.slippage,
      estimatedCostUSD: slippageCostUSD
    },
    total: {
      costUSD: gasCostUSD + serviceFeeUSD + slippageCostUSD,
      breakdown: {
        gas: gasCostUSD,
        fee: serviceFeeUSD,
        slippage: slippageCostUSD
      }
    }
  };
}

function generateRecommendations(
  route: any,
  gasEstimates: any,
  marketAnalysis: any,
  riskAssessment: any
): string[] {
  const recommendations = [];

  // Gas optimization recommendations
  if (gasEstimates.totalCostUSD > 20) {
    if (marketAnalysis.networkCongestion > 70) {
      recommendations.push('Consider waiting for lower network congestion to reduce gas costs');
    }
    if (gasEstimates.speed === 'fast' || gasEstimates.speed === 'instant') {
      recommendations.push('Consider using standard speed to reduce gas costs by 20-40%');
    }
  }

  // Route optimization recommendations
  if (route.steps.length > 2) {
    recommendations.push('Multi-hop route detected - consider direct pairs if available');
  }

  if (route.totalPriceImpact > 3) {
    recommendations.push('High price impact - consider splitting into smaller trades');
  }

  // Timing recommendations
  if (marketAnalysis.networkCongestion < 30) {
    recommendations.push('Excellent timing - low network congestion detected');
  }

  if (route.confidence > 95) {
    recommendations.push('High confidence route - optimal execution likely');
  }

  // Risk-based recommendations
  if (riskAssessment.level === 'high') {
    recommendations.push('High risk trade - review all factors before proceeding');
  }

  return recommendations;
}

function calculateOverallConfidence(
  route: any,
  gasEstimates: any,
  marketAnalysis: any,
  riskAssessment: any
): number {
  let confidence = 100;

  // Route confidence impact
  confidence = (confidence + route.confidence) / 2;

  // Gas confidence impact
  confidence = (confidence + gasEstimates.confidence) / 2;

  // Market conditions impact
  if (marketAnalysis.networkCongestion > 80) {
    confidence -= 10;
  }
  if (marketAnalysis.liquidityDepth < 100000) {
    confidence -= 5;
  }

  // Risk assessment impact
  switch (riskAssessment.level) {
    case 'high':
      confidence -= 20;
      break;
    case 'medium':
      confidence -= 10;
      break;
    case 'low':
      confidence += 5;
      break;
  }

  return Math.max(60, Math.min(100, confidence));
}

// Helper functions
function validateAnalysisRequest(request: OptimizedAnalysisRequest): string[] {
  const errors = [];

  if (!request.fromToken) errors.push('fromToken is required');
  if (!request.toToken) errors.push('toToken is required');
  if (!request.amount || request.amount <= 0) errors.push('amount must be positive');
  if (!request.network) errors.push('network is required');
  if (request.amount < 10) errors.push('minimum trade amount is $10');

  const supportedNetworks = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base', 'avalanche', 'bsc', 'solana'];
  if (!supportedNetworks.includes(request.network)) {
    errors.push(`network must be one of: ${supportedNetworks.join(', ')}`);
  }

  return errors;
}

function createTokenObject(symbol: string, network: string): any {
  // This would normally fetch from a token registry
  return {
    address: symbol === 'ETH' ? 'native' : `0x${symbol.toLowerCase()}`,
    symbol,
    decimals: 18,
    chainId: getChainId(network)
  };
}

function getChainId(network: string): string {
  const chainIds: Record<string, string> = {
    ethereum: '1',
    arbitrum: '42161',
    optimism: '10',
    polygon: '137',
    base: '8453',
    avalanche: '43114',
    bsc: '56',
    solana: 'solana'
  };
  return chainIds[network] || '1';
}

function getTokenPrice(symbol: string): number {
  // Mock prices - in production, fetch from price API
  const prices: Record<string, number> = {
    ETH: 2850,
    BTC: 67000,
    SOL: 95,
    MATIC: 0.8,
    AVAX: 25,
    BNB: 320,
    USDC: 1,
    USDT: 1
  };
  return prices[symbol] || 1;
}

function calculatePriceVolatility(tokenIn: any, tokenOut: any): number {
  // Mock volatility calculation
  return Math.random() * 20; // 0-20% volatility
}

async function getMarketTrend(fromSymbol: string, toSymbol: string): Promise<string> {
  // Mock trend analysis
  const trends = ['bullish', 'bearish', 'neutral'];
  return trends[Math.floor(Math.random() * trends.length)];
}

function assessOptimalTiming(networkStatus: any): string {
  if (!networkStatus) return 'neutral';
  
  if (networkStatus.networkCongestion < 30) return 'excellent';
  if (networkStatus.networkCongestion < 60) return 'good';
  if (networkStatus.networkCongestion < 80) return 'fair';
  return 'poor';
}

function calculateRiskScore(riskCount: number, route: any, gasEstimates: any): number {
  let score = 0;
  
  score += riskCount * 20; // 20 points per risk factor
  score += route.totalPriceImpact * 10; // Price impact weight
  score += (gasEstimates.totalCostUSD / 100) * 5; // Gas cost weight
  
  return Math.min(100, score);
}

function generateRiskMitigation(risks: string[]): string[] {
  const mitigation = [];
  
  if (risks.some(r => r.includes('price impact'))) {
    mitigation.push('Consider splitting trade into smaller amounts');
  }
  if (risks.some(r => r.includes('gas costs'))) {
    mitigation.push('Wait for lower network congestion or use slower execution');
  }
  if (risks.some(r => r.includes('liquidity'))) {
    mitigation.push('Monitor liquidity pools before execution');
  }
  if (risks.some(r => r.includes('multi-hop'))) {
    mitigation.push('Verify each hop has sufficient liquidity');
  }
  
  return mitigation;
}