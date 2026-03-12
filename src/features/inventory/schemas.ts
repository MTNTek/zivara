import { z } from 'zod';

/**
 * Schema for updating inventory quantity
 * Validates: Requirements 10.1, 10.6
 */
export const updateInventorySchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
});

/**
 * Schema for setting low stock threshold
 */
export const setLowStockThresholdSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  threshold: z.number().int('Threshold must be an integer').min(0, 'Threshold cannot be negative'),
});

/**
 * Schema for inventory adjustment (increase/decrease)
 */
export const adjustInventorySchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  adjustment: z.number().int('Adjustment must be an integer'),
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type SetLowStockThresholdInput = z.infer<typeof setLowStockThresholdSchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
