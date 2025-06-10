// Hiro API Usage Examples

import { hiroAPI } from './index'

// Example 1: Basic Runes Operations
export async function runesExample() {
  try {
    // Get list of runes
    const runes = await hiroAPI.runes.getEtchings({ limit: 10 })
    console.log('Total runes:', runes.total)
    console.log('First rune:', runes.results[0])

    // Get specific rune details
    if (runes.results.length > 0) {
      const runeId = runes.results[0].rune_id
      const runeDetails = await hiroAPI.runes.getEtching(runeId)
      console.log('Rune details:', runeDetails)

      // Get rune holders
      const holders = await hiroAPI.runes.getHolders(runeId, { limit: 5 })
      console.log('Top holders:', holders.results)

      // Get rune activity
      const activity = await hiroAPI.runes.getActivity(runeId, { 
        operation: 'mint',
        limit: 10 
      })
      console.log('Recent mints:', activity.results)
    }

    // Get trending runes
    const trending = await hiroAPI.runes.getTrendingRunes('24h', 5)
    console.log('Trending runes:', trending)

  } catch (error) {
    console.error('Runes example error:', error)
  }
}

// Example 2: Ordinals Operations
export async function ordinalsExample() {
  try {
    // Get latest inscriptions
    const latest = await hiroAPI.ordinals.getLatestInscriptions(10)
    console.log('Latest inscriptions:', latest)

    // Get inscriptions by content type
    const images = await hiroAPI.ordinals.getInscriptionsByContentType('image/png', {
      limit: 10
    })
    console.log('PNG inscriptions:', images)

    // Get recursive inscriptions
    const recursive = await hiroAPI.ordinals.getRecursiveInscriptions({ limit: 5 })
    console.log('Recursive inscriptions:', recursive)

    // Search inscriptions
    const searchResults = await hiroAPI.ordinals.searchInscriptions('bitcoin')
    console.log('Search results:', searchResults)

  } catch (error) {
    console.error('Ordinals example error:', error)
  }
}

// Example 3: BRC-20 Operations
export async function brc20Example() {
  try {
    // Get top BRC-20 tokens
    const topTokens = await hiroAPI.brc20.getTopByHolders(10)
    console.log('Top BRC-20 tokens:', topTokens)

    // Get specific token details
    const ordi = await hiroAPI.brc20.getToken('ordi')
    console.log('ORDI token:', ordi)

    // Get token holders
    const holders = await hiroAPI.brc20.getHolders('ordi', { limit: 10 })
    console.log('ORDI holders:', holders)

    // Get mint progress
    const mintProgress = await hiroAPI.brc20.getMintProgress('ordi')
    console.log('ORDI mint progress:', mintProgress)

    // Get holder distribution
    const distribution = await hiroAPI.brc20.getHolderDistribution('ordi')
    console.log('Holder distribution:', distribution)

  } catch (error) {
    console.error('BRC-20 example error:', error)
  }
}

// Example 4: Portfolio Management
export async function portfolioExample() {
  try {
    const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' // Example address

    // Get complete portfolio
    const portfolio = await hiroAPI.getPortfolio(address)
    console.log('Portfolio stats:', portfolio.stats)

    // Get individual balances
    const runeBalances = await hiroAPI.runes.getBalances(address)
    console.log('Rune balances:', runeBalances)

    const brc20Balances = await hiroAPI.brc20.getBalances(address)
    console.log('BRC-20 balances:', brc20Balances)

    const inscriptions = await hiroAPI.ordinals.getInscriptionsByAddress(address)
    console.log('Inscriptions:', inscriptions.total)

  } catch (error) {
    console.error('Portfolio example error:', error)
  }
}

// Example 5: Real-time WebSocket
export async function websocketExample() {
  try {
    // Connect to WebSocket
    await hiroAPI.connectWebSocket()

    // Subscribe to new inscriptions
    hiroAPI.ws.on('inscription', (message) => {
      if (message.action === 'new') {
        console.log('New inscription:', message.data)
      }
    })

    // Subscribe to rune activity
    hiroAPI.ws.subscribeToRunes({
      operation: 'mint'
    })

    hiroAPI.ws.on('rune', (message) => {
      console.log('Rune activity:', message.data)
    })

    // Subscribe to BRC-20 activity
    hiroAPI.ws.subscribeToBRC20({
      ticker: 'ordi'
    })

    hiroAPI.ws.on('brc20', (message) => {
      console.log('ORDI activity:', message.data)
    })

    // Subscribe to blocks
    hiroAPI.ws.subscribeToBlocks()

    hiroAPI.ws.on('block', (message) => {
      console.log('New block:', message.data)
    })

    // Monitor connection
    hiroAPI.ws.on('connected', () => {
      console.log('WebSocket connected')
    })

    hiroAPI.ws.on('disconnected', () => {
      console.log('WebSocket disconnected')
    })

    hiroAPI.ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

  } catch (error) {
    console.error('WebSocket example error:', error)
  }
}

