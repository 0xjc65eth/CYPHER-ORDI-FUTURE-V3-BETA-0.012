/**
 * Hiro API Service for Bitcoin, Ordinals, and Runes data
 */

class HiroApiService {
  constructor() {
    this.baseUrls = {
      stacks: 'https://api.hiro.so',
      ordinals: 'https://api.hiro.so/ordinals/v1',
      runes: 'https://api.hiro.so/runes/v1'
    };
    
    this.mempool = {
      base: 'https://mempool.space/api'
    };
  }

  /**
   * Generic API request handler
   */
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Get Bitcoin balance for an address using Mempool.space API
   */
  async getBitcoinBalance(address) {
    try {
      const url = `${this.mempool.base}/address/${address}`;
      const data = await this.makeRequest(url);
      
      return {
        total: data.chain_stats.funded_txo_sum,
        spent: data.chain_stats.spent_txo_sum,
        balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        unconfirmed: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum,
        txCount: data.chain_stats.tx_count,
        address: address
      };
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error);
      return {
        total: 0,
        spent: 0,
        balance: 0,
        unconfirmed: 0,
        txCount: 0,
        address: address
      };
    }
  }

  /**
   * Get UTXO data for an address
   */
  async getUTXOs(address) {
    try {
      const url = `${this.mempool.base}/address/${address}/utxo`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      return [];
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address, afterTxid = null) {
    try {
      let url = `${this.mempool.base}/address/${address}/txs`;
      if (afterTxid) {
        url += `/chain/${afterTxid}`;
      }
      
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get Ordinals (Inscriptions) for an address
   */
  async getOrdinals(address, limit = 50, offset = 0) {
    try {
      const url = `${this.baseUrls.ordinals}/inscriptions?address=${address}&limit=${limit}&offset=${offset}`;
      const data = await this.makeRequest(url);
      
      return {
        results: data.results || [],
        total: data.total || 0,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error fetching Ordinals:', error);
      return {
        results: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get specific inscription details
   */
  async getInscriptionDetails(inscriptionId) {
    try {
      const url = `${this.baseUrls.ordinals}/inscriptions/${inscriptionId}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching inscription details:', error);
      return null;
    }
  }

  /**
   * Get Runes balances for an address
   */
  async getRunesBalances(address) {
    try {
      const url = `${this.baseUrls.runes}/addresses/${address}/balances`;
      const data = await this.makeRequest(url);
      
      return {
        results: data.results || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching Runes balances:', error);
      return {
        results: [],
        total: 0
      };
    }
  }

  /**
   * Get Runes token information
   */
  async getRuneInfo(runeName) {
    try {
      const url = `${this.baseUrls.runes}/runes/${runeName}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching Rune info:', error);
      return null;
    }
  }

  /**
   * Get all Runes tokens list
   */
  async getRunesList(limit = 50, offset = 0, sortBy = 'market_cap') {
    try {
      const url = `${this.baseUrls.runes}/runes?limit=${limit}&offset=${offset}&sort_by=${sortBy}`;
      const data = await this.makeRequest(url);
      
      return {
        results: data.results || [],
        total: data.total || 0,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error fetching Runes list:', error);
      return {
        results: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get Ordinals collection stats
   */
  async getOrdinalsStats() {
    try {
      const url = `${this.baseUrls.ordinals}/stats`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching Ordinals stats:', error);
      return null;
    }
  }

  /**
   * Get recent Ordinals activity
   */
  async getRecentInscriptions(limit = 20) {
    try {
      const url = `${this.baseUrls.ordinals}/inscriptions?limit=${limit}&order_by=genesis_block_height&order=desc`;
      const data = await this.makeRequest(url);
      
      return data.results || [];
    } catch (error) {
      console.error('Error fetching recent inscriptions:', error);
      return [];
    }
  }

  /**
   * Search inscriptions by content type
   */
  async searchInscriptionsByContentType(contentType, limit = 50, offset = 0) {
    try {
      const url = `${this.baseUrls.ordinals}/inscriptions?mime_type=${encodeURIComponent(contentType)}&limit=${limit}&offset=${offset}`;
      const data = await this.makeRequest(url);
      
      return {
        results: data.results || [],
        total: data.total || 0,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error searching inscriptions:', error);
      return {
        results: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get comprehensive wallet portfolio
   */
  async getWalletPortfolio(address) {
    try {
      const [bitcoinBalance, ordinals, runes, utxos] = await Promise.allSettled([
        this.getBitcoinBalance(address),
        this.getOrdinals(address, 100),
        this.getRunesBalances(address),
        this.getUTXOs(address)
      ]);

      return {
        address,
        bitcoin: bitcoinBalance.status === 'fulfilled' ? bitcoinBalance.value : null,
        ordinals: ordinals.status === 'fulfilled' ? ordinals.value : { results: [], total: 0 },
        runes: runes.status === 'fulfilled' ? runes.value : { results: [], total: 0 },
        utxos: utxos.status === 'fulfilled' ? utxos.value : [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      throw error;
    }
  }

  /**
   * Get Bitcoin network stats
   */
  async getNetworkStats() {
    try {
      const url = `${this.mempool.base}/v1/statistics`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  }

  /**
   * Get current Bitcoin price
   */
  async getBitcoinPrice() {
    try {
      const url = `${this.mempool.base}/v1/prices`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      return null;
    }
  }

  /**
   * Get fee estimates
   */
  async getFeeEstimates() {
    try {
      const url = `${this.mempool.base}/v1/fees/recommended`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching fee estimates:', error);
      return null;
    }
  }

  /**
   * Get difficulty adjustment estimation
   */
  async getDifficultyAdjustment() {
    try {
      const url = `${this.mempool.base}/v1/difficulty-adjustment`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching difficulty adjustment:', error);
      return null;
    }
  }

  /**
   * Validate Bitcoin address
   */
  async validateAddress(address) {
    try {
      const url = `${this.mempool.base}/address/${address}`;
      await this.makeRequest(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let hiroApiInstance = null;

export const getHiroApi = () => {
  if (!hiroApiInstance) {
    hiroApiInstance = new HiroApiService();
  }
  return hiroApiInstance;
};

export default HiroApiService;