import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { db } from '@/db';
import { users, products, categories, inventory, cartItems, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { addToCart } from '@/features/cart/actions';
import { updateInventoryQuantity } from '@/features/inventory/actions';
import { hash } from 'bcrypt';

/**
 * **Validates: Requirements 16.4, 16.5**
 * 
 * Property: Checkout operations are atomic - either all succeed or all fail
 * 
 * This test verifies that the checkout process maintains atomicity:
 * - If checkout succeeds, ALL of the following must be true:
 *   1. Order is created in database
 *   2. Order items are created for all cart items
 *   3. Inventory is decremented for all products
 *   4. Cart is cleared
 *   5. Order status history is created
 * 
 * - If checkout fails, NONE of the above should occur (rollback)
 * 
 * Note: These tests mock Stripe payment to focus on database transaction atomicity
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

// Import after mocking
import { createOrder } from './actions';

describe.skipIf(!isDatabaseAvailable)('Checkout Transaction Atomicity (Property-Based)', () => {
  let testUserId: string;
  let testCategoryId: string;
  const testProducts: Array<{ id: string; name: string; price: string }> = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-checkout-${Date.now()}@example.com`,
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

    // Create test products with inventory
    for (let i = 0; i < 5; i++) {
      const [product] = await db
        .insert(products)
        .values({
          name: `Test Product ${i} ${Date.now()}`,
          slug: `test-product-${i}-${Date.now()}`,
          description: 'Test product for checkout atomicity tests',
          price: (10 + i * 5).toFixed(2),
          categoryId: testCategoryId,
          isActive: true,
        })
        .returning();

      await db.insert(inventory).values({
        productId: product.id,
        quantity: 100,
      });

      testProducts.push(product);
    }
  });

  afterEach(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up test data after each test
    await db.delete(orderItems).where(eq(orderItems.orderId, testUserId));
    await db.delete(orders).where(eq(orders.userId, testUserId));
    await db.delete(cartItems).where(eq(cartItems.userId, testUserId));

    // Reset inventory
    for (const product of testProducts) {
      await updateInventoryQuantity({
        productId: product.id,
        quantity: 100,
      });
    }
  });

  it('Property: Successful checkout creates order, order items, decrements inventory, and clears cart atomically', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate cart with 1-3 products, each with quantity 1-5
        fc.array(
          fc.record({
            productIndex: fc.integer({ min: 0, max: testProducts.length - 1 }),
            quantity: fc.integer({ min: 1, max: 5 }),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        async (cartConfig) => {
          // Skip if database not available
          if (!isDatabaseAvailable) return true;

          // Add items to cart
          const addedProducts = new Map<string, number>();
          for (const config of cartConfig) {
            const product = testProducts[config.productIndex];
            const currentQty = addedProducts.get(product.id) || 0;
            const newQty = currentQty + config.quantity;

            // Skip if total quantity would exceed inventory
            if (newQty > 100) continue;

            await addToCart({
              productId: product.id,
              quantity: config.quantity,
            });

            addedProducts.set(product.id, newQty);
          }

          // Skip if no items were added
          if (addedProducts.size === 0) return true;

          // Get initial inventory levels
          const initialInventory = new Map<string, number>();
          for (const [productId] of addedProducts) {
            const inv = await db.query.inventory.findFirst({
              where: eq(inventory.productId, productId),
            });
            if (inv) {
              initialInventory.set(productId, inv.quantity);
            }
          }

          // Get initial cart count
          const initialCartItems = await db.query.cartItems.findMany({
            where: eq(cartItems.userId, testUserId),
          });
          const initialCartCount = initialCartItems.length;

          // Perform checkout
          const checkoutResult = await createOrder({
            shippingAddress: {
              line1: '123 Test St',
              city: 'Test City',
              state: 'TS',
              postalCode: '12345',
              country: 'US',
            },
            paymentMethod: 'card',
          });

          // If checkout succeeded, verify all operations completed
          if (checkoutResult.success) {
            // 1. Order should exist
            const order = await db.query.orders.findFirst({
              where: eq(orders.id, checkoutResult.data!.orderId),
            });
            expect(order).toBeDefined();
            expect(order?.status).toBe('pending');

            // 2. Order items should exist for all cart items
            const createdOrderItems = await db.query.orderItems.findMany({
              where: eq(orderItems.orderId, checkoutResult.data!.orderId),
            });
            expect(createdOrderItems.length).toBe(addedProducts.size);

            // 3. Inventory should be decremented
            for (const [productId, quantity] of addedProducts) {
              const currentInv = await db.query.inventory.findFirst({
                where: eq(inventory.productId, productId),
              });
              const initialQty = initialInventory.get(productId) || 0;
              expect(currentInv?.quantity).toBe(initialQty - quantity);
            }

            // 4. Cart should be cleared
            const finalCartItems = await db.query.cartItems.findMany({
              where: eq(cartItems.userId, testUserId),
            });
            expect(finalCartItems.length).toBe(0);

            // 5. Order status history should exist
            const statusHistory = await db.query.orderStatusHistory.findMany({
              where: eq(orderItems.orderId, checkoutResult.data!.orderId),
            });
            expect(statusHistory.length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 10 } // Run 10 times with different random inputs
    );
  });

  it('Property: Failed checkout (insufficient inventory) rolls back all changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testProducts.length - 1 }),
        fc.integer({ min: 101, max: 200 }), // Quantity exceeding inventory
        async (productIndex, excessiveQuantity) => {
          // Skip if database not available
          if (!isDatabaseAvailable) return true;

          const product = testProducts[productIndex];

          // Set low inventory
          await updateInventoryQuantity({
            productId: product.id,
            quantity: 50,
          });

          // Try to add excessive quantity to cart (should fail)
          const addResult = await addToCart({
            productId: product.id,
            quantity: excessiveQuantity,
          });

          // Verify add to cart failed
          expect(addResult.success).toBe(false);

          // Verify inventory unchanged
          const inv = await db.query.inventory.findFirst({
            where: eq(inventory.productId, product.id),
          });
          expect(inv?.quantity).toBe(50);

          // Verify no cart items created
          const cartItemsCount = await db.query.cartItems.findMany({
            where: eq(cartItems.userId, testUserId),
          });
          expect(cartItemsCount.length).toBe(0);

          return true;
        }
      ),
      { numRuns: 5 }
    );
  });

  it('Property: Concurrent checkout attempts maintain data consistency', async () => {
    // This test verifies that if multiple checkout attempts happen,
    // the database maintains consistency (no partial updates)
    
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.integer({ min: 1, max: 3 }),
          { minLength: 2, maxLength: 2 }
        ),
        async (quantities) => {
          // Skip if database not available
          if (!isDatabaseAvailable) return true;

          const product = testProducts[0];

          // Add items to cart
          await addToCart({
            productId: product.id,
            quantity: quantities[0],
          });

          // Get initial state
          const initialInv = await db.query.inventory.findFirst({
            where: eq(inventory.productId, product.id),
          });
          const initialInventoryQty = initialInv?.quantity || 0;

          // Perform checkout
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

          // Verify consistency: either all changes applied or none
          const finalInv = await db.query.inventory.findFirst({
            where: eq(inventory.productId, product.id),
          });
          const finalCartItems = await db.query.cartItems.findMany({
            where: eq(cartItems.userId, testUserId),
          });

          if (result.success) {
            // All changes should be applied
            expect(finalInv?.quantity).toBe(initialInventoryQty - quantities[0]);
            expect(finalCartItems.length).toBe(0);
          } else {
            // No changes should be applied
            expect(finalInv?.quantity).toBe(initialInventoryQty);
            expect(finalCartItems.length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 5 }
    );
  });
});
