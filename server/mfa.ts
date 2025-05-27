import crypto from 'crypto';
import { z } from 'zod';
import { securityLogger, EncryptionService } from './security';

// MFA configuration and types
export enum MFAMethod {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  BACKUP_CODES = 'BACKUP_CODES'
}

export enum UserRole {
  USER = 'USER',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  AUTHENTICATED = 'AUTHENTICATED',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// TOTP (Time-based One-Time Password) implementation
export class TOTPManager {
  private static readonly ALGORITHM = 'sha1';
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30; // 30 seconds
  private static readonly WINDOW = 1; // Allow 1 period tolerance

  // Generate a new TOTP secret for user
  static generateSecret(): string {
    return crypto.randomBytes(20).toString('base32');
  }

  // Generate TOTP code from secret
  static generateTOTP(secret: string, timestamp?: number): string {
    const time = Math.floor((timestamp || Date.now()) / 1000 / this.PERIOD);
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(time));

    const hmac = crypto.createHmac(this.ALGORITHM, Buffer.from(secret, 'base32'));
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % Math.pow(10, this.DIGITS);

    return code.toString().padStart(this.DIGITS, '0');
  }

  // Verify TOTP code
  static verifyTOTP(secret: string, token: string): boolean {
    const now = Date.now();
    
    // Check current time and previous/next windows for clock drift tolerance
    for (let i = -this.WINDOW; i <= this.WINDOW; i++) {
      const testTime = now + (i * this.PERIOD * 1000);
      const expectedToken = this.generateTOTP(secret, testTime);
      
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  // Generate QR code data for authenticator apps
  static generateQRCodeData(secret: string, userEmail: string, issuer: string = 'Cush Immigration'): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(userEmail);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
  }
}

// Backup codes management
export class BackupCodesManager {
  private static readonly CODE_LENGTH = 8;
  private static readonly CODE_COUNT = 10;

  // Generate backup codes
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.CODE_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  // Hash backup codes for secure storage
  static hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => EncryptionService.hashPassword(code));
  }

  // Verify backup code
  static verifyBackupCode(providedCode: string, hashedCodes: string[]): boolean {
    return hashedCodes.some(hashedCode => 
      EncryptionService.verifyPassword(providedCode, hashedCode)
    );
  }

  // Remove used backup code
  static removeUsedCode(usedCode: string, hashedCodes: string[]): string[] {
    return hashedCodes.filter(hashedCode => 
      !EncryptionService.verifyPassword(usedCode, hashedCode)
    );
  }
}

// Multi-Factor Authentication Manager
export class MFAManager {
  // Setup MFA for user
  static async setupMFA(userId: string, method: MFAMethod): Promise<{
    secret?: string;
    qrCodeData?: string;
    backupCodes?: string[];
    setupToken?: string;
  }> {
    const setupData: any = {};

    switch (method) {
      case MFAMethod.TOTP:
        const secret = TOTPManager.generateSecret();
        setupData.secret = secret;
        setupData.qrCodeData = TOTPManager.generateQRCodeData(secret, `user-${userId}`);
        setupData.setupToken = TOTPManager.generateTOTP(secret);
        break;

      case MFAMethod.BACKUP_CODES:
        const codes = BackupCodesManager.generateBackupCodes();
        setupData.backupCodes = codes;
        break;

      default:
        throw new Error(`MFA method ${method} not supported`);
    }

    // Log MFA setup attempt
    securityLogger.logSecurityEvent('MFA_SETUP_INITIATED', {
      userId,
      method,
      timestamp: new Date().toISOString()
    }, 'medium');

    return setupData;
  }

  // Verify MFA token
  static async verifyMFA(
    userId: string, 
    method: MFAMethod, 
    token: string, 
    secret?: string, 
    backupCodes?: string[]
  ): Promise<boolean> {
    let isValid = false;

    try {
      switch (method) {
        case MFAMethod.TOTP:
          if (!secret) throw new Error('TOTP secret required');
          isValid = TOTPManager.verifyTOTP(secret, token);
          break;

        case MFAMethod.BACKUP_CODES:
          if (!backupCodes) throw new Error('Backup codes required');
          isValid = BackupCodesManager.verifyBackupCode(token, backupCodes);
          break;

        default:
          throw new Error(`MFA method ${method} not supported`);
      }

      // Log verification attempt
      securityLogger.logSecurityEvent('MFA_VERIFICATION_ATTEMPT', {
        userId,
        method,
        success: isValid,
        timestamp: new Date().toISOString()
      }, isValid ? 'low' : 'high');

      return isValid;
    } catch (error) {
      securityLogger.logSecurityEvent('MFA_VERIFICATION_ERROR', {
        userId,
        method,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }, 'high');
      
      return false;
    }
  }
}

// Role-Based Access Control (RBAC)
export class AccessControlManager {
  // Define role hierarchy and permissions
  private static readonly ROLE_HIERARCHY = {
    [UserRole.USER]: 0,
    [UserRole.PREMIUM]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3
  };

