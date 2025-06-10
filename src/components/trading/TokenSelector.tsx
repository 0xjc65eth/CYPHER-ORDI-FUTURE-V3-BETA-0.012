'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  TrendingUp, 
  Coins, 
  Filter,
  Clock,
  Zap,
  Shield,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Interfaces
interface Token {
  symbol: string;
  name: string;
  address: string;
  price: number;
  decimals: number;
  logoUrl?: string;
  network: string;
  balance?: string;
  volume24h?: number;
  priceChange24h?: number;
  marketCap?: number;
  isVerified?: boolean;
  tags?: string[];
}

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedNetwork: string;
  excludeToken?: Token | null;
}

// Mock token data por rede
const NETWORK_TOKENS: Record<string, Token[]> = {
  ethereum: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: 'native',
      price: 2850,
      decimals: 18,
      network: 'ethereum',
      balance: '2.5481',
      volume24h: 15200000000,
      priceChange24h: 2.4,
      marketCap: 342000000000,
      isVerified: true,
      tags: ['native', 'defi']
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      price: 1,
      decimals: 6,
      network: 'ethereum',
      balance: '18772.9759',
      volume24h: 8500000000,
      priceChange24h: 0.1,
      marketCap: 32000000000,
      isVerified: true,
      tags: ['stablecoin', 'defi']
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      price: 1,
      decimals: 6,
      network: 'ethereum',
      balance: '5000.00',
      volume24h: 25000000000,
      priceChange24h: -0.05,
      marketCap: 78000000000,
      isVerified: true,
      tags: ['stablecoin']
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a760698606B8eE2121c351',
      price: 110000,
      decimals: 8,
      network: 'ethereum',
      balance: '0.15',
      volume24h: 1200000000,
      priceChange24h: 1.8,
      marketCap: 18000000000,
      isVerified: true,
      tags: ['btc', 'wrapped']
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      price: 7.5,
      decimals: 18,
      network: 'ethereum',
      balance: '150.00',
      volume24h: 180000000,
      priceChange24h: 3.2,
      marketCap: 5600000000,
      isVerified: true,
      tags: ['defi', 'governance']
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      price: 15,
      decimals: 18,
      network: 'ethereum',
      balance: '85.00',
      volume24h: 450000000,
      priceChange24h: -1.2,
      marketCap: 8800000000,
      isVerified: true,
      tags: ['oracle', 'defi']
    }
  ],
  arbitrum: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: 'native',
      price: 2850,
      decimals: 18,
      network: 'arbitrum',
      balance: '1.8234',
      volume24h: 2400000000,
      priceChange24h: 2.4,
      isVerified: true,
      tags: ['native']
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912CE59144191C1e0d023ec7E279e0F5E57e8E79',
      price: 1.2,
      decimals: 18,
      network: 'arbitrum',
      balance: '1500.00',
      volume24h: 120000000,
      priceChange24h: 5.8,
      isVerified: true,
      tags: ['governance', 'l2']
    },
    {
      symbol: 'GMX',
      name: 'GMX',
      address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
      price: 45,
      decimals: 18,
      network: 'arbitrum',
      balance: '12.50',
      volume24h: 85000000,
      priceChange24h: -2.1,
      isVerified: true,
      tags: ['perps', 'defi']
    }
  ],
  solana: [
    {
      symbol: 'SOL',
      name: 'Solana',
      address: 'native',
      price: 95,
      decimals: 9,
      network: 'solana',
      balance: '45.2143',
      volume24h: 3200000000,
      priceChange24h: 4.2,
      isVerified: true,
      tags: ['native']
    },
    {
      symbol: 'RAY',
      name: 'Raydium',
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      price: 2.1,
      decimals: 6,
      network: 'solana',
      balance: '850.00',
      volume24h: 45000000,
      priceChange24h: 8.5,
      isVerified: true,
      tags: ['defi', 'amm']
    }
  ]
};

// Tokens populares/favoritos
const POPULAR_TOKENS = ['ETH', 'BTC', 'USDC', 'USDT', 'SOL', 'UNI', 'LINK'];

