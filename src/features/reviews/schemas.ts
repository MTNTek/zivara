import { z } from 'zod';

/**
 * Schema for creating a new review
 * Validates: Requirements 8.1-8.3, 8.8, 25.1-25.4
 */
export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be at most 2000 characters'),
});

/**
 * Schema for updating an existing review
 * Validates: Requirements 8.6, 25.6, 25.7
 */
export const updateReviewSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be at most 2000 characters'),
});

/**
 * Schema for deleting a review
 */
export const deleteReviewSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
});

/**
 * Schema for marking a review as helpful
 * Validates: Requirements 24.5, 24.6
 */
export const markReviewHelpfulSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
export type MarkReviewHelpfulInput = z.infer<typeof markReviewHelpfulSchema>;
