import { useState, useEffect, useCallback } from 'react';
import { HiroRunesAPI } from '@/lib/api/hiro/runes';
import { RuneEtching } from '@/lib/api/hiro/types';
import { runesDexService, RunesToken } from '@/services/RunesDexService';
import { logger } from '@/lib/logger';

interface RuneToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  volumeChange24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  maxSupply?: number;
  holders: number;
  mintProgress: number;
  mintingActive: boolean;
  etching: {
    block: number;
    transaction: string;
    timestamp: number;
    etcher: string;
  };
  divisibility: number;
  spacers: number;
  premine: number;
  cap: number;
  heightStart?: number;
  heightEnd?: number;
  offsetStart?: number;
  offsetEnd?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: string;
}

interface RunesMetrics {
  totalTokens: number;
  totalMarketCap: number;
  totalVolume24h: number;
  totalHolders: number;
  activeMints: number;
  completedMints: number;
  averagePrice: number;
  topGainer: RuneToken;
  topLoser: RuneToken;
  mostVolume: RuneToken;
  marketCapGrowth24h: number;
  holderGrowth24h: number;
}

interface RunesActivity {
  timestamp: number;
  totalVolume: number;
  transactionCount: number;
  uniqueTraders: number;
  averageTransactionSize: number;
  mintingVolume: number;
  tradingVolume: number;
  fees: number;
}

interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface RunesTokenPricesData {
  tokens: RuneToken[];
  metrics: RunesMetrics | null;
  priceHistory: PriceHistoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRunesTokenPrices(
  selectedToken: string = 'all',
  timeframe: '1d' | '7d' | '30d' | '90d' | '1y' | 'all' = '7d'
): RunesTokenPricesData {
  const [data, setData] = useState<RunesTokenPricesData>({
    tokens: [],
    metrics: null,
    priceHistory: [],
    loading: true,
    error: null,
    refetch: () => {}
  });

  const hiroAPI = new HiroRunesAPI();

  const fetchRunesData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch from Hiro API first
      const etchingsResponse = await hiroAPI.getEtchings({ limit: 100, sort_by: 'minted', order: 'desc' });
      const runesStats = await hiroAPI.getStats();

      // Convert Hiro data to our format and enhance with market data
      const tokens: RuneToken[] = [];
      
      for (const etching of etchingsResponse.results) {
        try {
          // Calculate basic metrics
          const totalSupply = parseFloat(etching.total_supply) || 0;
          const minted = parseFloat(etching.minted) || 0;
          const mintProgress = totalSupply > 0 ? (minted / totalSupply) * 100 : 0;
          const mintingActive = mintProgress < 100 && (etching.terms?.cap ? parseFloat(etching.terms.cap) > minted : false);
          
          // Generate mock price data (in real implementation, this would come from DEX APIs)
          const basePrice = Math.random() * 0.01 + 0.0001; // Base price in BTC
          const priceChange = (Math.random() - 0.5) * 0.4; // -20% to +20%
          const volumeMultiplier = Math.random() * 10 + 1;
          
          const token: RuneToken = {
            id: etching.rune_id,
            name: etching.name,
            symbol: etching.symbol || etching.name.substring(0, 6).toUpperCase(),
            price: basePrice,
            priceChange24h: basePrice * priceChange,
            priceChangePercent24h: priceChange * 100,
            volume24h: basePrice * totalSupply * volumeMultiplier * 0.01,
            volumeChange24h: (Math.random() - 0.5) * 0.6,
            marketCap: basePrice * minted,
            totalSupply,
            circulatingSupply: minted,
            maxSupply: totalSupply,
            holders: Math.floor(Math.random() * 10000) + 100,
            mintProgress,
            mintingActive,
            etching: {
              block: etching.genesis_height,
              transaction: etching.genesis_tx_hash,
              timestamp: etching.timestamp,
              etcher: 'Unknown'
            },
            divisibility: etching.divisibility,
            spacers: 0,
            premine: parseFloat(etching.premine) || 0,
            cap: parseFloat(etching.terms?.cap || '0'),
            heightStart: etching.terms?.height_start,
            heightEnd: etching.terms?.height_end,
            offsetStart: etching.terms?.offset_start,
            offsetEnd: etching.terms?.offset_end,
            rarity: mintProgress > 99 ? 'rare' : mintProgress > 90 ? 'uncommon' : 'common',
            category: etching.name.includes('DOG') || etching.name.includes('MEME') ? 'meme' : 
                     etching.name.includes('WIZARD') || etching.name.includes('ART') ? 'art' : 'utility'
          };
          
          tokens.push(token);
        } catch (error) {
          logger.error(`Error processing rune ${etching.name}:`, error);
        }
      }

      // Calculate metrics
      const metrics: RunesMetrics = {
        totalTokens: tokens.length,
        totalMarketCap: tokens.reduce((sum, token) => sum + token.marketCap, 0),
        totalVolume24h: tokens.reduce((sum, token) => sum + token.volume24h, 0),
        totalHolders: tokens.reduce((sum, token) => sum + token.holders, 0),
        activeMints: tokens.filter(token => token.mintingActive).length,
        completedMints: tokens.filter(token => !token.mintingActive).length,
        averagePrice: tokens.reduce((sum, token) => sum + token.price, 0) / tokens.length,
        topGainer: tokens.sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h)[0],
        topLoser: tokens.sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h)[0],
        mostVolume: tokens.sort((a, b) => b.volume24h - a.volume24h)[0],
        marketCapGrowth24h: Math.random() * 20 - 10, // Mock data
        holderGrowth24h: Math.random() * 10
      };

      // Generate price history for selected token or aggregate
      const priceHistory: PriceHistoryPoint[] = [];
      const periods = timeframe === '1d' ? 24 : timeframe === '7d' ? 7 * 24 : timeframe === '30d' ? 30 : 90;
      const interval = timeframe === '1d' ? 3600000 : timeframe === '7d' ? 3600000 : 86400000; // hourly or daily
      
      for (let i = periods; i >= 0; i--) {
        const timestamp = Date.now() - (i * interval);
        const basePrice = selectedToken === 'all' ? metrics.averagePrice : 
          tokens.find(t => t.id === selectedToken)?.price || metrics.averagePrice;
        
        const volatility = 0.1;
        const trend = (Math.random() - 0.5) * volatility;
        const price = basePrice * (1 + trend);
        
        priceHistory.push({
          timestamp,
          price,
          volume: Math.random() * 1000,
          high: price * (1 + Math.random() * 0.05),
          low: price * (1 - Math.random() * 0.05),
          open: price * (1 + (Math.random() - 0.5) * 0.02),
          close: price
        });
      }

      setData({
        tokens,
        metrics,
        priceHistory,
        loading: false,
        error: null,
        refetch: fetchRunesData
      });

    } catch (error) {
      logger.error('Error fetching runes data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch runes data'
      }));
    }
  }, [selectedToken, timeframe]);

  useEffect(() => {
    fetchRunesData();
    
    // Set up real-time updates
    const interval = setInterval(fetchRunesData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchRunesData]);

  return {
    ...data,
    refetch: fetchRunesData
  };
}