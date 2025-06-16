import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { z } from 'zod';

interface ValidationRule {
  type: 'string' | 'number' | 'email' | 'url' | 'bitcoin' | 'uuid' | 'json' | 'custom';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitize?: boolean;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string>;
  sanitized?: Record<string, any>;
}

export class InputValidator {
  private readonly bitcoinAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  private readonly ordinalsIdRegex = /^[a-f0-9]{64}i\d+$/;
  private readonly runeIdRegex = /^[A-Z]+$/;
  
  /**
   * Validate input against a schema
   */
  validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};
    const sanitized: Record<string, any> = {};
    
    // Check for unknown fields
    const schemaKeys = Object.keys(schema);
    const dataKeys = Object.keys(data || {});
    const unknownKeys = dataKeys.filter(key => !schemaKeys.includes(key));
    
    if (unknownKeys.length > 0) {
      errors._unknown = `Unknown fields: ${unknownKeys.join(', ')}`;
    }
    
    // Validate each field
    for (const [field, rule] of Object.entries(schema)) {
      const value = data?.[field];
      
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      // Skip validation for optional empty fields
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Validate based on type
      const validation = this.validateField(field, value, rule);
      
      if (!validation.valid) {
        errors[field] = validation.error!;
      } else if (rule.sanitize !== false) {
        sanitized[field] = validation.sanitized || value;
      } else {
        sanitized[field] = value;
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      sanitized
    };
  }
  
  /**
   * Validate a single field
   */
  private validateField(field: string, value: any, rule: ValidationRule): {
    valid: boolean;
    error?: string;
    sanitized?: any;
  } {
    switch (rule.type) {
      case 'string':
        return this.validateString(field, value, rule);
        
      case 'number':
        return this.validateNumber(field, value, rule);
        
      case 'email':
        return this.validateEmail(field, value);
        
      case 'url':
        return this.validateURL(field, value);
        
      case 'bitcoin':
        return this.validateBitcoinAddress(field, value);
        
      case 'uuid':
        return this.validateUUID(field, value);
        
      case 'json':
        return this.validateJSON(field, value);
        
      case 'custom':
        if (!rule.customValidator) {
          return { valid: false, error: 'Custom validator not provided' };
        }
        return {
          valid: rule.customValidator(value),
          error: rule.customValidator(value) ? undefined : `${field} validation failed`
        };
        
      default:
        return { valid: false, error: `Unknown validation type: ${rule.type}` };
    }
  }
  
  /**
   * Validate string input
   */
  private validateString(field: string, value: any, rule: ValidationRule): {
    valid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string` };
    }
    
    let sanitized = this.sanitizeInput(value);
    
    if (rule.min && sanitized.length < rule.min) {
      return { valid: false, error: `${field} must be at least ${rule.min} characters` };
    }
    
    if (rule.max && sanitized.length > rule.max) {
      return { valid: false, error: `${field} must be at most ${rule.max} characters` };
    }
    
    if (rule.pattern && !rule.pattern.test(sanitized)) {
      return { valid: false, error: `${field} format is invalid` };
    }
    
    return { valid: true, sanitized };
  }
  
  /**
   * Validate number input
   */
  private validateNumber(field: string, value: any, rule: ValidationRule): {
    valid: boolean;
    error?: string;
    sanitized?: number;
  } {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { valid: false, error: `${field} must be a number` };
    }
    
    if (rule.min !== undefined && num < rule.min) {
      return { valid: false, error: `${field} must be at least ${rule.min}` };
    }
    
    if (rule.max !== undefined && num > rule.max) {
      return { valid: false, error: `${field} must be at most ${rule.max}` };
    }
    
    return { valid: true, sanitized: num };
  }
  
  /**
   * Validate email address
   */
  private validateEmail(field: string, value: any): {
    valid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string` };
    }
    
    const sanitized = value.trim().toLowerCase();
    
    if (!validator.isEmail(sanitized)) {
      return { valid: false, error: `${field} must be a valid email address` };
    }
    
    return { valid: true, sanitized };
  }
  
  /**
   * Validate URL
   */
  private validateURL(field: string, value: any): {
    valid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string` };
    }
    
    const sanitized = value.trim();
    
    if (!validator.isURL(sanitized, { protocols: ['http', 'https'] })) {
      return { valid: false, error: `${field} must be a valid URL` };
    }
    
    return { valid: true, sanitized };
  }
  
  /**
   * Validate Bitcoin address
   */
  private validateBitcoinAddress(field: string, value: any): {
    valid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string` };
    }
    
    const sanitized = value.trim();
    
    if (!this.bitcoinAddressRegex.test(sanitized)) {
      return { valid: false, error: `${field} must be a valid Bitcoin address` };
    }
    
    return { valid: true, sanitized };
  }
  
  /**
   * Validate UUID
   */
  private validateUUID(field: string, value: any): {
    valid: boolean;
    error?: string;
    sanitized?: string;
  } {
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a string` };
    }
    
    const sanitized = value.trim().toLowerCase();
    
    if (!validator.isUUID(sanitized)) {
      return { valid: false, error: `${field} must be a valid UUID` };
    }
    
    return { valid: true, sanitized };
  }
  
  /**
   * Validate JSON
   */
  private validateJSON(field: string, value: any): {
    valid: boolean;
    error?: string;
    sanitized?: any;
  } {
    if (typeof value === 'object') {
      return { valid: true, sanitized: value };
    }
    
    if (typeof value !== 'string') {
      return { valid: false, error: `${field} must be a valid JSON string or object` };
    }
    
    try {
      const parsed = JSON.parse(value);
      return { valid: true, sanitized: parsed };
    } catch {
      return { valid: false, error: `${field} must be valid JSON` };
    }
  }
  
  /**
   * Sanitize HTML input
   */
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title', 'target']
    });
  }
  
  /**
   * Sanitize general input
   */
  sanitizeInput(input: string): string {
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Escape HTML entities
    sanitized = validator.escape(sanitized);
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    return sanitized;
  }
  
  /**
   * Validate file upload
   */
  validateFileUpload(file: File, options: {
    allowedTypes?: string[];
    maxSize?: number; // in bytes
  }): ValidationResult {
    const errors: Record<string, string> = {};
    
    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.type = `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`;
    }
    
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / 1024 / 1024).toFixed(2);
      errors.size = `File size exceeds maximum allowed size of ${maxSizeMB}MB`;
    }
    
    // Check filename
    const sanitizedName = this.sanitizeFilename(file.name);
    if (sanitizedName !== file.name) {
      errors.name = 'Filename contains invalid characters';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };
  }
  
  /**
   * Sanitize filename
   */
  sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');
    
    // Remove special characters except for dot and hyphen
    sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Ensure it doesn't start with a dot
    if (sanitized.startsWith('.')) {
      sanitized = '_' + sanitized.substring(1);
    }
    
    return sanitized;
  }
  
  /**
   * Create a Zod schema for complex validation
   */
  createZodSchema(schema: ValidationSchema) {
    const zodSchema: Record<string, any> = {};
    
    for (const [field, rule] of Object.entries(schema)) {
      let fieldSchema: any;
      
      switch (rule.type) {
        case 'string':
          fieldSchema = z.string();
          if (rule.min) fieldSchema = fieldSchema.min(rule.min);
          if (rule.max) fieldSchema = fieldSchema.max(rule.max);
          if (rule.pattern) fieldSchema = fieldSchema.regex(rule.pattern);
          break;
          
        case 'number':
          fieldSchema = z.number();
          if (rule.min !== undefined) fieldSchema = fieldSchema.min(rule.min);
          if (rule.max !== undefined) fieldSchema = fieldSchema.max(rule.max);
          break;
          
        case 'email':
          fieldSchema = z.string().email();
          break;
          
        case 'url':
          fieldSchema = z.string().url();
          break;
          
        case 'uuid':
          fieldSchema = z.string().uuid();
          break;
          
        default:
          fieldSchema = z.any();
      }
      
      if (!rule.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      zodSchema[field] = fieldSchema;
    }
    
    return z.object(zodSchema);
  }
}

/**
 * Pre-defined validation schemas
 */
export const ValidationSchemas = {
  // User registration
  userRegistration: {
    email: { type: 'email' as const, required: true },
    password: { 
      type: 'string' as const, 
      required: true, 
      min: 8, 
      max: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    username: { type: 'string' as const, required: true, min: 3, max: 30 },
    terms: { type: 'custom' as const, required: true, customValidator: (v) => v === true }
  },
  
  // Trading order
  tradingOrder: {
    symbol: { type: 'string' as const, required: true, pattern: /^[A-Z]+$/ },
    side: { type: 'custom' as const, required: true, customValidator: (v) => ['buy', 'sell'].includes(v) },
    amount: { type: 'number' as const, required: true, min: 0.00000001 },
    price: { type: 'number' as const, required: false, min: 0 },
    type: { type: 'custom' as const, required: true, customValidator: (v) => ['market', 'limit'].includes(v) }
  },
  
  // Wallet operation
  walletOperation: {
    address: { type: 'bitcoin' as const, required: true },
    amount: { type: 'number' as const, required: true, min: 0.00000546 }, // Bitcoin dust limit
    memo: { type: 'string' as const, required: false, max: 100 }
  },
  
  // API key creation
  apiKeyCreation: {
    name: { type: 'string' as const, required: true, min: 3, max: 50 },
    permissions: { type: 'json' as const, required: true },
    expiresAt: { type: 'string' as const, required: false }
  }
};

/**
 * Input sanitization utilities
 */
export const SanitizationUtils = {
  /**
   * Sanitize SQL input (prevent SQL injection)
   */
  sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '');
  },
  
  /**
   * Sanitize MongoDB input (prevent NoSQL injection)
   */
  sanitizeMongoDB(input: any): any {
    if (typeof input !== 'object') return input;
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (key.startsWith('$')) continue; // Remove MongoDB operators
      sanitized[key] = typeof value === 'object' ? SanitizationUtils.sanitizeMongoDB(value) : value;
    }
    
    return sanitized;
  },
  
  /**
   * Sanitize path input (prevent path traversal)
   */
  sanitizePath(path: string): string {
    return path.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\/\-_.]/g, '');
  }
};