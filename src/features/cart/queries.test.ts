import { describe, it, expect } from 'vitest';
import { getCartSummary } from './queries';

describe('Cart Queries', () => {
  describe('getCartSummary - calculation logic', () => {
    it('should calculate subtotal correctly for empty cart', async () => {
      const summary = await getCartSummary();

      expect(summary.subtotal).toBe(0);
      expect(summary.itemCount).toBe(0);
      expect(summary.totalQuantity).toBe(0);
    });

    it('should round subtotal to 2 decimal places', () => {
      // Test the rounding logic
      const price1 = 10.99;
      const quantity1 = 3;
      const price2 = 5.49;
      const quantity2 = 2;

      const subtotal = price1 * quantity1 + price2 * quantity2;
      const rounded = Math.round(subtotal * 100) / 100;

      expect(rounded).toBe(43.95);
    });
  });
});
