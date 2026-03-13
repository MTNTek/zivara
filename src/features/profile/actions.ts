'use server';

import { db } from '@/db';
import { users, userAddresses } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { updateProfileSchema, addressSchema } from './schemas';
import { eq, and, count } from 'drizzle-orm';
import { z } from 'zod';

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Update user profile information
 * Requirements: 11.1, 11.2, 11.3, 11.7
 */
export async function updateProfile(
  data: unknown
): Promise<ActionResult<{ emailChanged: boolean }>> {
  try {
    // Require authentication
    const session = await requireAuth();
    const userId = session.user.id;

    // Validate input (11.7 - email format validation)
    const validatedData = updateProfileSchema.parse(data);

    // Get current user data
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'Your account could not be found. Please sign in again',
      };
    }

    // Check if email is being changed
    const emailChanged = currentUser.email !== validatedData.email;

    // If email is changing, check if new email is already in use
    if (emailChanged) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, validatedData.email),
      });

      if (existingUser) {
        return {
          success: false,
          error: 'Email address is already in use',
        };
      }
    }

    // Update user profile (11.1 - persist changes)
    await db
      .update(users)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 11.3 - Send verification email on email change
    if (emailChanged) {
      // TODO: Implement email verification in Task 15
    }

    return {
      success: true,
      data: { emailChanged },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }

    console.error('Profile update error:', error);
    return {
      success: false,
      error: 'Unable to update your profile. Please try again',
    };
  }
}

/**
 * Add a new shipping address
 * Requirements: 11.4, 11.5
 */
export async function addAddress(
  data: unknown
): Promise<ActionResult<{ addressId: string }>> {
  try {
    // Require authentication
    const session = await requireAuth();
    const userId = session.user.id;

    // Validate input
    const validatedData = addressSchema.parse(data);

    // Check address count limit (11.4 - maximum of 5 addresses)
    const [addressCount] = await db
      .select({ count: count() })
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId));

    if (addressCount.count >= 5) {
      return {
        success: false,
        error: 'You can save up to 5 addresses. Please delete an existing address to add a new one',
      };
    }

    // If this is set as default, unset other default addresses (11.6)
    if (validatedData.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId));
    }

    // Create new address
    const [newAddress] = await db
      .insert(userAddresses)
      .values({
        userId,
        label: validatedData.label,
        addressLine1: validatedData.addressLine1,
        addressLine2: validatedData.addressLine2,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
        isDefault: validatedData.isDefault || false,
      })
      .returning({ id: userAddresses.id });

    return {
      success: true,
      data: { addressId: newAddress.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }

    console.error('Add address error:', error);
    return {
      success: false,
      error: 'Unable to add address. Please try again',
    };
  }
}

/**
 * Update an existing shipping address
 * Requirements: 11.4, 11.6
 */
export async function updateAddress(
  addressId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    // Require authentication
    const session = await requireAuth();
    const userId = session.user.id;

    // Validate input
    const validatedData = addressSchema.parse(data);

    // Verify address belongs to user
    const existingAddress = await db.query.userAddresses.findFirst({
      where: and(
        eq(userAddresses.id, addressId),
        eq(userAddresses.userId, userId)
      ),
    });

    if (!existingAddress) {
      return {
        success: false,
        error: 'This address could not be found',
      };
    }

    // If this is set as default, unset other default addresses (11.6)
    if (validatedData.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(and(
          eq(userAddresses.userId, userId),
          eq(userAddresses.isDefault, true)
        ));
    }

    // Update address
    await db
      .update(userAddresses)
      .set({
        label: validatedData.label,
        addressLine1: validatedData.addressLine1,
        addressLine2: validatedData.addressLine2,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
        isDefault: validatedData.isDefault || false,
        updatedAt: new Date(),
      })
      .where(eq(userAddresses.id, addressId));

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }

    console.error('Update address error:', error);
    return {
      success: false,
      error: 'Unable to update address. Please try again',
    };
  }
}

/**
 * Delete a shipping address
 * Requirements: 11.5
 */
export async function deleteAddress(
  addressId: string
): Promise<ActionResult> {
  try {
    // Require authentication
    const session = await requireAuth();
    const userId = session.user.id;

    // Verify address belongs to user
    const existingAddress = await db.query.userAddresses.findFirst({
      where: and(
        eq(userAddresses.id, addressId),
        eq(userAddresses.userId, userId)
      ),
    });

    if (!existingAddress) {
      return {
        success: false,
        error: 'This address could not be found',
      };
    }

    // Delete address (11.5 - remove from database)
    await db
      .delete(userAddresses)
      .where(eq(userAddresses.id, addressId));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete address error:', error);
    return {
      success: false,
      error: 'Unable to delete address. Please try again',
    };
  }
}

/**
 * Set an address as the default shipping address
 * Requirements: 11.6
 */
export async function setDefaultAddress(
  addressId: string
): Promise<ActionResult> {
  try {
    // Require authentication
    const session = await requireAuth();
    const userId = session.user.id;

    // Verify address belongs to user
    const existingAddress = await db.query.userAddresses.findFirst({
      where: and(
        eq(userAddresses.id, addressId),
        eq(userAddresses.userId, userId)
      ),
    });

    if (!existingAddress) {
      return {
        success: false,
        error: 'This address could not be found',
      };
    }

    // Unset all default addresses for this user
    await db
      .update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));

    // Set this address as default
    await db
      .update(userAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(userAddresses.id, addressId));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Set default address error:', error);
    return {
      success: false,
      error: 'Unable to set default address. Please try again',
    };
  }
}
