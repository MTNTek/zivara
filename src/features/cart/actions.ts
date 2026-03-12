'use server';

import { z } from 'zod';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { 
  addToCartSchema, 
  updateCartItemSchema,
  removeFromCartSchema,
  type AddToCartInput,
  type UpdateCartItemInput,
  type RemoveFromCartInput
} from './schemas';
import { checkInventoryAvailability } from '@/features/inventory/actions';
import { getCurrentUserId } from '@/lib/auth';
import { handleError, withDatabaseRetry, type ApiResponse } from '@/lib/error-handler';
import { ValidationError, NotFoundError, AuthenticationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Add item to cart with inventory validation
 * Validates: Requirements 5.1, 10.3, 10.4, 10.7, 18.1, 18.2
 * 
 * @param input - Product ID and quantity
 * @returns Success status with cart item or error
 */
export async function addToCart(input: AddToCartInput): Promise<ApiResponse<any>> {
  try {
    // Validate input
    const validated = addToCartSchema.parse(input);

    // Get current user ID (or session ID for guests)
    const userId = await getCurrentUserId();
    if (!userId) {
      logger.warn('Add to cart attempted without authentication');
      throw new AuthenticationError('Please sign in to add items to your cart');
    }

    // Check if product exists and is active
    const product = await withDatabaseRetry(() =>
      db.query.products.findFirst({
        where: eq(products.id, validated.productId),
      })
    );

    if (!product) {
      logger.warn('Add to cart attempted for non-existent product', {
        productId: validated.productId,
      });
      throw new NotFoundError('This product is no longer available');
    }

    if (!product.isActive) {
      logger.warn('Add to cart attempted for inactive product', {
        productId: validated.productId,
        productName: product.name,
      });
      throw new ValidationError('This product is currently unavailable');
    }

    // Check inventory availability (Requirement 10.3, 10.4, 10.7)
    const inventoryCheck = await checkInventoryAvailability(
      validated.productId,
      validated.quantity
    );

    if (!inventoryCheck.available) {
      if (inventoryCheck.availableQuantity === 0) {
        logger.info('Add to cart failed - out of stock', {
          productId: validated.productId,
          requestedQuantity: validated.quantity,
        });
        throw new ValidationError('This item is currently out of stock');
      } else {
        logger.info('Add to cart failed - insufficient stock', {
          productId: validated.productId,
          requestedQuantity: validated.quantity,
          availableQuantity: inventoryCheck.availableQuantity,
        });
        throw new ValidationError(
          `Only ${inventoryCheck.availableQuantity} item${inventoryCheck.availableQuantity === 1 ? '' : 's'} available`
        );
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await withDatabaseRetry(() =>
      db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, validated.productId)
        ),
      })
    );

    let result;
    if (existingCartItem) {
      // Update existing cart item
      const newQuantity = existingCartItem.quantity + validated.quantity;

      // Check if new quantity exceeds max limit (Requirement 5.7)
      if (newQuantity > 99) {
        logger.warn('Add to cart failed - max quantity exceeded', {
          productId: validated.productId,
          currentQuantity: existingCartItem.quantity,
          attemptedAddition: validated.quantity,
        });
        throw new ValidationError('Maximum 99 items per product. Please adjust your cart');
      }

      // Check if new quantity exceeds available inventory
      const newInventoryCheck = await checkInventoryAvailability(
        validated.productId,
        newQuantity
      );

      if (!newInventoryCheck.available) {
        throw new ValidationError(
          `Cannot add more items. Only ${newInventoryCheck.availableQuantity} available in stock`
        );
      }

      [result] = await withDatabaseRetry(() =>
        db
          .update(cartItems)
          .set({
            quantity: newQuantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingCartItem.id))
          .returning()
      );

      logger.info('Cart item quantity updated', {
        userId,
        productId: validated.productId,
        newQuantity,
      });
    } else {
      // Create new cart item
      [result] = await withDatabaseRetry(() =>
        db
          .insert(cartItems)
          .values({
            userId,
            productId: validated.productId,
            quantity: validated.quantity,
            priceAtAdd: product.price,
          })
          .returning()
      );

      logger.info('Item added to cart', {
        userId,
        productId: validated.productId,
        quantity: validated.quantity,
      });
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Add to cart validation error', {
        errors: error.issues,
      });
      throw new ValidationError(error.issues[0].message, error.issues);
    }

    return handleError(error);
  }
}

