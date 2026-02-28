'use server';

import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import type { GuestCartItem } from './storage';

/**
 * Merge guest cart with authenticated user cart
 * Validates: Requirements 22.3, 22.4
 * 
 * This function should be called after user logs in
 * 
 * @param guestCartItems - Items from guest cart (local storage)
 * @returns Merge result with success status
 */
export async function mergeGuestCart(
  guestCartItems: GuestCartItem[]
): Promise<{
  success: boolean;
  mergedCount: number;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        mergedCount: 0,
        error: 'Authentication required',
      };
    }

    if (guestCartItems.length === 0) {
      return {
        success: true,
        mergedCount: 0,
      };
    }

    let mergedCount = 0;

    // Process each guest cart item
    for (const guestItem of guestCartItems) {
      try {
        // Verify product exists and is active
        const product = await db.query.products.findFirst({
          where: eq(products.id, guestItem.productId),
        });

        if (!product || !product.isActive) {
          // Skip inactive or deleted products
          continue;
        }

        // Check if item already exists in user's cart
        const existingCartItem = await db.query.cartItems.findFirst({
          where: and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, guestItem.productId)
          ),
        });

        if (existingCartItem) {
          // Merge quantities (sum them up, max 99)
          const newQuantity = Math.min(
            existingCartItem.quantity + guestItem.quantity,
            99
          );

          await db
            .update(cartItems)
            .set({
              quantity: newQuantity,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingCartItem.id));

          mergedCount++;
        } else {
          // Add new item to user's cart
          await db.insert(cartItems).values({
            userId,
            productId: guestItem.productId,
            quantity: Math.min(guestItem.quantity, 99),
            priceAtAdd: guestItem.priceAtAdd,
            createdAt: new Date(guestItem.addedAt),
            updatedAt: new Date(),
          });

          mergedCount++;
        }
      } catch (itemError) {
        // Log error but continue processing other items
        console.error(
          `Error merging cart item ${guestItem.productId}:`,
          itemError
        );
      }
    }

    return {
      success: true,
      mergedCount,
    };
  } catch (error) {
    console.error('Error merging guest cart:', error);
    return {
      success: false,
      mergedCount: 0,
      error: error instanceof Error ? error.message : 'Failed to merge cart',
    };
  }
}

/**
 * Remove deleted products from all carts
 * Validates: Requirement 5.6
 * 
 * This should be called when a product is deleted
 * 
 * @param productId - ID of deleted product
 * @returns Deletion result
 */
export async function removeDeletedProductFromCarts(
  productId: string
): Promise<{
  success: boolean;
  removedCount: number;
}> {
  try {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.productId, productId))
      .returning();

    return {
      success: true,
      removedCount: result.length,
    };
  } catch (error) {
    console.error('Error removing deleted product from carts:', error);
    return {
      success: false,
      removedCount: 0,
    };
  }
}

/**
 * Update price for existing cart items when product price changes
 * Only updates items that are outside the 24-hour honor period
 * Validates: Requirement 14.4
 * 
 * @param productId - Product ID
 * @param newPrice - New product price
 * @returns Update result
 */
export async function updateCartItemPrices(
  productId: string,
  newPrice: string
): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  try {
    // Get all cart items for this product
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.productId, productId),
    });

    let updatedCount = 0;
    const now = new Date();

    // Update items that are outside 24-hour honor period
    for (const item of items) {
      const hoursSinceAdded = 
        (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60);

      // Only update if outside 24-hour honor period
      if (hoursSinceAdded > 24) {
        await db
          .update(cartItems)
          .set({
            priceAtAdd: newPrice,
            updatedAt: now,
          })
          .where(eq(cartItems.id, item.id));

        updatedCount++;
      }
    }

    return {
      success: true,
      updatedCount,
    };
  } catch (error) {
    console.error('Error updating cart item prices:', error);
    return {
      success: false,
      updatedCount: 0,
    };
  }
}
