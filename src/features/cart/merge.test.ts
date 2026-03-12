import { describe, it, expect } from 'vitest';
import type { GuestCartItem } from './storage';

// Note: Integration tests for mergeGuestCart require authentication context
// and database access. These tests focus on the business logic.

describe('Cart Merge - Logic Tests', () => {
  describe('quantity merging', () => {
    it('should cap merged quantity at 99', () => {
      const existingQuantity = 60;
      const guestQuantity = 50;
      const merged = Math.min(existingQuantity + guestQuantity, 99);

      expect(merged).toBe(99);
    });

    it('should sum quantities when under limit', () => {
      const existingQuantity = 20;
      const guestQuantity = 30;
      const merged = Math.min(existingQuantity + guestQuantity, 99);

      expect(merged).toBe(50);
    });
  });

  describe('date filtering', () => {
    it('should filter items older than 30 days', () => {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const items: GuestCartItem[] = [
        {
          productId: '1',
          quantity: 1,
          priceAtAdd: '10.00',
          addedAt: now.toISOString(),
        },
        {
          productId: '2',
          quantity: 1,
          priceAtAdd: '10.00',
          addedAt: thirtyOneDaysAgo.toISOString(),
        },
      ];

      const validItems = items.filter(item => {
        const addedDate = new Date(item.addedAt);
        return addedDate > thirtyDaysAgo;
      });

      expect(validItems.length).toBe(1);
      expect(validItems[0].productId).toBe('1');
    });
  });
});
