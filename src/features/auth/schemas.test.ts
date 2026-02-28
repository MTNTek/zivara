import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
} from './schemas';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Short1',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TESTPASSWORD123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TestPassword',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'T',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordResetRequestSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = passwordResetRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = passwordResetRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
