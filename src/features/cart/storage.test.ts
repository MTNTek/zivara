import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { GuestCartItem } from './storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(global, 'window', {
    value: { localStorage: localStorageMock },
    writable: true,
  });
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorageMock.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Import after mocking
const {
  getGuestCart,
  saveGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartCount,
} = await import('./storage');

describe('Guest Cart Storage', () => {
  describe('getGuestCart', () => {
    it('should return empty array when no cart exists', () => {
      const cart = getGuestCart();
      expect(cart).toEqual([]);
    });

    it('should return stored cart items', () => {
      const items: GuestCartItem[] = [
        {
          productId: '123',
          quantity: 2,
          priceAtAdd: '19.99',
          addedAt: new Date().toISOString(),
        },
      ];

      saveGuestCart(items);
      const cart = getGuestCart();

      expect(cart).toEqual(items);
    });

    it('should filter out items older than 30 days', () => {
      const now = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      const items: GuestCartItem[] = [
        {
          productId: '123',
          quantity: 1,
          priceAtAdd: '10.00',
          addedAt: now.toISOString(),
        },
        {
          productId: '456',
          quantity: 1,
          priceAtAdd: '20.00',
          addedAt: oldDate.toISOString(),
        },
      ];

      saveGuestCart(items);
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('123');
    });

    it('should handle corrupted storage data', () => {
      localStorage.setItem('zivara_guest_cart', 'invalid json');
      const cart = getGuestCart();

      expect(cart).toEqual([]);
    });
  });

  describe('addToGuestCart', () => {
    it('should add new item to empty cart', () => {
      addToGuestCart('123', 2, '19.99');
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('123');
      expect(cart[0].quantity).toBe(2);
      expect(cart[0].priceAtAdd).toBe('19.99');
    });

    it('should update quantity for existing item', () => {
      addToGuestCart('123', 2, '19.99');
      addToGuestCart('123', 3, '19.99');
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
      expect(cart[0].quantity).toBe(5);
    });

    it('should cap quantity at 99', () => {
      addToGuestCart('123', 50, '19.99');
      addToGuestCart('123', 60, '19.99');
      const cart = getGuestCart();

      expect(cart[0].quantity).toBe(99);
    });

    it('should cap initial quantity at 99', () => {
      addToGuestCart('123', 150, '19.99');
      const cart = getGuestCart();

      expect(cart[0].quantity).toBe(99);
    });
  });

  describe('updateGuestCartItem', () => {
    it('should update item quantity', () => {
      addToGuestCart('123', 2, '19.99');
      updateGuestCartItem('123', 5);
      const cart = getGuestCart();

      expect(cart[0].quantity).toBe(5);
    });

    it('should cap quantity at 99', () => {
      addToGuestCart('123', 2, '19.99');
      updateGuestCartItem('123', 150);
      const cart = getGuestCart();

      expect(cart[0].quantity).toBe(99);
    });

    it('should enforce minimum quantity of 1', () => {
      addToGuestCart('123', 2, '19.99');
      updateGuestCartItem('123', 0);
      const cart = getGuestCart();

      expect(cart[0].quantity).toBe(1);
    });

    it('should do nothing for non-existent item', () => {
      addToGuestCart('123', 2, '19.99');
      updateGuestCartItem('456', 5);
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('123');
      expect(cart[0].quantity).toBe(2);
    });
  });

  describe('removeFromGuestCart', () => {
    it('should remove item from cart', () => {
      addToGuestCart('123', 2, '19.99');
      addToGuestCart('456', 1, '29.99');
      removeFromGuestCart('123');
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('456');
    });

    it('should handle removing non-existent item', () => {
      addToGuestCart('123', 2, '19.99');
      removeFromGuestCart('456');
      const cart = getGuestCart();

      expect(cart.length).toBe(1);
    });
  });

  describe('clearGuestCart', () => {
    it('should remove all items', () => {
      addToGuestCart('123', 2, '19.99');
      addToGuestCart('456', 1, '29.99');
      clearGuestCart();
      const cart = getGuestCart();

      expect(cart).toEqual([]);
    });
  });

  describe('getGuestCartCount', () => {
    it('should return 0 for empty cart', () => {
      const count = getGuestCartCount();
      expect(count).toBe(0);
    });

    it('should return total quantity of all items', () => {
      addToGuestCart('123', 2, '19.99');
      addToGuestCart('456', 3, '29.99');
      const count = getGuestCartCount();

      expect(count).toBe(5);
    });
  });
});
