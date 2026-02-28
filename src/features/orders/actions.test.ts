import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { db } from '@/db';
import { users, products, categories, inventory, cartItems, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createOrder, updateOrderStatus, cancelOrder } from './actions';
import { addToCart } from '@/features/cart/actions';
import { updateInventoryQuantity } from '@/features/inventory/actions';
import { hash } from 'bcrypt';

/**
 * Unit tests for order creation
 * Validates: Requirements 6.1-6.7
 */

// Note: These tests require a running PostgreSQL database
const isDatabaseAvailable = !!process.env.DATABASE_URL;

// Mock payment module to avoid requiring Stripe credentials in tests
vi.mock('@/lib/payment', () => ({
  stripe: null,
  createPaymentIntent: vi.fn(async () => ({
    success: true,
    data: {
      id: 'pi_test_123',
      client_secret: 'test_secret',
      status: 'succeeded',
    },
  })),
  getPaymentIntent: vi.fn(async () => ({
    success: true,
    data: {
      id: 'pi_test_123',
      status: 'succeeded',
      payment_method: 'pm_test_123',
    },
  })),
  handlePaymentWithTimeout: vi.fn(async () => ({
    success: true,
    data: {
      id: 'pi_test_123',
      status: 'succeeded',
      payment_method: 'pm_test_123',
    },
  })),
  getCardLast4Digits: vi.fn(async () => '4242'),
}));

describe.skipIf(!isDatabaseAvailable)('Order Creation (Unit Tests)', () => {
  let testUserId: string;
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-order-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Test User',
        role: 'customer',
      })
      .returning();
    testUserId = user.id;

    // Create test category
    const [category] = await db
      .insert(categories)
      .values({
        name: `Test Category ${Date.now()}`,
        slug: `test-category-${Date.now()}`,
      })
      .returning();
    testCategoryId = category.id;

    // Create test product with inventory
    const [product] = await db
      .insert(products)
      .values({
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'Test product for order tests',
        price: '29.99',
        categoryId: testCategoryId,
        isActive: true,
      })
      .returning();
    testProductId = product.id;

    await db.insert(inventory).values({
      productId: product.id,
      quantity: 100,
    });
  });

  afterEach(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up test data after each test
    await db.delete(orderItems);
    await db.delete(orders).where(eq(orders.userId, testUserId));
    await db.delete(cartItems).where(eq(cartItems.userId, testUserId));

    // Reset inventory
    await updateInventoryQuantity({
      productId: testProductId,
      quantity: 100,
    });
  });

  describe('Successful order creation', () => {
    it('should create order with all cart items', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 2,
      });

      // Create order
      const result = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(true);
      expect(result.data?.orderId).toBeDefined();
      expect(result.data?.orderNumber).toBeDefined();

      // Verify order exists
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, result.data!.orderId),
      });
      expect(order).toBeDefined();
      expect(order?.status).toBe('pending');
    });

    it('should create order items for all cart items', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 3,
      });

      // Create order
      const result = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(true);

      // Verify order items
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, result.data!.orderId),
      });
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(3);
      expect(items[0].productId).toBe(testProductId);
    });

    it('should clear cart after successful order creation', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      // Verify cart has items
      const cartBefore = await db.query.cartItems.findMany({
        where: eq(cartItems.userId, testUserId),
      });
      expect(cartBefore.length).toBe(1);

      // Create order
      const result = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(true);

      // Verify cart is cleared
      const cartAfter = await db.query.cartItems.findMany({
        where: eq(cartItems.userId, testUserId),
      });
      expect(cartAfter.length).toBe(0);
    });

    it('should generate unique order confirmation number', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      // Create first order
      const result1 = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result1.success).toBe(true);

      // Add item to cart again
      await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      // Create second order
      const result2 = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result2.success).toBe(true);

      // Verify order numbers are different
      expect(result1.data?.orderNumber).not.toBe(result2.data?.orderNumber);
    });
  });

  describe('Checkout failure scenarios', () => {
    it('should fail when cart is empty', async () => {
      const result = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should fail when shipping address is missing required fields', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      const result = await createOrder({
        shippingAddress: {
          line1: '',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail when product is out of stock', async () => {
      // Set inventory to 0
      await updateInventoryQuantity({
        productId: testProductId,
        quantity: 0,
      });

      // Try to add to cart (should fail)
      const addResult = await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      expect(addResult.success).toBe(false);
      expect(addResult.error).toContain('out of stock');
    });

    it('should fail when requested quantity exceeds available inventory', async () => {
      // Set inventory to 5
      await updateInventoryQuantity({
        productId: testProductId,
        quantity: 5,
      });

      // Try to add more than available
      const addResult = await addToCart({
        productId: testProductId,
        quantity: 10,
      });

      expect(addResult.success).toBe(false);
      expect(addResult.error).toContain('Insufficient stock');
    });
  });

  describe('Inventory deduction', () => {
    it('should decrease inventory by ordered quantity', async () => {
      // Get initial inventory
      const initialInv = await db.query.inventory.findFirst({
        where: eq(inventory.productId, testProductId),
      });
      const initialQuantity = initialInv?.quantity || 0;

      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 5,
      });

      // Create order
      const result = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(result.success).toBe(true);

      // Verify inventory decreased
      const finalInv = await db.query.inventory.findFirst({
        where: eq(inventory.productId, testProductId),
      });
      expect(finalInv?.quantity).toBe(initialQuantity - 5);
    });

    it('should restore inventory when order is cancelled', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 3,
      });

      // Create order
      const createResult = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(createResult.success).toBe(true);

      // Get inventory after order
      const invAfterOrder = await db.query.inventory.findFirst({
        where: eq(inventory.productId, testProductId),
      });
      const quantityAfterOrder = invAfterOrder?.quantity || 0;

      // Cancel order
      const cancelResult = await cancelOrder({
        orderId: createResult.data!.orderId,
      });

      expect(cancelResult.success).toBe(true);

      // Verify inventory restored
      const invAfterCancel = await db.query.inventory.findFirst({
        where: eq(inventory.productId, testProductId),
      });
      expect(invAfterCancel?.quantity).toBe(quantityAfterOrder + 3);
    });
  });

  describe('Order status management', () => {
    it('should only allow cancelling pending orders', async () => {
      // Add item to cart
      await addToCart({
        productId: testProductId,
        quantity: 1,
      });

      // Create order
      const createResult = await createOrder({
        shippingAddress: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
      });

      expect(createResult.success).toBe(true);

      // Update order to processing
      await updateOrderStatus({
        orderId: createResult.data!.orderId,
        status: 'processing',
      });

      // Try to cancel (should fail)
      const cancelResult = await cancelOrder({
        orderId: createResult.data!.orderId,
      });

      expect(cancelResult.success).toBe(false);
      expect(cancelResult.error).toContain('pending');
    });
  });
});
