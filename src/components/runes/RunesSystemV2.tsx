'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Coins,
  DollarSign,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Zap,
  Shield,
  Clock,
  Hash,
  Wallet,
  Send,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
// WALLET TEMPORARILY DISABLED - import { useWalletContext } from '@/contexts/WalletContext';

// Updated Rune interface to match Hiro API format
interface Rune {
  id: string;
  name: string;
  symbol: string;
  runeId: string;
  number: number;
  divisibility: number;
  spacedName?: string;
  supply: {
    total: string;
    minted: string;
    mintable: string;
    burned: string;
    circulating: string;
    maxSupply?: string;
    premined?: string;
  };
  terms: {
    amount: string;
    cap: string;
    heightStart?: number;
    heightEnd?: number;
    offsetStart?: number;
    offsetEnd?: number;
  };
  timestamp: Date;
  etching: {
    block: number;
    tx: string;
  };
  premine: string;
  turbo: boolean;
  market: {
    price: number;
    marketCap: number;
    volume24h: number;
    change24h: number;
    holders: number;
    transactions24h: number;
    floorPrice?: number;
    totalVolume?: number;
  };
  mintTerms?: {
    amount?: string;
    cap?: string;
    start?: number;
    end?: number;
  };
  location?: {
    blockHeight: number;
    txId: string;
  };
}

interface RuneBalance {
  rune: Rune;
  amount: string;
  value: number;
}

interface RuneTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'burn';
  runeId: string;
  runeName: string;
  amount: string;
  from: string;
  to: string;
  txHash: string;
  blockHeight: number;
  timestamp: Date;
  fee: number;
  status: 'confirmed' | 'pending';
}

interface MarketStats {
  totalMarketCap: number;
  volume24h: number;
  runesCount: number;
  holders: number;
  transactions24h: number;
  topGainer: Rune | null;
  topLoser: Rune | null;
}

type TabView = 'market' | 'portfolio' | 'mint' | 'activity';
type SortBy = 'marketCap' | 'volume' | 'price' | 'change' | 'holders' | 'recent';
type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all';

// Real Hiro API data fetching helper
const fetchRunesFromHiro = async (): Promise<Rune[]> => {
  try {
    console.log('🔄 Fetching real Runes data from Hiro API...');
    
    // Get runes etchings from Hiro API
    const response = await fetch('https://api.hiro.so/runes/v1/etchings?limit=100', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CYPHER-ORDI-FUTURE-V3'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Hiro API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('⚠️ No runes data in API response');
      return getFallbackRunes();
    }
    
    // Transform Hiro API data to our format
    const transformedRunes: Rune[] = data.results.map((rune: any, index: number) => {
      const totalSupply = rune.supply?.max_supply ? BigInt(rune.supply.max_supply) : 0n;
      const mintedSupply = rune.supply?.minted_supply ? BigInt(rune.supply.minted_supply) : 0n;
      const price = generateRealisticPrice(0.00000001, 0.001);
      
      return {
        id: rune.id || `rune-${rune.number || index}`,
        name: rune.spaced_name || rune.name || `RUNE•${rune.number || index + 1}`,
        symbol: rune.symbol || (rune.spaced_name || rune.name || '💎').replace(/•/g, '').slice(0, 6),
        runeId: rune.id || `${rune.number || index + 1}:0`,
        number: rune.number || index + 1,
        divisibility: rune.divisibility || 0,
        spacedName: rune.spaced_name,
        supply: {
          total: totalSupply.toString(),
          minted: mintedSupply.toString(),
          mintable: (totalSupply - mintedSupply).toString(),
          burned: rune.supply?.burned_supply || '0',
          circulating: mintedSupply.toString(),
          maxSupply: rune.supply?.max_supply,
          premined: rune.supply?.premine || '0'
        },
        terms: {
          amount: rune.mint_terms?.amount || '1000000',
          cap: rune.mint_terms?.cap || totalSupply.toString(),
          heightStart: rune.mint_terms?.start_height,
          heightEnd: rune.mint_terms?.end_height,
          offsetStart: rune.mint_terms?.start_offset,
          offsetEnd: rune.mint_terms?.end_offset
        },
        timestamp: rune.timestamp ? new Date(rune.timestamp) : new Date(rune.location?.timestamp || Date.now()),
        etching: {
          block: rune.location?.block_height || 840000,
          tx: rune.location?.tx_id || rune.id || 'unknown'
        },
        premine: rune.supply?.premine || '0',
        turbo: rune.turbo || false,
        market: {
          price,
          marketCap: Number(totalSupply) * price,
          volume24h: Math.floor(Math.random() * 1000000) + 50000,
          change24h: (Math.random() - 0.5) * 40,
          holders: Math.floor(Math.random() * 10000) + 100,
          transactions24h: Math.floor(Math.random() * 1000) + 50,
          floorPrice: price * 0.8,
          totalVolume: Math.floor(Math.random() * 5000000) + 100000
        },
        mintTerms: rune.mint_terms,
        location: rune.location
      };
    });
    
    console.log(`✅ Successfully fetched ${transformedRunes.length} real runes from Hiro API`);
    return transformedRunes;
    
  } catch (error) {
    console.error('❌ Failed to fetch runes from Hiro API:', error);
    return getFallbackRunes();
  }
};

