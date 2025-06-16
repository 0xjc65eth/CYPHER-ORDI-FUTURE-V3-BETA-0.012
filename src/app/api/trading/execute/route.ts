import { NextRequest, NextResponse } from 'next/server';
import { TRADING_CONFIG } from '@/config/professionalApis';

interface TradeExecutionRequest {
  action: 'buy' | 'sell' | 'swap';
  fromToken: string;
  toToken?: string;
  amount: string;
  slippage?: number;
  network: string;
  walletAddress: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  deadline?: number;
}

interface TradeExecutionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  estimatedGas?: string;
  serviceFee?: string;
  executionTime?: number;
  priceImpact?: number;
  route?: any;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TradeExecutionRequest = await request.json();
    
    // Validate required fields
    if (!body.action || !body.fromToken || !body.amount || !body.network || !body.walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: action, fromToken, amount, network, walletAddress'
      }, { status: 400 });
    }

    // Validate network
    const supportedNetwork = TRADING_CONFIG.networks.find(n => n.id === body.network);
    if (!supportedNetwork) {
      return NextResponse.json({
        success: false,
        error: `Unsupported network: ${body.network}. Supported networks: ${TRADING_CONFIG.networks.map(n => n.id).join(', ')}`
      }, { status: 400 });
    }

    // Validate wallet address format
    if (!isValidAddress(body.walletAddress, body.network)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format'
      }, { status: 400 });
    }

    // Calculate service fee
    const serviceFee = calculateServiceFee(parseFloat(body.amount), body.fromToken);
    
    // Execute trade based on action type
    let result: TradeExecutionResponse;
    
    switch (body.action) {
      case 'buy':
        result = await executeBuyOrder(body, serviceFee);
        break;
      case 'sell':
        result = await executeSellOrder(body, serviceFee);
        break;
      case 'swap':
        result = await executeSwapOrder(body, serviceFee);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported action: ${body.action}`
        }, { status: 400 });
    }

    // Add execution metadata
    result.executionTime = Date.now() - startTime;
    result.serviceFee = serviceFee.toString();

    // Log successful execution
    console.log(`[Trading API] ${body.action.toUpperCase()} executed successfully:`, {
      network: body.network,
      fromToken: body.fromToken,
      toToken: body.toToken,
      amount: body.amount,
      txHash: result.transactionHash,
      executionTime: result.executionTime
    });

    return NextResponse.json(result);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Trading API] Execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
      executionTime
    }, { status: 500 });
  }
}

async function executeBuyOrder(
  request: TradeExecutionRequest, 
  serviceFee: number
): Promise<TradeExecutionResponse> {
  try {
    // Get current market price
    const marketPrice = await getMarketPrice(request.fromToken, request.network);
    if (!marketPrice) {
      throw new Error(`Unable to fetch market price for ${request.fromToken}`);
    }

    // Calculate buy amount with slippage
    const slippage = request.slippage || 0.5; // 0.5% default
    const adjustedPrice = marketPrice * (1 + slippage / 100);
    const buyAmount = parseFloat(request.amount) / adjustedPrice;

    // Estimate gas costs
    const gasEstimate = await estimateGasCosts(request);

    // For demo purposes, simulate successful execution
    // In production, this would interact with actual DEX protocols
    const mockTxHash = generateMockTransactionHash();
    
    return {
      success: true,
      transactionHash: mockTxHash,
      estimatedGas: gasEstimate.toString(),
      priceImpact: calculatePriceImpact(parseFloat(request.amount), marketPrice),
      route: {
        type: 'market_buy',
        price: adjustedPrice,
        amount: buyAmount,
        fees: {
          serviceFee,
          networkFee: gasEstimate,
          total: serviceFee + gasEstimate
        }
      }
    };
  } catch (error) {
    throw new Error(`Buy order execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeSellOrder(
  request: TradeExecutionRequest, 
  serviceFee: number
): Promise<TradeExecutionResponse> {
  try {
    // Get current market price
    const marketPrice = await getMarketPrice(request.fromToken, request.network);
    if (!marketPrice) {
      throw new Error(`Unable to fetch market price for ${request.fromToken}`);
    }

    // Calculate sell amount with slippage
    const slippage = request.slippage || 0.5; // 0.5% default
    const adjustedPrice = marketPrice * (1 - slippage / 100);
    const sellValue = parseFloat(request.amount) * adjustedPrice;

    // Estimate gas costs
    const gasEstimate = await estimateGasCosts(request);

    // For demo purposes, simulate successful execution
    const mockTxHash = generateMockTransactionHash();
    
    return {
      success: true,
      transactionHash: mockTxHash,
      estimatedGas: gasEstimate.toString(),
      priceImpact: calculatePriceImpact(parseFloat(request.amount), marketPrice),
      route: {
        type: 'market_sell',
        price: adjustedPrice,
        amount: parseFloat(request.amount),
        value: sellValue,
        fees: {
          serviceFee,
          networkFee: gasEstimate,
          total: serviceFee + gasEstimate
        }
      }
    };
  } catch (error) {
    throw new Error(`Sell order execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function executeSwapOrder(
  request: TradeExecutionRequest, 
  serviceFee: number
): Promise<TradeExecutionResponse> {
  try {
    if (!request.toToken) {
      throw new Error('toToken is required for swap operations');
    }

    // Get market prices for both tokens
    const fromPrice = await getMarketPrice(request.fromToken, request.network);
    const toPrice = await getMarketPrice(request.toToken, request.network);
    
    if (!fromPrice || !toPrice) {
      throw new Error('Unable to fetch market prices for swap tokens');
    }

    // Calculate swap ratio
    const swapRatio = fromPrice / toPrice;
    const slippage = request.slippage || 0.5;
    const adjustedRatio = swapRatio * (1 - slippage / 100);
    const outputAmount = parseFloat(request.amount) * adjustedRatio;

    // Estimate gas costs
    const gasEstimate = await estimateGasCosts(request);

    // For demo purposes, simulate successful execution
    const mockTxHash = generateMockTransactionHash();
    
    return {
      success: true,
      transactionHash: mockTxHash,
      estimatedGas: gasEstimate.toString(),
      priceImpact: calculatePriceImpact(parseFloat(request.amount), fromPrice),
      route: {
        type: 'token_swap',
        fromToken: request.fromToken,
        toToken: request.toToken,
        inputAmount: parseFloat(request.amount),
        outputAmount,
        swapRatio: adjustedRatio,
        fees: {
          serviceFee,
          networkFee: gasEstimate,
          total: serviceFee + gasEstimate
        }
      }
    };
  } catch (error) {
    throw new Error(`Swap order execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function calculateServiceFee(amount: number, token: string): number {
  const feePercentage = TRADING_CONFIG.fees.serviceFeePercentage;
  const maxFeeUSD = TRADING_CONFIG.fees.maxServiceFeeUSD;
  
  // Estimate USD value (simplified)
  const estimatedUSDValue = amount * getTokenPriceUSD(token);
  const calculatedFee = estimatedUSDValue * feePercentage;
  
  return Math.min(calculatedFee, maxFeeUSD);
}

function getTokenPriceUSD(token: string): number {
  // Simplified price mapping - in production, fetch from price API
  const priceMap: { [key: string]: number } = {
    'ETH': 2500,
    'BTC': 65000,
    'SOL': 150,
    'MATIC': 0.8,
    'AVAX': 35,
    'BNB': 300
  };
  
  return priceMap[token.toUpperCase()] || 1;
}

async function getMarketPrice(token: string, network: string): Promise<number | null> {
  try {
    // In production, integrate with price feeds like CoinGecko, CoinMarketCap, etc.
    // For demo purposes, return mock prices
    const prices: { [key: string]: number } = {
      'ETH': 2500 + (Math.random() - 0.5) * 100,
      'BTC': 65000 + (Math.random() - 0.5) * 2000,
      'SOL': 150 + (Math.random() - 0.5) * 10,
      'MATIC': 0.8 + (Math.random() - 0.5) * 0.1,
      'AVAX': 35 + (Math.random() - 0.5) * 3,
      'BNB': 300 + (Math.random() - 0.5) * 20
    };
    
    return prices[token.toUpperCase()] || null;
  } catch (error) {
    console.error('Error fetching market price:', error);
    return null;
  }
}

async function estimateGasCosts(request: TradeExecutionRequest): Promise<number> {
  // Simplified gas estimation - in production, use network-specific gas estimation
  const baseGasCosts: { [key: string]: number } = {
    'ethereum': 0.01,
    'arbitrum': 0.001,
    'optimism': 0.001,
    'polygon': 0.01,
    'base': 0.0005,
    'avalanche': 0.01,
    'bsc': 0.005,
    'solana': 0.0001
  };
  
  const baseCost = baseGasCosts[request.network] || 0.01;
  const complexityMultiplier = request.action === 'swap' ? 1.5 : 1;
  
  return baseCost * complexityMultiplier;
}

function calculatePriceImpact(amount: number, marketPrice: number): number {
  // Simplified price impact calculation
  // In production, use liquidity pool data for accurate calculations
  const tradeSize = amount * marketPrice;
  
  if (tradeSize < 1000) return 0.01; // 0.01% for small trades
  if (tradeSize < 10000) return 0.05; // 0.05% for medium trades
  if (tradeSize < 100000) return 0.1; // 0.1% for large trades
  
  return 0.25; // 0.25% for very large trades
}

function isValidAddress(address: string, network: string): boolean {
  // Simplified address validation - in production, use proper validation libraries
  const patterns: { [key: string]: RegExp } = {
    'ethereum': /^0x[a-fA-F0-9]{40}$/,
    'arbitrum': /^0x[a-fA-F0-9]{40}$/,
    'optimism': /^0x[a-fA-F0-9]{40}$/,
    'polygon': /^0x[a-fA-F0-9]{40}$/,
    'base': /^0x[a-fA-F0-9]{40}$/,
    'avalanche': /^0x[a-fA-F0-9]{40}$/,
    'bsc': /^0x[a-fA-F0-9]{40}$/,
    'solana': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  };
  
  const pattern = patterns[network];
  return pattern ? pattern.test(address) : false;
}

function generateMockTransactionHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Rate limiting middleware (implement as needed)
export async function GET() {
  return NextResponse.json({
    message: 'Trading execution endpoint - POST only',
    supportedActions: ['buy', 'sell', 'swap'],
    supportedNetworks: TRADING_CONFIG.networks.map(n => n.id),
    documentation: '/api/trading/execute/docs'
  });
}