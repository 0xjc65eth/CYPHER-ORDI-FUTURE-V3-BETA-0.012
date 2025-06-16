# RUNESDX.IO Integration Documentation

This document provides comprehensive information about the RUNESDX.IO integration implementation in the Cypher Terminal application.

## Overview

The RUNESDX.IO integration enables users to place, track, and manage Bitcoin Runes orders directly through the Cypher Terminal interface. The integration includes:

- **Order Placement**: Market and limit orders for Bitcoin Runes
- **Order Tracking**: Real-time order status updates via WebSocket
- **Wallet Integration**: Support for multiple Bitcoin wallets (Unisat, Xverse, OYL, MagicEden)
- **Order Management**: Cancel orders, view order history, and track active orders
- **Fee Estimation**: Real-time fee calculation for orders
- **Market Data**: Real-time market data and order book information

## Architecture

### Core Components

1. **RunesDXService** (`/src/services/RunesDXService.ts`)
   - Main API service for RUNESDX.IO integration
   - Handles HTTP requests and WebSocket connections
   - Provides caching and error handling

2. **useRunesDXOrders Hook** (`/src/hooks/runes/useRunesDXOrders.ts`)
   - React hook for order management
   - Integrates with wallet for signing
   - Provides order state management

3. **RunesTradingTerminal** (`/src/components/runes/professional/RunesTradingTerminal.tsx`)
   - Updated trading interface with RUNESDX.IO integration
   - Real-time order book and market data
   - Order placement and tracking UI

4. **OrderConfirmationModal** (`/src/components/runes/OrderConfirmationModal.tsx`)
   - Detailed order confirmation and tracking
   - Fee breakdown and transaction details

## API Endpoints

### Base Configuration

```typescript
const config = {
  baseUrl: 'https://api.runesdx.io/v1',
  websocketUrl: 'wss://ws.runesdx.io/v1',
  network: 'mainnet',
  timeout: 15000
};
```

### Order Placement

**Endpoint**: `POST /orders`

**Request Body**:
```typescript
{
  type: 'market' | 'limit',
  side: 'buy' | 'sell',
  runeSymbol: string,
  amount: string,
  price?: string, // Required for limit orders
  slippageTolerance?: number,
  walletAddress: string,
  signature: string,
  publicKey: string,
  clientId?: string,
  timestamp: number,
  source: 'cypher-terminal'
}
```

**Response**:
```typescript
{
  success: boolean,
  orderId?: string,
  order?: RunesDXOrder,
  error?: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Order Status

**Endpoint**: `GET /orders/{orderId}`

**Response**:
```typescript
{
  order: RunesDXOrder
}
```

### Cancel Order

**Endpoint**: `DELETE /orders/{orderId}`

**Request Body**:
```typescript
{
  signature: string
}
```

### Market Data

**Endpoint**: `GET /market/{symbol}`

**Response**:
```typescript
{
  symbol: string,
  currentPrice: string,
  priceChange24h: string,
  volume24h: string,
  liquidity: string,
  spread: string,
  lastUpdated: string
}
```

### Order Book

**Endpoint**: `GET /orderbook/{symbol}`

**Response**:
```typescript
{
  symbol: string,
  bids: Array<{
    price: string,
    quantity: string,
    total: string
  }>,
  asks: Array<{
    price: string,
    quantity: string,
    total: string
  }>,
  spread: string,
  lastUpdated: string
}
```

### Fee Estimation

**Endpoint**: `POST /orders/estimate-fees`

**Request Body**:
```typescript
{
  type: 'market' | 'limit',
  side: 'buy' | 'sell',
  runeSymbol: string,
  amount: string,
  price?: string,
  walletAddress: string
}
```

**Response**:
```typescript
{
  fees: {
    networkFee: string,
    tradingFee: string,
    total: string
  }
}
```

## WebSocket Integration

### Connection

The service automatically establishes a WebSocket connection for real-time updates:

```typescript
const ws = new WebSocket('wss://ws.runesdx.io/v1');
```

### Message Types

1. **Order Updates**:
```typescript
{
  type: 'order_update',
  orderId: string,
  order: RunesDXOrder
}
```

2. **Market Data Updates**:
```typescript
{
  type: 'market_data',
  symbol: string,
  data: RunesDXMarketData
}
```

3. **Order Book Updates**:
```typescript
{
  type: 'orderbook_update',
  symbol: string,
  data: RunesDXOrderBook
}
```

### Subscriptions

To subscribe to order updates:
```typescript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'orders',
  orderId: 'order-id-here'
}));
```

## Wallet Integration

### Supported Wallets

- **Unisat**: `await wallet.signMessage(message)`
- **Xverse**: `await wallet.request('signMessage', { message })`
- **OYL**: `await wallet.signMessage(message)`
- **MagicEden**: `await wallet.signMessage(message)`

### Order Signing

Orders are signed using a standardized message format:

```
RUNESDX ORDER
Type: MARKET
Side: BUY
Rune: DOG•GO•TO•THE•MOON
Amount: 1000
Address: bc1q...
Timestamp: 1234567890
```

### Signature Verification

The RUNESDX.IO API verifies signatures to ensure order authenticity and prevent replay attacks.

## Error Handling

### Common Error Codes

- `ORDER_PLACEMENT_FAILED`: General order placement failure
- `INSUFFICIENT_BALANCE`: Not enough funds for the order
- `INVALID_SIGNATURE`: Order signature verification failed
- `MARKET_CLOSED`: Trading is temporarily unavailable
- `RATE_LIMITED`: Too many requests

### Error Recovery

The service implements automatic retry logic with exponential backoff for transient failures.

## Usage Examples

### Basic Order Placement

```typescript
import { useRunesDXOrders } from '@/hooks/runes/useRunesDXOrders';

