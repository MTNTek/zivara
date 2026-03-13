'use server';

import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

export async function toggleWishlist(productId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'Sign in to save items', added: false };
  }

  const existing = await db.query.wishlistItems.findFirst({
    where: and(
      eq(wishlistItems.userId, userId),
      eq(wishlistItems.productId, productId),
    ),
  });

  if (existing) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return { success: true, added: false };
  }

  await db.insert(wishlistItems).values({ userId, productId });
  return { success: true, added: true };
}

export async function getWishlistProductIds(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const items = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  return items.map((i) => i.productId);
}

export async function getWishlistItems() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, userId),
    with: {
      product: {
        with: {
          images: true,
          inventory: true,
        },
      },
    },
    orderBy: (w, { desc }) => [desc(w.createdAt)],
  });
}

export async function removeFromWishlist(productId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };

  await db.delete(wishlistItems).where(
    and(
      eq(wishlistItems.userId, userId),
      eq(wishlistItems.productId, productId),
    ),
  );

  return { success: true };
}
