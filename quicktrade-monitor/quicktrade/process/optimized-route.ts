import { NextRequest, NextResponse } from 'next/server';
import { automatedFeeCollector } from '@/src/lib/feeCollection/automatedFeeCollector';
import { quickTradeAnalytics } from '@/src/lib/analytics/quickTradeAnalytics';
import { quickTradeErrorHandler } from '@/src/lib/errorHandling/quickTradeErrorHandler';
import { realTimeGasEstimator } from '@/src/lib/gasEstimation/realTimeGasEstimator';

interface OptimizedProcessRequest {
  analysisId: string;
  userAddress: string;
  selectedExchange: string;
  network: string;
  fromToken: string;
  toToken: string;
  amount: number;
  acceptedFee: number;
  slippagePreference?: number;
  speedPreference?: 'slow' | 'standard' | 'fast' | 'instant';
  executionStrategy?: 'direct' | 'monitored' | 'batch';
}

interface OptimizedProcessResponse {
  success: boolean;
  data?: {
    redirectUrl: string;
    estimatedExecutionTime: number;
    feeCollectionRecord: any;
    monitoringInfo: any;
    executionPlan: any;
    safeguards: any;
  };
  error?: string;
  performance?: {
    processingTime: number;
    optimizationsApplied: string[];
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<OptimizedProcessResponse>> {
  const startTime = performance.now();
  const timerId = quickTradeAnalytics.startTimer('process_trade', {
    endpoint: '/api/quicktrade/process/optimized'
  });

  try {
    // Parse and validate request
    const body: OptimizedProcessRequest = await request.json();
    const {
      analysisId,
      userAddress,
      selectedExchange,
      network,
      fromToken,
      toToken,
      amount,
      acceptedFee,
      slippagePreference,
      speedPreference,
      executionStrategy
    } = body;

    // Input validation
    const validationErrors = validateProcessRequest(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }

    console.log('🚀 Starting optimized trade processing', {
      analysisId,
      userAddress: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      selectedExchange,
      network,
      amount,
      strategy: executionStrategy || 'direct'
    });

    // Execute optimized trade processing
    const processResult = await quickTradeErrorHandler.executeWithRetry(
      () => performOptimizedTradeProcessing(body),
      {
        operation: 'optimized_trade_processing',
        chainId: network,
        attempt: 0,
        timestamp: Date.now(),
        metadata: {
          analysisId,
          selectedExchange,
          amount
        }
      }
    );

    const totalTime = quickTradeAnalytics.endTimer(timerId, 'process_trade', {
      network,
      exchange: selectedExchange,
      success: 'true'
    });

    console.log('✅ Optimized trade processing completed', {
      analysisId,
      redirectUrl: processResult.redirectUrl,
      feeRecordId: processResult.feeCollectionRecord.id,
      processingTime: totalTime.toFixed(2)
    });

    return NextResponse.json({
      success: true,
      data: processResult,
      performance: {
        processingTime: totalTime,
        optimizationsApplied: processResult.optimizationsApplied || []
      }
    });

  } catch (error) {
    console.error('❌ Optimized trade processing failed:', error);
    
    quickTradeAnalytics.recordError('process_trade', error as Error, {
      network: body?.network || 'unknown',
      exchange: body?.selectedExchange || 'unknown'
    });

    quickTradeAnalytics.endTimer(timerId, 'process_trade', {
      success: 'false'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      performance: {
        processingTime: performance.now() - startTime,
        optimizationsApplied: []
      }
    }, { status: 500 });
  }
}

async function performOptimizedTradeProcessing(request: OptimizedProcessRequest): Promise<any> {
  const {
    analysisId,
    userAddress,
    selectedExchange,
    network,
    fromToken,
    toToken,
    amount,
    acceptedFee,
    slippagePreference,
    speedPreference,
    executionStrategy
  } = request;

  const optimizationsApplied: string[] = [];

  // Step 1: Validate user address and network
  console.log('🔍 Validating user address and network compatibility...');
  await validateAddressAndNetwork(userAddress, network);
  optimizationsApplied.push('address_validation');

  // Step 2: Get real-time gas estimates for execution
  console.log('⛽ Getting optimized gas estimates...');
  const gasEstimates = await realTimeGasEstimator.estimateGas(
    selectedExchange.toLowerCase(),
    [fromToken, toToken],
    getChainId(network),
    speedPreference || 'standard'
  );
  optimizationsApplied.push('real_time_gas_estimation');

  // Step 3: Create fee collection record
  console.log('💰 Recording fee for automated collection...');
  const feeCollectionRecord = await automatedFeeCollector.recordFee(
    `pending_${analysisId}`, // Will be updated with actual tx hash
    userAddress,
    selectedExchange,
    network,
    calculateFeeAmount(amount, acceptedFee).toString(),
    acceptedFee,
    fromToken === 'ETH' || fromToken === 'SOL' ? 'native' : fromToken
  );
  optimizationsApplied.push('automated_fee_collection');

  // Step 4: Optimize execution parameters
  console.log('🎯 Optimizing execution parameters...');
  const executionPlan = await createExecutionPlan(
    selectedExchange,
    network,
    fromToken,
    toToken,
    amount,
    slippagePreference,
    gasEstimates,
    executionStrategy
  );
  optimizationsApplied.push('execution_optimization');

  // Step 5: Set up monitoring and safeguards
  console.log('🛡️ Setting up transaction monitoring...');
  const monitoringInfo = await setupTransactionMonitoring(
    analysisId,
    userAddress,
    network,
    executionPlan,
    feeCollectionRecord.id
  );
  optimizationsApplied.push('transaction_monitoring');

  // Step 6: Create safeguards and contingencies
  console.log('🚨 Creating execution safeguards...');
  const safeguards = await createExecutionSafeguards(
    executionPlan,
    gasEstimates,
    network,
    amount
  );
  optimizationsApplied.push('execution_safeguards');

  // Step 7: Generate optimized redirect URL
  console.log('🔗 Generating optimized redirect URL...');
  const redirectUrl = generateOptimizedRedirectUrl(
    selectedExchange,
    network,
    fromToken,
    toToken,
    amount,
    executionPlan,
    userAddress
  );
  optimizationsApplied.push('url_optimization');

  // Step 8: Calculate estimated execution time
  const estimatedExecutionTime = calculateExecutionTime(
    network,
    gasEstimates,
    executionPlan.complexity,
    speedPreference
  );

  return {
    redirectUrl,
    estimatedExecutionTime,
    feeCollectionRecord,
    monitoringInfo,
    executionPlan,
    safeguards,
    optimizationsApplied
  };
}

async function validateAddressAndNetwork(userAddress: string, network: string): Promise<void> {
  // Validate address format
  if (network === 'solana') {
    // Solana address validation
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(userAddress)) {
      throw new Error('Invalid Solana address format');
    }
  } else {
    // EVM address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      throw new Error('Invalid EVM address format');
    }
  }

