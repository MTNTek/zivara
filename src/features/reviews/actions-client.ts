'use server';

import { getSession } from '@/lib/auth';
import { createReview, type ActionResult } from './actions';

/**
 * Wrapper for createReview that gets userId from the current session.
 * Used by client components that don't have access to the userId.
 */
export async function submitReview(
  data: { productId: string; rating: number; comment: string }
): Promise<ActionResult<{ reviewId: string }>> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Please sign in to submit a review',
    };
  }

  return createReview(session.user.id, data);
}
