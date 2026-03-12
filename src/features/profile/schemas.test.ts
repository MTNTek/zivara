import { describe, it, expect } from 'vitest';
import { updateProfileSchema, addressSchema } from './schemas';

describe('Profile Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate valid profile data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format (Requirement 11.7)', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject missing name', () => {
      const invalidData = {
        email: 'john@example.com',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {
        name: 'John Doe',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    it('should validate valid address data', () => {
      const validData = {
        label: 'Home',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        isDefault: true,
      };

      const result = addressSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate address without optional fields', () => {
      const validData = {
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = addressSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        label: 'Home',
        addressLine1: '123 Main St',
        // Missing city, state, postalCode, country
      };

      const result = addressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty addressLine1', () => {
      const invalidData = {
        addressLine1: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = addressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject label longer than 100 characters', () => {
      const invalidData = {
        label: 'A'.repeat(101),
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = addressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters');
      }
    });

    it('should default isDefault to false when not provided', () => {
      const validData = {
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = addressSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });
  });
});
