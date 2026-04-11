'use server';

import { db } from '@/db';
import { searchQueries } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Record a search query for analytics
 */
export async function recordSearchQuery(query: string, resultsCount: number, executionTimeMs?: number) {
  try {
    if (!query || query.trim().length < 2) return;

    const userId = await getCurrentUserId().catch(() => null);

    await db.insert(searchQueries).values({
      query: query.trim().toLowerCase(),
      userId: userId || undefined,
      resultsCount,
      executionTimeMs: executionTimeMs ?? null,
    });
  } catch {
    // Don't let analytics failures affect the user experience
  }
}
