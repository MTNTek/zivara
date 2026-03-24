'use server';

import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email.toLowerCase()),
    });

    if (existing) {
      if (existing.isActive) {
        return { success: true, message: 'You\'re already subscribed!' };
      }
      // Re-subscribe
      await db.update(newsletterSubscribers)
        .set({ isActive: true, unsubscribedAt: null, subscribedAt: new Date() })
        .where(eq(newsletterSubscribers.id, existing.id));
      return { success: true, message: 'Welcome back! You\'ve been re-subscribed.' };
    }

    await db.insert(newsletterSubscribers).values({
      email: email.toLowerCase(),
    });

    return { success: true, message: 'You\'re subscribed — check your inbox!' };
  } catch (error) {
    logger.error('Newsletter subscription failed', { error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function getSubscriberCount() {
  try {
    const result = await db.query.newsletterSubscribers.findMany({
      where: eq(newsletterSubscribers.isActive, true),
    });
    return result.length;
  } catch {
    return 0;
  }
}
