import { describe, it, expect, beforeAll } from 'vitest';
import { createReview, updateReview, deleteReview, markReviewHelpful } from './actions';

// Note: These tests require a running PostgreSQL database
// Skip if DATABASE_URL is not configured
const isDatabaseAvailable = !!process.env.DATABASE_URL;

describe.skipIf(!isDatabaseAvailable)('Review Actions (Integration)', () => {
  beforeAll(() => {
    if (!isDatabaseAvailable) {
      console.log('Skipping database integration tests - DATABASE_URL not configured');
    }
  });

  describe('createReview - validation', () => {
    it('should reject invalid product ID', async () => {
      const reviewData = {
        productId: 'invalid-uuid',
        rating: 5,
        comment: 'This is a great product with excellent quality.',
      };

      const result = await createReview('test-user-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject rating below 1', async () => {
      const reviewData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        comment: 'This is a great product with excellent quality.',
      };

      const result = await createReview('test-user-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject rating above 5', async () => {
      const reviewData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        comment: 'This is a great product with excellent quality.',
      };

      const result = await createReview('test-user-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject comment shorter than 10 characters', async () => {
      const reviewData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'Too short',
      };

      const result = await createReview('test-user-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject comment longer than 2000 characters', async () => {
      const reviewData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'a'.repeat(2001),
      };

      const result = await createReview('test-user-id', reviewData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid review data', async () => {
      const reviewData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'This is a great product with excellent quality and features.',
      };

      // This will fail at database level since we don't have test data
      // but it validates the schema
      const result = await createReview('test-user-id', reviewData);

      // Either succeeds or fails with database error, not validation error
      if (!result.success) {
        expect(result.error).not.toContain('Invalid');
        expect(result.error).not.toContain('must be');
      }
    });
  });

  describe('updateReview - validation', () => {
    it('should reject invalid review ID', async () => {
      const updateData = {
        reviewId: 'invalid-uuid',
        rating: 4,
        comment: 'Updated review with more details about the product.',
      };

      const result = await updateReview('test-user-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject rating below 1', async () => {
      const updateData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        comment: 'Updated review with more details about the product.',
      };

      const result = await updateReview('test-user-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject rating above 5', async () => {
      const updateData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        comment: 'Updated review with more details about the product.',
      };

      const result = await updateReview('test-user-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject comment shorter than 10 characters', async () => {
      const updateData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        comment: 'Short',
      };

      const result = await updateReview('test-user-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject comment longer than 2000 characters', async () => {
      const updateData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        comment: 'a'.repeat(2001),
      };

      const result = await updateReview('test-user-id', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deleteReview - validation', () => {
    it('should reject invalid review ID', async () => {
      const deleteData = {
        reviewId: 'invalid-uuid',
      };

      const result = await deleteReview('test-user-id', deleteData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid review ID format', async () => {
      const deleteData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
      };

      // This will fail at database level since review doesn't exist
      // but it validates the schema
      const result = await deleteReview('test-user-id', deleteData);

      // Either succeeds or fails with database error, not validation error
      if (!result.success) {
        expect(result.error).not.toContain('Invalid');
      }
    });
  });

  describe('markReviewHelpful - validation', () => {
    it('should reject invalid review ID', async () => {
      const helpfulData = {
        reviewId: 'invalid-uuid',
      };

      const result = await markReviewHelpful(helpfulData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept valid review ID format', async () => {
      const helpfulData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
      };

      // This will fail at database level since review doesn't exist
      // but it validates the schema
      const result = await markReviewHelpful(helpfulData);

      // Either succeeds or fails with database error, not validation error
      if (!result.success) {
        expect(result.error).not.toContain('Invalid');
      }
    });
  });
});
