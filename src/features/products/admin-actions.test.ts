import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createProduct, updateProduct, deleteProduct, bulkUpdateProducts } from './actions';
import * as auth from '@/lib/auth';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  requireAdmin: vi.fn(),
  getCurrentUserId: vi.fn(),
}));

// Mock the database
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: '99.99',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Updated Product',
            slug: 'updated-product',
            description: 'Updated description',
            price: '149.99',
            categoryId: '123e4567-e89b-12d3-a456-426614174000',
            isActive: true,
            updatedAt: new Date(),
          }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    query: {
      products: {
        findFirst: vi.fn(() => Promise.resolve({
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: '99.99',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        })),
      },
    },
  },
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Admin Product Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful admin authentication
    vi.mocked(auth.requireAdmin).mockResolvedValue({
      user: { id: 'admin-user-id', email: 'admin@test.com', role: 'admin' },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '99.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Product');
    });

    it('should reject product with invalid price format', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '99.999', // 3 decimal places
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with negative price', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '-10.00',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with missing required fields', async () => {
      const productData = {
        name: '',
        slug: 'test-product',
        description: 'A test product description',
        price: '99.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject product with invalid slug format', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'Test Product With Spaces',
        description: 'A test product description',
        price: '99.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject discount price greater than regular price', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '100.00',
        discountPrice: '150.00',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid discount price', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '100.00',
        discountPrice: '79.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(true);
    });
  });

  describe('updateProduct', () => {
    it('should update a product with valid data', async () => {
      const updateData = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Updated Product',
        price: '149.99',
      };

      const result = await updateProduct(updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject update with invalid price', async () => {
      const updateData = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        price: 'invalid-price',
      };

      const result = await updateProduct(updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const updateData = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Updated Name Only',
      };

      const result = await updateProduct(updateData);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      const result = await deleteProduct('123e4567-e89b-12d3-a456-426614174001');

      expect(result.success).toBe(true);
    });

    it('should handle non-existent product', async () => {
      // Mock product not found
      const { db } = await import('@/db');
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null);

      const result = await deleteProduct('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });
  });

  describe('bulkUpdateProducts', () => {
    it('should update multiple products status', async () => {
      const productIds = ['product-1', 'product-2', 'product-3'];
      const updates = { isActive: false };

      const result = await bulkUpdateProducts(productIds, updates);

      expect(result.success).toBe(true);
      expect(result.data?.updated).toBe(3);
    });

    it('should update multiple products category', async () => {
      const productIds = ['product-1', 'product-2'];
      const updates = { categoryId: 'new-category-id' };

      const result = await bulkUpdateProducts(productIds, updates);

      expect(result.success).toBe(true);
      expect(result.data?.updated).toBe(2);
    });

    it('should reject empty product list', async () => {
      const result = await bulkUpdateProducts([], { isActive: false });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No products selected');
    });

    it('should handle bulk activation', async () => {
      const productIds = ['product-1', 'product-2'];
      const updates = { isActive: true };

      const result = await bulkUpdateProducts(productIds, updates);

      expect(result.success).toBe(true);
    });

    it('should handle bulk deactivation', async () => {
      const productIds = ['product-1', 'product-2'];
      const updates = { isActive: false };

      const result = await bulkUpdateProducts(productIds, updates);

      expect(result.success).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        slug: '',
        description: '',
        price: '',
        categoryId: '',
        isActive: true,
      };

      const result = await createProduct(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate price format with 2 decimal places', async () => {
      const validPrices = ['10.00', '99.99', '1.50', '100', '0.01'];

      for (const price of validPrices) {
        const productData = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        };

        const result = await createProduct(productData);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid price formats', async () => {
      const invalidPrices = ['10.999', 'abc', '', '-10', '0'];

      for (const price of invalidPrices) {
        const productData = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        };

        const result = await createProduct(productData);
        expect(result.success).toBe(false);
      }
    });

    it('should validate slug format', async () => {
      const validSlugs = ['test-product', 'product-123', 'my-awesome-product'];

      for (const slug of validSlugs) {
        const productData = {
          name: 'Test Product',
          slug,
          description: 'Test description',
          price: '99.99',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        };

        const result = await createProduct(productData);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid slug formats', async () => {
      const invalidSlugs = ['Test Product', 'test_product', 'test product', 'TEST-PRODUCT'];

      for (const slug of invalidSlugs) {
        const productData = {
          name: 'Test Product',
          slug,
          description: 'Test description',
          price: '99.99',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        };

        const result = await createProduct(productData);
        expect(result.success).toBe(false);
      }
    });

    it('should validate discount price is less than regular price', async () => {
      const testCases = [
        { price: '100.00', discountPrice: '99.99', shouldPass: true },
        { price: '100.00', discountPrice: '50.00', shouldPass: true },
        { price: '100.00', discountPrice: '100.00', shouldPass: false },
        { price: '100.00', discountPrice: '100.01', shouldPass: false },
      ];

      for (const testCase of testCases) {
        const productData = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: testCase.price,
          discountPrice: testCase.discountPrice,
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          isActive: true,
        };

        const result = await createProduct(productData);
        expect(result.success).toBe(testCase.shouldPass);
      }
    });
  });

  describe('Authorization', () => {
    it('should require admin role for product creation', async () => {
      // Mock unauthorized access
      vi.mocked(auth.requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'));

      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: '99.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = await createProduct(productData);

      expect(result.success).toBe(false);
    });

    it('should require admin role for product updates', async () => {
      vi.mocked(auth.requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await updateProduct({
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Updated Name',
      });

      expect(result.success).toBe(false);
    });

    it('should require admin role for product deletion', async () => {
      vi.mocked(auth.requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await deleteProduct('123e4567-e89b-12d3-a456-426614174001');

      expect(result.success).toBe(false);
    });

    it('should require admin role for bulk operations', async () => {
      vi.mocked(auth.requireAdmin).mockRejectedValueOnce(new Error('Unauthorized'));

      const result = await bulkUpdateProducts(['product-1'], { isActive: false });

      expect(result.success).toBe(false);
    });
  });
});


