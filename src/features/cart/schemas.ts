import { z } from 'zod';

/**
 * Schema for adding item to cart
 * Validates: Requirements 5.1, 10.3, 10.4
 */
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Maximum quantity per product is 99'),
});

/**
 * Schema for updating cart item quantity
 * Validates: Requirements 5.2, 5.7
 */
export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID format'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Maximum quantity per product is 99'),
});

/**
 * Schema for removing item from cart
 */
export const removeFromCartSchema = z.object({
  cartItemId: z.string().uuid('Invalid cart item ID format'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
