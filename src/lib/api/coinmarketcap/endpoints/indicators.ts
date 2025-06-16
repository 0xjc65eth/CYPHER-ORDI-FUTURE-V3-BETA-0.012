// CoinMarketCap Market Indicators (Fear & Greed, Altcoin Season)
import { getCMCClient } from '../client';
import { getGlobalMetrics } from './global-metrics';
import { getCryptocurrencyListings } from './cryptocurrency';
import { FearGreedIndex, AltcoinSeasonIndex } from '../types';
import { withCache } from '../cache';
import { CMC_CONFIG } from '../config';

// Calculate Fear & Greed Index based on various metrics
export async function getFearGreedIndex(): Promise<FearGreedIndex> {
  return withCache(
    '/fear-greed-index',
    {},
    async () => {
      // Get market data
      const [globalMetrics, topCryptos] = await Promise.all([
        getGlobalMetrics(),
        getCryptocurrencyListings({ limit: 100 }),
      ]);

      const quote = globalMetrics.quote[CMC_CONFIG.DEFAULT_CURRENCY];
      
      // Calculate various factors
      const factors = {
        // 1. Volatility (25%)
        volatility: calculateVolatilityScore(topCryptos),
        
        // 2. Market Momentum/Volume (25%)
        momentum: calculateMomentumScore(quote.total_volume_24h_yesterday_percentage_change),
        
        // 3. Bitcoin Dominance (15%)
        dominance: calculateDominanceScore(globalMetrics.btc_dominance),
        
        // 4. Market Cap Trend (20%)
        marketCapTrend: calculateMarketCapScore(quote.total_market_cap_yesterday_percentage_change),
        
        // 5. Top 10 Performance (15%)
        topPerformance: calculateTopPerformanceScore(topCryptos.slice(0, 10)),
      };

      // Calculate weighted score
      const score = Math.round(
        factors.volatility * 0.25 +
        factors.momentum * 0.25 +
        factors.dominance * 0.15 +
        factors.marketCapTrend * 0.20 +
        factors.topPerformance * 0.15
      );

      // Determine classification
      let classification: FearGreedIndex['value_classification'];
      if (score <= 20) classification = 'Extreme Fear';
      else if (score <= 40) classification = 'Fear';
      else if (score <= 60) classification = 'Neutral';
      else if (score <= 80) classification = 'Greed';
      else classification = 'Extreme Greed';

      return {
        value: score,
        value_classification: classification,
        timestamp: new Date().toISOString(),
        time_until_update: '1 hour',
      };
    },
    CMC_CONFIG.CACHE_TTL.FEAR_GREED
  );
}

// Calculate Altcoin Season Index
export async function getAltcoinSeasonIndex(): Promise<AltcoinSeasonIndex> {
  return withCache(
    '/altcoin-season-index',
    {},
    async () => {
      // Get top 50 cryptocurrencies
      const topCryptos = await getCryptocurrencyListings({ limit: 50 });
      
      // Calculate how many altcoins outperformed Bitcoin in the last 90 days
      const bitcoin = topCryptos.find(c => c.symbol === 'BTC');
      if (!bitcoin) {
        throw new Error('Bitcoin data not found');
      }

      const btcPerformance90d = bitcoin.quote[CMC_CONFIG.DEFAULT_CURRENCY].percent_change_90d;
      
      // Count altcoins (excluding BTC) that outperformed Bitcoin
      const outperformingAltcoins = topCryptos
        .filter(c => c.symbol !== 'BTC')
        .filter(c => c.quote[CMC_CONFIG.DEFAULT_CURRENCY].percent_change_90d > btcPerformance90d)
        .length;

      // Calculate percentage (out of 49 altcoins in top 50)
      const percentage = Math.round((outperformingAltcoins / 49) * 100);

      // Determine status
      let status: AltcoinSeasonIndex['status'];
      let description: string;

      if (percentage >= 75) {
        status = 'Alt Season';
        description = `${percentage}% of the top 50 altcoins outperformed Bitcoin over the last 90 days`;
      } else if (percentage <= 25) {
        status = 'Bitcoin Season';
        description = `Only ${percentage}% of the top 50 altcoins outperformed Bitcoin over the last 90 days`;
      } else {
        status = 'Neutral';
        description = `${percentage}% of the top 50 altcoins outperformed Bitcoin over the last 90 days`;
      }

      return {
        value: percentage,
        status,
        description,
        timestamp: new Date().toISOString(),
      };
    },
    CMC_CONFIG.CACHE_TTL.ALTCOIN_SEASON
  );
}