  // Check if address is not a known blacklisted address
  const blacklistedAddresses = [
    '0x0000000000000000000000000000000000000000',
    '0xdead000000000000000042069420694206942069'
  ];
  
  if (blacklistedAddresses.includes(userAddress.toLowerCase())) {
    throw new Error('Address not allowed');
  }
}

async function createExecutionPlan(
  exchange: string,
  network: string,
  fromToken: string,
  toToken: string,
  amount: number,
  slippagePreference: number = 0.5,
  gasEstimates: any,
  strategy: string = 'direct'
): Promise<any> {
  const plan = {
    exchange: exchange.toLowerCase(),
    network,
    route: [fromToken, toToken],
    amount,
    slippage: slippagePreference,
    gasSettings: {
      limit: gasEstimates.gasLimit,
      price: gasEstimates.gasPrice,
      maxFeePerGas: gasEstimates.maxFeePerGas,
      maxPriorityFeePerGas: gasEstimates.maxPriorityFeePerGas
    },
    strategy,
    complexity: 'simple',
    estimatedBlocks: gasEstimates.estimatedConfirmationTime / getAverageBlockTime(network),
    optimizations: []
  };

  // Apply strategy-specific optimizations
  switch (strategy) {
    case 'monitored':
      plan.optimizations.push('real_time_monitoring');
      plan.optimizations.push('adaptive_gas_pricing');
      break;
    case 'batch':
      plan.optimizations.push('batch_execution');
      plan.optimizations.push('gas_optimization');
      break;
    default:
      plan.optimizations.push('direct_execution');
  }

  // Network-specific optimizations
  if (network === 'ethereum' && gasEstimates.totalCostUSD > 20) {
    plan.optimizations.push('high_gas_protection');
  }

  if (network === 'solana') {
    plan.optimizations.push('compute_unit_optimization');
  }

  return plan;
}