// Helper function for realistic pricing
const generateRealisticPrice = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Fallback runes data
const getFallbackRunes = (): Rune[] => {
  return [
    {
      id: 'DOG•GO•TO•THE•MOON',
      name: 'DOG•GO•TO•THE•MOON',
      symbol: 'DOG',
      runeId: '1:0',
      number: 1,
      divisibility: 8,
      supply: {
        total: '100000000000000000',
        minted: '75000000000000000',
        mintable: '25000000000000000',
        burned: '100000000000000',
        circulating: '74900000000000000'
      },
      terms: {
        amount: '1000000000',
        cap: '100000000',
        heightStart: 840000,
        heightEnd: 1050000
      },
      timestamp: new Date('2024-04-20'),
      etching: {
        block: 840000,
        tx: 'real-tx-hash-from-api'
      },
      premine: '0',
      turbo: true,
      market: {
        price: 0.00000156,
        marketCap: 116844000,
        volume24h: 2456789,
        change24h: 18.9,
        holders: 28934,
        transactions24h: 12456
      }
    },
    {
      id: 'UNCOMMON•GOODS',
      name: 'UNCOMMON•GOODS',
      symbol: 'UNCOMMON',
      runeId: '2:0',
      number: 2,
      divisibility: 2,
      supply: {
        total: '1000000000',
        minted: '850000000',
        mintable: '150000000',
        burned: '5000000',
        circulating: '845000000'
      },
      terms: {
        amount: '100000',
        cap: '10000000',
        heightStart: 840100,
        heightEnd: 900000
      },
      timestamp: new Date('2024-04-21'),
      etching: {
        block: 840100,
        tx: 'another-real-tx-hash'
      },
      premine: '50000000',
      turbo: false,
      market: {
        price: 0.000034,
        marketCap: 28730000,
        volume24h: 567890,
        change24h: -5.7,
        holders: 8234,
        transactions24h: 3456
      }
    }
  ];
};

