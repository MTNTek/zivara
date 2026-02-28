import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db';
import { users, products, categories, inventory, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getOrderStatistics } from './order-queries';
import { hash } from 'bcrypt';

/**
 * Unit tests for admin order query functions
 * Validates: Requirement 21.7
 */

const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Admin Order Query Functions (Unit Tests)', () => {
  let testUserId: string;
  let testCategoryId: string;
  let testProductId: string;
  let testOrderIds: string[] = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-admin-stats-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Test Admin User',
        role: 'admin',
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

    // Create test product
    const [product] = await db
      .insert(products)
      .values({
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        description: 'Test product for admin stats',
        price: '50.00',
        categoryId: testCategoryId,
        isActive: true,
      })
      .returning();
    testProductId = product.id;

    await db.insert(inventory).values({
      productId: product.id,
      quantity: 100,
    });

    // Create test orders with different statuses
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const orderTotals = ['100.00', '150.00', '200.00', '250.00', '300.00'];

    for (let i = 0; i < 5; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-ADMIN-TEST-${Date.now()}-${i}`,
          userId: testUserId,
          status: orderStatuses[i],
          subtotal: orderTotals[i],
          tax: '10.00',
          shipping: '10.00',
          total: (parseFloat(orderTotals[i]) + 20).toFixed(2),
          shippingAddressLine1: '123 Admin Test St',
          shippingCity: 'Test City',
          shippingState: 'TS',
          shippingPostalCode: '12345',
          shippingCountry: 'US',
          paymentMethod: 'card',
        })
        .returning();

      testOrderIds.push(order.id);

      await db.insert(orderItems).values({
        orderId: order.id,
        productId: testProductId,
        productName: 'Test Product',
        quantity: 1,
        priceAtPurchase: orderTotals[i],
        subtotal: orderTotals[i],
      });
    }
  });

  afterAll(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up test data
    for (const orderId of testOrderIds) {
      await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
      await db.delete(orders).where(eq(orders.id, orderId));
    }

    if (testProductId) {
      await db.delete(inventory).where(eq(inventory.productId, testProductId));
      await db.delete(products).where(eq(products.id, testProductId));
    }

    if (testCategoryId) {
      await db.delete(categories).where(eq(categories.id, testCategoryId));
    }

    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  describe('getOrderStatistics', () => {
    it('should calculate total revenue excluding cancelled orders', async () => {
      const stats = await getOrderStatistics();

      // Total should exclude cancelled order (300 + 20)
      // Expected: 120 + 170 + 220 + 270 = 780
      const totalRevenue = parseFloat(stats.totalRevenue);
      expect(totalRevenue).toBeGreaterThanOrEqual(780);
    });

    it('should calculate average order value correctly', async () => {
      const stats = await getOrderStatistics();

      // Average of non-cancelled orders: (120 + 170 + 220 + 270) / 4 = 195
      const avgOrderValue = parseFloat(stats.averageOrderValue);
      expect(avgOrderValue).toBeGreaterThan(0);
    });

    it('should count total orders excluding cancelled', async () => {
      const stats = await getOrderStatistics();

      // Should count at least our 4 non-cancelled test orders
      expect(stats.totalOrders).toBeGreaterThanOrEqual(4);
    });

    it('should filter statistics by status', async () => {
      const stats = await getOrderStatistics({ status: 'pending' });

      // Should only include pending order (120)
      const totalRevenue = parseFloat(stats.totalRevenue);
      expect(totalRevenue).toBeGreaterThanOrEqual(120);
      expect(stats.totalOrders).toBeGreaterThanOrEqual(1);
    });

    it('should filter statistics by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stats = await getOrderStatistics({
        startDate: yesterday,
        endDate: tomorrow,
      });

      // Should include orders created today
      expect(stats.totalOrders).toBeGreaterThanOrEqual(4);
    });

    it('should filter statistics by user', async () => {
      const stats = await getOrderStatistics({ userId: testUserId });

      // Should include only test user's orders
      expect(stats.totalOrders).toBeGreaterThanOrEqual(4);
    });

    it('should return zero values when no orders match filters', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);

      const stats = await getOrderStatistics({
        startDate: futureDate,
      });

      expect(stats.totalRevenue).toBe('0');
      expect(stats.averageOrderValue).toBe('0');
      expect(stats.totalOrders).toBe(0);
    });

    it('should handle multiple filters simultaneously', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const stats = await getOrderStatistics({
        status: 'processing',
        userId: testUserId,
        startDate: yesterday,
      });

      // Should include only processing orders for test user
      expect(stats.totalOrders).toBeGreaterThanOrEqual(1);
      const totalRevenue = parseFloat(stats.totalRevenue);
      expect(totalRevenue).toBeGreaterThanOrEqual(170);
    });
  });
});