async function setupTransactionMonitoring(
  analysisId: string,
  userAddress: string,
  network: string,
  executionPlan: any,
  feeRecordId: string
): Promise<any> {
  const monitoringConfig = {
    analysisId,
    userAddress,
    network,
    feeRecordId,
    checkInterval: 15000, // 15 seconds
    maxMonitoringTime: 1800000, // 30 minutes
    confirmationsRequired: getRequiredConfirmations(network),
    webhookUrl: process.env.QUICKTRADE_WEBHOOK_URL,
    alertThresholds: {
      gasPrice: parseFloat(executionPlan.gasSettings.price) * 1.5,
      maxWaitTime: 600000, // 10 minutes
      slippageExceeded: executionPlan.slippage * 2
    },
    retryStrategy: {
      enabled: true,
      maxRetries: 3,
      backoffMultiplier: 1.5
    }
  };

  // Cache monitoring configuration
  await quickTradeAnalytics.recordTrade({
    tradeId: analysisId,
    userAddress,
    fromToken: executionPlan.route[0],
    toToken: executionPlan.route[1],
    amountIn: executionPlan.amount.toString(),
    amountOut: '0', // Will be updated when complete
    network,
    dex: executionPlan.exchange,
    gasUsed: executionPlan.gasSettings.limit,
    gasCostUSD: 0, // Will be calculated
    feeAmountUSD: 0, // Will be updated
    priceImpact: 0,
    slippage: executionPlan.slippage,
    executionTime: 0,
    routeHops: executionPlan.route.length - 1,
    success: false, // Will be updated
    timestamp: Date.now()
  });

  return monitoringConfig;
}

async function createExecutionSafeguards(
  executionPlan: any,
  gasEstimates: any,
  network: string,
  amount: number
): Promise<any> {
  const safeguards = {
    gasProtection: {
      enabled: true,
      maxGasPrice: parseFloat(gasEstimates.gasPrice) * 2,
      maxTotalCost: gasEstimates.totalCostUSD * 1.5,
      autoCancel: gasEstimates.totalCostUSD > 100 // Cancel if gas > $100
    },
    slippageProtection: {
      enabled: true,
      maxSlippage: executionPlan.slippage * 3,
      warningThreshold: executionPlan.slippage * 1.5,
      dynamicAdjustment: true
    },
    timeouts: {
      maxExecutionTime: 600000, // 10 minutes
      confirmationTimeout: getRequiredConfirmations(network) * getAverageBlockTime(network) * 3,
      retryInterval: 30000 // 30 seconds
    },
    amountProtection: {
      enabled: true,
      minOutputAmount: amount * 0.95, // 5% minimum output protection
      maxPriceImpact: 10, // 10% maximum price impact
      liquidityCheck: true
    },
    emergencyActions: {
      cancelTransaction: true,
      increaseGas: true,
      contactSupport: true,
      refundUser: amount > 1000 // Automatic refund for large amounts
    }
  };

  // Network-specific safeguards
  if (network === 'ethereum') {
    safeguards.gasProtection.maxGasPrice = Math.min(safeguards.gasProtection.maxGasPrice, 200); // 200 gwei max
  }

  if (network === 'solana') {
    safeguards.computeUnits = {
      maxComputeUnits: 1400000,
      priorityFeeMultiplier: 2
    };
  }

  return safeguards;
}

