'use server';

import { db } from '@/db';
import { cartItems } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { readGuestSessionId } from '@/lib/guest-session';

/**
 * Cart item with product details
 */
export interface CartItemWithProduct {
  id: string;
  userId: string | null;
  sessionId: string | null;
  productId: string;
  quantity: number;
  priceAtAdd: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    isActive: boolean;
    images: Array<{
      id: string;
      imageUrl: string;
      thumbnailUrl: string;
      altText: string | null;
      isPrimary: boolean;
    }>;
  };
}

/**
 * Cart summary with totals
 */
export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
}

/**
 * Get all cart items for current user with product details
 * Validates: Requirements 5.4, 22.1
 * 
 * @returns Cart items with product information
 */
export async function getCartItems(): Promise<CartItemWithProduct[]> {
  try {
    const userId = await getCurrentUserId();
    const sessionId = userId ? null : await readGuestSessionId();
    if (!userId && !sessionId) return [];

    const whereClause = userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId!);

    const items = await db.query.cartItems.findMany({
      where: whereClause,
      with: {
        product: {
          with: {
            images: {
              orderBy: (images, { asc }) => [asc(images.displayOrder)],
            },
          },
        },
      },
      orderBy: (cartItems, { desc }) => [desc(cartItems.createdAt)],
    });

    return items as CartItemWithProduct[];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}

/**
 * Get cart item by ID for current user
 * 
 * @param cartItemId - Cart item ID
 * @returns Cart item with product details or null
 */
export async function getCartItemById(
  cartItemId: string
): Promise<CartItemWithProduct | null> {
  try {
    const userId = await getCurrentUserId();
    const sessionId = userId ? null : await readGuestSessionId();
    if (!userId && !sessionId) return null;

    const ownerClause = userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId!);

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, cartItemId), ownerClause),
      with: {
        product: {
          with: {
            images: {
              orderBy: (images, { asc }) => [asc(images.displayOrder)],
            },
          },
        },
      },
    });

    return item as CartItemWithProduct | null;
  } catch (error) {
    console.error('Error fetching cart item:', error);
    return null;
  }
}

/**
 * Calculate cart totals
 * Validates: Requirement 5.5
 * 
 * @returns Cart summary with items and calculated totals
 */
export async function getCartSummary(): Promise<CartSummary> {
  try {
    const items = await getCartItems();

    // Calculate totals
    let subtotal = 0;
    let totalQuantity = 0;

    for (const item of items) {
      // Use priceAtAdd for calculation (locked price)
      const itemPrice = parseFloat(item.priceAtAdd);
      subtotal += itemPrice * item.quantity;
      totalQuantity += item.quantity;
    }

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      itemCount: items.length,
      totalQuantity,
    };
  } catch (error) {
    console.error('Error calculating cart summary:', error);
    return {
      items: [],
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0,
    };
  }
}

/**
 * Validate cart items - check if products are still active and available
 * Validates: Requirements 5.6, 22.6
 * 
 * @returns Validation result with unavailable items
 */
export async function validateCartItems(): Promise<{
  valid: boolean;
  unavailableItems: Array<{
    cartItemId: string;
    productId: string;
    productName: string;
    reason: 'deleted' | 'inactive';
  }>;
}> {
  try {
    const items = await getCartItems();
    const unavailableItems = [];

    for (const item of items) {
      if (!item.product) {
        unavailableItems.push({
          cartItemId: item.id,
          productId: item.productId,
          productName: 'Unknown Product',
          reason: 'deleted' as const,
        });
      } else if (!item.product.isActive) {
        unavailableItems.push({
          cartItemId: item.id,
          productId: item.productId,
          productName: item.product.name,
          reason: 'inactive' as const,
        });
      }
    }

    return {
      valid: unavailableItems.length === 0,
      unavailableItems,
    };
  } catch (error) {
    console.error('Error validating cart items:', error);
    return {
      valid: false,
      unavailableItems: [],
    };
  }
}

/**
 * Check if price has changed since item was added to cart
 * Validates: Requirement 14.3, 14.4
 * 
 * @param cartItemId - Cart item ID
 * @returns Price comparison result
 */
export async function checkPriceChange(cartItemId: string): Promise<{
  priceChanged: boolean;
  originalPrice: number;
  currentPrice: number;
  withinHonorPeriod: boolean;
}> {
  try {
    const userId = await getCurrentUserId();
    const sessionId = userId ? null : await readGuestSessionId();
    if (!userId && !sessionId) {
      throw new Error('No cart session found');
    }

    const ownerClause = userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId!);

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, cartItemId), ownerClause),
      with: { product: true },
    });

    if (!item || !item.product) {
      throw new Error('Cart item not found');
    }

    const originalPrice = parseFloat(item.priceAtAdd);
    const currentPrice = parseFloat(item.product.price);
    const priceChanged = originalPrice !== currentPrice;

    // Check if within 24-hour honor period
    const hoursSinceAdded = 
      (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60);
    const withinHonorPeriod = hoursSinceAdded <= 24;

    return {
      priceChanged,
      originalPrice,
      currentPrice,
      withinHonorPeriod,
    };
  } catch (error) {
    console.error('Error checking price change:', error);
    throw error;
  }
}

/**
 * Get cart item count for current user
 * 
 * @returns Total number of items in cart
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const userId = await getCurrentUserId();
    const sessionId = userId ? null : await readGuestSessionId();
    if (!userId && !sessionId) return 0;

    const whereClause = userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId!);

    const items = await db.query.cartItems.findMany({ where: whereClause });
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart item count:', error);
    return 0;
  }
}

/**
 * Clean up old cart items (older than 30 days)
 * Validates: Requirement 22.5
 * 
 * This should be run as a scheduled job
 */
export async function cleanupOldCartItems(): Promise<{
  success: boolean;
  deletedCount: number;
}> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db
      .delete(cartItems)
      .where(lt(cartItems.createdAt, thirtyDaysAgo))
      .returning();

    return {
      success: true,
      deletedCount: result.length,
    };
  } catch (error) {
    console.error('Error cleaning up old cart items:', error);
    return {
      success: false,
      deletedCount: 0,
    };
  }
}
