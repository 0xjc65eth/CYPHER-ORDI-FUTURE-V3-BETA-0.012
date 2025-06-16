// Configuração centralizada de segurança
export const SECURITY_CONFIG = {
  // HashiCorp Vault
  vault: {
    endpoint: process.env.VAULT_ENDPOINT || 'http://127.0.0.1:8200',
    token: process.env.VAULT_TOKEN,
    namespace: process.env.VAULT_NAMESPACE || 'cypher-ai',
    paths: {
      apiKeys: 'secret/api-keys',
      certificates: 'secret/certificates',
      twoFactor: 'secret/2fa',
      mfa: 'secret/mfa',
      audit: 'audit/events',
    },
  },

  // Redis para Rate Limiting
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    prefix: 'cypher:security:',
    ttl: {
      rateLimit: 3600, // 1 hora
      blacklist: 86400, // 24 horas
      session: 7200, // 2 horas
    },
  },

  // Rate Limiting
  rateLimit: {
    // Limites globais
    global: {
      windowMs: 60000, // 1 minuto
      maxRequests: 100,
    },
    // Limites por endpoint
    endpoints: {
      '/api/auth': {
        windowMs: 300000, // 5 minutos
        maxRequests: 5,
      },
      '/api/trading': {
        windowMs: 1000, // 1 segundo
        maxRequests: 10,
      },
      '/api/wallet': {
        windowMs: 60000, // 1 minuto
        maxRequests: 20,
      },
      '/api/analytics': {
        windowMs: 10000, // 10 segundos
        maxRequests: 50,
      },
    },
    // Token bucket para APIs críticas
    tokenBucket: {
      trading: {
        capacity: 100,
        refillRate: 10, // tokens por segundo
      },
      wallet: {
        capacity: 50,
        refillRate: 5,
      },
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production',
    algorithm: 'HS256' as const,
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    issuer: 'cypher-ai',
    audience: 'cypher-ai-users',
  },

  // CSRF
  csrf: {
    tokenLength: 32,
    cookieName: '_csrf',
    headerName: 'x-csrf-token',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
  },

  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-2FA-Token',
      'X-Request-ID',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: 86400, // 24 horas
  },

  // 2FA/MFA
  twoFactor: {
    issuer: 'Cypher AI',
    algorithm: 'SHA256',
    digits: 6,
    period: 30,
    window: 2, // tolerância de tempo
    backupCodes: 8,
    backupCodeLength: 8,
  },

  // Criptografia
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: {
      algorithm: 'scrypt',
      saltLength: 32,
      keyLength: 32,
      N: 16384,
      r: 8,
      p: 1,
    },
  },

  // Validação de entrada
  validation: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
    allowedFileExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.pdf',
    ],
  },

  // Headers de segurança
  headers: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': [
        "'self'",
        'https://api.coingecko.com',
        'wss://stream.binance.com',
        'https://mempool.space',
        'https://api.binance.com',
      ],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // Logs e auditoria
  audit: {
    enabled: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'apiKey',
      'privateKey',
      'seed',
      'mnemonic',
    ],
  },

  // Sessões
  session: {
    name: 'cypher-session',
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },

  // Throttling para operações sensíveis
  throttle: {
    login: {
      maxAttempts: 5,
      windowMs: 900000, // 15 minutos
      blockDuration: 3600000, // 1 hora
    },
    withdrawal: {
      maxAttempts: 3,
      windowMs: 3600000, // 1 hora
      blockDuration: 86400000, // 24 horas
    },
    apiKey: {
      maxAttempts: 10,
      windowMs: 600000, // 10 minutos
      blockDuration: 1800000, // 30 minutos
    },
  },
};

// Funções auxiliares
export function getEndpointRateLimit(path: string) {
  // Encontrar configuração mais específica
  for (const [endpoint, config] of Object.entries(SECURITY_CONFIG.rateLimit.endpoints)) {
    if (path.startsWith(endpoint)) {
      return config;
    }
  }
  return SECURITY_CONFIG.rateLimit.global;
}

export function getCSPHeader(): string {
  const csp = SECURITY_CONFIG.headers.contentSecurityPolicy;
  return Object.entries(csp)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

export function getHSTSHeader(): string {
  const { maxAge, includeSubDomains, preload } = SECURITY_CONFIG.headers.hsts;
  let header = `max-age=${maxAge}`;
  if (includeSubDomains) header += '; includeSubDomains';
  if (preload) header += '; preload';
  return header;
}

export function shouldAuditField(fieldName: string): boolean {
  return !SECURITY_CONFIG.audit.sensitiveFields.some(sensitive => 
    fieldName.toLowerCase().includes(sensitive.toLowerCase())
  );
}