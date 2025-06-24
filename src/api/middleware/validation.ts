/**
 * Request Validation Middleware
 * Comprehensive validation for API requests
 */

import { Request, Response, NextFunction } from 'express';
import { EnhancedLogger } from '@/lib/enhanced-logger';


export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationOptions {
  sanitize?: boolean;
  allowExtra?: boolean;
  strict?: boolean;
}

/**
 * Simple validation middleware for required fields
 */
export const validateRequest = (requiredFields: string[], options: ValidationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = [];
      const body = req.body || {};

      // Check required fields
      for (const field of requiredFields) {
        if (!body.hasOwnProperty(field) || body[field] === undefined || body[field] === null) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }

      // Sanitize if requested
      if (options.sanitize) {
        sanitizeRequest(req);
      }

      next();
    } catch (error) {
      EnhancedLogger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
};

/**
 * Advanced validation with custom rules
 */
export const validateWithRules = (rules: ValidationRule[], options: ValidationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = [];
      const body = req.body || {};

      for (const rule of rules) {
        const value = body[rule.field];
        const fieldErrors = validateField(rule.field, value, rule);
        errors.push(...fieldErrors);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }

      if (options.sanitize) {
        sanitizeRequest(req);
      }

      next();
    } catch (error) {
      EnhancedLogger.error('Advanced validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
};

/**
 * Validate individual field
 */
function validateField(fieldName: string, value: any, rule: ValidationRule): string[] {
  const errors: string[] = [];

  // Required check
  if (rule.required && (value === undefined || value === null || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  // Skip further validation if field is not provided and not required
  if (value === undefined || value === null) {
    return errors;
  }

  // Type validation
  if (rule.type) {
    if (!validateType(value, rule.type)) {
      errors.push(`${fieldName} must be of type ${rule.type}`);
      return errors;
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.min && value.length < rule.min) {
      errors.push(`${fieldName} must be at least ${rule.min} characters`);
    }
    if (rule.max && value.length > rule.max) {
      errors.push(`${fieldName} must be no more than ${rule.max} characters`);
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min && value < rule.min) {
      errors.push(`${fieldName} must be at least ${rule.min}`);
    }
    if (rule.max && value > rule.max) {
      errors.push(`${fieldName} must be no more than ${rule.max}`);
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (rule.min && value.length < rule.min) {
      errors.push(`${fieldName} must have at least ${rule.min} items`);
    }
    if (rule.max && value.length > rule.max) {
      errors.push(`${fieldName} must have no more than ${rule.max} items`);
    }
  }

  // Enum validation
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
  }

  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value);
    if (result !== true) {
      errors.push(typeof result === 'string' ? result : `${fieldName} is invalid`);
    }
  }

  return errors;
}

/**
 * Type validation helper
 */
function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

/**
 * Sanitize request data
 */
function sanitizeRequest(req: Request): void {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Sanitize individual value
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 1000); // Limit length
  }
  return value;
}

/**
 * Common validation rules
 */
export const commonRules = {
  email: {
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    max: 254
  },
  password: {
    type: 'string' as const,
    min: 8,
    max: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  symbol: {
    type: 'string' as const,
    pattern: /^[A-Z]{2,10}$/,
    max: 10
  },
  userId: {
    type: 'string' as const,
    pattern: /^[a-zA-Z0-9_-]{1,50}$/,
    max: 50
  },
  amount: {
    type: 'number' as const,
    min: 0,
    custom: (value: number) => value > 0 || 'Amount must be positive'
  },
  orderSide: {
    type: 'string' as const,
    enum: ['buy', 'sell']
  },
  orderType: {
    type: 'string' as const,
    enum: ['market', 'limit', 'stop', 'stop_limit']
  }
};

/**
 * Validate trading order
 */
export const validateTradingOrder = validateWithRules([
  { field: 'userId', required: true, ...commonRules.userId },
  { field: 'symbol', required: true, ...commonRules.symbol },
  { field: 'side', required: true, ...commonRules.orderSide },
  { field: 'type', required: true, ...commonRules.orderType },
  { field: 'quantity', required: true, ...commonRules.amount },
  { field: 'price', required: false, ...commonRules.amount }
]);

/**
 * Validate user registration
 */
export const validateUserRegistration = validateWithRules([
  { field: 'email', required: true, ...commonRules.email },
  { field: 'password', required: true, ...commonRules.password },
  { field: 'username', required: true, ...commonRules.userId }
]);

export default {
  validateRequest,
  validateWithRules,
  validateTradingOrder,
  validateUserRegistration,
  commonRules
};