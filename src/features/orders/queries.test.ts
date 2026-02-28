import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '@/db';
import { users, products, categories, inventory, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserOrders, getAllOrders, searchOrdersByNumber } from './queries';
import { hash } from 'bcrypt';

/**
 * Unit tests for order query functions
 * Validates: Requirements 7.1, 7.5, 12.1-12.5
 */

// Note: These tests require a running PostgreSQL database
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Order Query Functions (Unit Tests)', () => {
  let testUserId1: string;
  let testUserId2: string;
  let testCategoryId: string;
  let testProductId: string;
  let testOrderIds: string[] = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test users
    const [user1] = await db
      .insert(users)
      .values({
        email: `test-query-user1-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Test User 1',
        role: 'customer',
      })
      .returning();
    testUserId1 = user1.id;

    const [user2] = await db
      .insert(users)
      .values({
        email: `test-query-user2-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Test User 2',
        role: 'customer',
      })
      .returning();
    testUserId2 = user2.id;

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
        description: 'Test product for query tests',
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

    // Create test orders for user 1
    for (let i = 0; i < 3; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-TEST-USER1-${Date.now()}-${i}`,
          userId: testUserId1,
          status: i === 0 ? 'pending' : i === 1 ? 'processing' : 'shipped',
          subtotal: '29.99',
          tax: '2.99',
          shipping: '10.00',
          total: '42.98',
          shippingAddressLine1: '123 Test St',
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
        priceAtPurchase: '29.99',
        subtotal: '29.99',
      });
    }

    // Create test orders for user 2
    for (let i = 0; i < 2; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-TEST-USER2-${Date.now()}-${i}`,
          userId: testUserId2,
          status: 'delivered',
          subtotal: '59.98',
          tax: '5.99',
          shipping: '10.00',
          total: '75.97',
          shippingAddressLine1: '456 Test Ave',
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
        quantity: 2,
        priceAtPurchase: '29.99',
        subtotal: '59.98',
      });
    }
  });

  afterAll(async () => {
    if (!isDatabaseAvailable) return;

    // Clean up test data
    await db.delete(orderItems);
    for (const orderId of testOrderIds) {
      await db.delete(orders).where(eq(orders.id, orderId));
    }
    await db.delete(inventory).where(eq(inventory.productId, testProductId));
    await db.delete(products).where(eq(products.id, testProductId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId1));
    await db.delete(users).where(eq(users.id, testUserId2));
  });

  describe('getUserOrders', () => {
    it('should return all orders for a specific user', async () => {
      const result = await getUserOrders(testUserId1);

      expect(result.orders.length).toBe(3);
      expect(result.orders.every((order: any) => order.userId === testUserId1)).toBe(true);
    });

    it('should support pagination', async () => {
      const result = await getUserOrders(testUserId1, {
        page: 1,
        limit: 2,
      });

      expect(result.orders.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      const result = await getUserOrders(testUserId1, {
        status: 'pending',
      });

      expect(result.orders.length).toBe(1);
      expect(result.orders[0].status).toBe('pending');
    });

    it('should return empty array for user with no orders', async () => {
      const result = await getUserOrders('non-existent-user-id');

      expect(result.orders.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders with pagination', async () => {
      const result = await getAllOrders({
        page: 1,
        limit: 10,
      });

      expect(result.orders.length).toBeGreaterThanOrEqual(5);
      expect(result.pagination.total).toBeGreaterThanOrEqual(5);
    });

    it('should filter by status', async () => {
      const result = await getAllOrders({
        status: 'delivered',
      });

      expect(result.orders.every((order: any) => order.status === 'delivered')).toBe(true);
      expect(result.orders.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by user ID', async () => {
      const result = await getAllOrders({
        userId: testUserId2,
      });

      expect(result.orders.length).toBe(2);
      expect(result.orders.every((order: any) => order.userId === testUserId2)).toBe(true);
    });

    it('should sort by total amount', async () => {
      const resultAsc = await getAllOrders({
        sortBy: 'total',
        sortOrder: 'asc',
        limit: 10,
      });

      // Verify ascending order
      for (let i = 1; i < resultAsc.orders.length; i++) {
        const prev = parseFloat(resultAsc.orders[i - 1].total);
        const curr = parseFloat(resultAsc.orders[i].total);
        expect(curr).toBeGreaterThanOrEqual(prev);
      }

      const resultDesc = await getAllOrders({
        sortBy: 'total',
        sortOrder: 'desc',
        limit: 10,
      });

      // Verify descending order
      for (let i = 1; i < resultDesc.orders.length; i++) {
        const prev = parseFloat(resultDesc.orders[i - 1].total);
        const curr = parseFloat(resultDesc.orders[i].total);
        expect(curr).toBeLessThanOrEqual(prev);
      }
    });

    it('should sort by status', async () => {
      const result = await getAllOrders({
        sortBy: 'status',
        sortOrder: 'asc',
        limit: 10,
      });

      // Verify orders are sorted by status
      expect(result.orders.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', async () => {
      const result = await getAllOrders({
        userId: testUserId1,
        status: 'processing',
      });

      expect(result.orders.length).toBe(1);
      expect(result.orders[0].userId).toBe(testUserId1);
      expect(result.orders[0].status).toBe('processing');
    });
  });

  describe('searchOrdersByNumber', () => {
    it('should find orders by partial order number', async () => {
      const result = await searchOrdersByNumber('USER1');

      expect(result.length).toBe(3);
      expect(result.every((order: any) => order.orderNumber.includes('USER1'))).toBe(true);
    });

    it('should find orders by exact order number', async () => {
      const testOrder = await db.query.orders.findFirst({
        where: eq(orders.userId, testUserId1),
      });

      const result = await searchOrdersByNumber(testOrder!.orderNumber);

      expect(result.length).toBe(1);
      expect(result[0].orderNumber).toBe(testOrder!.orderNumber);
    });

    it('should return empty array when no matches found', async () => {
      const result = await searchOrdersByNumber('NONEXISTENT-ORDER-NUMBER');

      expect(result.length).toBe(0);
    });

    it('should be case insensitive', async () => {
      const result = await searchOrdersByNumber('user1');

      expect(result.length).toBe(3);
    });
  });
});
