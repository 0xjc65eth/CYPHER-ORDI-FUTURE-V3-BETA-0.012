import { useState, useEffect, useCallback } from 'react';

interface ArbitrageOpportunity {
  id: string;
  type: 'ordinals' | 'runes' | 'rare-sats';
  asset: string;
  collection?: string;
  buyMarketplace: string;
  sellMarketplace: string;
  buyPrice: number;
  sellPrice: number;
  fees: {
    buyFee: number;
    sellFee: number;
    networkFee: number;
  };
  profitAmount: number;
  profitPercent: number;
  volume24h: number;
  liquidity: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: Date;
  buyLink: string;
  sellLink: string;
}

const MARKETPLACE_FEES = {
  'Magic Eden': 0.025,
  'OrdSwap': 0.021,
  'Gamma': 0.015,
  'Unisat': 0.02,
  'OKX': 0.01,
  'Ordinals Wallet': 0.025
};

export function useArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const generateOpportunities = useCallback(() => {
    const marketplaces = Object.keys(MARKETPLACE_FEES);
    const opportunities: ArbitrageOpportunity[] = [];

    // Generate Ordinals opportunities
    const ordinalCollections = [
      { name: 'Bitcoin Punks', basePrice: 0.45, volume: 12.5 },
      { name: 'Ordinal Monkeys', basePrice: 0.38, volume: 8.7 },
      { name: 'Bitcoin Wizards', basePrice: 0.52, volume: 15.4 },
      { name: 'Pixel Pepes', basePrice: 0.29, volume: 6.2 },
      { name: 'Bitcoin Frogs', basePrice: 0.67, volume: 22.1 }
    ];

    ordinalCollections.forEach((collection) => {
      // Generate 2-3 opportunities per collection
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        const buyMarket = marketplaces[Math.floor(Math.random() * marketplaces.length)];
        let sellMarket = marketplaces[Math.floor(Math.random() * marketplaces.length)];
        while (sellMarket === buyMarket) {
          sellMarket = marketplaces[Math.floor(Math.random() * marketplaces.length)];
        }

        const priceVariation = 0.05 + Math.random() * 0.15; // 5-20% variation
        const buyPrice = collection.basePrice * (1 - priceVariation / 2);
        const sellPrice = collection.basePrice * (1 + priceVariation / 2);

        const buyFee = MARKETPLACE_FEES[buyMarket as keyof typeof MARKETPLACE_FEES];
        const sellFee = MARKETPLACE_FEES[sellMarket as keyof typeof MARKETPLACE_FEES];
        const networkFee = 0.00005 + Math.random() * 0.00005;

        const totalCost = buyPrice * (1 + buyFee) + networkFee;
        const totalRevenue = sellPrice * (1 - sellFee);
        const profitAmount = totalRevenue - totalCost;
        const profitPercent = (profitAmount / totalCost) * 100;

        if (profitPercent > 3) { // Only show profitable opportunities
          opportunities.push({
            id: `ord-${collection.name}-${i}`,
            type: 'ordinals',
            asset: `${collection.name} #${Math.floor(Math.random() * 1000)}`,
            collection: collection.name,
            buyMarketplace: buyMarket,
            sellMarketplace: sellMarket,
            buyPrice,
            sellPrice,
            fees: { buyFee, sellFee, networkFee },
            profitAmount,
            profitPercent,
            volume24h: collection.volume * (0.8 + Math.random() * 0.4),
            liquidity: profitPercent > 10 ? 'High' : profitPercent > 7 ? 'Medium' : 'Low',
            confidence: 0.7 + Math.random() * 0.3,
            riskLevel: profitPercent > 15 ? 'high' : profitPercent > 10 ? 'medium' : 'low',
            timestamp: new Date(),
            buyLink: '#',
            sellLink: '#'
          });
        }
      }
    });

    // Generate Runes opportunities
    const runesTokens = [
      { name: 'SATOSHI•NAKAMOTO', basePrice: 0.0089, volume: 0.234 },
      { name: 'BITCOIN•WIZARDS', basePrice: 0.0156, volume: 0.345 },
      { name: 'RARE•SATS', basePrice: 0.0678, volume: 0.567 },
      { name: 'DOG•GO•TO•THE•MOON', basePrice: 0.00045, volume: 0.456 }
    ];

    runesTokens.forEach((token) => {
      const buyMarket = 'Unisat';
      const sellMarket = Math.random() > 0.5 ? 'OKX' : 'Magic Eden';

      const priceVariation = 0.08 + Math.random() * 0.12;
      const buyPrice = token.basePrice * (1 - priceVariation / 2);
      const sellPrice = token.basePrice * (1 + priceVariation / 2);

      const buyFee = MARKETPLACE_FEES[buyMarket as keyof typeof MARKETPLACE_FEES];
      const sellFee = MARKETPLACE_FEES[sellMarket as keyof typeof MARKETPLACE_FEES];
      const networkFee = 0.00003;

      const totalCost = buyPrice * (1 + buyFee) + networkFee;
      const totalRevenue = sellPrice * (1 - sellFee);
      const profitAmount = totalRevenue - totalCost;
      const profitPercent = (profitAmount / totalCost) * 100;

      if (profitPercent > 5) {
        opportunities.push({
          id: `rune-${token.name}`,
          type: 'runes',
          asset: token.name,
          buyMarketplace: buyMarket,
          sellMarketplace: sellMarket,
          buyPrice,
          sellPrice,
          fees: { buyFee, sellFee, networkFee },
          profitAmount,
          profitPercent,
          volume24h: token.volume,
          liquidity: 'Medium',
          confidence: 0.6 + Math.random() * 0.3,
          riskLevel: profitPercent > 12 ? 'high' : 'medium',
          timestamp: new Date(),
          buyLink: '#',
          sellLink: '#'
        });
      }
    });

    // Generate Rare Sats opportunity
    if (Math.random() > 0.7) {
      opportunities.push({
        id: 'rare-sat-1',
        type: 'rare-sats',
        asset: 'Pizza Sat (Block 57043)',
        buyMarketplace: 'OrdSwap',
        sellMarketplace: 'Magic Eden',
        buyPrice: 2.5,
        sellPrice: 2.95,
        fees: {
          buyFee: MARKETPLACE_FEES['OrdSwap'],
          sellFee: MARKETPLACE_FEES['Magic Eden'],
          networkFee: 0.0001
        },
        profitAmount: 0.385,
        profitPercent: 15.4,
        volume24h: 5.2,
        liquidity: 'Low',
        confidence: 0.92,
        riskLevel: 'high',
        timestamp: new Date(),
        buyLink: '#',
        sellLink: '#'
      });
    }

    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setOpportunities(generateOpportunities());
      setLoading(false);
    }, 1500);
  }, [generateOpportunities]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    opportunities,
    loading,
    refresh
  };
}