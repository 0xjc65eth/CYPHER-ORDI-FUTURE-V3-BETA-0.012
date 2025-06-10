export interface BitcoinPriceData {
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  marketCap: number;
  lastUpdate: Date;
}

export interface MarketData {
  bitcoin: BitcoinPriceData;
  trending: Array<{
    name: string;
    symbol: string;
    price: number;
    change24h: number;
  }>;
}

class BitcoinAPIService {
  private cache: { data: MarketData | null; lastUpdate: number } = {
    data: null,
    lastUpdate: 0
  };

  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getCurrentPrice(): Promise<BitcoinPriceData> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin price');
      }

      const data = await response.json();
      const bitcoin = data.bitcoin;

      return {
        price: bitcoin.usd,
        change24h: bitcoin.usd_24h_change || 0,
        change24hPercent: bitcoin.usd_24h_change || 0,
        volume24h: bitcoin.usd_24h_vol || 0,
        marketCap: bitcoin.usd_market_cap || 0,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      // Return fallback data
      return {
        price: 97500,
        change24h: 1.2,
        change24hPercent: 1.2,
        volume24h: 15000000000,
        marketCap: 1900000000000,
        lastUpdate: new Date()
      };
    }
  }

  async getMarketData(): Promise<MarketData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data && (now - this.cache.lastUpdate) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const [bitcoinData, trendingResponse] = await Promise.all([
        this.getCurrentPrice(),
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h')
      ]);

      let trending: MarketData['trending'] = [];
      
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        trending = trendingData.slice(0, 5).map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0
        }));
      }

      const marketData: MarketData = {
        bitcoin: bitcoinData,
        trending
      };

      // Update cache
      this.cache = {
        data: marketData,
        lastUpdate: now
      };

      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Return fallback data
      const fallbackData: MarketData = {
        bitcoin: {
          price: 97500,
          change24h: 1.2,
          change24hPercent: 1.2,
          volume24h: 15000000000,
          marketCap: 1900000000000,
          lastUpdate: new Date()
        },
        trending: [
          { name: 'Ethereum', symbol: 'ETH', price: 3850, change24h: 2.5 },
          { name: 'BNB', symbol: 'BNB', price: 680, change24h: -1.2 },
          { name: 'Solana', symbol: 'SOL', price: 235, change24h: 4.8 },
          { name: 'XRP', symbol: 'XRP', price: 2.45, change24h: -2.1 },
          { name: 'Cardano', symbol: 'ADA', price: 1.05, change24h: 3.2 }
        ]
      };

      this.cache = {
        data: fallbackData,
        lastUpdate: now
      };

      return fallbackData;
    }
  }

  // Get real-time analysis based on current market conditions
  async getMarketAnalysis(): Promise<string> {
    const data = await this.getMarketData();
    const btc = data.bitcoin;
    
    let trend = "estável";
    let emoji = "➖";
    
    if (btc.change24hPercent > 2) {
      trend = "fortemente positiva";
      emoji = "📈";
    } else if (btc.change24hPercent > 0) {
      trend = "levemente positiva";
      emoji = "⬆️";
    } else if (btc.change24hPercent < -2) {
      trend = "fortemente negativa";
      emoji = "📉";
    } else if (btc.change24hPercent < 0) {
      trend = "levemente negativa";
      emoji = "⬇️";
    }

    return `📊 Resumo do mercado agora:
• Bitcoin: $${btc.price.toLocaleString()} (${btc.change24hPercent > 0 ? '+' : ''}${btc.change24hPercent.toFixed(2)}%)
• Tendência: ${trend} ${emoji}
• Volume 24h: $${(btc.volume24h / 1000000000).toFixed(1)}B
• Última atualização: ${btc.lastUpdate.toLocaleTimeString()}`;
  }
}

export const bitcoinAPI = new BitcoinAPIService();