import { describe, it, expect, beforeAll } from 'vitest';
import { hasAnyUsers, requestPasswordReset } from './actions';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Auth Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('hasAnyUsers', () => {
    it('should return a boolean', async () => {
      const result = await hasAnyUsers();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('requestPasswordReset', () => {
    it('should always return success to prevent email enumeration', async () => {
      const result = await requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('should handle valid email format', async () => {
      const result = await requestPasswordReset({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
    });
  });
});
