/**
 * Multi-Chain Wallet Service
 * Integrates Web3Modal for Ethereum/EVM chains and Solana wallets
 * Provides comprehensive wallet management across multiple blockchain networks
 */

import { ethers } from 'ethers'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createAppKit } from '@reown/appkit/react'
import { wagmi } from '@reown/appkit-adapter-wagmi'
import { solana } from '@reown/appkit-adapter-solana'
import { mainnet, arbitrum, polygon, optimism, base, sepolia, bsc, avalanche } from '@reown/appkit/networks'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect, coinbaseWallet, metaMask } from 'wagmi/connectors'
import { formatEther, parseEther } from 'viem'

// Enhanced chain configurations
export const SUPPORTED_EVM_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://ethereum.rpc.thirdweb.com',
    icon: '/wallets/ethereum.svg',
    color: '#627EEA',
    coingeckoId: 'ethereum'
  },
  {
    id: 56,
    name: 'BNB Chain',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    icon: '/wallets/bnb.svg',
    color: '#F3BA2F',
    coingeckoId: 'binancecoin'
  },
  {
    id: 137,
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    icon: '/wallets/polygon.svg',
    color: '#8247E5',
    coingeckoId: 'matic-network'
  },
  {
    id: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arbitrum.rpc.thirdweb.com',
    icon: '/wallets/arbitrum.svg',
    color: '#2D374B',
    coingeckoId: 'ethereum'
  },
  {
    id: 10,
    name: 'Optimism',
    currency: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://optimism.rpc.thirdweb.com',
    icon: '/wallets/optimism.svg',
    color: '#FF0420',
    coingeckoId: 'ethereum'
  },
  {
    id: 43114,
    name: 'Avalanche',
    currency: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    icon: '/wallets/avalanche.svg',
    color: '#E84142',
    coingeckoId: 'avalanche-2'
  },
  {
    id: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://base.rpc.thirdweb.com',
    icon: '/wallets/base.svg',
    color: '#0052FF',
    coingeckoId: 'ethereum'
  }
]

export const SUPPORTED_SOLANA_CHAINS = [
  {
    id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    currency: 'SOL',
    explorerUrl: 'https://explorer.solana.com',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    icon: '/wallets/solana.svg',
    color: '#14F195',
    coingeckoId: 'solana'
  }
]

// Popular wallet configurations
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    type: 'evm',
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    type: 'evm',
    downloadUrl: 'https://walletconnect.com/'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    type: 'evm',
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '/wallets/trust.svg',
    type: 'evm',
    downloadUrl: 'https://trustwallet.com/'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '/wallets/phantom.svg',
    type: 'solana',
    downloadUrl: 'https://phantom.app/'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '/wallets/solflare.svg',
    type: 'solana',
    downloadUrl: 'https://solflare.com/'
  }
]

// ERC-20 Token List (top tokens by market cap)
export const DEFAULT_TOKEN_LIST = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      1: '0xA0b86a33E6441b8d9d3364b06dFFC7c96a0D84e4',
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
    },
    icon: '/tokens/usdc.svg',
    coingeckoId: 'usd-coin'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      56: '0x55d398326f99059fF775485246999027B3197955'
    },
    icon: '/tokens/usdt.svg',
    coingeckoId: 'tether'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    addresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      10: '0x4200000000000000000000000000000000000006'
    },
    icon: '/tokens/weth.svg',
    coingeckoId: 'weth'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    addresses: {
      1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      137: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      42161: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
    },
    icon: '/tokens/wbtc.svg',
    coingeckoId: 'wrapped-bitcoin'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    addresses: {
      1: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      137: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
      42161: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'
    },
    icon: '/tokens/uni.svg',
    coingeckoId: 'uniswap'
  }
]

class MultiChainWalletService {
  constructor() {
    this.providers = new Map()
    this.solanaConnection = null
    this.balanceCache = new Map()
    this.priceCache = new Map()
    this.cacheExpiry = 30000 // 30 seconds
    this.eventListeners = new Set()
    
    this.initializeService()
  }

  /**
   * Initialize the wallet service
   */
  async initializeService() {
    try {
      // Initialize EVM providers
      await this.initializeEVMProviders()
      
      // Initialize Solana connection
      await this.initializeSolanaConnection()
      
      // Initialize price service
      await this.initializePriceService()
      
      console.log('MultiChainWalletService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MultiChainWalletService:', error)
    }
  }

