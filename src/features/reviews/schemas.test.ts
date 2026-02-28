import { describe, it, expect } from 'vitest';
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  markReviewHelpfulSchema,
} from './schemas';

describe('Review Schemas', () => {
  describe('createReviewSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'This is a great product with excellent quality.',
      };

      const result = createReviewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid product ID', () => {
      const invalidData = {
        productId: 'not-a-uuid',
        rating: 5,
        comment: 'This is a great product with excellent quality.',
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject rating below 1', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        comment: 'This is a great product with excellent quality.',
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1');
      }
    });

    it('should reject rating above 5', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        comment: 'This is a great product with excellent quality.',
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 5');
      }
    });

    it('should reject non-integer rating', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4.5,
        comment: 'This is a great product with excellent quality.',
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject comment shorter than 10 characters', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'Too short',
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10');
      }
    });

    it('should reject comment longer than 2000 characters', () => {
      const invalidData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'a'.repeat(2001),
      };

      const result = createReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 2000');
      }
    });

    it('should accept comment exactly 10 characters', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: '1234567890',
      };

      const result = createReviewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept comment exactly 2000 characters', () => {
      const validData = {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        comment: 'a'.repeat(2000),
      };

      const result = createReviewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept all valid ratings from 1 to 5', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const validData = {
          productId: '123e4567-e89b-12d3-a456-426614174000',
          rating,
          comment: 'This is a valid review comment.',
        };

        const result = createReviewSchema.safeParse(validData);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateReviewSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        comment: 'Updated review with more details about the product.',
      };

      const result = updateReviewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid review ID', () => {
      const invalidData = {
        reviewId: 'not-a-uuid',
        rating: 4,
        comment: 'Updated review with more details about the product.',
      };

      const result = updateReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject rating below 1', () => {
      const invalidData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        comment: 'Updated review with more details about the product.',
      };

      const result = updateReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const invalidData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        comment: 'Updated review with more details about the product.',
      };

      const result = updateReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject comment shorter than 10 characters', () => {
      const invalidData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        comment: 'Short',
      };

      const result = updateReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject comment longer than 2000 characters', () => {
      const invalidData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        comment: 'a'.repeat(2001),
      };

      const result = updateReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('deleteReviewSchema', () => {
    it('should validate correct delete data', () => {
      const validData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = deleteReviewSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid review ID', () => {
      const invalidData = {
        reviewId: 'not-a-uuid',
      };

      const result = deleteReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing review ID', () => {
      const invalidData = {};

      const result = deleteReviewSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('markReviewHelpfulSchema', () => {
    it('should validate correct helpful data', () => {
      const validData = {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = markReviewHelpfulSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid review ID', () => {
      const invalidData = {
        reviewId: 'not-a-uuid',
      };

      const result = markReviewHelpfulSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing review ID', () => {
      const invalidData = {};

      const result = markReviewHelpfulSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
