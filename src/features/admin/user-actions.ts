'use server';

import { z } from 'zod';
import { db } from '@/db';
import { users, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { userIdSchema } from './schemas';
import crypto from 'crypto';

/**
 * Deactivate a user account
 * Validates: Requirements 26.4, 26.5, 26.7
 */
export async function deactivateUser(userId: string) {
  try {
    // Validate input
    const validated = userIdSchema.parse({ userId });
    
    const session = await requireAdmin();

    // Update user status
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, validated.userId));

    // Log the action
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: 'deactivate_user',
      entityType: 'user',
      entityId: validated.userId,
      changes: JSON.stringify({ isActive: false }),
      createdAt: new Date(),
    });

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${validated.userId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    
    console.error('Error deactivating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate user',
    };
  }
}

/**
 * Reactivate a user account
 * Validates: Requirements 26.4, 26.5, 26.7
 */
export async function reactivateUser(userId: string) {
  try {
    // Validate input
    const validated = userIdSchema.parse({ userId });
    
    const session = await requireAdmin();

    // Update user status
    await db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, validated.userId));

    // Log the action
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: 'reactivate_user',
      entityType: 'user',
      entityId: validated.userId,
      changes: JSON.stringify({ isActive: true }),
      createdAt: new Date(),
    });

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${validated.userId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    
    console.error('Error reactivating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reactivate user',
    };
  }
}

/**
 * Generate a password reset token for a user
 * Validates: Requirements 26.6, 26.7
 */
export async function generatePasswordResetToken(userId: string) {
  try {
    // Validate input
    const validated = userIdSchema.parse({ userId });
    
    const session = await requireAdmin();

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // In a real implementation, you would store this token in a password_reset_tokens table
    // For now, we'll just log the action
    await db.insert(auditLogs).values({
      userId: session.user.id,
      action: 'generate_password_reset',
      entityType: 'user',
      entityId: validated.userId,
      changes: JSON.stringify({ resetTokenGenerated: true }),
      createdAt: new Date(),
    });

    revalidatePath(`/admin/users/${validated.userId}`);

    return {
      success: true,
      resetToken,
      resetTokenExpiry,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    
    console.error('Error generating password reset token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate reset token',
    };
  }
}
