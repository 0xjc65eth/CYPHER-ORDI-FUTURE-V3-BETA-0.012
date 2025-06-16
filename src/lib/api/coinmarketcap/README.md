# CoinMarketCap API Integration

Uma integração completa e otimizada com a API Pro do CoinMarketCap, oferecendo acesso a dados de mercado de criptomoedas em tempo real, históricos e indicadores avançados.

## Recursos

### 📊 Dados de Mercado
- **Listagens de Criptomoedas**: Top moedas por market cap, volume, etc.
- **Cotações em Tempo Real**: Preços atualizados de qualquer criptomoeda
- **Dados OHLCV**: Histórico de preços com diferentes intervalos
- **Pares de Mercado**: Informações detalhadas sobre exchanges e pares

### 📈 Métricas Globais
- **Estatísticas de Mercado**: Market cap total, volume, dominância
- **DeFi Stats**: Métricas específicas do ecossistema DeFi
- **Stablecoin Stats**: Dados sobre stablecoins
- **Tendências de Dominância**: BTC, ETH e altcoins

### 🎯 Indicadores Avançados
- **Fear & Greed Index**: Índice de medo e ganância do mercado
- **Altcoin Season Index**: Indicador de temporada de altcoins
- **Trending**: Moedas em alta, maiores ganhos/perdas
- **Market Sentiment**: Análise de sentimento com recomendações

### 🛠️ Ferramentas
- **Conversão de Preços**: Converter entre moedas e fiat
- **Preços Históricos**: Obter preços em datas específicas
- **Multi-conversão**: Converter para múltiplas moedas

## Instalação

```bash
npm install axios
```

## Uso Rápido

```typescript
import CMC from '@/lib/api/coinmarketcap';

// Obter top 10 criptomoedas
const topCryptos = await CMC.getTop(10);

// Obter cotação do Bitcoin
const btc = await CMC.getBySymbol('BTC');

// Fear & Greed Index
const fearGreed = await CMC.fearGreed();

// Métricas globais do mercado
const marketStats = await CMC.marketStats();
```

## Exemplos Detalhados

### 1. Listagens e Cotações

```typescript
import { 
  getCryptocurrencyListings, 
  getCryptocurrencyQuotes,
  getCryptocurrencyBySymbol 
} from '@/lib/api/coinmarketcap';

// Listar top 100 moedas
const listings = await getCryptocurrencyListings({
  start: 1,
  limit: 100,
  sort: 'market_cap',
  sort_dir: 'desc',
  convert: 'USD'
});

// Obter cotações de múltiplas moedas
const quotes = await getCryptocurrencyQuotes({
  symbol: 'BTC,ETH,BNB',
  convert: 'USD'
});

// Obter dados de uma moeda específica
const bitcoin = await getCryptocurrencyBySymbol('BTC');
console.log(`Bitcoin: $${bitcoin.quote.USD.price}`);
```

### 2. Trending e Gainers/Losers

```typescript
import { 
  getTrendingCryptocurrencies,
  getGainersLosers,
  getMostVisited 
} from '@/lib/api/coinmarketcap';

// Moedas em trending
const trending = await getTrendingCryptocurrencies({
  limit: 10,
  time_period: '24h'
});

// Maiores altas e baixas
const { gainers, losers } = await getGainersLosers({
  limit: 10,
  time_period: '24h'
});

// Mais visitadas
const mostVisited = await getMostVisited({ limit: 10 });
```

### 3. Indicadores de Mercado

```typescript
import { 
  getFearGreedIndex,
  getAltcoinSeasonIndex,
  getMarketSentiment 
} from '@/lib/api/coinmarketcap';

// Fear & Greed Index
const fearGreed = await getFearGreedIndex();
console.log(`Fear & Greed: ${fearGreed.value} - ${fearGreed.value_classification}`);

// Altcoin Season Index
const altSeason = await getAltcoinSeasonIndex();
console.log(`Alt Season: ${altSeason.value}% - ${altSeason.status}`);

// Sentimento completo do mercado
const sentiment = await getMarketSentiment();
console.log(sentiment.summary);
sentiment.recommendations.forEach(rec => console.log(`- ${rec}`));
```

### 4. Métricas Globais

