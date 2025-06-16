# CYPHER ORDi Future V3 - API Routes Documentation

## Overview
This document outlines the API routes available in CYPHER ORDi Future V3, focusing on the newly implemented endpoints for trading execution, portfolio synchronization, and AI command processing.

## Newly Implemented API Routes

### 1. Trading Execution API
**Endpoint**: `/api/trading/execute`
**Method**: POST
**Purpose**: Execute trading operations across multiple networks

#### Request Schema
```typescript
interface TradeExecutionRequest {
  action: 'buy' | 'sell' | 'swap';
  fromToken: string;
  toToken?: string;
  amount: string;
  slippage?: number;
  network: string;
  walletAddress: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  deadline?: number;
}
```

#### Response Schema
```typescript
interface TradeExecutionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  estimatedGas?: string;
  serviceFee?: string;
  executionTime?: number;
  priceImpact?: number;
  route?: any;
}
```

#### Features
- Multi-network support (Ethereum, Arbitrum, Optimism, Polygon, Base, Avalanche, BSC, Solana)
- Automatic service fee calculation (0.34%, max $100 USD)
- Gas estimation and optimization
- Price impact analysis
- Slippage protection
- Input validation and security checks

#### Example Usage
```bash
curl -X POST http://localhost:4444/api/trading/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "fromToken": "USDC",
    "amount": "1000",
    "network": "ethereum",
    "walletAddress": "0x742d35cc6bf8b5de47cb37d8c9f3c85c1e0d40b9",
    "slippage": 0.5
  }'
```

### 2. Portfolio Synchronization API
**Endpoint**: `/api/portfolio/sync`
**Method**: POST
**Purpose**: Synchronize portfolio data across multiple networks and protocols

#### Request Schema
```typescript
interface PortfolioSyncRequest {
  walletAddress: string;
  networks?: string[];
  includeNFTs?: boolean;
  includeTokens?: boolean;
  includeTransactions?: boolean;
  forceRefresh?: boolean;
}
```

#### Response Schema
```typescript
interface PortfolioSyncResponse {
  success: boolean;
  walletAddress: string;
  lastSyncTime: number;
  networks: NetworkBalance[];
  totalValueUSD: number;
  tokens: TokenBalance[];
  nfts?: NFTCollection[];
  transactions?: Transaction[];
  syncDuration: number;
  error?: string;
}
```

#### Features
- Multi-network portfolio aggregation
- Real-time balance synchronization
- NFT collection tracking
- Token balance monitoring
- Transaction history
- Caching for improved performance
- Rate limiting protection

#### Example Usage
```bash
curl -X POST http://localhost:4444/api/portfolio/sync \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35cc6bf8b5de47cb37d8c9f3c85c1e0d40b9",
    "networks": ["ethereum", "bitcoin", "solana"],
    "includeNFTs": true,
    "includeTokens": true,
    "includeTransactions": true
  }'
```

### 3. AI Command Processing API
**Endpoint**: `/api/ai/command`
**Method**: POST
**Purpose**: Process natural language commands for crypto analysis and trading

#### Request Schema
```typescript
interface AICommandRequest {
  command: string;
  context?: string;
  parameters?: Record<string, any>;
  userId?: string;
  priority?: 'low' | 'medium' | 'high';
}
```

#### Response Schema
```typescript
interface AICommandResponse {
  success: boolean;
  command: string;
  result?: any;
  executionTime: number;
  timestamp: string;
  error?: string;
  suggestions?: string[];
}
```

#### Supported Command Types
- **Market Analysis**: "Analyze BTC market trends"
- **Portfolio Management**: "Show my portfolio balance"
- **Trading Signals**: "Should I buy ETH now?"
- **Price Queries**: "What is the current BTC price?"
- **News & Sentiment**: "Latest crypto news sentiment"
- **Ordinals Data**: "Show top Ordinals collections"
- **Runes Information**: "Runes trading volume today"

#### Features
- Natural language processing
- Command sanitization and security
- Multi-category command routing
- Contextual suggestions
- Rate limiting
- Error handling and validation

