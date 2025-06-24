/**
 * 1inch API Service
 * Provides DEX aggregation for EVM-compatible networks including Ethereum, BSC, Polygon, etc.
 */

import { logger } from '@/lib/logger';

export interface OneInchConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultChainId?: number;
  timeout?: number;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  isFoT?: boolean; // Fee on Transfer
  synth?: boolean;
  eip2612?: boolean;
}

export interface Protocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export interface SwapRoute {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  subRoutes?: SwapRoute[][];
}

export interface QuoteResponse {
  fromToken: Token;
  toToken: Token;
  toAmount: string;
  fromAmount: string;
  protocols: Protocol[][][];
  estimatedGas: string;
  gasPrice?: string;
  protocolsData?: {
    [protocolName: string]: {
      name: string;
      part: number;
      fromTokenAddress: string;
      toTokenAddress: string;
    }[];
  };
}

export interface SwapTransaction {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
}

export interface SwapResponse {
  fromToken: Token;
  toToken: Token;
  toAmount: string;
  fromAmount: string;
  protocols: Protocol[][][];
  tx: SwapTransaction;
}

export interface ApprovalTransaction {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}

export interface ApprovalResponse {
  data: string;
  gasPrice: string;
  to: string;
  value: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  chainId: number;
  rpc: {
    status: string;
    latency: number;
  };
}

export interface LiquiditySource {
  name: string;
  logoURI: string;
  enabled: boolean;
}

export interface PresetResponse {
  [presetName: string]: {
    complexity: number;
    connectorTokens: Token[];
    gasLimit: {
      fast: number;
      standard: number;
      instant: number;
    };
  };
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume24h?: number;
}

export interface TokenPrice {
  address: string;
  symbol: string;
  price: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  liquidity?: number;
  lastUpdated: number;
}

export class OneInchService {
  private config: OneInchConfig;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 30000; // 30 seconds for swap quotes
  private rateLimitCount = 0;
  private rateLimitResetTime = 0;
  private readonly rateLimitPerMinute = 100; // 1inch has generous rate limits

  // Supported chain IDs
  public static readonly SUPPORTED_CHAINS = {
    ETHEREUM: 1,
    BSC: 56,
    POLYGON: 137,
    OPTIMISM: 10,
    ARBITRUM: 42161,
    GNOSIS: 100,
    AVALANCHE: 43114,
    FANTOM: 250,
    KLAYTN: 8217,
    AURORA: 1313161554,
    ZK_SYNC_ERA: 324,
    BASE: 8453,
  };

