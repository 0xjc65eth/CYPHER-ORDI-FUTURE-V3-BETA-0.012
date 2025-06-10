# Hiro API Integration

Complete implementation of Hiro APIs for Bitcoin, Ordinals, Runes, and BRC-20 tokens with intelligent caching, error handling, and real-time WebSocket support.

## Features

- **Complete API Coverage**: All Hiro endpoints implemented
- **Intelligent Caching**: LRU/FIFO cache with configurable TTL
- **Error Handling**: Robust error handling with retry logic
- **Rate Limiting**: Built-in rate limiting to prevent API throttling
- **WebSocket Support**: Real-time updates for all data types
- **TypeScript**: Full type safety with comprehensive interfaces
- **Optimized for Vercel**: Designed for serverless deployment

## Usage

### Basic Usage

```typescript
import { hiroAPI } from '@/lib/api/hiro'

// Get Runes data
const runes = await hiroAPI.runes.getEtchings({ limit: 20 })
const runeDetails = await hiroAPI.runes.getEtching('rune_id')
const holders = await hiroAPI.runes.getHolders('rune_id')

// Get Ordinals data
const inscriptions = await hiroAPI.ordinals.getInscriptions({ limit: 20 })
const inscription = await hiroAPI.ordinals.getInscription('inscription_id')
const transfers = await hiroAPI.ordinals.getInscriptionTransfers('inscription_id')

// Get BRC-20 data
const tokens = await hiroAPI.brc20.getTokens({ limit: 20 })
const token = await hiroAPI.brc20.getToken('ORDI')
const tokenHolders = await hiroAPI.brc20.getHolders('ORDI')
```

### Advanced Filtering

```typescript
// Filter Runes
const turboRunes = await hiroAPI.runes.getEtchings({
  turbo: true,
  sort_by: 'minted',
  order: 'desc',
  limit: 50
})

// Filter Inscriptions
const recursiveInscriptions = await hiroAPI.ordinals.getInscriptions({
  recursive: true,
  content_type: 'text/html',
  from_timestamp: Date.now() - 86400000, // Last 24 hours
  sort_by: 'timestamp',
  order: 'desc'
})

// Filter BRC-20 tokens
const popularTokens = await hiroAPI.brc20.getTokens({
  min_holders: 1000,
  sort_by: 'holders',
  order: 'desc'
})
```

### Real-time Updates

```typescript
// Connect WebSocket
await hiroAPI.connectWebSocket()

// Subscribe to events
hiroAPI.ws.on('inscription', (message) => {
  console.log('New inscription:', message.data)
})

hiroAPI.ws.on('rune', (message) => {
  console.log('Rune activity:', message.data)
})

hiroAPI.ws.on('brc20', (message) => {
  console.log('BRC-20 activity:', message.data)
})

// Subscribe to specific events
hiroAPI.ws.subscribeToInscriptions({ content_type: 'image/png' })
hiroAPI.ws.subscribeToRunes({ operation: 'mint' })
hiroAPI.ws.subscribeToBRC20({ ticker: 'ORDI' })

// Subscribe to all updates for an address
hiroAPI.subscribeToAddress('bc1qaddress...')
```

### Portfolio Management

```typescript
// Get complete portfolio for an address
const portfolio = await hiroAPI.getPortfolio('bc1qaddress...')

console.log('Inscriptions:', portfolio.inscriptions)
console.log('Runes:', portfolio.runes)
console.log('BRC-20 Tokens:', portfolio.brc20)
console.log('Stats:', portfolio.stats)
```

### Search and Discovery

```typescript
// Search across all types
const searchResults = await hiroAPI.search('punk', 20)

// Get trending items
const trending = await hiroAPI.getTrending('24h', 10)

// Get new deployments
const newRunes = await hiroAPI.runes.getNewEtchings(20)
const newTokens = await hiroAPI.brc20.getNewDeployments(20)
const latestInscriptions = await hiroAPI.ordinals.getLatestInscriptions(20)
```

