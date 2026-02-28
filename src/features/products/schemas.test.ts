import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { productSchema, categorySchema } from './schemas';

describe('Product Schemas', () => {
  describe('productSchema', () => {
    it('should validate valid product data', () => {
      const validData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '99.99',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid price format', () => {
      const invalidData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '99.999', // 3 decimal places
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '-10.00',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject discount price greater than or equal to regular price', () => {
      const invalidData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product description',
        price: '100.00',
        discountPrice: '100.00',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    /**
     * **Validates: Requirements 2.6**
     * 
     * Property: Product prices are always positive decimals with max 2 decimal places
     * 
     * This property test ensures that:
     * 1. All valid prices are positive numbers
     * 2. All valid prices have at most 2 decimal places
     * 3. The validation correctly rejects invalid prices
     */
    it('property: prices are always positive decimals with max 2 decimal places', () => {
      fc.assert(
        fc.property(
          // Generate positive numbers with max 2 decimal places
          fc.double({ min: 0.01, max: 999999.99, noNaN: true }),
          (price) => {
            // Round to 2 decimal places to ensure valid format
            const roundedPrice = Math.round(price * 100) / 100;
            const priceString = roundedPrice.toFixed(2);

            const productData = {
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              price: priceString,
              categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = productSchema.safeParse(productData);

            // All positive prices with max 2 decimals should be valid
            expect(result.success).toBe(true);

            if (result.success) {
              const parsedPrice = parseFloat(result.data.price);
              // Verify the price is positive
              expect(parsedPrice).toBeGreaterThan(0);
              
              // Verify max 2 decimal places
              const decimalPart = result.data.price.split('.')[1];
              if (decimalPart) {
                expect(decimalPart.length).toBeLessThanOrEqual(2);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('property: negative prices are always rejected', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -999999.99, max: -0.01, noNaN: true }),
          (price) => {
            const priceString = price.toFixed(2);

            const productData = {
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              price: priceString,
              categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = productSchema.safeParse(productData);

            // All negative prices should be rejected
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('property: zero price is rejected', () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: '0.00',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = productSchema.safeParse(productData);
      expect(result.success).toBe(false);
    });

    it('property: prices with more than 2 decimal places are rejected', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.001, max: 999999.999, noNaN: true }),
          fc.integer({ min: 3, max: 10 }),
          (price, decimals) => {
            // Create a price string with more than 2 decimal places
            const priceString = price.toFixed(decimals);
            
            // Only test if it actually has more than 2 decimal places
            const decimalPart = priceString.split('.')[1];
            if (!decimalPart || decimalPart.length <= 2) {
              return; // Skip this case
            }

            const productData = {
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              price: priceString,
              categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = productSchema.safeParse(productData);

            // Prices with more than 2 decimal places should be rejected
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('property: discount price must be less than regular price', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 10.00, max: 999999.99, noNaN: true }),
          fc.double({ min: 0.01, max: 0.99, noNaN: true }),
          (regularPrice, discountRatio) => {
            const regular = Math.round(regularPrice * 100) / 100;
            const discount = Math.round(regular * discountRatio * 100) / 100;

            const productData = {
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              price: regular.toFixed(2),
              discountPrice: discount.toFixed(2),
              categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = productSchema.safeParse(productData);

            // Discount less than regular price should be valid
            expect(result.success).toBe(true);

            if (result.success) {
              const parsedRegular = parseFloat(result.data.price);
              const parsedDiscount = parseFloat(result.data.discountPrice!);
              expect(parsedDiscount).toBeLessThan(parsedRegular);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('categorySchema', () => {
    it('should validate valid category data', () => {
      const validData = {
        name: 'Electronics',
        slug: 'electronics',
        displayOrder: 0,
      };

      const result = categorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug format', () => {
      const invalidData = {
        name: 'Electronics',
        slug: 'Electronics With Spaces',
        displayOrder: 0,
      };

      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid parent ID', () => {
      const validData = {
        name: 'Laptops',
        slug: 'laptops',
        parentId: '123e4567-e89b-12d3-a456-426614174000',
        displayOrder: 0,
      };

      const result = categorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid parent ID format', () => {
      const invalidData = {
        name: 'Laptops',
        slug: 'laptops',
        parentId: 'not-a-uuid',
        displayOrder: 0,
      };

      const result = categorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
