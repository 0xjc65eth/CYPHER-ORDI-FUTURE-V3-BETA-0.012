'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Flame,
  Crown,
  Filter,
  SortAsc,
  SortDesc,
  Zap,
  Activity,
  Volume2,
  Users,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RuneToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  mintProgress: number;
  mintingActive: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: string;
  totalSupply: number;
  circulatingSupply: number;
}

interface RuneSelectorProps {
  tokens: RuneToken[];
  selectedToken: string;
  onTokenSelect: (tokenId: string) => void;
  favorites: string[];
  onToggleFavorite: (tokenId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAdvancedFilters?: boolean;
}

interface FilterState {
  category: string;
  mintingStatus: 'all' | 'active' | 'completed';
  rarity: string;
  priceRange: { min: number; max: number };
  marketCapRange: { min: number; max: number };
  volumeRange: { min: number; max: number };
  sortBy: 'name' | 'price' | 'volume' | 'marketCap' | 'holders' | 'change';
  sortOrder: 'asc' | 'desc';
}

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500', 
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const CATEGORY_ICONS = {
  meme: '🐕',
  utility: '⚡',
  gaming: '🎮',
  defi: '💰',
  art: '🎨',
  other: '📦'
};

export const RuneSelector: React.FC<RuneSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  favorites,
  onToggleFavorite,
  className = '',
  size = 'md',
  showAdvancedFilters = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    mintingStatus: 'all',
    rarity: 'all',
    priceRange: { min: 0, max: Infinity },
    marketCapRange: { min: 0, max: Infinity },
    volumeRange: { min: 0, max: Infinity },
    sortBy: 'marketCap',
    sortOrder: 'desc'
  });

  // Get categories from tokens
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    tokens.forEach(token => {
      if (token.category) cats.add(token.category);
    });
    return Array.from(cats);
  }, [tokens]);

  // Get rarities from tokens
  const rarities = useMemo(() => {
    const rars = new Set(['all']);
    tokens.forEach(token => {
      if (token.rarity) rars.add(token.rarity);
    });
    return Array.from(rars);
  }, [tokens]);

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let filtered = [...tokens];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
      );
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(token => favorites.includes(token.id));
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(token => token.category === filters.category);
    }

    // Minting status filter
    if (filters.mintingStatus !== 'all') {
      if (filters.mintingStatus === 'active') {
        filtered = filtered.filter(token => token.mintingActive);
      } else if (filters.mintingStatus === 'completed') {
        filtered = filtered.filter(token => !token.mintingActive);
      }
    }

    // Rarity filter
    if (filters.rarity !== 'all') {
      filtered = filtered.filter(token => token.rarity === filters.rarity);
    }

    // Price range filter
    filtered = filtered.filter(token => 
      token.price >= filters.priceRange.min && 
      token.price <= filters.priceRange.max
    );

    // Market cap range filter
    filtered = filtered.filter(token => 
      token.marketCap >= filters.marketCapRange.min && 
      token.marketCap <= filters.marketCapRange.max
    );

    // Volume range filter
    filtered = filtered.filter(token => 
      token.volume24h >= filters.volumeRange.min && 
      token.volume24h <= filters.volumeRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (filters.sortBy) {
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        case 'holders':
          aValue = a.holders;
          bValue = b.holders;
          break;
        case 'change':
          aValue = a.priceChangePercent24h;
          bValue = b.priceChangePercent24h;
          break;
        default:
          aValue = a.marketCap;
          bValue = b.marketCap;
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [tokens, searchQuery, showFavoritesOnly, filters, favorites]);

  // Get selected token info
  const selectedTokenInfo = useMemo(() => {
    if (selectedToken === 'all') return null;
    return tokens.find(token => token.id === selectedToken);
  }, [selectedToken, tokens]);

  const handleTokenSelect = (tokenId: string) => {
    onTokenSelect(tokenId);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      mintingStatus: 'all',
      rarity: 'all',
      priceRange: { min: 0, max: Infinity },
      marketCapRange: { min: 0, max: Infinity },
      volumeRange: { min: 0, max: Infinity },
      sortBy: 'marketCap',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setShowFavoritesOnly(false);
  };

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`${sizeClasses[size]} ${className}`}>
          <Search className="w-4 h-4 mr-2" />
          {selectedTokenInfo ? (
            <div className="flex items-center gap-2">
              <span>{selectedTokenInfo.symbol}</span>
              {selectedTokenInfo.rarity && (
                <div className={`w-2 h-2 rounded-full ${RARITY_COLORS[selectedTokenInfo.rarity]}`} />
              )}
            </div>
          ) : (
            'All Runes'
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Select Rune Token
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Basic Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </Button>

            {showAdvancedFilters && (
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium block mb-1">Category</label>
                    <Select 
                      value={filters.category} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              {cat !== 'all' && CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minting Status Filter */}
                  <div>
                    <label className="text-sm font-medium block mb-1">Minting</label>
                    <Select 
                      value={filters.mintingStatus} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, mintingStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Flame className="w-3 h-3 text-orange-500" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rarity Filter */}
                  <div>
                    <label className="text-sm font-medium block mb-1">Rarity</label>
                    <Select 
                      value={filters.rarity} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, rarity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rarities.map(rarity => (
                          <SelectItem key={rarity} value={rarity}>
                            <div className="flex items-center gap-2">
                              {rarity !== 'all' && (
                                <div className={`w-3 h-3 rounded-full ${RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]}`} />
                              )}
                              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium block mb-1">Sort By</label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketCap">Market Cap</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="holders">Holders</SelectItem>
                        <SelectItem value="change">24h Change</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="text-sm font-medium block mb-1">Order</label>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">
                          <div className="flex items-center gap-2">
                            <SortDesc className="w-3 h-3" />
                            Descending
                          </div>
                        </SelectItem>
                        <SelectItem value="asc">
                          <div className="flex items-center gap-2">
                            <SortAsc className="w-3 h-3" />
                            Ascending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {filteredTokens.length} of {tokens.length} tokens
                  </div>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Token List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {/* All Tokens Option */}
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedToken === 'all' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTokenSelect('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    All Runes
                  </div>
                  <div className="text-sm text-gray-500">Aggregate view of all tokens</div>
                </div>
                <Badge variant="outline">{tokens.length} tokens</Badge>
              </div>
            </div>

            {/* Individual Tokens */}
            {filteredTokens.map((token) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedToken === token.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTokenSelect(token.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{token.symbol}</div>
                      
                      {/* Category Icon */}
                      {token.category && CATEGORY_ICONS[token.category as keyof typeof CATEGORY_ICONS] && (
                        <span className="text-sm">
                          {CATEGORY_ICONS[token.category as keyof typeof CATEGORY_ICONS]}
                        </span>
                      )}
                      
                      {/* Rarity Indicator */}
                      {token.rarity && (
                        <div className={`w-2 h-2 rounded-full ${RARITY_COLORS[token.rarity]}`} />
                      )}
                      
                      {/* Status Badges */}
                      {token.mintingActive && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          <Flame className="w-3 h-3 mr-1" />
                          Minting
                        </Badge>
                      )}
                      
                      {token.rarity === 'legendary' && (
                        <Badge variant="default" className="text-xs bg-yellow-500">
                          <Crown className="w-3 h-3 mr-1" />
                          Legendary
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500 truncate">{token.name}</div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>{token.price.toFixed(8)} BTC</span>
                      <span className={`${token.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {token.priceChangePercent24h >= 0 ? '+' : ''}{token.priceChangePercent24h.toFixed(2)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {token.volume24h.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {token.holders.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(token.id);
                      }}
                      className="p-1"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          favorites.includes(token.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                    
                    <div className="text-right text-xs min-w-20">
                      <div className="font-medium">{token.marketCap.toFixed(2)} BTC</div>
                      <div className="text-gray-500">Market Cap</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>No tokens found</div>
                <div className="text-sm">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuneSelector;