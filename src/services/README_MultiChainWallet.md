# Multi-Chain Wallet Service

A comprehensive wallet integration service that provides seamless connectivity across multiple blockchain networks including Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base, and Solana.

## Features

### 🌐 Multi-Chain Support
- **EVM Chains**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base
- **Solana**: Full SOL and SPL token support
- **Automatic Network Detection**: Smart chain switching and recommendations
- **Cross-Chain Balance Aggregation**: Real-time portfolio tracking

### 🔗 Wallet Integration
- **MetaMask**: Most popular Ethereum wallet
- **WalletConnect**: Universal wallet connector
- **Coinbase Wallet**: Institutional-grade security
- **Trust Wallet**: Mobile-first experience
- **Phantom**: Leading Solana wallet
- **Solflare**: Advanced Solana features

### 💰 Financial Features
- **Real-time Balances**: Live balance tracking across all chains
- **USD Value Calculation**: CoinGecko price integration
- **Portfolio Analytics**: 24h changes and performance metrics
- **Token Support**: Native currencies and popular tokens
- **Transaction History**: Comprehensive transaction tracking

### 🚀 Performance Optimizations
- **Intelligent Caching**: 30-second balance cache with auto-refresh
- **Price Caching**: 5-minute price updates
- **Batch API Calls**: Efficient data fetching
- **Error Recovery**: Robust error handling and fallbacks
- **Connection Pooling**: Optimized RPC connections

## Installation & Setup

### 1. Dependencies

The service uses the following key dependencies (already included in package.json):

```json
{
  "@reown/appkit": "^1.6.7",
  "@reown/appkit-adapter-wagmi": "^1.6.7",
  "wagmi": "^2.17.2",
  "viem": "latest",
  "ethers": "^6.14.3",
  "@solana/web3.js": "^1.98.2"
}
```

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key (optional)
```

### 3. Web3Modal Configuration

The service automatically configures Web3Modal with all supported chains and wallets. The configuration is handled in `/src/config/web3modal.config.ts`.

## Usage

### Basic Implementation

```tsx
import { MultiChainWalletButton } from '@/components/wallet'

// Compact button with dropdown
<MultiChainWalletButton
  variant="compact"
  showBalance={true}
  showChainSwitcher={true}
  showNetworkStatus={true}
  onBalanceUpdate={(balance) => setPortfolioValue(balance)}
  onNetworkChange={(chainId) => setActiveNetwork(chainId)}
/>

// Minimal button
<MultiChainWalletButton
  variant="minimal"
  showNetworkStatus={true}
/>
```

### Full Interface

```tsx
import { MultiChainWallet } from '@/components/wallet'

<MultiChainWallet
  showPortfolio={true}
  compact={false}
  onBalanceUpdate={(balance) => {
    console.log('Total portfolio value:', balance)
  }}
/>
```

### Service Integration

```js
import multiChainWalletService from '@/services/MultiChainWallet'

// Get all balances for an address
const balances = await multiChainWalletService.getAllBalances('0x...')

// Get balance for specific chain
const balance = await multiChainWalletService.getChainBalance(1, '0x...')

// Get token balances
const tokens = await multiChainWalletService.getTokenBalances(1, '0x...')

// Calculate portfolio value
const portfolio = multiChainWalletService.calculatePortfolioValue(balances)

// Subscribe to events
const unsubscribe = multiChainWalletService.subscribe((event, data) => {
  console.log('Wallet event:', event, data)
})
```

## Component Variants

### MultiChainWalletButton

The main wallet button component with multiple display variants:

#### Props
```tsx
interface MultiChainWalletButtonProps {
  variant?: 'default' | 'compact' | 'minimal' | 'full'
  showBalance?: boolean
  showChainSwitcher?: boolean
  showNetworkStatus?: boolean
  className?: string
  onBalanceUpdate?: (balance: number) => void
  onNetworkChange?: (chainId: number | string) => void
}
```

#### Variants

**Default/Full** - Complete wallet interface with all features
- Portfolio summary with USD values
- Network status indicator
- Chain switcher
- Transaction history access
- Account management

**Compact** - Space-efficient dropdown interface
- Current network badge
- Balance display
- Quick chain switching
- Portfolio overview in dropdown

**Minimal** - Simple connection button
- Connection status indicator
- Basic wallet connection

### MultiChainWallet

Full-featured wallet interface component:

#### Props
```tsx
interface MultiChainWalletProps {
  showPortfolio?: boolean
  compact?: boolean
  onBalanceUpdate?: (totalBalance: number) => void
}
```

## Service API Reference

### Core Methods

#### `getAllBalances(address: string)`
Fetches balances across all supported chains for a given address.

**Returns**: `Promise<ChainBalance[]>`

#### `getChainBalance(chainId: number | string, address: string)`
Gets balance for a specific blockchain.

**Returns**: `Promise<{ balance: string, formattedBalance: string, timestamp: number }>`

#### `getTokenBalances(chainId: number, address: string, tokenList?: Token[])`
Fetches ERC-20/SPL token balances for a specific chain.

**Returns**: `Promise<TokenBalance[]>`

#### `calculatePortfolioValue(balances: ChainBalance[])`
Calculates total portfolio value and 24h performance.

**Returns**: `{ totalValue: number, total24hChange: number, total24hChangePercent: number }`

#### `switchNetwork(chainId: number)`
Programmatically switches to a different network.

**Returns**: `Promise<boolean>`

#### `getTransactionHistory(chainId: number | string, address: string, limit?: number)`
Retrieves transaction history for an address.

**Returns**: `Promise<Transaction[]>`

### Utility Methods

#### `getSupportedChains()`
Returns all supported blockchain configurations.

#### `getSupportedWallets(chainType?: 'evm' | 'solana' | 'all')`
Gets list of supported wallets, optionally filtered by chain type.

#### `clearCache()`
Clears all cached data.

#### `getCacheStats()`
Returns cache statistics for debugging.

## Supported Networks

### EVM Chains

| Network | Chain ID | Currency | Explorer |
|---------|----------|----------|----------|
| Ethereum | 1 | ETH | etherscan.io |
| BNB Chain | 56 | BNB | bscscan.com |
| Polygon | 137 | MATIC | polygonscan.com |
| Arbitrum | 42161 | ETH | arbiscan.io |
| Optimism | 10 | ETH | optimistic.etherscan.io |
| Avalanche | 43114 | AVAX | snowtrace.io |
| Base | 8453 | ETH | basescan.org |

### Solana

| Network | ID | Currency | Explorer |
|---------|-------|----------|----------|
| Solana Mainnet | solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp | SOL | explorer.solana.com |

## Default Token List

The service includes support for major tokens across all chains:

- **USDC**: USD Coin
- **USDT**: Tether
- **WETH**: Wrapped Ethereum
- **WBTC**: Wrapped Bitcoin
- **UNI**: Uniswap

Additional tokens can be added by modifying the `DEFAULT_TOKEN_LIST` in the service file.

## Error Handling

The service implements comprehensive error handling:

- **Connection Failures**: Automatic fallback to alternative RPC endpoints
- **Invalid Addresses**: Address validation for both EVM and Solana
- **Network Timeouts**: Request timeout handling with retries
- **Cache Invalidation**: Smart cache clearing on errors
- **User Feedback**: Toast notifications for user-facing errors

## Performance Considerations

### Caching Strategy
- **Balance Cache**: 30-second TTL with automatic refresh
- **Price Cache**: 5-minute TTL with background updates
- **Connection Pool**: Persistent RPC connections
- **Batch Requests**: Multiple balance fetches in single calls

### Optimization Features
- **Lazy Loading**: Components load only when needed
- **Debounced Updates**: Prevents excessive API calls
- **Selective Refresh**: Updates only changed data
- **Memory Management**: Automatic cleanup of unused connections

## Security Features

### Transaction Validation
- **Address Verification**: Checksum validation for all addresses
- **Network Confirmation**: Ensures transactions on correct network
- **Balance Verification**: Confirms sufficient balance before transactions
- **Rate Limiting**: Prevents abuse of API endpoints

### Data Protection
- **No Private Key Storage**: Never stores sensitive wallet data
- **Read-Only Operations**: Service only reads blockchain data
- **HTTPS Enforcement**: All API calls use secure connections
- **Input Sanitization**: All user inputs are validated and sanitized

## Development & Debugging

### Debug Information

Enable debug mode by setting localStorage:
```js
localStorage.setItem('multiChainWallet:debug', 'true')
```

### Cache Statistics

View cache performance:
```js
const stats = multiChainWalletService.getCacheStats()
console.log('Cache stats:', stats)
```

### Event Monitoring

Subscribe to all wallet events:
```js
multiChainWalletService.subscribe((event, data) => {
  console.log(`Event: ${event}`, data)
})
```

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Wallet Extensions**: MetaMask, Coinbase Wallet, Trust Wallet
- **WalletConnect**: v2.0 protocol support

## Demo & Testing

Visit `/multi-wallet-demo` to see the complete implementation with:
- Live wallet connections
- Real-time balance updates
- Network switching demonstrations
- All component variants
- Integration examples

## Contributing

When extending the service:

1. **Add New Chains**: Update `SUPPORTED_EVM_CHAINS` or `SUPPORTED_SOLANA_CHAINS`
2. **Add Wallets**: Extend the wagmi configuration in `web3modal.config.ts`
3. **Add Tokens**: Update `DEFAULT_TOKEN_LIST` with new token contracts
4. **Testing**: Use the demo page for comprehensive testing

## License

This service is part of the CYPHER ORDI FUTURE project and follows the same licensing terms.