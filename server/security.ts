import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Encryption service for sensitive data
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return crypto.scryptSync(key, 'salt', this.KEY_LENGTH);
  }

  static encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from('cush-platform'));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv + tag + encrypted data
      return iv.toString('hex') + tag.toString('hex') + encrypted;
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      
      // Extract components
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
      const tag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
      const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from('cush-platform'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const hashBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), hashBuffer);
  }
}

// Advanced rate limiting with different tiers
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    keyGenerator: (req) => {
      // Use IP + User-Agent for better rate limiting
      return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
    }
  });
};

// Security rate limiters
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

export const paymentRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 payment attempts
  'Too many payment attempts, please try again later'
);

export const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests, please try again later'
);

export const strictRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests
  'Rate limit exceeded for sensitive operations'
);

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://*.stripe.com",
        "https://replit.com",
        "https://*.replit.dev"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://*.stripe.com",
        "wss://*.replit.dev",
        "https://*.replit.dev"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com"
      ]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Input validation and sanitization
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize all input data
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    if (req.params) {
      req.params = sanitizeInput(req.params);
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
      /(\bdrop\b.*\btable\b)|(\btable\b.*\bdrop\b)/i,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi
    ];

    const requestString = JSON.stringify(req.body) + JSON.stringify(req.query);
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestString)) {
        return res.status(400).json({
          error: 'Invalid request detected',
          code: 'SECURITY_VIOLATION'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Request validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

// Security logging
export const securityLogger = {
  logSecurityEvent: (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical') => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      source: 'cush-security'
    };
    
    // In production, send to security monitoring service
    console.log(`[SECURITY-${severity.toUpperCase()}]`, JSON.stringify(logEntry));
    
    // For critical events, could trigger alerts
    if (severity === 'critical') {
      // TODO: Implement alerting system
    }
  },

  logFailedAuth: (ip: string, userAgent: string, reason: string) => {
    securityLogger.logSecurityEvent('AUTH_FAILURE', {
      ip,
      userAgent,
      reason,
      timestamp: Date.now()
    }, 'medium');
  },

  logSuspiciousActivity: (ip: string, activity: string, details: any) => {
    securityLogger.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      ip,
      activity,
      details
    }, 'high');
  }
};

// Enhanced authentication middleware
export const enhancedAuth = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';

  // Check for suspicious patterns in headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
  for (const header of suspiciousHeaders) {
    const value = req.get(header);
    if (value && value.includes(',')) {
      // Multiple IPs might indicate proxy manipulation
      securityLogger.logSuspiciousActivity(ip, 'PROXY_MANIPULATION', { header, value });
    }
  }

  // Rate limiting check
  const authAttempts = (req as any).rateLimit;
  if (authAttempts && authAttempts.remaining < 2) {
    securityLogger.logSuspiciousActivity(ip, 'RATE_LIMIT_APPROACH', {
      remaining: authAttempts.remaining,
      userAgent
    });
  }

  next();
};

// Data masking for logs
export const maskSensitiveData = (data: any): any => {
  const sensitiveFields = [
    'password', 'ssn', 'passport', 'cardNumber', 'cvv', 'pin',
    'accountNumber', 'routingNumber', 'socialSecurity'
  ];

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (typeof masked[field] === 'string') {
          const value = masked[field];
          masked[field] = value.length > 4 
            ? '*'.repeat(value.length - 4) + value.slice(-4)
            : '*'.repeat(value.length);
        }
      }
    }
    
    return masked;
  }
  
  return data;
};