// Helper functions for Fear & Greed calculation
function calculateVolatilityScore(cryptos: any[]): number {
  // Calculate average absolute price change
  const avgChange = cryptos.reduce((sum, crypto) => {
    return sum + Math.abs(crypto.quote[CMC_CONFIG.DEFAULT_CURRENCY].percent_change_24h);
  }, 0) / cryptos.length;

  // Convert to score (higher volatility = more fear)
  if (avgChange >= 10) return 10; // Extreme fear
  if (avgChange >= 7) return 25;
  if (avgChange >= 5) return 40;
  if (avgChange >= 3) return 60;
  if (avgChange >= 1) return 75;
  return 90; // Low volatility = greed
}

function calculateMomentumScore(volumeChange: number): number {
  // Higher volume = more greed
  if (volumeChange >= 50) return 90;
  if (volumeChange >= 25) return 75;
  if (volumeChange >= 0) return 60;
  if (volumeChange >= -25) return 40;
  if (volumeChange >= -50) return 25;
  return 10; // Large volume decrease = fear
}

function calculateDominanceScore(btcDominance: number): number {
  // Higher BTC dominance = more fear (flight to safety)
  if (btcDominance >= 70) return 20;
  if (btcDominance >= 60) return 35;
  if (btcDominance >= 50) return 50;
  if (btcDominance >= 40) return 65;
  if (btcDominance >= 30) return 80;
  return 90; // Low BTC dominance = altcoin greed
}

function calculateMarketCapScore(marketCapChange: number): number {
  // Positive market cap change = greed
  if (marketCapChange >= 10) return 90;
  if (marketCapChange >= 5) return 75;
  if (marketCapChange >= 0) return 60;
  if (marketCapChange >= -5) return 40;
  if (marketCapChange >= -10) return 25;
  return 10; // Large market cap decrease = fear
}

function calculateTopPerformanceScore(topCryptos: any[]): number {
  // Calculate average performance of top 10
  const avgPerformance = topCryptos.reduce((sum, crypto) => {
    return sum + crypto.quote[CMC_CONFIG.DEFAULT_CURRENCY].percent_change_24h;
  }, 0) / topCryptos.length;

  // Convert to score
  if (avgPerformance >= 5) return 85;
  if (avgPerformance >= 2) return 70;
  if (avgPerformance >= 0) return 55;
  if (avgPerformance >= -2) return 40;
  if (avgPerformance >= -5) return 25;
  return 10;
}

// Get market sentiment summary
export async function getMarketSentiment(): Promise<{
  fearGreedIndex: FearGreedIndex;
  altcoinSeasonIndex: AltcoinSeasonIndex;
  summary: string;
  recommendations: string[];
}> {
  const [fearGreed, altcoinSeason] = await Promise.all([
    getFearGreedIndex(),
    getAltcoinSeasonIndex(),
  ]);

  // Generate summary
  let summary = `Market is showing ${fearGreed.value_classification.toLowerCase()}`;
  if (altcoinSeason.status !== 'Neutral') {
    summary += ` during ${altcoinSeason.status.toLowerCase()}`;
  }

  // Generate recommendations based on indicators
  const recommendations: string[] = [];

  if (fearGreed.value <= 20) {
    recommendations.push('Extreme fear may present buying opportunities for long-term investors');
    recommendations.push('Consider dollar-cost averaging into quality projects');
  } else if (fearGreed.value >= 80) {
    recommendations.push('Extreme greed suggests caution - consider taking some profits');
    recommendations.push('Avoid FOMO and stick to your investment strategy');
  }

  if (altcoinSeason.status === 'Alt Season') {
    recommendations.push('Altcoins are outperforming - research quality alt projects');
    recommendations.push('Monitor for potential rotation back to Bitcoin');
  } else if (altcoinSeason.status === 'Bitcoin Season') {
    recommendations.push('Bitcoin is dominant - consider increasing BTC allocation');
    recommendations.push('Wait for better entry points in altcoins');
  }

  return {
    fearGreedIndex: fearGreed,
    altcoinSeasonIndex: altcoinSeason,
    summary,
    recommendations,
  };
}