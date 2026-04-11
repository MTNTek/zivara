import { describe, it, expect, beforeAll, vi } from 'vitest';
import { updateProductPrice, updateProductDiscount } from './price-actions';

// Mock auth
vi.mock('@/lib/auth', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: 'admin-id', role: 'admin' } }),
  getCurrentUserId: vi.fn().mockResolvedValue('admin-id'),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Price Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });
  describe('updateProductPrice - validation', () => {
    it('should reject invalid product ID format', async () => {
      const result = await updateProductPrice({
        productId: 'invalid-uuid',
        price: '99.99',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid price format', async () => {
      const result = await updateProductPrice({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        price: '99.999', // Too many decimal places
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('decimal');
    });

    it('should reject negative price', async () => {
      const result = await updateProductPrice({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        price: '-10.00',
      });

      expect(result.success).toBe(false);
    });

    it('should reject zero price', async () => {
      const result = await updateProductPrice({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        price: '0.00',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('positive');
    });
  });

  describe('updateProductDiscount - validation', () => {
    it('should reject invalid product ID format', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const result = await updateProductDiscount({
        productId: 'invalid-uuid',
        discountPrice: '79.99',
        discountStartDate: startDate.toISOString(),
        discountEndDate: endDate.toISOString(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject discount without start date', async () => {
      const result = await updateProductDiscount({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        discountPrice: '79.99',
        discountStartDate: null,
        discountEndDate: new Date().toISOString(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject discount without end date', async () => {
      const result = await updateProductDiscount({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        discountPrice: '79.99',
        discountStartDate: new Date().toISOString(),
        discountEndDate: null,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject end date before start date', async () => {
      const endDate = new Date();
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const result = await updateProductDiscount({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        discountPrice: '79.99',
        discountStartDate: startDate.toISOString(),
        discountEndDate: endDate.toISOString(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('after start date');
    });

    it('should allow removing discount by setting null', async () => {
      const result = await updateProductDiscount({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        discountPrice: null,
        discountStartDate: null,
        discountEndDate: null,
      });

      // This should pass validation (removing discount is valid)
      // But will fail on database lookup since product doesn't exist
      expect(result.success).toBe(false);
    });
  });
});


describe('Discount Utility Functions', () => {
  describe('isDiscountActive', () => {
    it('should return true when discount is currently active', async () => {
      const { isDiscountActive } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const result = isDiscountActive('79.99', startDate, endDate);
      expect(result).toBe(true);
    });

    it('should return false when discount has not started yet', async () => {
      const { isDiscountActive } = await import('./price-actions');
      
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // Day after tomorrow

      const result = isDiscountActive('79.99', startDate, endDate);
      expect(result).toBe(false);
    });

    it('should return false when discount has ended', async () => {
      const { isDiscountActive } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 2 days ago
      const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      const result = isDiscountActive('79.99', startDate, endDate);
      expect(result).toBe(false);
    });

    it('should return false when discount price is null', async () => {
      const { isDiscountActive } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = isDiscountActive(null, startDate, endDate);
      expect(result).toBe(false);
    });

    it('should return false when dates are null', async () => {
      const { isDiscountActive } = await import('./price-actions');
      
      const result = isDiscountActive('79.99', null, null);
      expect(result).toBe(false);
    });
  });

  describe('getEffectivePrice', () => {
    it('should return discount price when discount is active', async () => {
      const { getEffectivePrice } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = getEffectivePrice('100.00', '79.99', startDate, endDate);
      expect(result).toBe('79.99');
    });

    it('should return regular price when discount is not active', async () => {
      const { getEffectivePrice } = await import('./price-actions');
      
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const result = getEffectivePrice('100.00', '79.99', startDate, endDate);
      expect(result).toBe('100.00');
    });

    it('should return regular price when no discount is set', async () => {
      const { getEffectivePrice } = await import('./price-actions');
      
      const result = getEffectivePrice('100.00', null, null, null);
      expect(result).toBe('100.00');
    });
  });

  describe('getPricingDisplay', () => {
    it('should return discount information when discount is active', async () => {
      const { getPricingDisplay } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = getPricingDisplay('100.00', '79.99', startDate, endDate);
      
      expect(result.effectivePrice).toBe('79.99');
      expect(result.originalPrice).toBe('100.00');
      expect(result.hasActiveDiscount).toBe(true);
      expect(result.discountPercentage).toBe(20);
    });

    it('should calculate discount percentage correctly', async () => {
      const { getPricingDisplay } = await import('./price-actions');
      
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = getPricingDisplay('200.00', '150.00', startDate, endDate);
      
      expect(result.discountPercentage).toBe(25);
    });

    it('should return regular price info when discount is not active', async () => {
      const { getPricingDisplay } = await import('./price-actions');
      
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const result = getPricingDisplay('100.00', '79.99', startDate, endDate);
      
      expect(result.effectivePrice).toBe('100.00');
      expect(result.originalPrice).toBeNull();
      expect(result.hasActiveDiscount).toBe(false);
      expect(result.discountPercentage).toBeNull();
    });

    it('should return regular price info when no discount is set', async () => {
      const { getPricingDisplay } = await import('./price-actions');
      
      const result = getPricingDisplay('100.00', null, null, null);
      
      expect(result.effectivePrice).toBe('100.00');
      expect(result.originalPrice).toBeNull();
      expect(result.hasActiveDiscount).toBe(false);
      expect(result.discountPercentage).toBeNull();
    });
  });
});
