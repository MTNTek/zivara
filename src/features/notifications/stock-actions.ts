'use server';

import { db } from '@/db';
import { stockNotifications } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Subscribe to stock notifications for a product
 */
export async function subscribeStockNotification(productId: string, email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Valid email required' };
    }

    const userId = await getCurrentUserId();

    // Check for existing subscription
    const existing = await db.query.stockNotifications.findFirst({
      where: and(
        eq(stockNotifications.productId, productId),
        eq(stockNotifications.email, email.toLowerCase()),
        eq(stockNotifications.notified, false),
      ),
    });

    if (existing) {
      return { success: true, message: 'Already subscribed' };
    }

    await db.insert(stockNotifications).values({
      productId,
      email: email.toLowerCase(),
      userId: userId || undefined,
    });

    return { success: true, message: 'Notification set' };
  } catch {
    return { success: false, error: 'Failed to set notification' };
  }
}
