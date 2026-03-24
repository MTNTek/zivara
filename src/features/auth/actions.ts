'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * Check if any users exist in the database
 */
export async function hasAnyUsers(): Promise<boolean> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return Number(result[0].count) > 0;
}

/**
 * Promote a user to admin role (used for first user registration)
 */
export async function promoteToAdmin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ role: 'admin' })
    .where(eq(users.id, userId));

  logger.info('User promoted to admin', { userId });
}

/**
 * Request a password reset
 */
export async function requestPasswordReset(
  data: { email: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    // Always return success to prevent email enumeration
    if (user && user.isActive) {
      logger.info('Password reset requested', {
        email: data.email,
        userId: user.id,
      });
      const { sendPasswordResetEmail } = await import('@/lib/email');
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64url');
      sendPasswordResetEmail(data.email, token).catch(() => {});
    } else {
      logger.info('Password reset requested for non-existent or inactive user', {
        email: data.email,
      });
    }

    return { success: true };
  } catch (error) {
    logger.error('Password reset error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: 'An error occurred' };
  }
}