  /**
   * Initialize EVM chain providers
   */
  async initializeEVMProviders() {
    for (const chain of SUPPORTED_EVM_CHAINS) {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl)
        await provider.getNetwork() // Test connection
        this.providers.set(chain.id, provider)
        console.log(`Connected to ${chain.name} (Chain ID: ${chain.id})`)
      } catch (error) {
        console.warn(`Failed to connect to ${chain.name}:`, error)
      }
    }
  }

  /**
   * Initialize Solana connection
   */
  async initializeSolanaConnection() {
    try {
      const solanaChain = SUPPORTED_SOLANA_CHAINS[0]
      this.solanaConnection = new Connection(solanaChain.rpcUrl, 'confirmed')
      
      // Test connection
      await this.solanaConnection.getVersion()
      console.log('Connected to Solana mainnet')
    } catch (error) {
      console.warn('Failed to connect to Solana:', error)
    }
  }

  /**
   * Initialize price service
   */
  async initializePriceService() {
    // Start periodic price updates
    this.updatePrices()
    setInterval(() => this.updatePrices(), 60000) // Update every minute
  }

  /**
   * Get balance for a specific chain
   */
  async getChainBalance(chainId, address) {
    const cacheKey = `${chainId}-${address}`
    const cached = this.balanceCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    try {
      let balance = '0'
      let formattedBalance = '0'
      
      if (typeof chainId === 'number') {
        // EVM chain
        const provider = this.providers.get(chainId)
        if (provider) {
          const balanceWei = await provider.getBalance(address)
          balance = balanceWei.toString()
          formattedBalance = formatEther(balanceWei)
        }
      } else if (chainId.startsWith('solana:')) {
        // Solana chain
        if (this.solanaConnection) {
          const publicKey = new PublicKey(address)
          const balanceLamports = await this.solanaConnection.getBalance(publicKey)
          balance = balanceLamports.toString()
          formattedBalance = (balanceLamports / LAMPORTS_PER_SOL).toString()
        }
      }

      const result = {
        balance,
        formattedBalance: parseFloat(formattedBalance).toFixed(6),
        timestamp: Date.now()
      }

      this.balanceCache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } catch (error) {
      console.error(`Error fetching balance for chain ${chainId}:`, error)
      return { balance: '0', formattedBalance: '0.000000', timestamp: Date.now() }
    }
  }

  /**
   * Get balances across all supported chains
   */
  async getAllBalances(address) {
    const balances = []
    const promises = []

    // Get EVM chain balances
    for (const chain of SUPPORTED_EVM_CHAINS) {
      promises.push(
        this.getChainBalance(chain.id, address).then(balance => ({
          chainId: chain.id,
          chainName: chain.name,
          currency: chain.currency,
          explorerUrl: chain.explorerUrl,
          icon: chain.icon,
          color: chain.color,
          coingeckoId: chain.coingeckoId,
          ...balance
        }))
      )
    }

    // Get Solana balance (if address is valid Solana address)
    if (this.isValidSolanaAddress(address)) {
      for (const chain of SUPPORTED_SOLANA_CHAINS) {
        promises.push(
          this.getChainBalance(chain.id, address).then(balance => ({
            chainId: chain.id,
            chainName: chain.name,
            currency: chain.currency,
            explorerUrl: chain.explorerUrl,
            icon: chain.icon,
            color: chain.color,
            coingeckoId: chain.coingeckoId,
            ...balance
          }))
        )
      }
    }

    try {
      const results = await Promise.allSettled(promises)
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          balances.push(result.value)
        }
      })
    } catch (error) {
      console.error('Error fetching all balances:', error)
    }

    return balances
  }

  /**
   * Get token balances for a specific chain
   */
  async getTokenBalances(chainId, address, tokenList = DEFAULT_TOKEN_LIST) {
    const provider = this.providers.get(chainId)
    if (!provider) return []

    const balances = []
    const tokenABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ]

    for (const token of tokenList) {
      const tokenAddress = token.addresses[chainId]
      if (!tokenAddress) continue

      try {
        const contract = new ethers.Contract(tokenAddress, tokenABI, provider)
        const balance = await contract.balanceOf(address)
        const decimals = token.decimals || await contract.decimals()
        
        if (balance > 0) {
          const formattedBalance = ethers.formatUnits(balance, decimals)
          balances.push({
            ...token,
            address: tokenAddress,
            balance: balance.toString(),
            formattedBalance: parseFloat(formattedBalance).toFixed(6),
            decimals
          })
        }
      } catch (error) {
        console.warn(`Error fetching balance for ${token.symbol} on chain ${chainId}:`, error)
      }
    }

    return balances
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(chainId, address, limit = 10) {
    try {
      if (typeof chainId === 'number') {
        // EVM transaction history
        return await this.getEVMTransactionHistory(chainId, address, limit)
      } else if (chainId.startsWith('solana:')) {
        // Solana transaction history
        return await this.getSolanaTransactionHistory(address, limit)
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return []
    }
  }

  /**
   * Get EVM transaction history
   */
  async getEVMTransactionHistory(chainId, address, limit) {
    const chain = SUPPORTED_EVM_CHAINS.find(c => c.id === chainId)
    if (!chain) return []

    // This would typically use an API service like Etherscan, Alchemy, or Moralis
    // For demo purposes, we'll return mock data
    return [
      {
        hash: '0x...',
        from: address,
        to: '0x...',
        value: '1000000000000000000',
        timestamp: Date.now() - 3600000,
        status: 'success',
        gasUsed: '21000',
        gasPrice: '20000000000'
      }
    ]
  }

  /**
   * Get Solana transaction history
   */
  async getSolanaTransactionHistory(address, limit) {
    if (!this.solanaConnection) return []

    try {
      const publicKey = new PublicKey(address)
      const signatures = await this.solanaConnection.getSignaturesForAddress(
        publicKey,
        { limit }
      )

      const transactions = []
      for (const sig of signatures) {
        const tx = await this.solanaConnection.getTransaction(sig.signature)
        if (tx) {
          transactions.push({
            signature: sig.signature,
            slot: tx.slot,
            timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
            status: sig.err ? 'failed' : 'success',
            fee: tx.meta?.fee || 0
          })
        }
      }

      return transactions
    } catch (error) {
      console.error('Error fetching Solana transaction history:', error)
      return []
    }
  }

  /**
   * Update cryptocurrency prices
   */
  async updatePrices() {
    try {
      const coingeckoIds = [
        ...SUPPORTED_EVM_CHAINS.map(chain => chain.coingeckoId),
        ...SUPPORTED_SOLANA_CHAINS.map(chain => chain.coingeckoId)
      ].filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
      )

      if (response.ok) {
        const prices = await response.json()
        for (const [id, data] of Object.entries(prices)) {
          this.priceCache.set(id, {
            price: data.usd,
            change24h: data.usd_24h_change,
            timestamp: Date.now()
          })
        }
        console.log('Prices updated successfully')
      }
    } catch (error) {
      console.error('Error updating prices:', error)
    }
  }

  /**
   * Get price for a cryptocurrency
   */
  getPrice(coingeckoId) {
    const cached = this.priceCache.get(coingeckoId)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached
    }
    return { price: 0, change24h: 0 }
  }

  /**
   * Calculate portfolio value
   */
  calculatePortfolioValue(balances) {
    let totalValue = 0
    let total24hChange = 0

    for (const balance of balances) {
      const price = this.getPrice(balance.coingeckoId)
      const value = parseFloat(balance.formattedBalance) * price.price
      totalValue += value
      total24hChange += value * (price.change24h / 100)
    }

    return {
      totalValue,
      total24hChange,
      total24hChangePercent: totalValue > 0 ? (total24hChange / totalValue) * 100 : 0
    }
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(chainId) {
    try {
      if (window.ethereum) {
        const chain = SUPPORTED_EVM_CHAINS.find(c => c.id === chainId)
        if (!chain) throw new Error('Unsupported chain')

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }]
        })

        return true
      }
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added to wallet
        return await this.addNetwork(chainId)
      }
      console.error('Error switching network:', error)
      return false
    }
  }

  /**
   * Add a new network to the wallet
   */
  async addNetwork(chainId) {
    try {
      const chain = SUPPORTED_EVM_CHAINS.find(c => c.id === chainId)
      if (!chain || !window.ethereum) return false

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: {
            name: chain.currency,
            symbol: chain.currency,
            decimals: 18
          },
          rpcUrls: [chain.rpcUrl],
          blockExplorerUrls: [chain.explorerUrl]
        }]
      })

      return true
    } catch (error) {
      console.error('Error adding network:', error)
      return false
    }
  }

  /**
   * Validate if an address is a valid Solana address
   */
  isValidSolanaAddress(address) {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  isValidEthereumAddress(address) {
    return ethers.isAddress(address)
  }

  /**
   * Get supported wallets for a chain type
   */
  getSupportedWallets(chainType = 'all') {
    if (chainType === 'all') {
      return SUPPORTED_WALLETS
    }
    return SUPPORTED_WALLETS.filter(wallet => wallet.type === chainType)
  }

  /**
   * Get supported chains
   */
  getSupportedChains() {
    return {
      evm: SUPPORTED_EVM_CHAINS,
      solana: SUPPORTED_SOLANA_CHAINS,
      all: [...SUPPORTED_EVM_CHAINS, ...SUPPORTED_SOLANA_CHAINS]
    }
  }

  /**
   * Subscribe to wallet events
   */
  subscribe(callback) {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  /**
   * Emit events to all listeners
   */
  emit(event, data) {
    this.eventListeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.balanceCache.clear()
    this.priceCache.clear()
    console.log('Wallet service cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      balanceCache: this.balanceCache.size,
      priceCache: this.priceCache.size,
      providers: this.providers.size,
      solanaConnected: !!this.solanaConnection
    }
  }
}

// Create singleton instance
const multiChainWalletService = new MultiChainWalletService()

export default multiChainWalletService
export { MultiChainWalletService }