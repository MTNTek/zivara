import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAuditLog, logAuthAttempt, logAdminAction, logRateLimitViolation } from './audit';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

describe('Audit Logging', () => {
  // Clean up audit logs after each test
  afterEach(async () => {
    await db.delete(auditLogs);
  });

  describe('createAuditLog', () => {
    it('should create an audit log entry with all fields', async () => {
      const testData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'test_action',
        entityType: 'test_entity',
        entityId: '123e4567-e89b-12d3-a456-426614174001',
        changes: { field: 'value' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await createAuditLog(testData);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'test_action'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(testData.userId);
      expect(logs[0].action).toBe(testData.action);
      expect(logs[0].entityType).toBe(testData.entityType);
      expect(logs[0].entityId).toBe(testData.entityId);
      expect(logs[0].changes).toBe(JSON.stringify(testData.changes));
      expect(logs[0].ipAddress).toBe(testData.ipAddress);
      expect(logs[0].userAgent).toBe(testData.userAgent);
    });

    it('should create an audit log entry with minimal fields', async () => {
      const testData = {
        action: 'minimal_action',
        entityType: 'minimal_entity',
      };

      await createAuditLog(testData);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'minimal_action'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBeNull();
      expect(logs[0].entityId).toBeNull();
      expect(logs[0].changes).toBeNull();
      expect(logs[0].ipAddress).toBeNull();
      expect(logs[0].userAgent).toBeNull();
    });

    it('should not throw error if audit logging fails', async () => {
      // Mock db.insert to throw an error
      const originalInsert = db.insert;
      vi.spyOn(db, 'insert').mockImplementation(() => {
        throw new Error('Database error');
      });

      // Should not throw
      await expect(
        createAuditLog({
          action: 'test_action',
          entityType: 'test_entity',
        })
      ).resolves.not.toThrow();

      // Restore original implementation
      db.insert = originalInsert;
    });
  });

  describe('logAuthAttempt', () => {
    it('should log successful authentication attempt (Requirement 18.4)', async () => {
      const email = 'test@example.com';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      await logAuthAttempt(email, true, ipAddress, userAgent, userId);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'auth_success'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(userId);
      expect(logs[0].action).toBe('auth_success');
      expect(logs[0].entityType).toBe('authentication');
      expect(logs[0].ipAddress).toBe(ipAddress);
      expect(logs[0].userAgent).toBe(userAgent);
      
      const changes = JSON.parse(logs[0].changes || '{}');
      expect(changes.email).toBe(email);
      expect(changes.success).toBe(true);
    });

    it('should log failed authentication attempt (Requirement 18.4)', async () => {
      const email = 'test@example.com';
      const ipAddress = '192.168.1.1';

      await logAuthAttempt(email, false, ipAddress);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'auth_failure'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBeNull();
      expect(logs[0].action).toBe('auth_failure');
      expect(logs[0].entityType).toBe('authentication');
      expect(logs[0].ipAddress).toBe(ipAddress);
      
      const changes = JSON.parse(logs[0].changes || '{}');
      expect(changes.email).toBe(email);
      expect(changes.success).toBe(false);
    });

    it('should log authentication attempt without optional fields', async () => {
      const email = 'test@example.com';

      await logAuthAttempt(email, true);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'auth_success'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].ipAddress).toBeNull();
      expect(logs[0].userAgent).toBeNull();
    });
  });

  describe('logAdminAction', () => {
    it('should log admin action with all details (Requirement 26.7)', async () => {
      const adminUserId = '123e4567-e89b-12d3-a456-426614174000';
      const action = 'update_order_status';
      const entityType = 'order';
      const entityId = '123e4567-e89b-12d3-a456-426614174001';
      const changes = {
        previousStatus: 'pending',
        newStatus: 'processing',
      };
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      await logAdminAction(
        adminUserId,
        action,
        entityType,
        entityId,
        changes,
        ipAddress,
        userAgent
      );

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, action),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(adminUserId);
      expect(logs[0].action).toBe(action);
      expect(logs[0].entityType).toBe(entityType);
      expect(logs[0].entityId).toBe(entityId);
      expect(logs[0].changes).toBe(JSON.stringify(changes));
      expect(logs[0].ipAddress).toBe(ipAddress);
      expect(logs[0].userAgent).toBe(userAgent);
    });

    it('should log admin action without optional fields', async () => {
      const adminUserId = '123e4567-e89b-12d3-a456-426614174000';
      const action = 'deactivate_user';
      const entityType = 'user';
      const entityId = '123e4567-e89b-12d3-a456-426614174001';

      await logAdminAction(adminUserId, action, entityType, entityId);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, action),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe(adminUserId);
      expect(logs[0].ipAddress).toBeNull();
      expect(logs[0].userAgent).toBeNull();
    });
  });

  describe('logRateLimitViolation', () => {
    it('should log auth rate limit violation (Requirement 34.7)', async () => {
      const ipAddress = '192.168.1.1';
      const identifier = 'test@example.com';

      await logRateLimitViolation('auth', ipAddress, identifier);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'rate_limit_exceeded:auth'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBeNull();
      expect(logs[0].action).toBe('rate_limit_exceeded:auth');
      expect(logs[0].entityType).toBe('rate_limit');
      expect(logs[0].ipAddress).toBe(ipAddress);
      
      const changes = JSON.parse(logs[0].changes || '{}');
      expect(changes.identifier).toBe(identifier);
    });

    it('should log API rate limit violation (Requirement 34.7)', async () => {
      const ipAddress = '192.168.1.1';

      await logRateLimitViolation('api', ipAddress);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'rate_limit_exceeded:api'),
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('rate_limit_exceeded:api');
      expect(logs[0].entityType).toBe('rate_limit');
      expect(logs[0].ipAddress).toBe(ipAddress);
    });
  });

  describe('Integration Tests', () => {
    it('should create multiple audit log entries', async () => {
      await logAuthAttempt('user1@example.com', true, '192.168.1.1');
      await logAuthAttempt('user2@example.com', false, '192.168.1.2');
      await logRateLimitViolation('auth', '192.168.1.3');

      const allLogs = await db.query.auditLogs.findMany();
      expect(allLogs.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle concurrent audit log creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        logAuthAttempt(`user${i}@example.com`, true, '192.168.1.1')
      );

      await Promise.all(promises);

      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.action, 'auth_success'),
      });

      expect(logs.length).toBeGreaterThanOrEqual(10);
    });
  });
});