function generateOptimizedRedirectUrl(
  exchange: string,
  network: string,
  fromToken: string,
  toToken: string,
  amount: number,
  executionPlan: any,
  userAddress: string
): string {
  const exchangeUrls: Record<string, Record<string, string>> = {
    uniswap: {
      ethereum: 'https://app.uniswap.org/#/swap',
      arbitrum: 'https://app.uniswap.org/#/swap',
      optimism: 'https://app.uniswap.org/#/swap',
      polygon: 'https://app.uniswap.org/#/swap',
      base: 'https://app.uniswap.org/#/swap'
    },
    sushiswap: {
      ethereum: 'https://app.sushi.com/swap',
      arbitrum: 'https://app.sushi.com/swap',
      polygon: 'https://app.sushi.com/swap'
    },
    jupiter: {
      solana: 'https://jup.ag/swap'
    },
    orca: {
      solana: 'https://www.orca.so/'
    },
    '1inch': {
      ethereum: 'https://app.1inch.io/#/1/unified/swap',
      arbitrum: 'https://app.1inch.io/#/42161/unified/swap',
      optimism: 'https://app.1inch.io/#/10/unified/swap',
      polygon: 'https://app.1inch.io/#/137/unified/swap'
    }
  };

  const baseUrl = exchangeUrls[exchange.toLowerCase()]?.[network];
  if (!baseUrl) {
    throw new Error(`Unsupported exchange ${exchange} on network ${network}`);
  }

  // Build optimized URL with parameters
  const params = new URLSearchParams();
  
  if (network === 'solana') {
    // Solana-specific parameters
    params.set('inputMint', fromToken === 'SOL' ? 'So11111111111111111111111111111111111111112' : fromToken);
    params.set('outputMint', toToken === 'USDC' ? 'EPjFWdd5AufqSSGfEXoTWHvpHt1ysaYuGjhLWaezuQAM' : toToken);
    params.set('amount', (amount * 1e6).toString()); // Convert to lamports/minor units
  } else {
    // EVM parameters
    params.set('inputCurrency', fromToken === 'ETH' ? 'ETH' : fromToken);
    params.set('outputCurrency', toToken);
    params.set('exactAmount', amount.toString());
    params.set('exactField', 'input');
  }

  // Add optimization parameters
  params.set('slippage', (executionPlan.slippage * 100).toString());
  
  if (executionPlan.gasSettings.maxFeePerGas) {
    params.set('maxFeePerGas', executionPlan.gasSettings.maxFeePerGas);
  }

  // Add tracking parameters
  params.set('utm_source', 'cypher_quicktrade');
  params.set('utm_medium', 'optimized_redirect');
  params.set('utm_campaign', `${network}_${exchange}`);

  return `${baseUrl}?${params.toString()}`;
}

function calculateExecutionTime(
  network: string,
  gasEstimates: any,
  complexity: string,
  speedPreference: string = 'standard'
): number {
  const baseTime = gasEstimates.estimatedConfirmationTime * 1000; // Convert to milliseconds
  
  const complexityMultipliers = {
    simple: 1,
    moderate: 1.3,
    complex: 1.6
  };

  const speedMultipliers = {
    slow: 2,
    standard: 1,
    fast: 0.7,
    instant: 0.5
  };

  const complexityMultiplier = complexityMultipliers[complexity as keyof typeof complexityMultipliers] || 1;
  const speedMultiplier = speedMultipliers[speedPreference as keyof typeof speedMultipliers] || 1;

  return Math.ceil(baseTime * complexityMultiplier * speedMultiplier);
}

// Helper functions
function validateProcessRequest(request: OptimizedProcessRequest): string[] {
  const errors = [];

  if (!request.analysisId) errors.push('analysisId is required');
  if (!request.userAddress) errors.push('userAddress is required');
  if (!request.selectedExchange) errors.push('selectedExchange is required');
  if (!request.network) errors.push('network is required');
  if (!request.fromToken) errors.push('fromToken is required');
  if (!request.toToken) errors.push('toToken is required');
  if (!request.amount || request.amount <= 0) errors.push('amount must be positive');
  if (!request.acceptedFee || request.acceptedFee < 0) errors.push('acceptedFee must be non-negative');

  const supportedNetworks = ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base', 'avalanche', 'bsc', 'solana'];
  if (!supportedNetworks.includes(request.network)) {
    errors.push(`network must be one of: ${supportedNetworks.join(', ')}`);
  }

  return errors;
}

function calculateFeeAmount(amount: number, feePercentageUSD: number): number {
  // feePercentageUSD is the dollar amount, not percentage
  return feePercentageUSD;
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

function getAverageBlockTime(network: string): number {
  const blockTimes: Record<string, number> = {
    ethereum: 12000,    // 12 seconds
    arbitrum: 1000,     // 1 second
    optimism: 2000,     // 2 seconds
    polygon: 2000,      // 2 seconds
    base: 2000,         // 2 seconds
    avalanche: 2000,    // 2 seconds
    bsc: 3000,          // 3 seconds
    solana: 400         // 400ms
  };
  return blockTimes[network] || 12000;
}

function getRequiredConfirmations(network: string): number {
  const confirmations: Record<string, number> = {
    ethereum: 6,
    arbitrum: 6,
    optimism: 6,
    polygon: 20,
    base: 6,
    avalanche: 6,
    bsc: 6,
    solana: 32
  };
  return confirmations[network] || 6;
}