/**
 * Centralized audit logging utilities
 * Validates: Requirements 18.4, 26.7, 34.7
 */

import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { logger } from '@/lib/logger';

export interface AuditLogData {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry
 * This is a centralized function for all audit logging across the platform
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: new Date(),
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error: error instanceof Error ? error.message : String(error) });
    // Don't throw - audit logging failure shouldn't break the operation
  }
}

/**
 * Log authentication attempt (success or failure)
 * Validates: Requirement 18.4
 */
export async function logAuthAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  userId?: string
): Promise<void> {
  await createAuditLog({
    userId: userId || null,
    action: success ? 'auth_success' : 'auth_failure',
    entityType: 'authentication',
    entityId: userId || null,
    changes: { email, success },
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
}

/**
 * Log admin action
 * Validates: Requirement 26.7
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId: adminUserId,
    action,
    entityType,
    entityId,
    changes,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
}

/**
 * Log rate limit violation
 * Validates: Requirement 34.7
 */
export async function logRateLimitViolation(
  type: 'auth' | 'api',
  ipAddress: string,
  identifier?: string
): Promise<void> {
  await createAuditLog({
    userId: null,
    action: `rate_limit_exceeded:${type}`,
    entityType: 'rate_limit',
    entityId: null,
    changes: { identifier },
    ipAddress,
    userAgent: null,
  });
}
