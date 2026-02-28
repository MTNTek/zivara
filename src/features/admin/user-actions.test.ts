import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '@/db';
import { users, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { deactivateUser, reactivateUser, generatePasswordResetToken } from './user-actions';
import { hash } from 'bcrypt';

/**
 * Unit tests for admin user management actions
 * Validates: Requirements 26.4, 26.5, 26.6, 26.7
 */

const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  requireAdmin: vi.fn(async () => ({
    user: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: 'admin',
    },
  })),
}));

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe.skipIf(!isDatabaseAvailable)('Admin User Management Actions (Unit Tests)', () => {
  let testUserId: string;
  let adminUserId: string;

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        email: `admin-actions-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      })
      .returning();
    adminUserId = admin.id;

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-actions-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Test User',
        role: 'customer',
        isActive: true,
      })
      .returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up audit logs
    await db.delete(auditLogs).where(eq(auditLogs.entityId, testUserId));

    // Clean up test users
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, adminUserId));
  });

  describe('deactivateUser', () => {
    it('should deactivate a user account', async () => {
      const result = await deactivateUser(testUserId);

      expect(result.success).toBe(true);

      // Verify user is deactivated
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      expect(user.isActive).toBe(false);
    });

    it('should log the deactivation action', async () => {
      // Deactivate user
      await deactivateUser(testUserId);

      // Check audit log
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, testUserId));

      const deactivateLog = logs.find(log => log.action === 'deactivate_user');
      expect(deactivateLog).toBeDefined();
      expect(deactivateLog!.entityType).toBe('user');
      expect(deactivateLog!.changes).toContain('isActive');
    });

    it('should handle errors gracefully', async () => {
      const result = await deactivateUser('invalid-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate a deactivated user account', async () => {
      // First deactivate
      await deactivateUser(testUserId);

      // Then reactivate
      const result = await reactivateUser(testUserId);

      expect(result.success).toBe(true);

      // Verify user is reactivated
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      expect(user.isActive).toBe(true);
    });

    it('should log the reactivation action', async () => {
      // Deactivate first
      await deactivateUser(testUserId);

      // Clear previous logs
      await db.delete(auditLogs).where(eq(auditLogs.entityId, testUserId));

      // Reactivate
      await reactivateUser(testUserId);

      // Check audit log
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, testUserId));

      const reactivateLog = logs.find(log => log.action === 'reactivate_user');
      expect(reactivateLog).toBeDefined();
      expect(reactivateLog!.entityType).toBe('user');
      expect(reactivateLog!.changes).toContain('isActive');
    });

    it('should handle errors gracefully', async () => {
      const result = await reactivateUser('invalid-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token', async () => {
      const result = await generatePasswordResetToken(testUserId);

      expect(result.success).toBe(true);
      expect(result.resetToken).toBeDefined();
      expect(result.resetToken).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(result.resetTokenExpiry).toBeDefined();
    });

    it('should generate unique tokens', async () => {
      const result1 = await generatePasswordResetToken(testUserId);
      const result2 = await generatePasswordResetToken(testUserId);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.resetToken).not.toBe(result2.resetToken);
    });

    it('should set token expiry to 1 hour from now', async () => {
      const beforeGeneration = Date.now();
      const result = await generatePasswordResetToken(testUserId);
      const afterGeneration = Date.now();

      expect(result.success).toBe(true);
      expect(result.resetTokenExpiry).toBeDefined();

      const expiryTime = result.resetTokenExpiry!.getTime();
      const expectedMinExpiry = beforeGeneration + 3600000; // 1 hour
      const expectedMaxExpiry = afterGeneration + 3600000;

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMinExpiry);
      expect(expiryTime).toBeLessThanOrEqual(expectedMaxExpiry);
    });

    it('should log the password reset action', async () => {
      // Clear previous logs
      await db.delete(auditLogs).where(eq(auditLogs.entityId, testUserId));

      // Generate reset token
      await generatePasswordResetToken(testUserId);

      // Check audit log
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, testUserId));

      const resetLog = logs.find(log => log.action === 'generate_password_reset');
      expect(resetLog).toBeDefined();
      expect(resetLog!.entityType).toBe('user');
      expect(resetLog!.changes).toContain('resetTokenGenerated');
    });

    it('should handle errors gracefully', async () => {
      const result = await generatePasswordResetToken('invalid-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    it('should log all admin actions with correct structure', async () => {
      // Clear previous logs
      await db.delete(auditLogs).where(eq(auditLogs.entityId, testUserId));

      // Perform various actions
      await deactivateUser(testUserId);
      await reactivateUser(testUserId);
      await generatePasswordResetToken(testUserId);

      // Get all logs
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, testUserId));

      expect(logs.length).toBeGreaterThanOrEqual(3);

      // Verify log structure
      for (const log of logs) {
        expect(log).toHaveProperty('id');
        expect(log).toHaveProperty('userId');
        expect(log).toHaveProperty('action');
        expect(log).toHaveProperty('entityType');
        expect(log).toHaveProperty('entityId');
        expect(log).toHaveProperty('changes');
        expect(log).toHaveProperty('createdAt');

        expect(log.entityType).toBe('user');
        expect(log.entityId).toBe(testUserId);
      }
    });

    it('should record admin user ID in audit logs', async () => {
      // Clear previous logs
      await db.delete(auditLogs).where(eq(auditLogs.entityId, testUserId));

      // Perform action
      await deactivateUser(testUserId);

      // Get logs
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, testUserId));

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].userId).toBe('admin-user-id'); // From mocked requireAdmin
    });
  });
});