export function TokenSelector({ isOpen, onClose, onSelect, selectedNetwork, excludeToken }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'balance' | 'price' | 'volume'>('balance');
  const [favoriteTokens, setFavoriteTokens] = useState<string[]>(['ETH', 'USDC', 'WBTC']);

  // Obter tokens da rede selecionada
  const networkTokens = NETWORK_TOKENS[selectedNetwork] || [];

  // Filtrar e ordenar tokens
  const filteredAndSortedTokens = useMemo(() => {
    let tokens = networkTokens.filter(token => {
      // Excluir token já selecionado
      if (excludeToken && token.address === excludeToken.address) {
        return false;
      }

      // Filtrar por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Filtrar por aba
    if (selectedTab === 'favorites') {
      tokens = tokens.filter(token => favoriteTokens.includes(token.symbol));
    } else if (selectedTab === 'popular') {
      tokens = tokens.filter(token => POPULAR_TOKENS.includes(token.symbol));
    } else if (selectedTab === 'stablecoins') {
      tokens = tokens.filter(token => token.tags?.includes('stablecoin'));
    }

    // Ordenar
    tokens.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.symbol.localeCompare(b.symbol);
        case 'balance':
          const balanceA = parseFloat(a.balance || '0');
          const balanceB = parseFloat(b.balance || '0');
          return balanceB - balanceA;
        case 'price':
          return b.price - a.price;
        case 'volume':
          return (b.volume24h || 0) - (a.volume24h || 0);
        default:
          return 0;
      }
    });

    return tokens;
  }, [networkTokens, searchQuery, selectedTab, sortBy, favoriteTokens, excludeToken]);

  // Limpar busca ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Toggle favorito
  const toggleFavorite = (tokenSymbol: string) => {
    setFavoriteTokens(prev => 
      prev.includes(tokenSymbol)
        ? prev.filter(s => s !== tokenSymbol)
        : [...prev, tokenSymbol]
    );
  };

  // Formatar número
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-400" />
            Selecionar Token
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, símbolo ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">Favoritos</TabsTrigger>
            <TabsTrigger value="popular" className="text-xs">Populares</TabsTrigger>
            <TabsTrigger value="stablecoins" className="text-xs">Stable</TabsTrigger>
          </TabsList>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 rounded text-sm px-2 py-1"
              >
                <option value="balance">Saldo</option>
                <option value="alphabetical">A-Z</option>
                <option value="price">Preço</option>
                <option value="volume">Volume</option>
              </select>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredAndSortedTokens.length} tokens
            </Badge>
          </div>

          <TabsContent value={selectedTab} className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAndSortedTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum token encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              filteredAndSortedTokens.map((token) => (
                <div
                  key={token.address}
                  onClick={() => onSelect(token)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  {/* Token Icon */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="font-bold text-white">{token.symbol[0]}</span>
                    </div>
                    {token.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{token.symbol}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(token.symbol);
                        }}
                        className="p-1 h-auto hover:bg-transparent"
                      >
                        <Star 
                          className={`w-3 h-3 ${
                            favoriteTokens.includes(token.symbol) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-400 truncate">{token.name}</div>
                    
                    {/* Tags */}
                    {token.tags && token.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {token.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Balance */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium">
                        ${token.price >= 1 ? token.price.toLocaleString() : token.price.toFixed(4)}
                      </span>
                      {token.priceChange24h !== undefined && (
                        <div className={`flex items-center text-xs ${
                          token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.priceChange24h >= 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {Math.abs(token.priceChange24h).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    
                    {token.balance && (
                      <div className="text-sm text-gray-400">
                        {parseFloat(token.balance).toFixed(4)} {token.symbol}
                      </div>
                    )}
                    
                    {token.volume24h && (
                      <div className="text-xs text-gray-500">
                        Vol: ${formatNumber(token.volume24h)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Abrir em nova aba para adicionar token customizado
              window.open('https://tokenlists.org/', '_blank');
            }}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Adicionar Token
          </Button>
        </div>

        {/* Network Info */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Rede ativa:</span>
            <span className="text-blue-400 font-medium capitalize">{selectedNetwork}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}