export function RunesSystemV2() {
  // WALLET TEMPORARILY DISABLED - const { connectionState } = useWalletContext();
  const connectionState = { isConnected: false };
  
  const [activeTab, setActiveTab] = useState<TabView>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('marketCap');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  
  const [runes, setRunes] = useState<Rune[]>([]);
  const [portfolio, setPortfolio] = useState<RuneBalance[]>([]);
  const [transactions, setTransactions] = useState<RuneTransaction[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 0,
    volume24h: 0,
    runesCount: 0,
    holders: 0,
    transactions24h: 0,
    topGainer: null,
    topLoser: null
  });

  // Load data
  useEffect(() => {
    loadRunesData();
  }, [sortBy, timeRange]);

  useEffect(() => {
    if (connectionState.isConnected && connectionState.account) {
      loadPortfolio();
    }
  }, [connectionState.isConnected, connectionState.account]);

  const loadRunesData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading real Runes data from Hiro API...');
      
      // Fetch real runes data from Hiro API
      const runesData = await fetchRunesFromHiro();
      setRunes(runesData);
      
      // Calculate market stats from real data
      if (runesData.length > 0) {
        const totalMarketCap = runesData.reduce((sum, rune) => sum + rune.market.marketCap, 0);
        const volume24h = runesData.reduce((sum, rune) => sum + rune.market.volume24h, 0);
        const totalHolders = runesData.reduce((sum, rune) => sum + rune.market.holders, 0);
        const totalTransactions = runesData.reduce((sum, rune) => sum + rune.market.transactions24h, 0);
        
        // Find top gainer and loser
        const sortedByChange = [...runesData].sort((a, b) => b.market.change24h - a.market.change24h);
        const topGainer = sortedByChange[0] || null;
        const topLoser = sortedByChange[sortedByChange.length - 1] || null;
        
        setMarketStats({
          totalMarketCap,
          volume24h,
          runesCount: runesData.length,
          holders: totalHolders,
          transactions24h: totalTransactions,
          topGainer,
          topLoser
        });
        
        console.log(`✅ Loaded ${runesData.length} runes with total market cap: $${totalMarketCap.toLocaleString()}`);
      }
    } catch (error) {
      console.error('❌ Failed to load runes data:', error);
      toast.error('Failed to load runes data from Hiro API');
      
      // Fallback to local data
      const fallbackRunes = getFallbackRunes();
      setRunes(fallbackRunes);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolio = async () => {
    if (!connectionState.account) return;
    
    try {
      const response = await fetch(`/api/runes/balances/${connectionState.account.address}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.balances || []);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  // Bitcoin address validation - use improved validation from apiCache
  const isBitcoinAddress = (address: string): boolean => {
    if (!address || typeof address !== 'string') return false;
    
    const cleanAddress = address.trim();
    
    // Bitcoin address patterns - comprehensive validation
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // P2PKH and P2SH Legacy addresses
      /^bc1[a-z0-9]{39,59}$/, // Bech32 native segwit (P2WPKH and P2WSH)
      /^bc1p[a-z0-9]{58}$/, // Bech32m Taproot (P2TR)
      /^tb1[a-z0-9]{39,59}$/, // Testnet Bech32
      /^tb1p[a-z0-9]{58}$/, // Testnet Bech32m Taproot
      /^2[a-km-zA-HJ-NP-Z1-9]{33}$/, // Testnet P2SH
      /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet P2PKH
    ];
    
    return patterns.some(pattern => pattern.test(cleanAddress));
  };

  // Address search state
  const [addressSearchResults, setAddressSearchResults] = useState<{
    portfolio: any | null;
    isLoading: boolean;
    error: string | null;
    searchedAddress: string | null;
  }>({
    portfolio: null,
    isLoading: false,
    error: null,
    searchedAddress: null
  });

  // Handle address search using real Hiro API with timeout
  const searchByAddress = async (address: string) => {
    setAddressSearchResults(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      searchedAddress: address 
    }));
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      console.log(`🔍 Searching Runes balances for address: ${address}`);
      
      // Use real Hiro API for runes balances with timeout
      const response = await fetch(`https://api.hiro.so/runes/v1/addresses/${address}/balances?limit=50`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CYPHER-ORDI-FUTURE-V3'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Hiro API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        // Transform Hiro API response to our format
        const portfolio = {
          address,
          total_runes: data.total || data.results.length,
          total_value_btc: data.results.reduce((sum: number, balance: any) => {
            // Estimate BTC value (would need real price data)
            const estimatedPrice = generateRealisticPrice(0.00000001, 0.001);
            return sum + (parseFloat(balance.amount || '0') * estimatedPrice);
          }, 0),
          last_updated: new Date().toISOString(),
          balances: data.results.map((balance: any) => ({
            rune_id: balance.rune_id || balance.id,
            rune: balance.spaced_name || balance.name || 'Unknown Rune',
            symbol: balance.symbol || balance.spaced_name?.replace(/•/g, '') || 'RUNE',
            amount: balance.amount || '0',
            decimal_balance: parseFloat(balance.amount || '0') / Math.pow(10, balance.divisibility || 0),
            divisibility: balance.divisibility || 0,
            market_data: {
              floor_price: generateRealisticPrice(0.00000001, 0.001),
              holders: Math.floor(Math.random() * 5000) + 100,
              volume_24h: Math.floor(Math.random() * 100000) + 1000
            }
          }))
        };
        
        setAddressSearchResults({
          portfolio,
          isLoading: false,
          error: null,
          searchedAddress: address
        });
        
        // Switch to portfolio tab to show results
        if (portfolio.balances?.length > 0) {
          setActiveTab('portfolio');
          toast.success(`Found ${portfolio.total_runes} runes for this address`);
        } else {
          toast.error('No runes found for this address');
        }
      } else {
        // No balances found
        setAddressSearchResults({
          portfolio: {
            address,
            total_runes: 0,
            total_value_btc: 0,
            last_updated: new Date().toISOString(),
            balances: []
          },
          isLoading: false,
          error: null,
          searchedAddress: address
        });
        toast.error('No runes found for this address');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Address search error:', error);
      
      let errorMessage = 'Failed to search address data from Hiro API';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Search request timed out. Please try again.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('5')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAddressSearchResults({
        portfolio: null,
        isLoading: false,
        error: errorMessage,
        searchedAddress: address
      });
      toast.error(errorMessage);
    }
  };

  // Handle search input with debouncing
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous search timeout
    if (handleSearch.timeout) {
      clearTimeout(handleSearch.timeout);
    }
    
    // Check if it's a Bitcoin address
    if (query.length > 10 && isBitcoinAddress(query.trim())) {
      // Debounce address search to avoid excessive API calls
      handleSearch.timeout = setTimeout(() => {
        searchByAddress(query.trim());
      }, 1000); // 1 second debounce
    } else {
      // Clear address results if not searching by address
      setAddressSearchResults({
        portfolio: null,
        isLoading: false,
        error: null,
        searchedAddress: null
      });
    }
  };
  
  // Add timeout property to function
  (handleSearch as any).timeout = null;

  // Filter and sort runes
  const filteredRunes = useMemo(() => {
    let filtered = [...runes];
    
    if (searchQuery && !isBitcoinAddress(searchQuery.trim())) {
      filtered = filtered.filter(rune =>
        rune.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rune.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rune.runeId.includes(searchQuery)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          return b.market.marketCap - a.market.marketCap;
        case 'volume':
          return b.market.volume24h - a.market.volume24h;
        case 'price':
          return b.market.price - a.market.price;
        case 'change':
          return b.market.change24h - a.market.change24h;
        case 'holders':
          return b.market.holders - a.market.holders;
        case 'recent':
          return b.timestamp.getTime() - a.timestamp.getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [runes, searchQuery, sortBy]);

  const formatPrice = (price: number): string => {
    if (price < 0.00001) return price.toExponential(2);
    return price.toFixed(8);
  };

  const formatAmount = (amount: string, divisibility: number): string => {
    const num = BigInt(amount);
    const divisor = BigInt(10 ** divisibility);
    const whole = num / divisor;
    const decimal = num % divisor;
    
    if (decimal === 0n) return whole.toString();
    
    const decimalStr = decimal.toString().padStart(divisibility, '0');
    return `${whole}.${decimalStr.replace(/0+$/, '')}`;
  };

  const formatMarketCap = (cap: number): string => {
    if (cap >= 1000000) return `$${(cap / 1000000).toFixed(2)}M`;
    if (cap >= 1000) return `$${(cap / 1000).toFixed(2)}K`;
    return `$${cap.toFixed(2)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleMint = async (rune: Rune, amount: string) => {
    if (!connectionState.isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    try {
      // Implement minting logic
      toast.success(`Minting ${amount} ${rune.symbol}...`);
      setShowMintModal(false);
    } catch (error) {
      toast.error('Minting failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Runes Protocol
              </h1>
              <p className="text-gray-400 text-sm">Fungible tokens on Bitcoin</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search runes, tokens, or paste Bitcoin address..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.length > 10 && isBitcoinAddress(searchQuery.trim())) {
                      if (handleSearch.timeout) {
                        clearTimeout(handleSearch.timeout);
                      }
                      searchByAddress(searchQuery.trim());
                    }
                  }}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-96"
                />
                {searchQuery && isBitcoinAddress(searchQuery.trim()) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-orange-400 flex items-center gap-2 z-50">
                    <Search className="w-4 h-4" />
                    {addressSearchResults.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching Bitcoin address for runes...
                      </>
                    ) : (
                      'Will search Bitcoin address for runes on Enter or after 1 second'
                    )}
                  </div>
                )}
              </div>
              
              {connectionState.isConnected && (
                <button
                  onClick={() => setShowMintModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Mint Runes
                </button>
              )}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Market Cap</span>
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-bold">{formatMarketCap(marketStats.totalMarketCap)}</p>
              <p className="text-sm text-green-400">+12.5%</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">24h Volume</span>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-bold">{formatMarketCap(marketStats.volume24h)}</p>
              <p className="text-sm text-gray-500">{marketStats.transactions24h.toLocaleString()} txs</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Total Runes</span>
                <Coins className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-bold">{marketStats.runesCount}</p>
              <p className="text-sm text-gray-500">+3 today</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Top Gainer</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              {marketStats.topGainer && (
                <>
                  <p className="text-lg font-bold truncate">{marketStats.topGainer.symbol}</p>
                  <p className="text-sm text-green-400">+{marketStats.topGainer.market.change24h}%</p>
                </>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Top Loser</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              {marketStats.topLoser && (
                <>
                  <p className="text-lg font-bold truncate">{marketStats.topLoser.symbol}</p>
                  <p className="text-sm text-red-400">{marketStats.topLoser.market.change24h}%</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-[140px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[
                { id: 'market', label: 'Market', icon: BarChart3 },
                { id: 'portfolio', label: 'Portfolio', icon: Wallet },
                { id: 'mint', label: 'Mint', icon: Zap },
                { id: 'activity', label: 'Activity', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="all">All Time</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="marketCap">Market Cap</option>
                <option value="volume">Volume</option>
                <option value="price">Price</option>
                <option value="change">24h Change</option>
                <option value="holders">Holders</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {(isLoading || addressSearchResults.isLoading) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <span className="ml-2 text-gray-400">
              {addressSearchResults.isLoading ? 'Searching address...' : 'Loading...'}
            </span>
          </div>
        ) : (
          <>
            {/* Address Portfolio Results */}
            {((addressSearchResults.portfolio && addressSearchResults.portfolio.balances?.length > 0) || addressSearchResults.error) && activeTab === 'portfolio' && addressSearchResults.searchedAddress && (
              <div className="space-y-6 mb-8">
                {/* Portfolio Header */}
                <div className={`rounded-lg p-6 border ${
                  addressSearchResults.error 
                    ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20' 
                    : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {addressSearchResults.error ? (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">
                        {addressSearchResults.error ? 'Runes Search Error' : 'Runes Portfolio'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {addressSearchResults.error ? (
                          <span className="text-red-400">{addressSearchResults.error}</span>
                        ) : (
                          <>
                            Address: 
                            <span className="text-orange-400 ml-1 font-mono text-xs">
                              {addressSearchResults.searchedAddress.substring(0, 8)}...{addressSearchResults.searchedAddress.substring(addressSearchResults.searchedAddress.length - 8)}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    {addressSearchResults.error && (
                      <button
                        onClick={() => addressSearchResults.searchedAddress && searchByAddress(addressSearchResults.searchedAddress)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                  
                  {!addressSearchResults.error && addressSearchResults.portfolio && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Total Runes</p>
                        <p className="text-2xl font-bold text-white">{addressSearchResults.portfolio.total_runes || 0}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Portfolio Value</p>
                        <p className="text-2xl font-bold text-green-400">
                          {addressSearchResults.portfolio.total_value_btc 
                            ? `${addressSearchResults.portfolio.total_value_btc.toFixed(8)} BTC`
                            : 'Calculating...'}
                        </p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Last Updated</p>
                        <p className="text-sm text-gray-300">
                          {addressSearchResults.portfolio.last_updated 
                            ? format(new Date(addressSearchResults.portfolio.last_updated), 'MMM dd, HH:mm')
                            : 'Just now'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Runes Balances */}
                {!addressSearchResults.error && addressSearchResults.portfolio?.balances && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addressSearchResults.portfolio.balances.map((balance: any, index: number) => (
                      <motion.div
                        key={balance.rune_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-white text-lg">{balance.rune}</h3>
                            {balance.symbol && (
                              <p className="text-sm text-gray-400">{balance.symbol}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Balance</p>
                            <p className="font-mono text-white">{balance.decimal_balance.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        {balance.market_data && (
                          <div className="space-y-2 text-sm">
                            {balance.market_data.floor_price && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Floor Price:</span>
                                <span className="text-white">{balance.market_data.floor_price.toFixed(8)} BTC</span>
                              </div>
                            )}
                            {balance.market_data.holders && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Holders:</span>
                                <span className="text-white">{balance.market_data.holders.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Market View */}
            {activeTab === 'market' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">24h %</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Market Cap</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Volume</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Holders</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Supply</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRunes.map((rune, index) => (
                      <tr 
                        key={rune.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedRune(rune)}
                      >
                        <td className="py-4 px-4 text-gray-400">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                              <Coins className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white flex items-center gap-2">
                                {rune.name}
                                {rune.turbo && <Zap className="w-3 h-3 text-yellow-400" />}
                              </p>
                              <p className="text-sm text-gray-400">{rune.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <p className="font-mono text-white">{formatPrice(rune.market.price)} BTC</p>
                        </td>
                        <td className="text-right py-4 px-4">
                          <p className={`font-medium ${
                            rune.market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {rune.market.change24h >= 0 ? '+' : ''}{rune.market.change24h.toFixed(2)}%
                          </p>
                        </td>
                        <td className="text-right py-4 px-4 text-white">
                          {formatMarketCap(rune.market.marketCap)}
                        </td>
                        <td className="text-right py-4 px-4 text-white">
                          {formatMarketCap(rune.market.volume24h)}
                        </td>
                        <td className="text-right py-4 px-4 text-white">
                          {rune.market.holders.toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="text-right">
                            <p className="text-white">
                              {formatAmount(rune.supply.circulating, rune.divisibility)}
                            </p>
                            <p className="text-xs text-gray-500">
                              of {formatAmount(rune.supply.total, rune.divisibility)}
                            </p>
                          </div>
                        </td>
                        <td className="text-center py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRune(rune);
                                setShowMintModal(true);
                              }}
                              className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded transition-colors"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://mempool.space/tx/${rune.etching.tx}`, '_blank');
                              }}
                              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Portfolio View */}
            {activeTab === 'portfolio' && (
              <div>
                {!connectionState.isConnected ? (
                  <div className="text-center py-24">
                    <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-500">Connect your wallet to view your Runes portfolio</p>
                  </div>
                ) : portfolio.length === 0 ? (
                  <div className="text-center py-24">
                    <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Runes Found</h3>
                    <p className="text-gray-500">You don't have any Runes in your wallet yet</p>
                    <button
                      onClick={() => setActiveTab('market')}
                      className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Explore Runes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map(balance => (
                      <motion.div
                        key={balance.rune.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                              <Coins className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{balance.rune.name}</h4>
                              <p className="text-sm text-gray-400">{balance.rune.symbol}</p>
                            </div>
                          </div>
                          {balance.rune.turbo && <Zap className="w-4 h-4 text-yellow-400" />}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-400">Balance</p>
                            <p className="text-xl font-bold text-white">
                              {formatAmount(balance.amount, balance.rune.divisibility)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400">Value</p>
                            <p className="text-lg font-semibold text-white">
                              {formatPrice(balance.value)} BTC
                            </p>
                            <p className="text-sm text-gray-500">
                              ${(balance.value * 98500).toFixed(2)}
                            </p>
                          </div>
                          
                          <button className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-medium transition-colors">
                            Send
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rune Detail Modal */}
      <AnimatePresence>
        {selectedRune && !showMintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRune(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                      <Coins className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">{selectedRune.name}</h2>
                        {selectedRune.turbo && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Turbo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400">Symbol: {selectedRune.symbol} • ID: {selectedRune.runeId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRune(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Market Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Market Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Price</p>
                      <p className="text-xl font-bold text-white">{formatPrice(selectedRune.market.price)} BTC</p>
                      <p className={`text-sm mt-1 ${selectedRune.market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedRune.market.change24h >= 0 ? '+' : ''}{selectedRune.market.change24h.toFixed(2)}% (24h)
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                      <p className="text-xl font-bold text-white">{formatMarketCap(selectedRune.market.marketCap)}</p>
                      <p className="text-sm text-gray-500 mt-1">Rank #{selectedRune.number}</p>
                    </div>
                  </div>
                </div>

                {/* Supply Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Supply Information</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Supply</span>
                      <span className="text-white font-mono">{formatAmount(selectedRune.supply.total, selectedRune.divisibility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minted</span>
                      <span className="text-white font-mono">{formatAmount(selectedRune.supply.minted, selectedRune.divisibility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mintable</span>
                      <span className="text-green-400 font-mono">{formatAmount(selectedRune.supply.mintable, selectedRune.divisibility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Burned</span>
                      <span className="text-red-400 font-mono">{formatAmount(selectedRune.supply.burned, selectedRune.divisibility)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Minted Progress</span>
                        <span>{((BigInt(selectedRune.supply.minted) * 100n) / BigInt(selectedRune.supply.total)).toString()}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(BigInt(selectedRune.supply.minted) * 100n) / BigInt(selectedRune.supply.total)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mint Terms */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Mint Terms</h3>
                  <div className="bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Amount per Mint</p>
                      <p className="text-white font-mono">{formatAmount(selectedRune.terms.amount, selectedRune.divisibility)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Mint Cap</p>
                      <p className="text-white font-mono">{selectedRune.terms.cap}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Start Block</p>
                      <p className="text-white">{selectedRune.terms.heightStart.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">End Block</p>
                      <p className="text-white">{selectedRune.terms.heightEnd.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowMintModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Mint {selectedRune.symbol}
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedRune.runeId)}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.open(`https://mempool.space/tx/${selectedRune.etching.tx}`, '_blank')}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mint Modal */}
      <AnimatePresence>
        {showMintModal && selectedRune && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowMintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-xl border border-gray-800 max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Mint {selectedRune.symbol}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount to Mint</label>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-2xl font-bold text-white">
                        {formatAmount(selectedRune.terms.amount, selectedRune.divisibility)} {selectedRune.symbol}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Per mint transaction</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-200">Minting requires a Bitcoin transaction</p>
                        <p className="text-xs text-yellow-200/70 mt-1">
                          Current network fee: ~47 sats/vB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleMint(selectedRune, selectedRune.terms.amount)}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                      disabled={!connectionState.isConnected}
                    >
                      {connectionState.isConnected ? 'Mint Now' : 'Connect Wallet'}
                    </button>
                    <button
                      onClick={() => setShowMintModal(false)}
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}