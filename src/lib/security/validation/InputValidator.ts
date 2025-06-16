import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logger';

// Schemas comuns de validação
export const CommonSchemas = {
  // IDs e identificações
  userId: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  
  // Cripto e blockchain
  bitcoinAddress: z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/),
  ethereumAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  
  // Valores numéricos
  amount: z.number().positive().finite(),
  price: z.number().positive().finite(),
  percentage: z.number().min(0).max(100),
  
  // Strings seguras
  safeString: z.string().transform(val => DOMPurify.sanitize(val)),
  alphanumeric: z.string().regex(/^[a-zA-Z0-9]+$/),
  
  // Data e tempo
  timestamp: z.number().int().positive(),
  dateString: z.string().datetime(),
  
  // Arrays e objetos
  stringArray: z.array(z.string()),
  numberArray: z.array(z.number()),
};

// Schemas de API
export const APISchemas = {
  // Trading
  tradeOrder: z.object({
    symbol: z.string().toUpperCase(),
    side: z.enum(['buy', 'sell']),
    type: z.enum(['market', 'limit', 'stop-loss', 'take-profit']),
    amount: CommonSchemas.amount,
    price: CommonSchemas.price.optional(),
    stopPrice: CommonSchemas.price.optional(),
    timeInForce: z.enum(['GTC', 'IOC', 'FOK']).optional(),
  }),
  
  // Wallet
  withdrawal: z.object({
    address: CommonSchemas.bitcoinAddress,
    amount: CommonSchemas.amount,
    memo: CommonSchemas.safeString.optional(),
    twoFactorToken: z.string().length(6).optional(),
  }),
  
  // User
  userProfile: z.object({
    username: CommonSchemas.username,
    email: CommonSchemas.email,
    fullName: CommonSchemas.safeString.max(100),
    bio: CommonSchemas.safeString.max(500).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      language: z.enum(['en', 'pt', 'es']),
      notifications: z.boolean(),
    }).optional(),
  }),
  
  // Analytics
  analyticsQuery: z.object({
    metric: z.enum(['price', 'volume', 'trades', 'users']),
    timeframe: z.enum(['1h', '24h', '7d', '30d', '1y']),
    startDate: CommonSchemas.dateString.optional(),
    endDate: CommonSchemas.dateString.optional(),
    groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
  }),
};

// Classe principal de validação
export class InputValidator {
  // Validar e sanitizar entrada
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
  } {
    try {
      const validated = schema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        logger.warn('Input validation failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Validation failed' };
    }
  }
  
  // Sanitizar HTML
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }
  
  // Validar SQL injection
  static isSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\-\-)|(;)|(\|\|)|(\*)|(\?))/i,
      /(union|select|insert|update|delete|drop|create|alter|exec|script)/i,
      /(script|javascript|vbscript|onload|onerror|onclick)/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
  
  // Validar XSS
  static isXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }
  
  // Validar path traversal
  static isPathTraversal(path: string): boolean {
    const traversalPatterns = [
      /\.\.\//, // ../
      /\.\.\\/,  // ..\\
      /%2e%2e/i, // URL encoded
      /\x2e\x2e/, // Hex encoded
    ];
    
    return traversalPatterns.some(pattern => pattern.test(path));
  }
  
  // Validar command injection
  static isCommandInjection(input: string): boolean {
    const commandPatterns = [
      /[;&|`$()]/,
      /(\||\||&&|;|`|\$\(|\))/,
      /(cat|ls|pwd|whoami|curl|wget|nc|bash|sh)/i,
    ];
    
    return commandPatterns.some(pattern => pattern.test(input));
  }
  
  // Validar arquivo upload
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): {
    valid: boolean;
    error?: string;
  } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB padrão
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
    } = options;
    
    // Verificar tamanho
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }
    
    // Verificar tipo MIME
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    // Verificar extensão
    const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' };
    }
    
    // Verificar nome malicioso
    if (this.isPathTraversal(file.name) || this.isCommandInjection(file.name)) {
      return { valid: false, error: 'Invalid file name' };
    }
    
    return { valid: true };
  }
  
  // Criar schema customizado com validações de segurança
  static createSecureSchema<T extends z.ZodRawShape>(shape: T) {
    return z.object(shape).superRefine((data, ctx) => {
      // Verificar cada string no objeto
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          if (this.isSQLInjection(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Potential SQL injection detected in ${key}`,
            });
          }
          
          if (this.isXSS(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Potential XSS detected in ${key}`,
            });
          }
          
          if (key.toLowerCase().includes('path') && this.isPathTraversal(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Path traversal detected in ${key}`,
            });
          }
        }
      });
    });
  }
  
  // Validar requisição completa
  static validateRequest(request: {
    body?: unknown;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validar query params
    if (request.query) {
      Object.entries(request.query).forEach(([key, value]) => {
        if (this.isSQLInjection(value) || this.isXSS(value)) {
          errors.push(`Invalid query parameter: ${key}`);
        }
      });
    }
    
    // Validar headers
    if (request.headers) {
      const dangerousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
      Object.keys(request.headers).forEach(header => {
        if (dangerousHeaders.includes(header.toLowerCase())) {
          errors.push(`Dangerous header detected: ${header}`);
        }
      });
    }
    
    // Validar params
    if (request.params) {
      Object.entries(request.params).forEach(([key, value]) => {
        if (this.isPathTraversal(value)) {
          errors.push(`Path traversal in parameter: ${key}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}