/**
 * Admin Authentication Middleware
 * Enhanced security for administrative endpoints
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EnhancedLogger } from '@/lib/enhanced-logger';

const logger = new EnhancedLogger();

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'super_admin' | 'system';
  permissions: string[];
  lastLogin: number;
  sessionId: string;
}

interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

// Mock admin database (would use actual database in production)
const adminUsers = new Map<string, AdminUser>([
  ['admin_001', {
    id: 'admin_001',
    username: 'cypher_admin',
    role: 'super_admin',
    permissions: ['*'],
    lastLogin: Date.now(),
    sessionId: 'session_001'
  }],
  ['system_001', {
    id: 'system_001',
    username: 'system',
    role: 'system',
    permissions: ['system:*', 'monitoring:*', 'services:*'],
    lastLogin: Date.now(),
    sessionId: 'session_system'
  }]
]);

// Active admin sessions
const activeSessions = new Map<string, {
  adminId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}>();

/**
 * Admin authentication middleware
 */
export const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    // Verify JWT token
    const decoded = await verifyAdminToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin token',
        code: 'INVALID_ADMIN_TOKEN'
      });
    }

    // Get admin user
    const admin = adminUsers.get(decoded.adminId);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin user not found',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Verify session
    const session = activeSessions.get(decoded.sessionId);
    if (!session || session.adminId !== admin.id) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin session',
        code: 'INVALID_SESSION'
      });
    }

    // Check session expiry (24 hours)
    const SESSION_DURATION = 24 * 60 * 60 * 1000;
    if (Date.now() - session.createdAt > SESSION_DURATION) {
      activeSessions.delete(decoded.sessionId);
      return res.status(401).json({
        success: false,
        error: 'Admin session expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Update last activity
    session.lastActivity = Date.now();
    activeSessions.set(decoded.sessionId, session);

    // Add admin to request
    req.admin = admin;

    logger.info('Admin authenticated', {
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip
    });

    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication system error',
      code: 'AUTH_SYSTEM_ERROR'
    });
  }
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required',
          code: 'ADMIN_AUTH_REQUIRED'
        });
      }

      // Super admin has all permissions
      if (admin.role === 'super_admin' || admin.permissions.includes('*')) {
        return next();
      }

      // Check specific permission
      const hasPermission = admin.permissions.some(perm => {
        if (perm === permission) return true;
        if (perm.endsWith('*')) {
          const prefix = perm.slice(0, -1);
          return permission.startsWith(prefix);
        }
        return false;
      });

      if (!hasPermission) {
        logger.warn('Admin permission denied', {
          adminId: admin.id,
          requiredPermission: permission,
          adminPermissions: admin.permissions,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permission
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization system error',
        code: 'AUTH_SYSTEM_ERROR'
      });
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string | string[]) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const admin = req.admin;
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required',
          code: 'ADMIN_AUTH_REQUIRED'
        });
      }

      if (!requiredRoles.includes(admin.role)) {
        logger.warn('Admin role access denied', {
          adminId: admin.id,
          adminRole: admin.role,
          requiredRoles,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          success: false,
          error: 'Insufficient role privileges',
          code: 'INSUFFICIENT_ROLE',
          required: requiredRoles,
          current: admin.role
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization system error',
        code: 'AUTH_SYSTEM_ERROR'
      });
    }
  };
};

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check query parameter (for WebSocket upgrades)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
}

/**
 * Verify admin JWT token
 */
async function verifyAdminToken(token: string): Promise<any> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as any;
    
    // Verify token structure
    if (!decoded.adminId || !decoded.sessionId || !decoded.role) {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate admin token
 */
export const generateAdminToken = (admin: AdminUser, sessionId: string): string => {
  const secret = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-in-production';
  
  return jwt.sign({
    adminId: admin.id,
    username: admin.username,
    role: admin.role,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }, secret);
};

/**
 * Create admin session
 */
export const createAdminSession = (adminId: string, ipAddress: string, userAgent: string): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  activeSessions.set(sessionId, {
    adminId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    ipAddress,
    userAgent
  });

  return sessionId;
};

/**
 * Admin login endpoint
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password, mfaCode } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find admin user (would check against database in production)
    const admin = Array.from(adminUsers.values())
      .find(a => a.username === username);

    if (!admin) {
      logger.warn('Admin login failed - user not found', { username });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password (would use proper password hashing in production)
    const validPassword = await verifyAdminPassword(username, password);
    if (!validPassword) {
      logger.warn('Admin login failed - invalid password', { username });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify MFA if required (mock implementation)
    if (mfaCode && !await verifyMFA(admin.id, mfaCode)) {
      logger.warn('Admin login failed - invalid MFA', { username });
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA code',
        code: 'INVALID_MFA'
      });
    }

    // Create session
    const sessionId = createAdminSession(
      admin.id,
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    );

    // Generate token
    const token = generateAdminToken(admin, sessionId);

    // Update last login
    admin.lastLogin = Date.now();
    adminUsers.set(admin.id, admin);

    logger.info('Admin login successful', {
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      sessionId
    });

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions
        },
        session: {
          id: sessionId,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        }
      }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login system error',
      code: 'LOGIN_SYSTEM_ERROR'
    });
  }
};

// Mock password verification (would use bcrypt in production)
async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
  // Mock password check - in production would use proper password hashing
  const validPasswords: Record<string, string> = {
    'cypher_admin': 'CypherAdmin2025!',
    'system': 'SystemPassword2025!'
  };
  
  return validPasswords[username] === password;
}

// Mock MFA verification
async function verifyMFA(adminId: string, code: string): Promise<boolean> {
  // Mock MFA verification - would integrate with TOTP/SMS service
  return code === '123456';
}

export default {
  adminAuth,
  requirePermission,
  requireRole,
  adminLogin,
  generateAdminToken,
  createAdminSession
};