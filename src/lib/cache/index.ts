// Exportações centralizadas do sistema de cache
export { cacheService, cacheKeys, cacheTTL } from './cache.service';
export { redis, CACHE_CONFIG } from './redis.config';
export { redis as getRedisClient } from './redis.config';
export { CACHE_CONFIG as redisConfig } from './redis.config';

// Re-exportar helpers comuns
export const CACHE_ENABLED = process.env.NEXT_PUBLIC_CACHE_ENABLED !== 'false';

// Função helper para invalidar cache relacionado
export async function invalidateRelatedCache(patterns: string[]) {
  const { cacheService } = await import('./cache.service');
  await Promise.all(patterns.map(pattern => cacheService.clearPattern(pattern)));
}