### Cache Management

```typescript
// Get cache statistics
const cacheStats = hiroAPI.getCacheStats()
console.log('Cache stats:', cacheStats)

// Clear specific cache
hiroAPI.runes.clearCache()
hiroAPI.ordinals.clearCache()
hiroAPI.brc20.clearCache()

// Clear all caches
hiroAPI.clearAllCaches()
```

### Error Handling

```typescript
try {
  const data = await hiroAPI.runes.getEtching('invalid_id')
} catch (error) {
  if (error.error === 'NOT_FOUND') {
    console.log('Rune not found')
  } else if (error.error === 'RATE_LIMITED') {
    console.log('Rate limited, try again later')
  } else {
    console.error('API error:', error.message)
  }
}
```

### Health Check

```typescript
// Check API health
const health = await hiroAPI.healthCheck()
console.log('API Health:', health)
// Output: { runes: true, ordinals: true, brc20: true, websocket: true, cache: true }
```

## Environment Variables

```env
NEXT_PUBLIC_HIRO_API_ENDPOINT=https://api.hiro.so
NEXT_PUBLIC_HIRO_API_KEY=your_api_key_here
NEXT_PUBLIC_HIRO_API_TIMEOUT=30000
NEXT_PUBLIC_HIRO_WS_ENDPOINT=wss://api.hiro.so/ordinals/v1/ws
```

## API Reference

### Runes API
- `getEtchings()` - List all rune etchings
- `getEtching(runeId)` - Get specific rune details
- `getHolders(runeId)` - Get rune holders
- `getActivity(runeId)` - Get rune activity
- `getBalances(address)` - Get rune balances for address
- `getStats()` - Get global runes statistics
- `searchRunes(query)` - Search runes by name
- `getTrendingRunes()` - Get trending runes
- `getNewEtchings()` - Get new rune etchings
- `getTopByMarketCap()` - Get top runes by market cap

### Ordinals API
- `getInscriptions()` - List inscriptions
- `getInscription(id)` - Get inscription details
- `getInscriptionContent(id)` - Get inscription content
- `getInscriptionTransfers(id)` - Get inscription transfers
- `getInscriptionsByAddress(address)` - Get inscriptions by address
- `getStats()` - Get global ordinals statistics
- `getLatestInscriptions()` - Get latest inscriptions
- `getPopularInscriptions()` - Get popular inscriptions
- `searchInscriptions(query)` - Search inscriptions

### BRC-20 API
- `getTokens()` - List BRC-20 tokens
- `getToken(ticker)` - Get token details
- `getHolders(ticker)` - Get token holders
- `getActivity(ticker)` - Get token activity
- `getBalances(address)` - Get token balances for address
- `getStats()` - Get global BRC-20 statistics
- `searchTokens(query)` - Search tokens
- `getTrendingTokens()` - Get trending tokens
- `getNewDeployments()` - Get new token deployments
- `getTopByHolders()` - Get top tokens by holders

### WebSocket Events
- `connected` - WebSocket connected
- `disconnected` - WebSocket disconnected
- `error` - WebSocket error
- `message` - Any message received
- `inscription` - New inscription event
- `rune` - Rune activity event
- `brc20` - BRC-20 activity event
- `block` - New block event
- `mempool` - Mempool update event

## Performance Optimization

The implementation includes several performance optimizations:

1. **Intelligent Caching**: Different TTL for different data types
2. **Request Batching**: Batch multiple requests when possible
3. **Rate Limiting**: Prevents API throttling
4. **Connection Pooling**: Reuses HTTP connections
5. **Lazy Loading**: Only loads data when needed
6. **WebSocket Reconnection**: Automatic reconnection with exponential backoff

## Best Practices

1. Always handle errors appropriately
2. Use caching to reduce API calls
3. Subscribe to WebSocket events for real-time data
4. Batch requests when fetching multiple items
5. Monitor rate limits and adjust accordingly
6. Clear cache periodically for fresh data
7. Use appropriate filters to reduce data transfer