  constructor(config: OneInchConfig = {}) {
    this.config = {
      baseUrl: 'https://api.1inch.dev',
      defaultChainId: OneInchService.SUPPORTED_CHAINS.ETHEREUM,
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    if (now >= this.rateLimitResetTime) {
      this.rateLimitCount = 0;
      this.rateLimitResetTime = now + 60000;
    }

    if (this.rateLimitCount >= this.rateLimitPerMinute) {
      logger.warn('1inch rate limit reached');
      return false;
    }

    this.rateLimitCount++;
    return true;
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Cache data with TTL
   */
  private setCachedData(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Make API request with error handling and caching
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}, ttl = this.defaultTTL, chainId?: number): Promise<T> {
    const cacheKey = `${chainId || this.config.defaultChainId}:${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const url = new URL(`${this.config.baseUrl}/v6.0/${chainId || this.config.defaultChainId}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout || 10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`1inch API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Cache successful response
      this.setCachedData(cacheKey, data, ttl);
      
      return data as T;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), '1inch API request failed');
      
      // Try to return cached data if request fails
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        logger.warn('Returning stale cached data due to API failure');
        return staleData.data as T;
      }
      
      throw error;
    }
  }

  /**
   * Get health check status for a specific chain
   */
  async getHealthCheck(chainId?: number): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>('/healthcheck', {}, 60000, chainId);
  }

  /**
   * Get all supported tokens for a specific chain
   */
  async getTokens(chainId?: number): Promise<{ tokens: { [address: string]: Token } }> {
    return this.makeRequest<{ tokens: { [address: string]: Token } }>('/tokens', {}, 3600000, chainId); // 1 hour cache for tokens
  }

  /**
   * Get approved spender address for token approvals
   */
  async getApprovalSpender(chainId?: number): Promise<{ address: string }> {
    return this.makeRequest<{ address: string }>('/approve/spender', {}, 3600000, chainId); // 1 hour cache
  }

  /**
   * Get allowance for a specific token and owner
   */
  async getAllowance(options: {
    tokenAddress: string;
    walletAddress: string;
    chainId?: number;
  }): Promise<{ allowance: string }> {
    const params = {
      tokenAddress: options.tokenAddress,
      walletAddress: options.walletAddress,
    };

    return this.makeRequest<{ allowance: string }>('/approve/allowance', params, 30000, options.chainId);
  }

  /**
   * Get approval transaction data
   */
  async getApprovalTransaction(options: {
    tokenAddress: string;
    amount?: string;
    chainId?: number;
  }): Promise<ApprovalResponse> {
    const params = {
      tokenAddress: options.tokenAddress,
      ...(options.amount && { amount: options.amount }),
    };

    return this.makeRequest<ApprovalResponse>('/approve/transaction', params, 60000, options.chainId);
  }

  /**
   * Get swap quote without gas estimation
   */
  async getQuote(options: {
    src: string;
    dst: string;
    amount: string;
    chainId?: number;
    includeTokensInfo?: boolean;
    includeProtocols?: boolean;
    includeGas?: boolean;
    connectorTokens?: string;
    complexityLevel?: number;
    mainRouteParts?: number;
    parts?: number;
    gasLimit?: number;
  }): Promise<QuoteResponse> {
    const params = {
      src: options.src,
      dst: options.dst,
      amount: options.amount,
      includeTokensInfo: options.includeTokensInfo ?? true,
      includeProtocols: options.includeProtocols ?? true,
      includeGas: options.includeGas ?? true,
      ...(options.connectorTokens && { connectorTokens: options.connectorTokens }),
      ...(options.complexityLevel && { complexityLevel: options.complexityLevel }),
      ...(options.mainRouteParts && { mainRouteParts: options.mainRouteParts }),
      ...(options.parts && { parts: options.parts }),
      ...(options.gasLimit && { gasLimit: options.gasLimit }),
    };

    return this.makeRequest<QuoteResponse>('/quote', params, 15000, options.chainId); // 15 seconds for quotes
  }

  /**
   * Get swap transaction data
   */
  async getSwap(options: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    slippage: number;
    chainId?: number;
    protocols?: string;
    fee?: number;
    gasLimit?: number;
    connectorTokens?: string;
    complexityLevel?: number;
    mainRouteParts?: number;
    parts?: number;
    includeTokensInfo?: boolean;
    includeProtocols?: boolean;
    includeGas?: boolean;
    disableEstimate?: boolean;
    allowPartialFill?: boolean;
  }): Promise<SwapResponse> {
    const params = {
      src: options.src,
      dst: options.dst,
      amount: options.amount,
      from: options.from,
      slippage: options.slippage,
      includeTokensInfo: options.includeTokensInfo ?? true,
      includeProtocols: options.includeProtocols ?? true,
      includeGas: options.includeGas ?? true,
      disableEstimate: options.disableEstimate ?? false,
      allowPartialFill: options.allowPartialFill ?? false,
      ...(options.protocols && { protocols: options.protocols }),
      ...(options.fee && { fee: options.fee }),
      ...(options.gasLimit && { gasLimit: options.gasLimit }),
      ...(options.connectorTokens && { connectorTokens: options.connectorTokens }),
      ...(options.complexityLevel && { complexityLevel: options.complexityLevel }),
      ...(options.mainRouteParts && { mainRouteParts: options.mainRouteParts }),
      ...(options.parts && { parts: options.parts }),
    };

    return this.makeRequest<SwapResponse>('/swap', params, 10000, options.chainId); // 10 seconds for swap txs
  }

  /**
   * Get available liquidity sources
   */
  async getLiquiditySources(chainId?: number): Promise<{ protocols: LiquiditySource[] }> {
    return this.makeRequest<{ protocols: LiquiditySource[] }>('/liquidity-sources', {}, 3600000, chainId); // 1 hour cache
  }

  /**
   * Get presets for optimization
   */
  async getPresets(chainId?: number): Promise<PresetResponse> {
    return this.makeRequest<PresetResponse>('/presets', {}, 3600000, chainId); // 1 hour cache
  }

  /**
   * Get token price in USD (using native token as base)
   */
  async getTokenPrice(options: {
    addresses: string[];
    chainId?: number;
    currency?: string;
  }): Promise<{ [address: string]: TokenPrice }> {
    const params = {
      addresses: options.addresses.join(','),
      currency: options.currency || 'USD',
    };

    return this.makeRequest<{ [address: string]: TokenPrice }>('/prices', params, 60000, options.chainId);
  }

  /**
   * Get optimal swap route without executing
   */
  async getOptimalRoute(options: {
    src: string;
    dst: string;
    amount: string;
    chainId?: number;
    gasPrice?: string;
    complexityLevel?: number;
    mainRouteParts?: number;
    parts?: number;
  }): Promise<{
    routes: SwapRoute[];
    estimatedGas: string;
    fromAmount: string;
    toAmount: string;
    protocols: Protocol[][][];
  }> {
    const params = {
      src: options.src,
      dst: options.dst,
      amount: options.amount,
      ...(options.gasPrice && { gasPrice: options.gasPrice }),
      ...(options.complexityLevel && { complexityLevel: options.complexityLevel }),
      ...(options.mainRouteParts && { mainRouteParts: options.mainRouteParts }),
      ...(options.parts && { parts: options.parts }),
    };

    return this.makeRequest<{
      routes: SwapRoute[];
      estimatedGas: string;
      fromAmount: string;
      toAmount: string;
      protocols: Protocol[][][];
    }>('/route', params, 30000, options.chainId);
  }

  /**
   * Get gas price recommendation
   */
  async getGasPrice(chainId?: number): Promise<{
    instant: string;
    fast: string;
    standard: string;
    baseFee?: string;
  }> {
    return this.makeRequest<{
      instant: string;
      fast: string;
      standard: string;
      baseFee?: string;
    }>('/gas-price', {}, 30000, chainId);
  }

  /**
   * Estimate gas for swap
   */
  async estimateGas(options: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId?: number;
    protocols?: string;
    gasPrice?: string;
  }): Promise<{ estimatedGas: string }> {
    const params = {
      src: options.src,
      dst: options.dst,
      amount: options.amount,
      from: options.from,
      ...(options.protocols && { protocols: options.protocols }),
      ...(options.gasPrice && { gasPrice: options.gasPrice }),
    };

    return this.makeRequest<{ estimatedGas: string }>('/gas-estimate', params, 30000, options.chainId);
  }

  /**
   * Get supported chains information
   */
  getSupportedChains(): typeof OneInchService.SUPPORTED_CHAINS {
    return OneInchService.SUPPORTED_CHAINS;
  }

  /**
   * Helper method to check if a chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return Object.values(OneInchService.SUPPORTED_CHAINS).includes(chainId);
  }

  /**
   * Get popular tokens for a specific chain
   */
  async getPopularTokens(chainId?: number): Promise<Token[]> {
    const tokens = await this.getTokens(chainId);
    
    // Filter for popular/well-known tokens
    const popularAddresses = this.getPopularTokenAddresses(chainId || this.config.defaultChainId!);
    
    return popularAddresses
      .map(address => tokens.tokens[address.toLowerCase()])
      .filter(Boolean);
  }

  /**
   * Get popular token addresses for different chains
   */
  private getPopularTokenAddresses(chainId: number): string[] {
    const popularTokens: { [chainId: number]: string[] } = {
      [OneInchService.SUPPORTED_CHAINS.ETHEREUM]: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
        '0xA0b86a33E6441b8bb9708E8b6eE1e7b2d6b4F85e', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
      ],
      [OneInchService.SUPPORTED_CHAINS.BSC]: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // BNB
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
        '0x55d398326f99059fF775485246999027B3197955', // USDT
        '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
      ],
      [OneInchService.SUPPORTED_CHAINS.POLYGON]: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // MATIC
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
      ],
    };

    return popularTokens[chainId] || [];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Default instance
export const oneInchService = new OneInchService();

export default oneInchService;