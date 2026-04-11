import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db';
import { users, orders, orderItems, products, categories, inventory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUsers, getUserWithOrders } from './user-queries';
import { hash } from 'bcrypt';

/**
 * Unit tests for admin user management query functions
 * Validates: Requirements 26.1, 26.2, 26.3
 */

const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Admin User Management Query Functions (Unit Tests)', () => {
  const testUserIds: string[] = [];
  let testCategoryId: string;
  let testProductId: string;
  const testOrderIds: string[] = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test category and product for orders
    const [category] = await db
      .insert(categories)
      .values({
        name: `Test User Mgmt Category ${Date.now()}`,
        slug: `test-user-mgmt-category-${Date.now()}`,
      })
      .returning();
    testCategoryId = category.id;

    const [product] = await db
      .insert(products)
      .values({
        name: `Test User Mgmt Product ${Date.now()}`,
        slug: `test-user-mgmt-product-${Date.now()}`,
        description: 'Test product for user management tests',
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

    // Create test users with different attributes
    const testUsers = [
      {
        email: `alice-${Date.now()}@example.com`,
        name: 'Alice Johnson',
        role: 'customer',
        isActive: true,
      },
      {
        email: `bob-${Date.now()}@example.com`,
        name: 'Bob Smith',
        role: 'customer',
        isActive: true,
      },
      {
        email: `charlie-${Date.now()}@example.com`,
        name: 'Charlie Brown',
        role: 'admin',
        isActive: true,
      },
      {
        email: `deactivated-${Date.now()}@example.com`,
        name: 'Deactivated User',
        role: 'customer',
        isActive: false,
      },
    ];

    for (const userData of testUsers) {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          passwordHash: await hash('password123', 10),
        })
        .returning();
      testUserIds.push(user.id);
    }

    // Create orders for first user (Alice)
    for (let i = 0; i < 3; i++) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-USER-TEST-${Date.now()}-${i}`,
          userId: testUserIds[0],
          status: i === 0 ? 'delivered' : i === 1 ? 'shipped' : 'processing',
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
        })
        .returning();
      testOrderIds.push(order.id);

      await db.insert(orderItems).values({
        orderId: order.id,
        productId: testProductId,
        productName: 'Test Product',
        quantity: 2,
        priceAtPurchase: '50.00',
        subtotal: '100.00',
      });
    }

    // Create one order for second user (Bob)
    const [bobOrder] = await db
      .insert(orders)
      .values({
        orderNumber: `ORD-BOB-TEST-${Date.now()}`,
        userId: testUserIds[1],
        status: 'pending',
        subtotal: '50.00',
        tax: '5.00',
        shipping: '10.00',
        total: '65.00',
        shippingAddressLine1: '456 Test Ave',
        shippingCity: 'Test City',
        shippingState: 'TS',
        shippingPostalCode: '12345',
        shippingCountry: 'US',
        paymentMethod: 'card',
      })
      .returning();
    testOrderIds.push(bobOrder.id);

    await db.insert(orderItems).values({
      orderId: bobOrder.id,
      productId: testProductId,
      productName: 'Test Product',
      quantity: 1,
      priceAtPurchase: '50.00',
      subtotal: '50.00',
    });
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
    for (const userId of testUserIds) {
      await db.delete(users).where(eq(users.id, userId));
    }
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const result = await getUsers({ page: 1, limit: 10 });

      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users.length).toBeGreaterThanOrEqual(4);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should include order count for each user', async () => {
      const result = await getUsers({ page: 1, limit: 10 });

      const alice = result.users.find(u => u.name === 'Alice Johnson');
      const bob = result.users.find(u => u.name === 'Bob Smith');
      const charlie = result.users.find(u => u.name === 'Charlie Brown');

      expect(alice).toBeDefined();
      expect(alice!.orderCount).toBe(3);
      expect(bob).toBeDefined();
      expect(bob!.orderCount).toBe(1);
      expect(charlie).toBeDefined();
      expect(charlie!.orderCount).toBe(0);
    });

    it('should search users by email', async () => {
      const result = await getUsers({ search: 'alice', page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      const alice = result.users.find(u => u.name === 'Alice Johnson');
      expect(alice).toBeDefined();
    });

    it('should search users by name', async () => {
      const result = await getUsers({ search: 'Bob Smith', page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      const bob = result.users.find(u => u.name === 'Bob Smith');
      expect(bob).toBeDefined();
    });

    it('should return empty results for non-matching search', async () => {
      const result = await getUsers({ search: 'nonexistent-user-xyz', page: 1, limit: 10 });

      expect(result.users.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should sort users by name ascending', async () => {
      const result = await getUsers({ sortBy: 'name', sortOrder: 'asc', page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThan(0);

      // Check if sorted alphabetically
      for (let i = 1; i < result.users.length; i++) {
        expect(result.users[i].name.localeCompare(result.users[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort users by email descending', async () => {
      const result = await getUsers({ sortBy: 'email', sortOrder: 'desc', page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThan(0);

      // Check if sorted in reverse alphabetical order
      for (let i = 1; i < result.users.length; i++) {
        expect(result.users[i - 1].email.localeCompare(result.users[i].email)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort users by creation date by default', async () => {
      const result = await getUsers({ page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThan(0);

      // Check if sorted by most recent first (desc)
      for (let i = 1; i < result.users.length; i++) {
        const prevDate = new Date(result.users[i - 1].createdAt).getTime();
        const currDate = new Date(result.users[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it('should respect pagination limit', async () => {
      const result = await getUsers({ page: 1, limit: 2 });

      expect(result.users.length).toBeLessThanOrEqual(2);
    });

    it('should calculate total pages correctly', async () => {
      const result = await getUsers({ page: 1, limit: 2 });

      const expectedPages = Math.ceil(result.pagination.total / 2);
      expect(result.pagination.totalPages).toBe(expectedPages);
    });

    it('should include all user fields', async () => {
      const result = await getUsers({ page: 1, limit: 10 });

      expect(result.users.length).toBeGreaterThan(0);

      const user = result.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('orderCount');
    });

    it('should include both active and inactive users', async () => {
      const result = await getUsers({ page: 1, limit: 10 });

      const activeUser = result.users.find(u => u.isActive === true);
      const inactiveUser = result.users.find(u => u.isActive === false);

      expect(activeUser).toBeDefined();
      expect(inactiveUser).toBeDefined();
    });
  });

  describe('getUserWithOrders', () => {
    it('should return user details with order history', async () => {
      const user = await getUserWithOrders(testUserIds[0]);

      expect(user).toBeDefined();
      expect(user!.name).toBe('Alice Johnson');
      expect(user!.orders).toBeDefined();
      expect(Array.isArray(user!.orders)).toBe(true);
      expect(user!.orders.length).toBe(3);
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserWithOrders('00000000-0000-0000-0000-000000000000');

      expect(user).toBeNull();
    });

    it('should include all user fields', async () => {
      const user = await getUserWithOrders(testUserIds[0]);

      expect(user).toBeDefined();
      expect(user!).toHaveProperty('id');
      expect(user!).toHaveProperty('email');
      expect(user!).toHaveProperty('name');
      expect(user!).toHaveProperty('role');
      expect(user!).toHaveProperty('isActive');
      expect(user!).toHaveProperty('createdAt');
      expect(user!).toHaveProperty('updatedAt');
      expect(user!).toHaveProperty('orders');
    });

    it('should include all order fields', async () => {
      const user = await getUserWithOrders(testUserIds[0]);

      expect(user).toBeDefined();
      expect(user!.orders.length).toBeGreaterThan(0);

      const order = user!.orders[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('orderNumber');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('createdAt');
    });

    it('should sort orders by most recent first', async () => {
      const user = await getUserWithOrders(testUserIds[0]);

      expect(user).toBeDefined();
      expect(user!.orders.length).toBeGreaterThan(1);

      // Check if sorted by most recent first
      for (let i = 1; i < user!.orders.length; i++) {
        const prevDate = new Date(user!.orders[i - 1].createdAt).getTime();
        const currDate = new Date(user!.orders[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it('should return user with empty orders array if no orders', async () => {
      const user = await getUserWithOrders(testUserIds[2]); // Charlie (admin with no orders)

      expect(user).toBeDefined();
      expect(user!.name).toBe('Charlie Brown');
      expect(user!.orders).toBeDefined();
      expect(Array.isArray(user!.orders)).toBe(true);
      expect(user!.orders.length).toBe(0);
    });

    it('should include inactive users', async () => {
      const user = await getUserWithOrders(testUserIds[3]); // Deactivated user

      expect(user).toBeDefined();
      expect(user!.name).toBe('Deactivated User');
      expect(user!.isActive).toBe(false);
    });
  });
});
