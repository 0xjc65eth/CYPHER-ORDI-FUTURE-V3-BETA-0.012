# CYPHER ORDI FUTURE v3.1.0 - Wallet APIs Documentation

Sistema robusto de APIs para buscar dados de carteiras Bitcoin, Ordinals e Runes com múltiplos fallbacks, cache inteligente e rate limiting.

## 🚀 Funcionalidades Principais

- **Múltiplos Fallbacks**: APIs integradas com Hiro, Mempool.space, Blockstream, OrdScan
- **Cache Inteligente**: Sistema de cache em Redis + memória com TTL otimizado
- **Rate Limiting**: Controle automático de requisições por provider
- **Error Handling**: Tratamento robusto de erros com fallbacks automáticos
- **Monitoramento**: APIs de status e health check em tempo real

## 📚 APIs Disponíveis

### 1. Bitcoin Balance API

Busca o saldo Bitcoin de um endereço com múltiplos fallbacks.

```bash
# Buscar saldo de um endereço
GET /api/bitcoin/balance?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Forçar refresh (ignorar cache)
GET /api/bitcoin/balance?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&refresh=true

# Batch request (múltiplos endereços)
POST /api/bitcoin/balance
{
  "addresses": [
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "confirmed": 50000000,
    "unconfirmed": 0,
    "total": 50000000,
    "utxoCount": 5
  },
  "cached": true,
  "source": "Hiro"
}
```

### 2. Bitcoin Transactions API

Busca histórico de transações Bitcoin com paginação.

```bash
# Buscar transações de um endereço
GET /api/bitcoin/transactions?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Com paginação
GET /api/bitcoin/transactions?address=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh&page=0&limit=20
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "transactions": [
      {
        "txid": "abc123...",
        "blockHeight": 800000,
        "blockTime": 1684567890,
        "confirmations": 6,
        "fee": 1500,
        "value": 50000000,
        "type": "incoming",
        "confirmed": true,
        "inputs": [...],
        "outputs": [...]
      }
    ],
    "totalCount": 250,
    "page": 0,
    "limit": 20,
    "hasMore": true
  },
  "pagination": {
    "page": 0,
    "limit": 20,
    "total": 250,
    "hasMore": true
  }
}
```

### 3. Ordinals Address API

Busca Ordinals/Inscriptions de um endereço.

```bash
# Buscar ordinals de um endereço
GET /api/ordinals/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Com paginação e metadados
GET /api/ordinals/address/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?page=0&limit=50&metadata=true
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "total_inscriptions": 15,
    "inscriptions": [
      {
        "id": "abc123...i0",
        "number": 12345,
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "content_type": "image/png",
        "content_length": 2048,
        "sat": 1234567890,
        "satpoint": "abc123...i0:1234567890",
        "location": "abc123...i0:0",
        "output": "abc123...i0:0",
        "output_value": 546,
        "timestamp": 1684567890,
        "genesis_height": 800000,
        "collection": {
          "id": "bitcoin-punks",
          "name": "Bitcoin Punks",
          "slug": "bitcoin-punks",
          "floor_price": 5000000
        },
        "traits": [...]
      }
    ],
    "collections": [
      {
        "id": "bitcoin-punks",
        "name": "Bitcoin Punks",
        "count": 5,
        "floor_price": 5000000
      }
    ],
    "page": 0,
    "limit": 50,
    "has_more": false
  }
}
```

### 4. Runes Balance API

Busca balances de Runes de um endereço.

```bash
# Buscar runes de um endereço
GET /api/runes/balances/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Com dados de mercado
GET /api/runes/balances/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?market=true

# Batch request para runes específicas
POST /api/runes/balances/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
{
  "rune_ids": ["1:0", "2:1", "3:5"]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "total_runes": 8,
    "total_value_btc": 1.5,
    "balances": [
      {
        "rune": "UNCOMMON•GOODS",
        "rune_id": "1:0",
        "symbol": "UG",
        "balance": "1000000000",
        "decimal_balance": 10.0,
        "decimals": 8,
        "divisibility": 8,
        "number": 1,
        "deployed_at": {
          "block_height": 840000,
          "tx_id": "abc123...",
          "timestamp": 1684567890
        },
        "market_data": {
          "floor_price": 0.001,
          "market_cap": 1000000,
          "volume_24h": 50000,
          "holders": 1234
        }
      }
    ],
    "page": 0,
    "limit": 50,
    "has_more": false,
    "last_updated": 1684567890000
  }
}
```

