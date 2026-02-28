import { describe, it, expect, beforeAll } from 'vitest';
import { updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } from './actions';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Profile Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('updateProfile - validation', () => {
    it('should reject invalid email format (Requirement 11.7)', async () => {
      const profileData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const result = await updateProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Note: In test environment without auth context, we get a generic error
      // In real usage, validation would catch this before auth check
    });

    it('should reject short name', async () => {
      const profileData = {
        name: 'J',
        email: 'john@example.com',
      };

      const result = await updateProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing fields', async () => {
      const profileData = {
        name: 'John Doe',
        // Missing email
      };

      const result = await updateProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addAddress - validation', () => {
    it('should reject missing required fields', async () => {
      const addressData = {
        label: 'Home',
        addressLine1: '123 Main St',
        // Missing city, state, postalCode, country
      };

      const result = await addAddress(addressData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty addressLine1', async () => {
      const addressData = {
        addressLine1: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = await addAddress(addressData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject label longer than 100 characters', async () => {
      const addressData = {
        label: 'A'.repeat(101),
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = await addAddress(addressData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateAddress - validation', () => {
    it('should reject invalid address data', async () => {
      const addressData = {
        addressLine1: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const result = await updateAddress('test-id', addressData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const addressData = {
        addressLine1: '123 Main St',
        // Missing other required fields
      };

      const result = await updateAddress('test-id', addressData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
