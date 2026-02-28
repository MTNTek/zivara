'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/password';
import { registerSchema, passwordResetRequestSchema } from './schemas';
import { sendWelcomeEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { handleError, withDatabaseRetry, type ApiResponse } from '@/lib/error-handler';
import { ValidationError, ConflictError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Register a new user
 * Requirements: 1.1, 18.1, 18.2, 18.4
 */
export async function registerUser(
  data: unknown
): Promise<ApiResponse<{ userId: string }>> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await withDatabaseRetry(() =>
      db.query.users.findFirst({
        where: eq(users.email, validatedData.email),
      })
    );

    if (existingUser) {
      logger.warn('Registration attempt with existing email', {
        email: validatedData.email,
      });
      throw new ConflictError('This email address is already registered. Please sign in or use a different email');
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await withDatabaseRetry(() =>
      db
        .insert(users)
        .values({
          email: validatedData.email,
          name: validatedData.name,
          passwordHash,
          role: 'customer',
          isActive: true,
        })
        .returning({ id: users.id, email: users.email, name: users.name })
    );

    // Log successful registration (Requirement 18.4)
    logger.logAuthAttempt(true, validatedData.email, {
      action: 'registration',
      userId: newUser.id,
    });

    // Send welcome email (Requirement 28.1)
    // Don't block registration if email fails
    sendWelcomeEmail({
      name: newUser.name,
      email: newUser.email,
    }).catch((error) => {
      logger.error('Failed to send welcome email', {
        email: newUser.email,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    return {
      success: true,
      data: { userId: newUser.id },
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      logger.warn('Registration validation error', {
        error: firstError?.message,
        path: firstError?.path,
      });
      throw new ValidationError(
        firstError?.message || 'Validation error',
        error.issues
      );
    }

    // Log failed registration attempt (Requirement 18.4)
    if ('email' in (data as any)) {
      logger.logAuthAttempt(false, (data as any).email, {
        action: 'registration',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Handle and return error
    return handleError(error);
  }
}

/**
 * Request a password reset
 * Requirements: 1.5, 18.1, 18.2
 */
export async function requestPasswordReset(
  data: unknown
): Promise<ApiResponse<void>> {
  try {
    // Validate input
    const validatedData = passwordResetRequestSchema.parse(data);

    // Check if user exists
    const user = await withDatabaseRetry(() =>
      db.query.users.findFirst({
        where: eq(users.email, validatedData.email),
      })
    );

    // Always return success to prevent email enumeration
    // In a real implementation, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with an expiration time
    // 3. Send an email with the reset link
    
    if (user && user.isActive) {
      logger.info('Password reset requested', {
        email: validatedData.email,
        userId: user.id,
      });
      // TODO: Generate reset token and send email
    } else {
      logger.info('Password reset requested for non-existent or inactive user', {
        email: validatedData.email,
      });
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      logger.warn('Password reset validation error', {
        error: firstError?.message,
        path: firstError?.path,
      });
      throw new ValidationError(
        firstError?.message || 'Validation error',
        error.issues
      );
    }

    // Handle and return error
    return handleError(error);
  }
}