### 5. Status & Monitoring API

Monitora o status das APIs, cache e rate limiting.

```bash
# Status geral do sistema
GET /api/wallet-apis/status

# Status detalhado
GET /api/wallet-apis/status?detailed=true

# Status de um provider específico
GET /api/wallet-apis/status?provider=hiro
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "overall_status": "healthy",
    "timestamp": 1684567890000,
    "cache": {
      "redis_available": true,
      "memory_cache_size": 156,
      "memory_keys_sample": ["wallet:bitcoin:balance:bc1q...", "..."]
    },
    "apis": [
      {
        "provider": "hiro",
        "endpoint": "balance",
        "status": "healthy",
        "responseTime": 250,
        "successRate": 0.98,
        "lastSuccess": 1684567880000,
        "totalRequests": 1234,
        "rateLimitStatus": {
          "requests": 45,
          "remaining": 455,
          "resetTime": 1684568490000,
          "blocked": false
        }
      }
    ],
    "system_metrics": {
      "uptime": 86400,
      "total_requests": 5678,
      "avg_response_time": 285
    }
  }
}
```

**Ações de Manutenção:**
```bash
# Limpar cache por padrão
POST /api/wallet-apis/status
{
  "action": "clear_cache",
  "pattern": "wallet:bitcoin:*"
}

# Pré-aquecer cache para um endereço
POST /api/wallet-apis/status
{
  "action": "warmup_cache",
  "target": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}

# Obter saúde de um provider
POST /api/wallet-apis/status
{
  "action": "get_health",
  "target": "hiro"
}
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Hiro API
HIRO_API_URL=https://api.hiro.so
HIRO_API_KEY=your_hiro_api_key

# UniSat API (opcional)
UNISAT_API_KEY=your_unisat_api_key

# Cache Redis (opcional)
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_CACHE_ENABLED=true
```

### Rate Limits Configurados

- **Hiro**: 500 requests / 10 minutos
- **Mempool.space**: 10 requests / minuto  
- **Blockstream**: 100 requests / minuto
- **OrdScan**: 300 requests / hora

### Cache TTL Configurado

- **Balance**: 30 segundos
- **Transactions**: 60 segundos
- **Ordinals**: 5 minutos (300s)
- **Runes**: 3 minutos (180s)
- **Metadata**: 1 hora (3600s)

## 🛡️ Recursos de Segurança

1. **Validação de Endereços**: Validação rigorosa de formatos Bitcoin
2. **Rate Limiting**: Controle automático por provider
3. **Input Sanitization**: Sanitização de todos os inputs
4. **Error Boundaries**: Tratamento robusto de erros
5. **Timeout Protection**: Timeouts configurados para todas as requisições

## 📊 Monitoramento

- **Health Checks**: APIs respondem com status de saúde
- **Performance Metrics**: Tempo de resposta e taxa de sucesso
- **Cache Monitoring**: Status do cache Redis e memória
- **Rate Limit Tracking**: Monitoramento de limites por provider

## 🚨 Error Handling

Todas as APIs implementam:
- Fallback automático entre providers
- Cache inteligente para reduzir falhas
- Logs detalhados para debugging
- Responses padronizados com códigos HTTP apropriados

## 🔄 Fallback Strategy

1. **Primeira tentativa**: Provider primário (Hiro)
2. **Segunda tentativa**: Provider secundário (Mempool/OrdScan)
3. **Terceira tentativa**: Provider terciário (Blockstream)
4. **Cache Fallback**: Retorna dados em cache se disponível
5. **Error Response**: Retorna erro estruturado se tudo falhar

Este sistema garante alta disponibilidade e confiabilidade para todas as operações de carteira Bitcoin, Ordinals e Runes.