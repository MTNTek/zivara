'use server';

import { db } from '@/db';
import { reviews, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { ActionResult } from './actions';

/**
 * Admin: Delete any review (moderation)
 */
export async function adminDeleteReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    const productId = review.productId;

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Recalculate product rating
    const result = await db
      .select({
        avgRating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const { avgRating, count } = result[0];

    await db
      .update(products)
      .set({
        averageRating: avgRating,
        reviewCount: count,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    return { success: true };
  } catch (error) {
    logger.error('Error deleting review', { error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete review',
    };
  }
}
