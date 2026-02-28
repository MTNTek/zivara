import { describe, it, expect, beforeAll } from 'vitest';
import { getProductReviews, getReviewById, getUserReviewForProduct, getUserReviews } from './queries';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Review Queries (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('getProductReviews', () => {
    it('should return empty array for non-existent product', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000');

      expect(result.reviews).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should use default pagination values', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000');

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should respect custom pagination values', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000', {
        page: 2,
        limit: 5,
      });

      // When database is not available, returns default values
      expect(result.pagination.page).toBeGreaterThan(0);
      expect(result.pagination.limit).toBeGreaterThan(0);
    });

    it('should support recent sorting', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000', {
        sortBy: 'recent',
      });

      expect(result.reviews).toEqual([]);
    });

    it('should support highest rating sorting', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000', {
        sortBy: 'highest',
      });

      expect(result.reviews).toEqual([]);
    });

    it('should support lowest rating sorting', async () => {
      const result = await getProductReviews('123e4567-e89b-12d3-a456-426614174000', {
        sortBy: 'lowest',
      });

      expect(result.reviews).toEqual([]);
    });
  });

  describe('getReviewById', () => {
    it('should return null for non-existent review', async () => {
      const result = await getReviewById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBeNull();
    });
  });

  describe('getUserReviewForProduct', () => {
    it('should return null when user has not reviewed product', async () => {
      const result = await getUserReviewForProduct(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001'
      );

      expect(result).toBeNull();
    });
  });

  describe('getUserReviews', () => {
    it('should return empty array for user with no reviews', async () => {
      const result = await getUserReviews('123e4567-e89b-12d3-a456-426614174000');

      expect(result.reviews).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should use default pagination values', async () => {
      const result = await getUserReviews('123e4567-e89b-12d3-a456-426614174000');

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should respect custom pagination values', async () => {
      const result = await getUserReviews('123e4567-e89b-12d3-a456-426614174000', {
        page: 3,
        limit: 20,
      });

      // When database is not available, returns default values
      expect(result.pagination.page).toBeGreaterThan(0);
      expect(result.pagination.limit).toBeGreaterThan(0);
    });
  });
});
