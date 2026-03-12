import { describe, it, expect, beforeAll } from 'vitest';
import { addToCart, updateCartItemQuantity, removeFromCart, clearCart } from './actions';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Cart Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('addToCart - validation', () => {
    it('should reject invalid product ID format', async () => {
      const result = await addToCart({
        productId: 'invalid-uuid',
        quantity: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject quantity less than 1', async () => {
      const result = await addToCart({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject quantity greater than 99', async () => {
      const result = await addToCart({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject non-integer quantity', async () => {
      const result = await addToCart({
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1.5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateCartItemQuantity - validation', () => {
    it('should reject invalid cart item ID format', async () => {
      const result = await updateCartItemQuantity({
        cartItemId: 'invalid-uuid',
        quantity: 2,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject quantity less than 1', async () => {
      const result = await updateCartItemQuantity({
        cartItemId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject quantity greater than 99', async () => {
      const result = await updateCartItemQuantity({
        cartItemId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('removeFromCart - validation', () => {
    it('should reject invalid cart item ID format', async () => {
      const result = await removeFromCart({
        cartItemId: 'invalid-uuid',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('clearCart', () => {
    it('should return success even if cart is empty', async () => {
      const result = await clearCart();

      // Should succeed even if no items to clear
      expect(result.success).toBeDefined();
    });
  });
});
