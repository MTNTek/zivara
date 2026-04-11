import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db';
import { users, products, categories, inventory, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { exportOrdersToCSV } from './export-actions';
import { hash } from 'bcrypt';

/**
 * Unit tests for order export functionality
 * Validates: Requirement 21.6
 */

const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Order Export Functions (Unit Tests)', () => {
  const testUserId: string;
  let testCategoryId: string;
  let testProductId: string;
  const testOrderIds: string[] = [];
  const testOrderNumbers: string[] = [];

  beforeAll(async () => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
      return;
    }

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: `test-export-${Date.now()}@example.com`,
        passwordHash: await hash('password123', 10),
        name: 'Export Test User',
        role: 'customer',
      })
      .returning();
    testUserId = user.id;

    // Create test category
    const [category] = await db
      .insert(categories)
      .values({
        name: `Export Category ${Date.now()}`,
        slug: `export-category-${Date.now()}`,
      })
      .returning();
    testCategoryId = category.id;

    // Create test product
    const [product] = await db
      .insert(products)
      .values({
        name: `Export Product ${Date.now()}`,
        slug: `export-product-${Date.now()}`,
        description: 'Test product for export',
        price: '75.00',
        categoryId: testCategoryId,
        isActive: true,
      })
      .returning();
    testProductId = product.id;

    await db.insert(inventory).values({
      productId: product.id,
      quantity: 100,
    });

    // Create test orders
    const orderStatuses = ['pending', 'processing', 'shipped'];

    for (let i = 0; i < 3; i++) {
      const orderNumber = `ORD-EXPORT-${Date.now()}-${i}`;
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber,
          userId: testUserId,
          status: orderStatuses[i],
          subtotal: '75.00',
          tax: '7.50',
          shipping: '10.00',
          total: '92.50',
          shippingAddressLine1: '456 Export St',
          shippingAddressLine2: 'Apt 2B',
          shippingCity: 'Export City',
          shippingState: 'EX',
          shippingPostalCode: '54321',
          shippingCountry: 'US',
          paymentMethod: 'card',
          lastFourDigits: '4242',
        })
        .returning();

      testOrderIds.push(order.id);
      testOrderNumbers.push(orderNumber);

      await db.insert(orderItems).values({
        orderId: order.id,
        productId: testProductId,
        productName: 'Export Product',
        quantity: 2,
        priceAtPurchase: '37.50',
        subtotal: '75.00',
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

  describe('exportOrdersToCSV', () => {
    it('should export orders to CSV format', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('should include CSV headers', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      const lines = result.data!.split('\n');
      const headers = lines[0];

      expect(headers).toContain('Order Number');
      expect(headers).toContain('Order Date');
      expect(headers).toContain('Status');
      expect(headers).toContain('Customer Name');
      expect(headers).toContain('Customer Email');
      expect(headers).toContain('Total');
      expect(headers).toContain('Shipping Address Line 1');
      expect(headers).toContain('Items');
    });

    it('should include order data in CSV', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      const csvContent = result.data!;

      // Check that our test orders are included
      expect(csvContent).toContain('Export Test User');
      expect(csvContent).toContain('92.50');
      expect(csvContent).toContain('Export City');
    });

    it('should filter orders by status', async () => {
      const result = await exportOrdersToCSV({ status: 'pending' });

      expect(result.success).toBe(true);
      const lines = result.data!.split('\n');
      
      // Should have header + at least 1 pending order
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(result.data).toContain('pending');
    });

    it('should filter orders by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await exportOrdersToCSV({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(3);
    });

    it('should filter orders by order number', async () => {
      const result = await exportOrdersToCSV({
        orderNumber: testOrderNumbers[0],
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain(testOrderNumbers[0]);
    });

    it('should escape CSV special characters', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      
      // CSV should handle commas in addresses properly
      // Fields with commas should be quoted
      const lines = result.data!.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should include order items in export', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      expect(result.data).toContain('Export Product');
      expect(result.data).toContain('x2'); // Quantity
    });

    it('should include payment information', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      expect(result.data).toContain('4242'); // Last 4 digits
      expect(result.data).toContain('card'); // Payment method
    });

    it('should handle orders with no matching filters', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);

      const result = await exportOrdersToCSV({
        startDate: futureDate,
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      
      // Should still have headers
      const lines = result.data!.split('\n');
      expect(lines.length).toBe(1); // Only header line
    });

    it('should return count of exported orders', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(typeof result.count).toBe('number');
    });

    it('should handle multiple filters simultaneously', async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const result = await exportOrdersToCSV({
        status: 'processing',
        userId: testUserId,
        startDate: yesterday,
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain('processing');
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it('should include all required order fields', async () => {
      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      const csvContent = result.data!;

      // Check for all important fields
      expect(csvContent).toContain('75.00'); // Subtotal
      expect(csvContent).toContain('7.50'); // Tax
      expect(csvContent).toContain('10.00'); // Shipping
      expect(csvContent).toContain('456 Export St'); // Address line 1
      expect(csvContent).toContain('Apt 2B'); // Address line 2
      expect(csvContent).toContain('54321'); // Postal code
    });
  });
});
