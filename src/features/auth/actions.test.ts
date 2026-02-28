import { describe, it, expect, beforeAll } from 'vitest';
import { registerUser, requestPasswordReset } from './actions';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Auth Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('registerUser - validation', () => {
    it('should reject invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        name: 'Test User',
      };

      const result = await registerUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };

      const result = await registerUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject short name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'T',
      };

      const result = await registerUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('requestPasswordReset - validation', () => {
    it('should reject invalid email', async () => {
      const result = await requestPasswordReset({
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