// Example 6: Advanced Filtering and Search
export async function advancedSearchExample() {
  try {
    // Search across all types
    const searchResults = await hiroAPI.search('punk', 20)
    console.log('Search results:', {
      runes: searchResults.runes.length,
      inscriptions: searchResults.inscriptions.length,
      brc20: searchResults.brc20.length
    })

    // Get trending across all types
    const trending = await hiroAPI.getTrending('24h', 10)
    console.log('Trending items:', trending)

    // Filter runes by supply
    const largeRunes = await hiroAPI.runes.getEtchings({
      min_supply: '1000000000',
      sort_by: 'minted',
      order: 'desc',
      limit: 10
    })
    console.log('Large supply runes:', largeRunes)

    // Filter inscriptions by sat rarity
    const rareInscriptions = await hiroAPI.ordinals.getInscriptionsBySatRarity('mythic', {
      limit: 10
    })
    console.log('Mythic inscriptions:', rareInscriptions)

    // Get cursed inscriptions
    const cursed = await hiroAPI.ordinals.getCursedInscriptions({ limit: 10 })
    console.log('Cursed inscriptions:', cursed)

  } catch (error) {
    console.error('Advanced search example error:', error)
  }
}

// Example 7: Cache Management
export async function cacheExample() {
  try {
    // Get cache statistics before operations
    console.log('Initial cache stats:', hiroAPI.getCacheStats())

    // Perform some operations to populate cache
    await hiroAPI.runes.getEtchings({ limit: 10 })
    await hiroAPI.ordinals.getLatestInscriptions(10)
    await hiroAPI.brc20.getTopByHolders(10)

    // Check cache stats after operations
    console.log('Cache stats after operations:', hiroAPI.getCacheStats())

    // Clear specific cache
    hiroAPI.runes.clearCache()
    console.log('Runes cache cleared')

    // Clear all caches
    hiroAPI.clearAllCaches()
    console.log('All caches cleared')

  } catch (error) {
    console.error('Cache example error:', error)
  }
}

// Example 8: Error Handling
export async function errorHandlingExample() {
  try {
    // Try to get non-existent rune
    const rune = await hiroAPI.runes.getEtching('non-existent-id')
  } catch (error: any) {
    if (error.error === 'NOT_FOUND') {
      console.log('Rune not found - expected error')
    } else if (error.error === 'RATE_LIMITED') {
      console.log('Rate limited - wait before retrying')
    } else if (error.error === 'UNAUTHORIZED') {
      console.log('Invalid API key')
    } else {
      console.error('Unexpected error:', error)
    }
  }
}

// Example 9: Batch Operations
export async function batchOperationsExample() {
  try {
    // Get multiple runes at once
    const runeIds = ['rune1', 'rune2', 'rune3'] // Replace with actual IDs
    const runes = await hiroAPI.runes.getMultipleEtchings(runeIds)
    console.log('Batch runes:', runes.size)

    // Get multiple inscriptions
    const inscriptionIds = ['inscription1', 'inscription2'] // Replace with actual IDs
    const inscriptions = await hiroAPI.ordinals.getMultipleInscriptions(inscriptionIds)
    console.log('Batch inscriptions:', inscriptions.size)

    // Get multiple BRC-20 tokens
    const tickers = ['ordi', 'sats', 'rats'] // Example tickers
    const tokens = await hiroAPI.brc20.getMultipleTokens(tickers)
    console.log('Batch tokens:', tokens.size)

  } catch (error) {
    console.error('Batch operations example error:', error)
  }
}

// Example 10: Health Check
export async function healthCheckExample() {
  try {
    const health = await hiroAPI.healthCheck()
    console.log('API Health Status:')
    console.log('- Runes API:', health.runes ? '✅' : '❌')
    console.log('- Ordinals API:', health.ordinals ? '✅' : '❌')
    console.log('- BRC-20 API:', health.brc20 ? '✅' : '❌')
    console.log('- WebSocket:', health.websocket ? '✅' : '❌')
    console.log('- Cache:', health.cache ? '✅' : '❌')

  } catch (error) {
    console.error('Health check error:', error)
  }
}

// Run all examples
export async function runAllExamples() {
  console.log('🚀 Running Hiro API Examples...\n')

  console.log('1️⃣ Runes Example:')
  await runesExample()
  console.log('\n---\n')

  console.log('2️⃣ Ordinals Example:')
  await ordinalsExample()
  console.log('\n---\n')

  console.log('3️⃣ BRC-20 Example:')
  await brc20Example()
  console.log('\n---\n')

  console.log('4️⃣ Portfolio Example:')
  await portfolioExample()
  console.log('\n---\n')

  console.log('5️⃣ WebSocket Example:')
  await websocketExample()
  console.log('\n---\n')

  console.log('6️⃣ Advanced Search Example:')
  await advancedSearchExample()
  console.log('\n---\n')

  console.log('7️⃣ Cache Example:')
  await cacheExample()
  console.log('\n---\n')

  console.log('8️⃣ Error Handling Example:')
  await errorHandlingExample()
  console.log('\n---\n')

  console.log('9️⃣ Batch Operations Example:')
  await batchOperationsExample()
  console.log('\n---\n')

  console.log('🔟 Health Check Example:')
  await healthCheckExample()

  console.log('\n✅ All examples completed!')
}

// Export for testing
if (require.main === module) {
  runAllExamples().catch(console.error)
}