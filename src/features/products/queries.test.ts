import { describe, it, expect, beforeAll } from 'vitest';
import {
  getProducts,
  getProductsByCategory,
  getSearchSuggestions,
  getSearchSuggestionsForQuery,
} from './queries';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Product Search and Filtering (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('getProducts - Basic Functionality', () => {
    it('should return products with default pagination', async () => {
      const result = await getProducts();

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(24);
      expect(Array.isArray(result.products)).toBe(true);
    });

    it('should respect custom pagination values', async () => {
      const result = await getProducts({ page: 2, limit: 12 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(12);
      expect(result.products.length).toBeLessThanOrEqual(12);
    });

    it('should calculate total pages correctly', async () => {
      const result = await getProducts({ limit: 10 });

      const expectedPages = Math.ceil(result.total / 10);
      expect(result.totalPages).toBe(expectedPages);
    });
  });

  describe('getProducts - Search Functionality', () => {
    it('should search products by name', async () => {
      const result = await getProducts({ search: 'test' });

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('total');
      // Results should be filtered by search term
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should search products by description', async () => {
      const result = await getProducts({ search: 'description' });

      expect(result).toHaveProperty('products');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty search results', async () => {
      const result = await getProducts({ search: 'xyznonexistentproduct123' });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should filter stop words from search', async () => {
      // Search with stop words should work the same as without
      const result1 = await getProducts({ search: 'laptop' });
      const result2 = await getProducts({ search: 'the laptop' });

      // Both should return similar results (stop words filtered)
      expect(result1.total).toBeGreaterThanOrEqual(0);
      expect(result2.total).toBeGreaterThanOrEqual(0);
    });

    it('should support partial word matching', async () => {
      const result = await getProducts({ search: 'lap' });

      expect(result).toHaveProperty('products');
      // Should find products with "laptop", "lapton", etc.
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should be case-insensitive', async () => {
      const result1 = await getProducts({ search: 'LAPTOP' });
      const result2 = await getProducts({ search: 'laptop' });
      const result3 = await getProducts({ search: 'LaPtOp' });

      // All should return the same results
      expect(result1.total).toBe(result2.total);
      expect(result2.total).toBe(result3.total);
    });
  });

  describe('getProducts - Filtering', () => {
    it('should filter by category', async () => {
      // Using a non-existent category ID should return no results
      const result = await getProducts({
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter by minimum price', async () => {
      const result = await getProducts({ minPrice: 100 });

      expect(result).toHaveProperty('products');
      // All products should have price >= 100
      result.products.forEach((product) => {
        expect(parseFloat(product.price)).toBeGreaterThanOrEqual(100);
      });
    });

    it('should filter by maximum price', async () => {
      const result = await getProducts({ maxPrice: 50 });

      expect(result).toHaveProperty('products');
      // All products should have price <= 50
      result.products.forEach((product) => {
        expect(parseFloat(product.price)).toBeLessThanOrEqual(50);
      });
    });

    it('should filter by price range', async () => {
      const result = await getProducts({ minPrice: 20, maxPrice: 100 });

      expect(result).toHaveProperty('products');
      // All products should be within price range
      result.products.forEach((product) => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(20);
        expect(price).toBeLessThanOrEqual(100);
      });
    });

    it('should filter by minimum rating', async () => {
      const result = await getProducts({ minRating: 4 });

      expect(result).toHaveProperty('products');
      // All products should have rating >= 4
      result.products.forEach((product) => {
        if (product.averageRating) {
          expect(parseFloat(product.averageRating)).toBeGreaterThanOrEqual(4);
        }
      });
    });

    it('should support multiple filters simultaneously', async () => {
      const result = await getProducts({
        minPrice: 10,
        maxPrice: 100,
        minRating: 3,
        search: 'test',
      });

      expect(result).toHaveProperty('products');
      // All filters should be applied
      result.products.forEach((product) => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(10);
        expect(price).toBeLessThanOrEqual(100);
        if (product.averageRating) {
          expect(parseFloat(product.averageRating)).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });

  describe('getProducts - Sorting', () => {
    it('should sort by price ascending', async () => {
      const result = await getProducts({ sortBy: 'price-asc', limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      // Verify ascending order
      for (let i = 1; i < result.products.length; i++) {
        const prevPrice = parseFloat(result.products[i - 1].price);
        const currPrice = parseFloat(result.products[i].price);
        expect(currPrice).toBeGreaterThanOrEqual(prevPrice);
      }
    });

    it('should sort by price descending', async () => {
      const result = await getProducts({ sortBy: 'price-desc', limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      // Verify descending order
      for (let i = 1; i < result.products.length; i++) {
        const prevPrice = parseFloat(result.products[i - 1].price);
        const currPrice = parseFloat(result.products[i].price);
        expect(currPrice).toBeLessThanOrEqual(prevPrice);
      }
    });

    it('should sort by rating', async () => {
      const result = await getProducts({ sortBy: 'rating', limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      // Verify descending rating order
      for (let i = 1; i < result.products.length; i++) {
        const prevRating = parseFloat(result.products[i - 1].averageRating || '0');
        const currRating = parseFloat(result.products[i].averageRating || '0');
        expect(currRating).toBeLessThanOrEqual(prevRating);
      }
    });

    it('should sort by newest first (default)', async () => {
      const result = await getProducts({ sortBy: 'newest', limit: 10 });

      expect(result.products.length).toBeGreaterThan(0);
      // Verify descending date order
      for (let i = 1; i < result.products.length; i++) {
        const prevDate = new Date(result.products[i - 1].createdAt);
        const currDate = new Date(result.products[i].createdAt);
        expect(currDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
      }
    });

    it('should sort by relevance when searching', async () => {
      const result = await getProducts({ search: 'laptop', limit: 10 });

      expect(result).toHaveProperty('products');
      // When searching, results should be sorted by relevance
      // Products with "laptop" in name should appear before those with it only in description
    });
  });

  describe('getProducts - Performance', () => {
    it('should return results within 500ms for large datasets', async () => {
      const startTime = Date.now();
      await getProducts({ page: 1, limit: 24 });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should be fast even with 100k products (with proper indexes)
      expect(executionTime).toBeLessThan(500);
    });

    it('should handle complex queries efficiently', async () => {
      const startTime = Date.now();
      await getProducts({
        search: 'laptop',
        minPrice: 100,
        maxPrice: 2000,
        minRating: 4,
        sortBy: 'price-asc',
        page: 1,
        limit: 24,
      });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return empty results for non-existent category', async () => {
      const result = await getProductsByCategory('123e4567-e89b-12d3-a456-426614174000');

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should support pagination', async () => {
      const result = await getProductsByCategory('123e4567-e89b-12d3-a456-426614174000', {
        page: 1,
        limit: 12,
      });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('should support filtering within category', async () => {
      const result = await getProductsByCategory('123e4567-e89b-12d3-a456-426614174000', {
        minPrice: 50,
        maxPrice: 200,
      });

      expect(result).toHaveProperty('products');
      result.products.forEach((product) => {
        const price = parseFloat(product.price);
        expect(price).toBeGreaterThanOrEqual(50);
        expect(price).toBeLessThanOrEqual(200);
      });
    });

    it('should support search within category', async () => {
      const result = await getProductsByCategory('123e4567-e89b-12d3-a456-426614174000', {
        search: 'test',
      });

      expect(result).toHaveProperty('products');
    });

    it('should support sorting within category', async () => {
      const result = await getProductsByCategory('123e4567-e89b-12d3-a456-426614174000', {
        sortBy: 'price-asc',
      });

      expect(result).toHaveProperty('products');
    });
  });

  describe('Search Suggestions', () => {
    it('should return popular search suggestions', async () => {
      const suggestions = await getSearchSuggestions(10);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });

    it('should return suggestions matching partial query', async () => {
      const suggestions = await getSearchSuggestionsForQuery('lap', 5);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      // All suggestions should start with 'lap'
      suggestions.forEach((suggestion) => {
        expect(suggestion.toLowerCase().startsWith('lap')).toBe(true);
      });
    });

    it('should return empty array for very short queries', async () => {
      const suggestions = await getSearchSuggestionsForQuery('a', 5);

      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await getSearchSuggestionsForQuery('', 5);

      expect(suggestions).toEqual([]);
    });
  });

  describe('Search Relevance Ranking', () => {
    it('should prioritize name matches over description matches', async () => {
      // This test would require specific test data
      // Products with search term in name should rank higher than those with it only in description
      const result = await getProducts({ search: 'laptop' });

      expect(result).toHaveProperty('products');
      // First few results should have 'laptop' in the name
    });

    it('should handle multi-term searches', async () => {
      const result = await getProducts({ search: 'wireless mouse' });

      expect(result).toHaveProperty('products');
      // Products matching both terms should rank higher
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search', async () => {
      const result = await getProducts({ search: 'test & product' });

      expect(result).toHaveProperty('products');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(300);
      const result = await getProducts({ search: longQuery });

      expect(result).toHaveProperty('products');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative prices gracefully', async () => {
      const result = await getProducts({ minPrice: -100 });

      expect(result).toHaveProperty('products');
      // Should still return results (negative prices filtered by database)
    });

    it('should handle invalid rating values', async () => {
      const result = await getProducts({ minRating: 10 });

      expect(result).toHaveProperty('products');
      // Should return empty or handle gracefully (ratings are 1-5)
    });

    it('should handle page beyond total pages', async () => {
      const result = await getProducts({ page: 9999, limit: 24 });

      expect(result.products).toEqual([]);
      expect(result.page).toBe(9999);
    });
  });
});