```typescript
import { 
  getGlobalMetrics,
  getMarketStatistics,
  getDominanceTrends 
} from '@/lib/api/coinmarketcap';

// Métricas globais
const metrics = await getGlobalMetrics();

// Estatísticas de mercado processadas
const stats = await getMarketStatistics();
console.log(`Market Cap: $${stats.totalMarketCap.toLocaleString()}`);
console.log(`BTC Dominance: ${stats.btcDominance.toFixed(2)}%`);

// Tendências de dominância
const dominance = await getDominanceTrends();
console.log(`BTC: ${dominance.btc.current}% (${dominance.btc.change24h > 0 ? '+' : ''}${dominance.btc.change24h}%)`);
```

### 5. Conversão de Moedas

```typescript
import { 
  priceConversion,
  convertCrypto,
  convertToMultipleCurrencies 
} from '@/lib/api/coinmarketcap';

// Conversão simples
const conversion = await convertCrypto(1, 'BTC', 'ETH');
console.log(`1 BTC = ${conversion.to.amount} ETH`);

// Conversão para múltiplas moedas
const multiConvert = await convertToMultipleCurrencies(
  100, 
  'ETH', 
  ['USD', 'EUR', 'BRL', 'JPY']
);
```

### 6. Dados Históricos

```typescript
import { 
  getOHLCVHistorical,
  getHistoricalPrice 
} from '@/lib/api/coinmarketcap';

// OHLCV histórico
const ohlcv = await getOHLCVHistorical({
  symbol: 'BTC',
  period: 'daily',
  time_start: '2024-01-01',
  time_end: '2024-12-31',
  convert: 'USD'
});

// Preço em data específica
const historicalPrice = await getHistoricalPrice(
  'BTC',
  '2024-01-01T00:00:00Z'
);
```

## Cache Inteligente

O sistema possui cache automático com TTLs otimizados:

```typescript
import { getCache, invalidateCache } from '@/lib/api/coinmarketcap';

// Verificar estatísticas do cache
const cache = getCache();
const stats = cache.getStats();
console.log(`Cache size: ${stats.size} items`);

// Invalidar cache por padrão
invalidateCache('listings'); // Remove todos os caches de listings

// Cache customizado
const data = await getCryptocurrencyListings({
  limit: 10
}, {
  cache: true,
  cacheTTL: 600 // 10 minutos
});
```

## Tratamento de Erros

```typescript
import { 
  CMCError, 
  CMCRateLimitError,
  CMCValidationError 
} from '@/lib/api/coinmarketcap';

try {
  const data = await getCryptocurrencyQuotes({ symbol: 'BTC' });
} catch (error) {
  if (error instanceof CMCRateLimitError) {
    console.error(`Rate limit atingido. Retry após ${error.retryAfter}s`);
  } else if (error instanceof CMCValidationError) {
    console.error(`Erro de validação: ${error.message}`);
  } else if (error instanceof CMCError) {
    console.error(`Erro da API: ${error.errorMessage}`);
  }
}
```

## Configuração

### Variáveis de Ambiente

```env
# .env.local
CMC_API_KEY=c045d2a9-6f2d-44e9-8297-a88ab83b463b
```

### Limites de Rate

- **Por minuto**: 30 requisições
- **Diário**: 333 requisições
- **Mensal**: 10.000 requisições

### TTLs de Cache

- **Listings**: 5 minutos
- **Quotes**: 1 minuto
- **Global Metrics**: 5 minutos
- **Trending**: 10 minutos
- **Historical**: 1 hora
- **Indicators**: 1 hora

## Otimizações para Vercel

- ✅ Cache automático para reduzir calls de API
- ✅ Retry com backoff exponencial
- ✅ Compressão gzip nas requisições
- ✅ Timeout configurável
- ✅ Error handling robusto
- ✅ TypeScript completo

## Desenvolvimento

```bash
# Modo sandbox (dados de teste)
const client = getCMCClient({ sandbox: true });

# Log de requisições
NODE_ENV=development npm run dev
```

## Suporte

Para mais informações sobre a API do CoinMarketCap, consulte:
- [Documentação oficial](https://coinmarketcap.com/api/documentation/v1/)
- [Status da API](https://status.coinmarketcap.com/)