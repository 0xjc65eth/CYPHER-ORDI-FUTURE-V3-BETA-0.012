/**
 * Enhanced Mempool.space API Service
 * Provides comprehensive Bitcoin blockchain data including mempool, blocks, mining, and Lightning Network stats
 */

import { logger } from '@/lib/logger';

export interface MempoolConfig {
  baseUrl?: string;
  timeout?: number;
  network?: 'mainnet' | 'testnet' | 'signet' | 'liquid';
}

export interface MempoolStats {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: number[][];
}

export interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
  extras: {
    coinbaseRaw: string;
    orphans: string[];
    coinbaseAddress: string;
    coinbaseSignature: string;
    coinbaseSignatureAscii: string;
    avgFee: number;
    avgFeeRate: number;
    feeRange: [number, number, number, number, number, number, number];
    reward: number;
    totalFees: number;
    avgTxSize: number;
    totalInputs: number;
    totalOutputs: number;
    totalOutputAmt: number;
    medianFee: number;
    feePercentiles: [number, number, number, number, number, number, number];
    medianFeeAmt: number;
    utxoSetChange: number;
    utxoSetSize: number;
    virtualSize: number;
    segwitTotalTxs: number;
    segwitTotalSize: number;
    segwitTotalWeight: number;
    header: string;
    feeSpan: [number, number];
    pool: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

export interface AddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

export interface MiningPool {
  poolId: number;
  name: string;
  link: string;
  blockCount: number;
  rank: number;
  emptyBlocks: number;
  slug: string;
  avgMatchRate: number;
  avgFeeDelta: string;
  poolUniqueId: number;
}

export interface MiningStats {
  pools: MiningPool[];
  blockCount: number;
  totalFees: number;
  totalReward: number;
  totalTx: number;
}

export interface DifficultyAdjustment {
  progressPercent: number;
  difficultyChange: number;
  estimatedRetargetDate: number;
  remainingBlocks: number;
  remainingTime: number;
  previousRetarget: number;
  previousTime: number;
  nextRetargetHeight: number;
  timeAvg: number;
  timeOffset: number;
  expectedBlocks: number;
}

export interface HashrateData {
  timestamp: number;
  avgHashrate: number;
  poolCount: number;
  blockCount: number;
}

export interface LightningStats {
  total_capacity: number;
  public_channel_count: number;
  announced_node_count: number;
  unannounced_node_count: number;
  avg_capacity: number;
  avg_fee_rate: number;
  avg_base_fee_mtokens: number;
  med_capacity: number;
  med_fee_rate: number;
  med_base_fee_mtokens: number;
  clearnet_nodes: {
    total: number;
    ipv4: number;
    ipv6: number;
    tor: number;
  };
  unannounced_nodes: {
    total: number;
    ipv4: number;
    ipv6: number;
    tor: number;
  };
}

export interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

export interface PriceData {
  time: number;
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  CHF: number;
  AUD: number;
  JPY: number;
}

export class MempoolService {
  private config: MempoolConfig;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 30000; // 30 seconds for most data
  private rateLimitCount = 0;
  private rateLimitResetTime = 0;
  private readonly rateLimitPerMinute = 300; // Mempool.space is quite generous

  constructor(config: MempoolConfig = {}) {
    this.config = {
      baseUrl: 'https://mempool.space',
      network: 'mainnet',
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Get the appropriate API base URL based on network
   */
  private getApiBaseUrl(): string {
    const networkPath = this.config.network === 'mainnet' ? '' : `/${this.config.network}`;
    return `${this.config.baseUrl}${networkPath}/api`;
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
      logger.warn('Mempool.space rate limit reached');
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
  private async makeRequest<T>(endpoint: string, ttl = this.defaultTTL): Promise<T> {
    const cacheKey = `${this.config.network}:${endpoint}`;
    
    // Check cache first
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const url = `${this.getApiBaseUrl()}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mempool API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Cache successful response
      this.setCachedData(cacheKey, data, ttl);
      
      return data as T;
    } catch (error) {
      logger.error('Mempool API request failed:', error);
      
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
   * Get current mempool statistics
   */
  async getMempoolStats(): Promise<MempoolStats> {
    return this.makeRequest<MempoolStats>('/mempool', 15000); // 15 seconds
  }

  /**
   * Get recommended fees for different confirmation times
   */
  async getRecommendedFees(): Promise<RecommendedFees> {
    return this.makeRequest<RecommendedFees>('/v1/fees/recommended', 30000);
  }

  /**
   * Get fee histogram from mempool
   */
  async getFeeHistogram(): Promise<number[][]> {
    return this.makeRequest<number[][]>('/mempool/fees', 30000);
  }

  /**
   * Get recent blocks
   */
  async getRecentBlocks(startHeight?: number): Promise<Block[]> {
    const endpoint = startHeight ? `/v1/blocks/${startHeight}` : '/v1/blocks';
    return this.makeRequest<Block[]>(endpoint, 60000); // 1 minute cache
  }

  /**
   * Get specific block by hash or height
   */
  async getBlock(hashOrHeight: string | number): Promise<Block> {
    return this.makeRequest<Block>(`/block/${hashOrHeight}`, 300000); // 5 minutes cache for historical blocks
  }

  /**
   * Get block transactions
   */
  async getBlockTransactions(hashOrHeight: string | number, startIndex = 0): Promise<Transaction[]> {
    return this.makeRequest<Transaction[]>(`/block/${hashOrHeight}/txs/${startIndex}`, 300000);
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<Transaction> {
    return this.makeRequest<Transaction>(`/tx/${txid}`, 300000); // 5 minutes for confirmed transactions
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txid: string): Promise<{
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  }> {
    return this.makeRequest<{
      confirmed: boolean;
      block_height?: number;
      block_hash?: string;
      block_time?: number;
    }>(`/tx/${txid}/status`, 60000);
  }

  /**
   * Get address information and statistics
   */
  async getAddressInfo(address: string): Promise<AddressInfo> {
    return this.makeRequest<AddressInfo>(`/address/${address}`, 60000);
  }

  /**
   * Get address transactions
   */
  async getAddressTransactions(address: string, lastSeenTxid?: string): Promise<Transaction[]> {
    const endpoint = lastSeenTxid 
      ? `/address/${address}/txs/chain/${lastSeenTxid}`
      : `/address/${address}/txs`;
    return this.makeRequest<Transaction[]>(endpoint, 60000);
  }

  /**
   * Get address UTXOs
   */
  async getAddressUTXOs(address: string): Promise<UTXO[]> {
    return this.makeRequest<UTXO[]>(`/address/${address}/utxo`, 60000);
  }

  /**
   * Get mining pools statistics
   */
  async getMiningPools(period: '24h' | '3d' | '1w' | '1m' | '3m' | '6m' | '1y' | '2y' | '3y' = '1w'): Promise<MiningStats> {
    return this.makeRequest<MiningStats>(`/v1/mining/pools/${period}`, 300000); // 5 minutes cache
  }

  /**
   * Get mining pool information
   */
  async getMiningPool(slug: string): Promise<{
    pool: MiningPool;
    blockCount: number;
    blocks: Block[];
  }> {
    return this.makeRequest<{
      pool: MiningPool;
      blockCount: number;
      blocks: Block[];
    }>(`/v1/mining/pool/${slug}`, 300000);
  }

  /**
   * Get difficulty adjustment information
   */
  async getDifficultyAdjustment(): Promise<DifficultyAdjustment> {
    return this.makeRequest<DifficultyAdjustment>('/v1/difficulty-adjustment', 60000);
  }

  /**
   * Get network hashrate data
   */
  async getHashrate(period: '24h' | '3d' | '1w' | '1m' | '3m' | '6m' | '1y' | '2y' | '3y' = '1w'): Promise<HashrateData[]> {
    return this.makeRequest<HashrateData[]>(`/v1/mining/hashrate/${period}`, 300000);
  }

  /**
   * Get Lightning Network statistics
   */
  async getLightningStats(): Promise<LightningStats> {
    return this.makeRequest<LightningStats>('/v1/lightning/statistics/latest', 300000);
  }

  /**
   * Get historical Lightning Network statistics
   */
  async getLightningStatsHistory(period: '1w' | '1m' | '3m' | '6m' | '1y' | '2y' | '3y' = '1m'): Promise<LightningStats[]> {
    return this.makeRequest<LightningStats[]>(`/v1/lightning/statistics/${period}`, 3600000); // 1 hour cache
  }

  /**
   * Get Bitcoin price data
   */
  async getBitcoinPrices(): Promise<PriceData> {
    return this.makeRequest<PriceData>('/v1/prices', 60000);
  }

  /**
   * Get historical Bitcoin price data
   */
  async getHistoricalPrices(period: '1w' | '1m' | '3m' | '6m' | '1y' | '2y' | '3y' = '1y'): Promise<PriceData[]> {
    return this.makeRequest<PriceData[]>(`/v1/historical-price/${period}`, 3600000); // 1 hour cache
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<{
    blocksCount: number;
    mempoolSize: number;
    totalFees: number;
    totalBitcoins: number;
    currentDifficulty: number;
    currentHashrate: number;
    halvingBlocks: number;
    halvingProgress: number;
    chainSize: number;
    nodesCount: number;
    lightningChannels: number;
    lightningCapacity: number;
  }> {
    const [
      mempool,
      recentBlocks,
      difficulty,
      lightning,
      prices
    ] = await Promise.all([
      this.getMempoolStats(),
      this.getRecentBlocks(),
      this.getDifficultyAdjustment(),
      this.getLightningStats(),
      this.getBitcoinPrices()
    ]);

    const latestBlock = recentBlocks[0];
    const halvingBlocks = 210000;
    const nextHalving = Math.ceil((latestBlock.height + 1) / halvingBlocks) * halvingBlocks;
    const blocksUntilHalving = nextHalving - latestBlock.height;
    const halvingProgress = ((latestBlock.height % halvingBlocks) / halvingBlocks) * 100;

    return {
      blocksCount: latestBlock.height,
      mempoolSize: mempool.count,
      totalFees: mempool.total_fee,
      totalBitcoins: (latestBlock.height * 50 * Math.pow(0.5, Math.floor(latestBlock.height / halvingBlocks))) / 100000000,
      currentDifficulty: latestBlock.difficulty,
      currentHashrate: 0, // Would need hashrate endpoint
      halvingBlocks: blocksUntilHalving,
      halvingProgress,
      chainSize: 0, // Would need chain size endpoint
      nodesCount: 0, // Would need nodes endpoint
      lightningChannels: lightning.public_channel_count,
      lightningCapacity: lightning.total_capacity,
    };
  }

  /**
   * Get fee recommendations with analysis
   */
  async getFeeRecommendations(): Promise<{
    fees: RecommendedFees;
    mempoolSize: number;
    analysis: {
      congestionLevel: 'low' | 'medium' | 'high' | 'extreme';
      averageConfirmationTime: string;
      recommendation: string;
    };
  }> {
    const [fees, mempool] = await Promise.all([
      this.getRecommendedFees(),
      this.getMempoolStats()
    ]);

    let congestionLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    let averageConfirmationTime = '< 10 minutes';
    let recommendation = 'Network is running smoothly. Use economy fee for non-urgent transactions.';

    if (fees.fastestFee > 100) {
      congestionLevel = 'extreme';
      averageConfirmationTime = '> 60 minutes';
      recommendation = 'Network is extremely congested. Consider waiting or using Lightning Network.';
    } else if (fees.fastestFee > 50) {
      congestionLevel = 'high';
      averageConfirmationTime = '30-60 minutes';
      recommendation = 'Network is congested. Use higher fees for faster confirmation.';
    } else if (fees.fastestFee > 20) {
      congestionLevel = 'medium';
      averageConfirmationTime = '10-30 minutes';
      recommendation = 'Moderate network activity. Standard fees should work well.';
    }

    return {
      fees,
      mempoolSize: mempool.count,
      analysis: {
        congestionLevel,
        averageConfirmationTime,
        recommendation,
      },
    };
  }

  /**
   * Get block production statistics
   */
  async getBlockProductionStats(blocks = 144): Promise<{
    averageBlockTime: number;
    expectedBlockTime: number;
    blocksAhead: number;
    blocksPerHour: number;
    estimatedTimeToNextBlock: number;
  }> {
    const recentBlocks = await this.getRecentBlocks();
    const analysisBlocks = recentBlocks.slice(0, blocks);
    
    if (analysisBlocks.length < 2) {
      throw new Error('Insufficient block data for analysis');
    }

    const timeDiffs = [];
    for (let i = 0; i < analysisBlocks.length - 1; i++) {
      timeDiffs.push(analysisBlocks[i].timestamp - analysisBlocks[i + 1].timestamp);
    }

    const averageBlockTime = timeDiffs.reduce((sum, time) => sum + time, 0) / timeDiffs.length;
    const expectedBlockTime = 600; // 10 minutes in seconds
    const blocksPerHour = 3600 / averageBlockTime;
    const expectedBlocksPerHour = 6;
    const blocksAhead = (blocksPerHour - expectedBlocksPerHour) * 24; // How many blocks ahead/behind per day

    return {
      averageBlockTime,
      expectedBlockTime,
      blocksAhead,
      blocksPerHour,
      estimatedTimeToNextBlock: averageBlockTime,
    };
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

  /**
   * Switch network
   */
  switchNetwork(network: 'mainnet' | 'testnet' | 'signet' | 'liquid'): void {
    this.config.network = network;
    this.clearCache(); // Clear cache when switching networks
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): string {
    return this.config.network || 'mainnet';
  }
}

// Default instance
export const mempoolService = new MempoolService();

export default mempoolService;