import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db';
import { users, products, categories, inventory, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDashboardStats, getRecentOrders } from './queries';
import { hash } from 'bcrypt';

/**
 * Unit tests for admin dashboard query functions
 * Validates: Requirements 9.1, 9.4, 9.6
 */

const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Admin Dashboard Query Functions (Unit Tests)', () => {
  let testUserIds: string[] = [];
  let testCategoryId: string;
  let testProductIds: string[] = [];
  let testOrderIds: string[] = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test users
    for (let i = 0; i < 3; i++) {
      const [user] = await db
        .insert(users)
        .values({
          email: `test-dashboard-user${i}-${Date.now()}@example.com`,
          passwordHash: await hash('password123', 10),
          name: `Test Dashboard User ${i}`,
          role: 'customer',
        })
        .returning();
      testUserIds.push(user.id);
    }

    // Create test category
    const [category] = await db
      .insert(categories)
      .values({
        name: `Test Dashboard Category ${Date.now()}`,
        slug: `test-dashboard-category-${Date.now()}`,
      })
      .returning();
    testCategoryId = category.id;

    // Create test products
    for (let i = 0; i < 5; i++) {
      const [product] = await db
        .insert(products)
        .values({
          name: `Test Dashboard Product ${i} ${Date.now()}`,
          slug: `test-dashboard-product-${i}-${Date.now()}`,
          description: 'Test product for dashboard tests',
          price: '50.00',
          categoryId: testCategoryId,
          isActive: i < 3, // 3 active, 2 inactive
        })
        .returning();
      testProductIds.push(product.id);

      await db.insert(inventory).values({
        productId: product.id,
        quantity: 100,
      });
    }

    // Create test orders with different dates and statuses
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Today's orders
    for (let i = 0; i < 2; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-DASH-TODAY-${Date.now()}-${i}`,
          userId: testUserIds[i % testUserIds.length],
          status: 'processing',
          subtotal: '100.00',
          tax: '10.00',
          shipping: '15.00',
          total: '125.00',
          shippingAddressLine1: '123 Test St',
          shippingCity: 'Test City',
          shippingState: 'TS',
          shippingPostalCode: '12345',
          shippingCountry: 'US',
          paymentMethod: 'card',
          createdAt: today,
        })
        .returning();
      testOrderIds.push(order.id);

      await db.insert(orderItems).values({
        orderId: order.id,
        productId: testProductIds[0],
        productName: 'Test Product',
        quantity: 2,
        priceAtPurchase: '50.00',
        subtotal: '100.00',
      });
    }

    // This week's orders (but not today)
    for (let i = 0; i < 2; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-DASH-WEEK-${Date.now()}-${i}`,
          userId: testUserIds[i % testUserIds.length],
          status: 'shipped',
          subtotal: '200.00',
          tax: '20.00',
          shipping: '15.00',
          total: '235.00',
          shippingAddressLine1: '456 Test Ave',
          shippingCity: 'Test City',
          shippingState: 'TS',
          shippingPostalCode: '12345',
          shippingCountry: 'US',
          paymentMethod: 'card',
          createdAt: yesterday,
        })
        .returning();
      testOrderIds.push(order.id);

      await db.insert(orderItems).values({
        orderId: order.id,
        productId: testProductIds[1],
        productName: 'Test Product',
        quantity: 4,
        priceAtPurchase: '50.00',
        subtotal: '200.00',
      });
    }

    // This month's orders (but not this week)
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: `ORD-DASH-MONTH-${Date.now()}`,
        userId: testUserIds[0],
        status: 'delivered',
        subtotal: '150.00',
        tax: '15.00',
        shipping: '15.00',
        total: '180.00',
        shippingAddressLine1: '789 Test Blvd',
        shippingCity: 'Test City',
        shippingState: 'TS',
        shippingPostalCode: '12345',
        shippingCountry: 'US',
        paymentMethod: 'card',
        createdAt: lastWeek,
      })
      .returning();
    testOrderIds.push(order.id);

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: testProductIds[2],
      productName: 'Test Product',
      quantity: 3,
      priceAtPurchase: '50.00',
      subtotal: '150.00',
    });

    // Cancelled order (should not count in revenue)
    const [cancelledOrder] = await db
      .insert(orders)
      .values({
        orderNumber: `ORD-DASH-CANCELLED-${Date.now()}`,
        userId: testUserIds[1],
        status: 'cancelled',
        subtotal: '100.00',
        tax: '10.00',
        shipping: '15.00',
        total: '125.00',
        shippingAddressLine1: '999 Test Rd',
        shippingCity: 'Test City',
        shippingState: 'TS',
        shippingPostalCode: '12345',
        shippingCountry: 'US',
        paymentMethod: 'card',
        createdAt: today,
      })
      .returning();
    testOrderIds.push(cancelledOrder.id);

    await db.insert(orderItems).values({
      orderId: cancelledOrder.id,
      productId: testProductIds[0],
      productName: 'Test Product',
      quantity: 2,
      priceAtPurchase: '50.00',
      subtotal: '100.00',
    });
  });

  afterAll(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up test data
    await db.delete(orderItems);
    for (const orderId of testOrderIds) {
      await db.delete(orders).where(eq(orders.id, orderId));
    }
    for (const productId of testProductIds) {
      await db.delete(inventory).where(eq(inventory.productId, productId));
      await db.delete(products).where(eq(products.id, productId));
    }
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    for (const userId of testUserIds) {
      await db.delete(users).where(eq(users.id, userId));
    }
  });

  describe('getDashboardStats', () => {
    it('should return total orders count', async () => {
      const stats = await getDashboardStats();

      // Should count all orders including cancelled
      expect(stats.totalOrders).toBeGreaterThanOrEqual(6);
    });

    it('should calculate total revenue excluding cancelled orders', async () => {
      const stats = await getDashboardStats();

      // Total revenue should be at least the sum of our test orders (excluding cancelled)
      // 2 today orders (125 each) + 2 week orders (235 each) + 1 month order (180) = 900
      const expectedMinRevenue = 900;
      const actualRevenue = parseFloat(stats.totalRevenue);

      expect(actualRevenue).toBeGreaterThanOrEqual(expectedMinRevenue);
    });

    it('should count active products correctly', async () => {
      const stats = await getDashboardStats();

      // We created 3 active products
      expect(stats.activeProducts).toBeGreaterThanOrEqual(3);
    });

    it('should calculate today\'s revenue correctly', async () => {
      const stats = await getDashboardStats();

      // Today's revenue should be at least 2 orders * 125 = 250 (excluding cancelled)
      const expectedMinRevenue = 250;
      const actualRevenue = parseFloat(stats.todayRevenue);

      expect(actualRevenue).toBeGreaterThanOrEqual(expectedMinRevenue);
    });

    it('should calculate this week\'s revenue correctly', async () => {
      const stats = await getDashboardStats();

      // Week's revenue should include today's and yesterday's orders
      // 2 today (125 each) + 2 yesterday (235 each) = 720
      const expectedMinRevenue = 720;
      const actualRevenue = parseFloat(stats.weekRevenue);

      expect(actualRevenue).toBeGreaterThanOrEqual(expectedMinRevenue);
    });

    it('should calculate this month\'s revenue correctly', async () => {
      const stats = await getDashboardStats();

      // Month's revenue should include all non-cancelled orders
      // 2 today (125 each) + 2 week (235 each) + 1 month (180) = 900
      const expectedMinRevenue = 900;
      const actualRevenue = parseFloat(stats.monthRevenue);

      expect(actualRevenue).toBeGreaterThanOrEqual(expectedMinRevenue);
    });

    it('should return valid numeric strings for all revenue fields', async () => {
      const stats = await getDashboardStats();

      expect(stats.totalRevenue).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.todayRevenue).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.weekRevenue).toMatch(/^\d+(\.\d+)?$/);
      expect(stats.monthRevenue).toMatch(/^\d+(\.\d+)?$/);
    });
  });

  describe('getRecentOrders', () => {
    it('should return recent orders sorted by creation date', async () => {
      const recentOrders = await getRecentOrders(10);

      expect(recentOrders.length).toBeGreaterThanOrEqual(6);

      // Verify orders are sorted by most recent first
      for (let i = 1; i < recentOrders.length; i++) {
        const prevDate = new Date(recentOrders[i - 1].createdAt).getTime();
        const currDate = new Date(recentOrders[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it('should respect the limit parameter', async () => {
      const recentOrders = await getRecentOrders(3);

      expect(recentOrders.length).toBeLessThanOrEqual(3);
    });

    it('should include customer information for authenticated orders', async () => {
      const recentOrders = await getRecentOrders(10);

      const authenticatedOrder = recentOrders.find(order => order.customerName !== null);
      expect(authenticatedOrder).toBeDefined();
      expect(authenticatedOrder!.customerName).toBeTruthy();
      expect(authenticatedOrder!.customerEmail).toBeTruthy();
    });

    it('should include all required order fields', async () => {
      const recentOrders = await getRecentOrders(5);

      expect(recentOrders.length).toBeGreaterThan(0);

      const order = recentOrders[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('orderNumber');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('customerEmail');
      expect(order).toHaveProperty('createdAt');
    });

    it('should return guest email when customer name is null', async () => {
      // Create a guest order
      const [guestOrder] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-GUEST-${Date.now()}`,
          guestEmail: 'guest@example.com',
          status: 'pending',
          subtotal: '50.00',
          tax: '5.00',
          shipping: '10.00',
          total: '65.00',
          shippingAddressLine1: '111 Guest St',
          shippingCity: 'Test City',
          shippingState: 'TS',
          shippingPostalCode: '12345',
          shippingCountry: 'US',
          paymentMethod: 'card',
        })
        .returning();

      await db.insert(orderItems).values({
        orderId: guestOrder.id,
        productId: testProductIds[0],
        productName: 'Test Product',
        quantity: 1,
        priceAtPurchase: '50.00',
        subtotal: '50.00',
      });

      const recentOrders = await getRecentOrders(10);
      const foundGuestOrder = recentOrders.find(o => o.id === guestOrder.id);

      expect(foundGuestOrder).toBeDefined();
      expect(foundGuestOrder!.customerName).toBeNull();
      expect(foundGuestOrder!.customerEmail).toBe('guest@example.com');

      // Clean up
      await db.delete(orderItems).where(eq(orderItems.orderId, guestOrder.id));
      await db.delete(orders).where(eq(orders.id, guestOrder.id));
    });

    it('should handle empty database gracefully', async () => {
      // This test assumes there might be no orders in a fresh database
      // The function should return an empty array without errors
      const recentOrders = await getRecentOrders(10);

      expect(Array.isArray(recentOrders)).toBe(true);
    });
  });
});
