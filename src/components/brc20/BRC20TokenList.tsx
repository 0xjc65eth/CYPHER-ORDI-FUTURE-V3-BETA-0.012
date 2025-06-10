/**
 * 🟡 BRC-20 TOKEN LIST COMPONENT
 * Professional token listing with real-time data and trading integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { brc20Service, type BRC20Token } from '@/services/BRC20Service';
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Eye, 
  Star,
  Search,
  Filter,
  BarChart3,
  Users,
  Activity,
  CheckCircle
} from 'lucide-react';

interface BRC20TokenListProps {
  onTokenSelect?: (token: BRC20Token) => void;
  showPortfolioOnly?: boolean;
  userAddress?: string;
}

export function BRC20TokenList({ onTokenSelect, showPortfolioOnly = false, userAddress }: BRC20TokenListProps) {
  const [tokens, setTokens] = useState<BRC20Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume24h' | 'price' | 'holders' | 'priceChange24h'>('marketCap');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterMintable, setFilterMintable] = useState(false);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const tokenData = await brc20Service.getBRC20Tokens(200);
      setTokens(tokenData);
    } catch (error) {
      console.error('Failed to load BRC-20 tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTokens = tokens
    .filter(token => {
      const matchesSearch = token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           token.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVerified = !filterVerified || token.verified;
      const matchesMintable = !filterMintable || token.mintable;
      
      return matchesSearch && matchesVerified && matchesMintable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'volume24h':
          return b.volume24h - a.volume24h;
        case 'price':
          return b.price - a.price;
        case 'holders':
          return b.holders - a.holders;
        case 'priceChange24h':
          return b.priceChange24h - a.priceChange24h;
        default:
          return 0;
      }
    });

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`;
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatNumber = (num: number, compact = false) => {
    if (compact && num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (compact && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const handleTrade = (token: BRC20Token) => {
    const platforms = brc20Service.getBRC20TradingPlatforms(token.ticker);
    window.open(platforms[0].url, '_blank');
  };

  const handleViewDetails = (token: BRC20Token) => {
    window.open(`https://ordiscan.com/brc20/${token.ticker}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            BRC-20 Tokens ({filteredAndSortedTokens.length})
          </h3>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-800 border-gray-600"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterVerified ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterVerified(!filterVerified)}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Button>
              <Button
                variant={filterMintable ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMintable(!filterMintable)}
                className="text-xs"
              >
                <Activity className="h-3 w-3 mr-1" />
                Mintable
              </Button>
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 text-white text-sm rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="marketCap">Market Cap</option>
              <option value="volume24h">Volume 24h</option>
              <option value="price">Price</option>
              <option value="holders">Holders</option>
              <option value="priceChange24h">24h Change</option>
            </select>
          </div>
        </div>

        {/* Token Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Token</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">24h Change</th>
                <th className="pb-3 font-medium text-right">Market Cap</th>
                <th className="pb-3 font-medium text-right">Volume (24h)</th>
                <th className="pb-3 font-medium text-right">Holders</th>
                <th className="pb-3 font-medium text-right">Progress</th>
                <th className="pb-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTokens.map((token, index) => (
                <TokenRow 
                  key={token.ticker} 
                  token={token} 
                  rank={index + 1}
                  onTrade={() => handleTrade(token)}
                  onViewDetails={() => handleViewDetails(token)}
                  onSelect={() => onTokenSelect?.(token)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedTokens.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tokens found matching your criteria</p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface TokenRowProps {
  token: BRC20Token;
  rank: number;
  onTrade: () => void;
  onViewDetails: () => void;
  onSelect?: () => void;
}

function TokenRow({ token, rank, onTrade, onViewDetails, onSelect }: TokenRowProps) {
  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`;
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatNumber = (num: number, compact = false) => {
    if (compact && num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (compact && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <tr 
      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <td className="py-4 text-gray-400 font-mono">{rank}</td>
      
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs uppercase">
              {token.ticker.slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white uppercase font-mono">{token.ticker}</span>
              {token.verified && (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
              {token.mintable && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                  Mintable
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-400">{token.name}</div>
          </div>
        </div>
      </td>
      
      <td className="py-4 text-right">
        <div className="font-mono text-white">{formatPrice(token.price)}</div>
      </td>
      
      <td className="py-4 text-right">
        <div className={`flex items-center justify-end gap-1 ${
          token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {token.priceChange24h >= 0 ? 
            <TrendingUp className="w-4 h-4" /> : 
            <TrendingDown className="w-4 h-4" />
          }
          <span className="font-medium">
            {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
          </span>
        </div>
      </td>
      
      <td className="py-4 text-right">
        <div className="font-mono text-white">
          ${formatNumber(token.marketCap, true)}
        </div>
      </td>
      
      <td className="py-4 text-right">
        <div className="font-mono text-white">
          ${formatNumber(token.volume24h, true)}
        </div>
      </td>
      
      <td className="py-4 text-right">
        <div className="text-white">{formatNumber(token.holders, true)}</div>
      </td>
      
      <td className="py-4 text-right">
        <div className="space-y-1">
          <div className="text-white text-sm">
            {token.progress.toFixed(1)}%
          </div>
          <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden ml-auto">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${Math.min(token.progress, 100)}%` }}
            />
          </div>
        </div>
      </td>
      
      <td className="py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="border-gray-600 hover:border-gray-500"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTrade();
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}