#### Example Usage
```bash
curl -X POST http://localhost:4444/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Analyze BTC market trends for the next 24 hours",
    "context": "trading_analysis",
    "userId": "user123"
  }'
```

### 4. Enhanced AI Custom Analysis API
**Endpoint**: `/api/ai/custom-analysis`
**Method**: POST
**Purpose**: Advanced multi-agent analysis system for deep market insights

#### Features (Already Implemented)
- 30-agent analysis system
- Multi-source data aggregation
- Real-time market data integration
- Social sentiment analysis
- On-chain metrics analysis
- Trade signal generation
- Confidence scoring

## API Integration Guidelines

### Authentication
- Currently using development mode without authentication
- Production deployment will require API key authentication
- Rate limiting implemented per endpoint

### Error Handling
All APIs follow consistent error response format:
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2025-06-14T...",
  "executionTime": 150
}
```

### Rate Limits
- Trading API: 100 requests/hour per wallet
- Portfolio Sync: 100 requests/hour per wallet
- AI Commands: 60 requests/minute per user
- Custom Analysis: 20 requests/hour per user

### Response Caching
- Portfolio data: 5-minute cache
- Market data: 1-minute cache
- AI responses: No caching (real-time)

## Network Support

### Supported Networks
1. **Ethereum** (ethereum)
2. **Bitcoin** (bitcoin)
3. **Solana** (solana)
4. **Polygon** (polygon)
5. **Arbitrum** (arbitrum)
6. **Optimism** (optimism)
7. **Base** (base)
8. **Avalanche** (avalanche)
9. **BSC** (bsc)

### Network-Specific Features
- **Bitcoin**: Native balance, Ordinals, Runes
- **Ethereum**: ERC-20 tokens, NFTs, DeFi protocols
- **Solana**: SPL tokens, Solana NFTs
- **Layer 2s**: Lower fees, faster transactions

## Security Features

### Input Validation
- Wallet address format validation
- Command sanitization
- Parameter type checking
- SQL injection prevention

### Rate Limiting
- Per-IP and per-user limits
- Progressive rate limiting
- Burst protection

### Error Prevention
- Transaction simulation before execution
- Gas estimation and optimization
- Slippage protection
- Network congestion handling

## Integration Examples

### Frontend Integration
```typescript
// Trading execution
const executeTrade = async (tradeParams) => {
  const response = await fetch('/api/trading/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeParams)
  });
  return response.json();
};

// Portfolio sync
const syncPortfolio = async (walletAddress) => {
  const response = await fetch('/api/portfolio/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  return response.json();
};

// AI command
const processAICommand = async (command) => {
  const response = await fetch('/api/ai/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });
  return response.json();
};
```

## Testing & Validation

### Testing Endpoints
Each API includes GET endpoints for documentation and testing:
- `/api/trading/execute` (GET) - Shows supported actions and networks
- `/api/portfolio/sync` (GET) - Shows supported networks and features
- `/api/ai/command` (GET) - Shows supported commands and examples

### Health Checks
Monitor API health using existing health check endpoint:
- `/api/health` - Overall system health
- `/api/system/status` - Detailed system status

## Performance Optimization

### Caching Strategy
- Redis caching for portfolio data
- In-memory caching for market data
- CDN caching for static responses

### Database Optimization
- Indexed queries for wallet addresses
- Connection pooling
- Query optimization

### API Response Optimization
- Response compression
- Pagination for large datasets
- Selective field responses

## Future Enhancements

### Planned Features
1. WebSocket support for real-time updates
2. Batch operations for multiple trades
3. Advanced portfolio analytics
4. Machine learning-powered predictions
5. Cross-chain arbitrage detection

### API Versioning
- Current version: v1 (implicit)
- Future versions will use explicit versioning
- Backward compatibility maintenance

---

**Last Updated**: June 14, 2025
**API Version**: 1.0
**CYPHER ORDi Future V3**: Beta 0.012