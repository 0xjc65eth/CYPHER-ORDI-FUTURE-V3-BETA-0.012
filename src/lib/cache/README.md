# 🚀 Sistema de Cache - CYPHER ORDI FUTURE

## Visão Geral

Sistema de cache híbrido implementado com Redis (Upstash) e fallback para cache em memória. Otimizado para reduzir latência e custos de API.

## Configuração

### 1. Variáveis de Ambiente

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
NEXT_PUBLIC_CACHE_ENABLED=true
```

### 2. TTLs Configurados

```typescript
ttl: {
  default: 300,    // 5 minutos
  prices: 60,      // 1 minuto
  ordinals: 600,   // 10 minutos
  mining: 300,     // 5 minutos
  analytics: 1800, // 30 minutos
}
```

## Uso Básico

### 1. Em Serviços (Backend)

```typescript
import { cacheService, cacheKeys, cacheTTL } from '@/lib/cache';

// Obter ou computar valor
const data = await cacheService.getOrCompute(
  cacheKeys.bitcoinPrice(),
  async () => await fetchBitcoinPrice(),
  cacheTTL.prices
);
```

### 2. Em Componentes (Frontend)

```typescript
import { useBitcoinPrice } from '@/hooks/cache';

function PriceDisplay() {
  const { data, loading, error, refetch } = useBitcoinPrice();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Bitcoin: ${data.price}</div>;
}
```

## Funcionalidades

### Cache Service

- `get<T>(key)` - Obter valor do cache
- `set<T>(key, value, ttl?)` - Salvar no cache
- `delete(key)` - Deletar chave
- `clearPattern(pattern)` - Limpar por padrão
- `getOrCompute<T>(key, fn, ttl?)` - Cache-aside pattern

### Hooks Disponíveis

- `useCache<T>(key, fetcher, options)` - Hook genérico
- `useBitcoinPrice()` - Preço do Bitcoin
- `useBitcoinChart(days)` - Gráfico de mercado

## Monitoramento

Use o componente `<CacheStatus />` para visualizar:
- Status da conexão Redis
- Número de chaves em cache
- Lista de chaves ativas

## Performance

- **Cache Hit (Redis)**: ~5-10ms
- **Cache Hit (Memory)**: <1ms
- **Cache Miss**: Tempo da API + overhead

## Troubleshooting

### Redis não conecta
- Verificar variáveis de ambiente
- Sistema continua funcionando com cache em memória

### Cache não atualiza
- Verificar TTL configurado
- Usar `invalidate()` para forçar atualização

### Memória alta
- Cache em memória é limpo automaticamente a cada 5 minutos
- Ajustar TTLs se necessário