function TradingComponent() {
  const { placeOrder, isPlacingOrder } = useRunesDXOrders();

  const handleBuyOrder = async () => {
    try {
      const response = await placeOrder({
        type: 'market',
        side: 'buy',
        runeSymbol: 'DOG•GO•TO•THE•MOON',
        amount: '1000',
        slippageTolerance: 0.5
      });
      
      if (response.success) {
        console.log('Order placed:', response.orderId);
      }
    } catch (error) {
      console.error('Order failed:', error);
    }
  };

  return (
    <button 
      onClick={handleBuyOrder}
      disabled={isPlacingOrder}
    >
      {isPlacingOrder ? 'Placing...' : 'Buy Runes'}
    </button>
  );
}
```

### Order Tracking

```typescript
import { useEffect } from 'react';
import { runesDXService } from '@/services/RunesDXService';

function OrderTracker({ orderId }) {
  useEffect(() => {
    const handleOrderUpdate = (order) => {
      console.log('Order updated:', order);
    };

    runesDXService.subscribeToOrderUpdates(orderId, handleOrderUpdate);

    return () => {
      runesDXService.unsubscribeFromOrderUpdates(orderId);
    };
  }, [orderId]);

  return <div>Tracking order {orderId}</div>;
}
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_RUNESDX_API_KEY=your_api_key_here
NEXT_PUBLIC_RUNESDX_BASE_URL=https://api.runesdx.io/v1
NEXT_PUBLIC_RUNESDX_WS_URL=wss://ws.runesdx.io/v1
```

### Service Configuration

```typescript
import { RunesDXService } from '@/services/RunesDXService';

const runesDXService = new RunesDXService({
  baseUrl: process.env.NEXT_PUBLIC_RUNESDX_BASE_URL,
  apiKey: process.env.NEXT_PUBLIC_RUNESDX_API_KEY,
  websocketUrl: process.env.NEXT_PUBLIC_RUNESDX_WS_URL,
  network: 'mainnet',
  timeout: 15000,
  enableWebsocket: true,
  maxRetries: 3
});
```

## Security Considerations

1. **API Key Protection**: Store API keys securely and never expose them in client code
2. **Signature Validation**: All orders must be signed by the user's wallet
3. **Rate Limiting**: Respect API rate limits to avoid service disruption
4. **Input Validation**: Validate all user inputs before sending to the API
5. **Error Handling**: Never expose sensitive error details to users

## Testing

### Mock Implementation

For development and testing, the service can be configured to use mock data:

```typescript
const mockService = new RunesDXService({
  baseUrl: 'http://localhost:3001/mock-api',
  enableWebsocket: false
});
```

### Test Coverage

- Unit tests for service methods
- Integration tests for wallet signing
- End-to-end tests for order placement flow
- WebSocket connection tests

## Deployment

### Production Checklist

- [ ] API keys configured
- [ ] WebSocket connections tested
- [ ] Error monitoring enabled
- [ ] Rate limiting configured
- [ ] Security headers in place
- [ ] SSL/TLS certificates valid

### Monitoring

Monitor key metrics:
- Order placement success rate
- API response times
- WebSocket connection stability
- Error rates by type
- User engagement metrics

## Future Enhancements

1. **Advanced Order Types**: Stop-loss, take-profit orders
2. **Portfolio Integration**: Real-time portfolio tracking
3. **Price Alerts**: Notifications for price movements
4. **Trading Bots**: Automated trading strategies
5. **Analytics**: Advanced trading analytics and reporting

## Support

For technical support or API issues:
- Documentation: https://docs.runesdx.io
- Support: support@runesdx.io
- Status: https://status.runesdx.io

## License

This integration is part of the Cypher Terminal project and follows the same licensing terms.