  private static readonly ROLE_PERMISSIONS = {
    [UserRole.USER]: [
      'wallet.view',
      'wallet.transfer',
      'loans.view',
      'loans.apply',
      'community.view',
      'documentation.view',
      'flights.view',
      'imisi.chat'
    ],
    [UserRole.PREMIUM]: [
      'wallet.view',
      'wallet.transfer',
      'wallet.virtual_cards',
      'loans.view',
      'loans.apply',
      'loans.premium_rates',
      'community.view',
      'community.premium',
      'documentation.view',
      'documentation.premium',
      'flights.view',
      'flights.premium',
      'imisi.chat',
      'imisi.premium',
      'concierge.access'
    ],
    [UserRole.ADMIN]: [
      'admin.dashboard',
      'admin.users.view',
      'admin.users.edit',
      'admin.transactions.view',
      'admin.loans.manage',
      'admin.partners.view',
      'admin.partners.edit',
      'admin.reports.view',
      'security.logs.view',
      'compliance.view'
    ],
    [UserRole.SUPER_ADMIN]: [
      'superadmin.full_access',
      'system.configure',
      'security.manage',
      'compliance.manage',
      'admin.roles.assign',
      'admin.mfa.manage',
      'admin.api.keys'
    ]
  };

  // Check if user has required role
  static hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.ROLE_HIERARCHY[userRole] >= this.ROLE_HIERARCHY[requiredRole];
  }

  // Check if user has specific permission
  static hasPermission(userRole: UserRole, permission: string): boolean {
    // Super admin has all permissions
    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check role-specific permissions
    const rolePermissions = this.ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  // Check if user can access resource
  static canAccess(
    userRole: UserRole, 
    resourceLevel: AccessLevel, 
    specificPermission?: string
  ): boolean {
    // Check specific permission if provided
    if (specificPermission && !this.hasPermission(userRole, specificPermission)) {
      return false;
    }

    // Check access level requirements
    switch (resourceLevel) {
      case AccessLevel.PUBLIC:
        return true;
      
      case AccessLevel.AUTHENTICATED:
        return userRole !== undefined;
      
      case AccessLevel.PREMIUM:
        return this.hasRole(userRole, UserRole.PREMIUM);
      
      case AccessLevel.ADMIN:
        return this.hasRole(userRole, UserRole.ADMIN);
      
      case AccessLevel.SUPER_ADMIN:
        return this.hasRole(userRole, UserRole.SUPER_ADMIN);
      
      default:
        return false;
    }
  }

  // Generate access token with role information
  static generateAccessToken(userId: string, userRole: UserRole): string {
    const tokenData = {
      userId,
      role: userRole,
      permissions: this.ROLE_PERMISSIONS[userRole] || [],
      issuedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    return EncryptionService.encrypt(JSON.stringify(tokenData));
  }

  // Verify and decode access token
  static verifyAccessToken(token: string): {
    userId: string;
    role: UserRole;
    permissions: string[];
    isValid: boolean;
  } | null {
    try {
      const decryptedData = EncryptionService.decrypt(token);
      const tokenData = JSON.parse(decryptedData);

      // Check if token is expired
      if (Date.now() > tokenData.expiresAt) {
        return null;
      }

      return {
        userId: tokenData.userId,
        role: tokenData.role,
        permissions: tokenData.permissions,
        isValid: true
      };
    } catch (error) {
      return null;
    }
  }
}

// Session security manager
export class SessionSecurityManager {
  private static readonly MAX_SESSIONS_PER_USER = 5;
  private static readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
  private static readonly SUSPICIOUS_LOGIN_THRESHOLD = 5;

  // Validate session security
  static validateSession(sessionData: any, userAgent?: string, ipAddress?: string): {
    isValid: boolean;
    shouldChallenge: boolean;
    reason?: string;
  } {
    // Check session timeout
    if (Date.now() - sessionData.lastActivity > this.SESSION_TIMEOUT) {
      return {
        isValid: false,
        shouldChallenge: false,
        reason: 'Session expired'
      };
    }

    // Check for suspicious activity
    const isSuspicious = this.detectSuspiciousActivity(sessionData, userAgent, ipAddress);
    
    if (isSuspicious) {
      return {
        isValid: true,
        shouldChallenge: true,
        reason: 'Suspicious activity detected'
      };
    }

    return { isValid: true, shouldChallenge: false };
  }

  // Detect suspicious login activity
  private static detectSuspiciousActivity(
    sessionData: any, 
    userAgent?: string, 
    ipAddress?: string
  ): boolean {
    // Check for device/location changes
    if (sessionData.userAgent && userAgent && sessionData.userAgent !== userAgent) {
      return true;
    }

    if (sessionData.ipAddress && ipAddress && sessionData.ipAddress !== ipAddress) {
      return true;
    }

    // Check for rapid login attempts
    if (sessionData.loginAttempts && sessionData.loginAttempts > this.SUSPICIOUS_LOGIN_THRESHOLD) {
      return true;
    }

    return false;
  }

  // Generate secure session ID
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Advanced authentication schemas
export const mfaSetupSchema = z.object({
  method: z.nativeEnum(MFAMethod),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional()
});

export const mfaVerificationSchema = z.object({
  method: z.nativeEnum(MFAMethod),
  token: z.string().min(6).max(8),
  trustDevice: z.boolean().optional().default(false)
});

export const roleAssignmentSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
  reason: z.string().min(10)
});

export type MFASetup = z.infer<typeof mfaSetupSchema>;
export type MFAVerification = z.infer<typeof mfaVerificationSchema>;
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;