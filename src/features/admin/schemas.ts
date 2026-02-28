import { z } from 'zod';

/**
 * Schema for user management actions
 * Validates: Requirements 26.4, 26.5, 26.6
 */
export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * Schema for bulk product updates
 * Validates: Requirement 20.6
 */
export const bulkProductUpdateSchema = z.object({
  productIds: z.array(z.string().uuid('Invalid product ID format')).min(1, 'At least one product must be selected'),
  updates: z.object({
    isActive: z.boolean().optional(),
    categoryId: z.string().uuid('Invalid category ID format').optional(),
    discountPrice: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Discount price must be a valid decimal with max 2 decimal places')
      .refine((val) => parseFloat(val) > 0, 'Discount price must be positive')
      .optional()
      .nullable(),
    discountStartDate: z.string().datetime().optional().nullable(),
    discountEndDate: z.string().datetime().optional().nullable(),
  }),
});

/**
 * Schema for order filtering
 * Validates: Requirements 12.2, 21.2
 */
export const orderFilterSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  customerId: z.string().uuid('Invalid customer ID format').optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Schema for user search and filtering
 * Validates: Requirements 26.1, 26.2
 */
export const userFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Schema for product search in admin interface
 * Validates: Requirement 20.7
 */
export const adminProductSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type UserIdInput = z.infer<typeof userIdSchema>;
export type BulkProductUpdateInput = z.infer<typeof bulkProductUpdateSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type AdminProductSearchInput = z.infer<typeof adminProductSearchSchema>;
