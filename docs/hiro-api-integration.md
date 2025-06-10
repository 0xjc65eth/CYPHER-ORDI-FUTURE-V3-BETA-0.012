# Hiro API Integration Documentation

## Overview
Documentação completa para integração com APIs do Hiro para Bitcoin, Stacks e Ordinals.

## Available APIs

### 1. Hiro Stacks API
- **Base URL**: `https://api.hiro.so`
- **Docs**: https://docs.hiro.so/get-started/stacks-blockchain-api

#### Key Endpoints:
- `/v1/address/{address}/balances` - Get address balances
- `/v1/address/{address}/transactions` - Get transactions
- `/v1/blocks` - Get blocks information
- `/v1/tokens` - Token information

### 2. Hiro Bitcoin API  
- **Base URL**: `https://api.hiro.so/ordinals/v1`
- **Docs**: https://docs.hiro.so/bitcoin

#### Key Endpoints:
- `/inscriptions` - Get inscriptions data
- `/inscriptions/{inscription_id}` - Get specific inscription
- `/brc-20/tokens` - BRC-20 token data
- `/sats/{satoshi}` - Rare satoshi information

### 3. Ordinals API
- **Base URL**: `https://api.hiro.so/ordinals/v1`

#### Endpoints for CYPHER Integration:
```javascript
// Get inscriptions
GET /inscriptions?limit=20&offset=0

// Get inscription details
GET /inscriptions/{inscription_id}

// Get BRC-20 tokens
GET /brc-20/tokens

// Get BRC-20 balances
GET /brc-20/balances/{address}
```

## Integration Examples

### 1. Fetch Ordinals Data
```javascript
async function fetchOrdinals() {
  const response = await fetch('https://api.hiro.so/ordinals/v1/inscriptions?limit=50');
  const data = await response.json();
  return data.results;
}
```

### 2. Get BRC-20 Tokens
```javascript
async function getBRC20Tokens() {
  const response = await fetch('https://api.hiro.so/ordinals/v1/brc-20/tokens');
  const data = await response.json();
  return data.results;
}
```

### 3. Get Address Bitcoin Balance
```javascript
async function getBitcoinBalance(address) {
  const response = await fetch(`https://api.hiro.so/extended/v1/address/${address}/balances`);
  const data = await response.json();
  return data.stx.balance;
}
```

## Rate Limits
- **Free Tier**: 50 requests/minute
- **Premium**: 500 requests/minute
- **Enterprise**: Custom limits

## Authentication
```javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};
```

## Integration Plan for CYPHER

### Phase 1: Basic Integration
1. ✅ Arbitrage Scanner - Link to Hiro wallet
2. ✅ Ordinals data fetching
3. ✅ BRC-20 token information
4. ✅ Real-time price updates

### Phase 2: Advanced Features
1. 🔄 Wallet connection via Hiro Connect
2. 🔄 Transaction broadcasting
3. 🔄 Smart contract interactions
4. 🔄 NFT marketplace integration

### Phase 3: Professional Tools
1. 📋 Portfolio tracking
2. 📋 Advanced analytics
3. 📋 Automated trading signals
4. 📋 Risk management tools

## Hiro Wallet Integration

### Connect Wallet
```javascript
import { connect } from '@stacks/connect';

const connectWallet = () => {
  connect({
    appDetails: {
      name: 'CYPHER ORDI',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: (data) => {
      console.log('Connected:', data);
    },
  });
};
```

### Transaction Signing
```javascript
import { openContractCall } from '@stacks/connect';

const executeTransaction = () => {
  openContractCall({
    contractAddress: 'SP000000000000000000002Q6VF78',
    contractName: 'pox',
    functionName: 'stack-stx',
    functionArgs: [/* args */],
    network: new StacksMainnet(),
    onFinish: (data) => {
      console.log('Transaction submitted:', data);
    },
  });
};
```

## Error Handling
```javascript
async function safeApiCall(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
```

## Implementation Status

### ✅ Completed
- Basic API endpoint mapping
- Rate limiting understanding
- Error handling patterns
- Integration architecture

### 🔄 In Progress  
- Real-time data streaming
- Wallet connection improvements
- Transaction broadcasting

### 📋 Planned
- Advanced analytics integration
- Smart contract interactions
- Portfolio management
- Automated trading features

## Resources
- [Hiro Documentation](https://docs.hiro.so)
- [Stacks.js SDK](https://github.com/hirosystems/stacks.js)
- [Connect Wallet Guide](https://docs.hiro.so/get-started/connect-wallet)
- [API Reference](https://docs.hiro.so/api-reference)

## Notes
- All endpoints are production-ready
- CORS enabled for frontend integration
- WebSocket support for real-time data
- Comprehensive error responses