/**
 * Update cart item quantity with inventory validation
 * Validates: Requirements 5.2, 5.7, 10.7, 18.1, 18.2
 * 
 * @param input - Cart item ID and new quantity
 * @returns Success status with updated cart item or error
 */
export async function updateCartItemQuantity(input: UpdateCartItemInput): Promise<ApiResponse<any>> {
  try {
    // Validate input
    const validated = updateCartItemSchema.parse(input);

    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Get cart item
    const cartItem = await withDatabaseRetry(() =>
      db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.id, validated.cartItemId),
          eq(cartItems.userId, userId)
        ),
      })
    );

    if (!cartItem) {
      throw new NotFoundError('This item is no longer in your cart');
    }

    // Check inventory availability for new quantity
    const inventoryCheck = await checkInventoryAvailability(
      cartItem.productId,
      validated.quantity
    );

    if (!inventoryCheck.available) {
      throw new ValidationError(
        `Only ${inventoryCheck.availableQuantity} item${inventoryCheck.availableQuantity === 1 ? '' : 's'} available in stock`
      );
    }

    // Update cart item
    const [result] = await withDatabaseRetry(() =>
      db
        .update(cartItems)
        .set({
          quantity: validated.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, validated.cartItemId))
        .returning()
    );

    logger.info('Cart item quantity updated', {
      userId,
      cartItemId: validated.cartItemId,
      newQuantity: validated.quantity,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.issues[0].message, error.issues);
    }
    return handleError(error);
  }
}

/**
 * Remove item from cart
 * Validates: Requirements 5.3, 18.1, 18.2
 * 
 * @param input - Cart item ID
 * @returns Success status
 */
export async function removeFromCart(input: RemoveFromCartInput): Promise<ApiResponse<void>> {
  try {
    // Validate input
    const validated = removeFromCartSchema.parse(input);

    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Delete cart item
    await withDatabaseRetry(() =>
      db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.id, validated.cartItemId),
            eq(cartItems.userId, userId)
          )
        )
    );

    logger.info('Item removed from cart', {
      userId,
      cartItemId: validated.cartItemId,
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.issues[0].message, error.issues);
    }
    return handleError(error);
  }
}

/**
 * Clear all items from cart
 * Validates: Requirements 6.3, 18.1, 18.2
 * 
 * @returns Success status
 */
export async function clearCart(): Promise<ApiResponse<void>> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Delete all cart items for user
    await withDatabaseRetry(() =>
      db
        .delete(cartItems)
        .where(eq(cartItems.userId, userId))
    );

    logger.info('Cart cleared', { userId });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Validate all cart items have sufficient inventory
 * Used during checkout process
 * Validates: Requirements 6.1, 18.1, 18.2
 * 
 * @returns Validation result with any out-of-stock items
 */
export async function validateCartInventory(): Promise<ApiResponse<any>> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Get all cart items for user
    const userCartItems = await withDatabaseRetry(() =>
      db.query.cartItems.findMany({
        where: eq(cartItems.userId, userId),
        with: {
          product: true,
        },
      })
    );

    if (userCartItems.length === 0) {
      throw new ValidationError('Your cart is empty. Add some items to continue');
    }

    // Check inventory for each item
    const outOfStockItems = [];
    for (const item of userCartItems) {
      const inventoryCheck = await checkInventoryAvailability(
        item.productId,
        item.quantity
      );

      if (!inventoryCheck.available) {
        outOfStockItems.push({
          productId: item.productId,
          productName: item.product.name,
          requestedQuantity: item.quantity,
          availableQuantity: inventoryCheck.availableQuantity,
        });
      }
    }

    if (outOfStockItems.length > 0) {
      logger.warn('Cart validation failed - out of stock items', {
        userId,
        outOfStockCount: outOfStockItems.length,
      });
      
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Some items in your cart are no longer available in the requested quantity',
          details: { outOfStockItems },
        },
      };
    }

    logger.info('Cart inventory validated', {
      userId,
      itemCount: userCartItems.length,
    });

    return {
      success: true,
      data: userCartItems,
    };
  } catch (error) {
    return handleError(error);
  }
}
