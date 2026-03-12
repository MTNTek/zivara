'use server';

import { db } from '@/db';
import { reviews, products, orderItems, orders } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  markReviewHelpfulSchema,
} from './schemas';

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new review for a product
 * Validates: Requirements 8.1-8.3, 8.8, 25.1-25.4
 * 
 * @param userId - ID of the user creating the review
 * @param data - Review data (productId, rating, comment)
 * @returns ActionResult with review ID if successful
 */
export async function createReview(
  userId: string,
  data: unknown
): Promise<ActionResult<{ reviewId: string }>> {
  try {
    // Validate input
    const validatedData = createReviewSchema.parse(data);

    // Check if user has purchased the product (Requirement 8.2, 25.1)
    const hasPurchased = await db.query.orderItems.findFirst({
      where: and(
        eq(orderItems.productId, validatedData.productId),
        eq(orders.userId, userId)
      ),
      with: {
        order: true,
      },
    });

    if (!hasPurchased) {
      return {
        success: false,
        error: 'You can only review products you have purchased',
      };
    }

    // Check if user has already reviewed this product (Requirement 25.2)
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.userId, userId),
        eq(reviews.productId, validatedData.productId)
      ),
    });

    if (existingReview) {
      return {
        success: false,
        error: 'You have already reviewed this product',
      };
    }

    // Create the review
    const [newReview] = await db
      .insert(reviews)
      .values({
        userId,
        productId: validatedData.productId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        isVerifiedPurchase: true,
        helpfulCount: 0,
      })
      .returning({ id: reviews.id });

    // Update product average rating and review count (Requirement 8.5, 25.5)
    await updateProductRating(validatedData.productId);

    return {
      success: true,
      data: { reviewId: newReview.id },
    };
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unable to submit your review. Please try again',
    };
  }
}

/**
 * Update an existing review
 * Validates: Requirements 8.6, 25.6, 25.7
 * 
 * @param userId - ID of the user updating the review
 * @param data - Updated review data
 * @returns ActionResult indicating success or failure
 */
export async function updateReview(
  userId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = updateReviewSchema.parse(data);

    // Get the existing review
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, validatedData.reviewId),
    });

    if (!existingReview) {
      return {
        success: false,
        error: 'This review could not be found',
      };
    }

    // Check if user owns the review
    if (existingReview.userId !== userId) {
      return {
        success: false,
        error: 'You can only edit your own reviews',
      };
    }

    // Check if review is within 30 days (Requirement 25.6)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (existingReview.createdAt < thirtyDaysAgo) {
      return {
        success: false,
        error: 'Reviews can only be edited within 30 days of submission',
      };
    }

    // Update the review (Requirement 25.7)
    await db
      .update(reviews)
      .set({
        rating: validatedData.rating,
        comment: validatedData.comment,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, validatedData.reviewId));

    // Recalculate product rating if rating changed
    if (existingReview.rating !== validatedData.rating) {
      await updateProductRating(existingReview.productId);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating review:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unable to update your review. Please try again',
    };
  }
}

/**
 * Delete a review
 * Validates: Requirements 8.6, 8.7
 * 
 * @param userId - ID of the user deleting the review
 * @param data - Review ID to delete
 * @returns ActionResult indicating success or failure
 */
export async function deleteReview(
  userId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = deleteReviewSchema.parse(data);

    // Get the existing review
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, validatedData.reviewId),
    });

    if (!existingReview) {
      return {
        success: false,
        error: 'This review could not be found',
      };
    }

    // Check if user owns the review
    if (existingReview.userId !== userId) {
      return {
        success: false,
        error: 'You can only delete your own reviews',
      };
    }

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, validatedData.reviewId));

    // Recalculate product rating (Requirement 8.7)
    await updateProductRating(existingReview.productId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unable to delete your review. Please try again',
    };
  }
}

/**
 * Mark a review as helpful
 * Validates: Requirements 24.5, 24.6
 * 
 * @param data - Review ID to mark as helpful
 * @returns ActionResult indicating success or failure
 */
export async function markReviewHelpful(
  data: unknown
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = markReviewHelpfulSchema.parse(data);

    // Check if review exists
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, validatedData.reviewId),
    });

    if (!review) {
      return {
        success: false,
        error: 'This review could not be found',
      };
    }

    // Increment helpful count
    await db
      .update(reviews)
      .set({
        helpfulCount: sql`${reviews.helpfulCount} + 1`,
      })
      .where(eq(reviews.id, validatedData.reviewId));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unable to mark review as helpful. Please try again',
    };
  }
}

/**
 * Helper function to update product average rating and review count
 * Validates: Requirements 8.5, 8.7
 * 
 * @param productId - ID of the product to update
 */
async function updateProductRating(productId: string): Promise<void> {
  // Calculate average rating and count
  const result = await db
    .select({
      avgRating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  const { avgRating, count } = result[0];

  // Update product
  await db
    .update(products)
    .set({
      averageRating: avgRating,
      reviewCount: count,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}
